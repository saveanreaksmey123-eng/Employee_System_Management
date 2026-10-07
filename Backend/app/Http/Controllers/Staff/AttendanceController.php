<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Get today's attendance record for the logged in staff.
     */
    public function today(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        if (!$employee) {
            return response()->json(['message' => 'Linked employee profile not found'], 404);
        }

        $today = Carbon::today()->format('Y-m-d');
        $record = Attendance::where('employee_id', $employee->employee_id)
            ->where('date', $today)
            ->first();

        return response()->json([
            'date' => $today,
            'attendance' => $record,
            'employee' => $employee,
        ]);
    }

    /**
     * Perform Check-In for today.
     */
    public function checkIn(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        if (!$employee) {
            return response()->json(['message' => 'Linked employee profile not found'], 404);
        }

        $today = Carbon::today()->format('Y-m-d');
        $currentTime = Carbon::now()->format('H:i:s');

        $record = Attendance::where('employee_id', $employee->employee_id)
            ->where('date', $today)
            ->first();

        if ($record && $record->check_in) {
            return response()->json([
                'message' => "You have already checked in today at {$record->check_in}.",
                'attendance' => $record,
            ], 422);
        }

        // Determine status: Late if after 08:30 AM
        $lateThreshold = Carbon::createFromTimeString('08:30:00');
        $now = Carbon::now();
        $status = $now->greaterThan($lateThreshold) ? 'Late' : 'Present';

        $notes = $request->notes ?? ($status === 'Late' ? 'Checked in late' : 'On-time check in');

        $attendance = Attendance::updateOrCreate(
            ['employee_id' => $employee->employee_id, 'date' => $today],
            [
                'employee_name' => $employee->full_name,
                'department' => $employee->department,
                'check_in' => $currentTime,
                'status' => $status,
                'work_hours' => 0,
                'notes' => $notes,
            ]
        );

        return response()->json([
            'message' => "Checked in successfully at {$currentTime}! Status: {$status}",
            'attendance' => $attendance,
        ]);
    }

    /**
     * Perform Check-Out for today.
     */
    public function checkOut(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        if (!$employee) {
            return response()->json(['message' => 'Linked employee profile not found'], 404);
        }

        $today = Carbon::today()->format('Y-m-d');
        $currentTime = Carbon::now()->format('H:i:s');

        $record = Attendance::where('employee_id', $employee->employee_id)
            ->where('date', $today)
            ->first();

        if (!$record || !$record->check_in) {
            return response()->json([
                'message' => 'You need to check in first before checking out.',
            ], 422);
        }

        if ($record->check_out) {
            return response()->json([
                'message' => "You have already checked out today at {$record->check_out}.",
                'attendance' => $record,
            ], 422);
        }

        // Calculate work hours
        $start = Carbon::parse($today . ' ' . $record->check_in);
        $end = Carbon::parse($today . ' ' . $currentTime);
        $workHours = max(0, round($end->diffInMinutes($start) / 60, 2));

        $record->update([
            'check_out' => $currentTime,
            'work_hours' => $workHours,
        ]);

        return response()->json([
            'message' => "Checked out successfully at {$currentTime}! Total hours: {$workHours} hrs",
            'attendance' => $record,
        ]);
    }

    /**
     * View attendance history of logged in staff.
     */
    public function history(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        if (!$employee) {
            return response()->json(['message' => 'Linked employee profile not found'], 404);
        }

        $query = Attendance::where('employee_id', $employee->employee_id);

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->filled('month') && $request->filled('year')) {
            $yearMonth = sprintf('%04d-%02d', $request->year, $request->month);
            $query->where('date', 'like', "{$yearMonth}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 20);
        $records = $query->orderBy('date', 'desc')->paginate($perPage);

        return response()->json($records);
    }
}
