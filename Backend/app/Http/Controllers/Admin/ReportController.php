<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /**
     * Display a listing of all staff reports with search and filters.
     */
    public function index(Request $request)
    {
        $query = Report::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('staff_name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        if ($request->filled('date')) {
            $query->where('date', $request->date);
        }

        $perPage = $request->get('per_page', 15);
        $reports = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($reports);
    }

    /**
     * Display report details.
     */
    public function show($id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        return response()->json($report);
    }

    /**
     * Review report, add admin comment, update status (Reviewed / Rejected / Pending).
     */
    public function review(Request $request, $id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $request->validate([
            'status' => 'required|in:Pending,Reviewed,Rejected',
            'admin_comment' => 'nullable|string',
        ]);

        $report->update([
            'status' => $request->status,
            'admin_comment' => $request->admin_comment,
            'reviewed_by' => $request->user()->name,
            'reviewed_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Report updated successfully',
            'report' => $report,
        ]);
    }

    /**
     * Delete report and remove any attachment file.
     */
    public function destroy($id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        if ($report->attachment) {
            Storage::disk('public')->delete($report->attachment);
        }

        $report->delete();

        return response()->json(['message' => 'Report deleted successfully']);
    }
}
