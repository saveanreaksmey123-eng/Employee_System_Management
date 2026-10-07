<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /**
     * View only own reports.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        if (!$employee) {
            return response()->json(['message' => 'Linked employee profile not found'], 404);
        }

        $query = Report::where(function ($q) use ($user, $employee) {
            $q->where('employee_id', $employee->employee_id)
              ->orWhere('user_id', $user->id);
        });

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 15);
        $reports = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($reports);
    }

    /**
     * Create a new report by staff.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        if (!$employee) {
            return response()->json(['message' => 'Linked employee profile not found'], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'nullable|date',
            'attachment' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,zip',
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentName = $file->getClientOriginalName();
            $attachmentPath = $file->store('reports', 'public');
        }

        $report = Report::create([
            'title' => $request->title,
            'description' => $request->description,
            'employee_id' => $employee->employee_id,
            'user_id' => $user->id,
            'staff_name' => $employee->full_name,
            'department' => $employee->department,
            'date' => $request->date ?? Carbon::today()->format('Y-m-d'),
            'attachment' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'status' => 'Pending',
            'admin_comment' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]);

        return response()->json([
            'message' => 'Report submitted successfully',
            'report' => $report,
        ], 201);
    }

    /**
     * Show own report details.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $employee = $user->employee();

        $report = Report::find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        // Security check: only own report
        if ($report->employee_id !== $employee?->employee_id && $report->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access to this report.'], 403);
        }

        return response()->json($report);
    }

    /**
     * Update pending report.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $employee = $user->employee();

        $report = Report::find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        if ($report->employee_id !== $employee?->employee_id && $report->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access to this report.'], 403);
        }

        if ($report->status !== 'Pending') {
            return response()->json([
                'message' => 'Cannot edit a report that has already been reviewed or rejected.',
            ], 422);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'nullable|date',
            'attachment' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,zip',
        ]);

        $data = [
            'title' => $request->title,
            'description' => $request->description,
            'date' => $request->date ?? $report->date,
        ];

        if ($request->hasFile('attachment')) {
            if ($report->attachment) {
                Storage::disk('public')->delete($report->attachment);
            }
            $file = $request->file('attachment');
            $data['attachment_name'] = $file->getClientOriginalName();
            $data['attachment'] = $file->store('reports', 'public');
        }

        $report->update($data);

        return response()->json([
            'message' => 'Report updated successfully',
            'report' => $report,
        ]);
    }

    /**
     * Delete pending report.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $employee = $user->employee();

        $report = Report::find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        if ($report->employee_id !== $employee?->employee_id && $report->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access to this report.'], 403);
        }

        if ($report->status !== 'Pending') {
            return response()->json([
                'message' => 'Cannot delete a report that has already been reviewed or rejected.',
            ], 422);
        }

        if ($report->attachment) {
            Storage::disk('public')->delete($report->attachment);
        }

        $report->delete();

        return response()->json(['message' => 'Report deleted successfully']);
    }
}
