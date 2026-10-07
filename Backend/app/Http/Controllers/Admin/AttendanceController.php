<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Department;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Display attendance records with search and filters.
     */
    public function index(Request $request)
    {
        $query = Attendance::query();

        // Search employee name / id
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('employee_name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        // Filter by Date
        if ($request->filled('date')) {
            $query->where('date', $request->date);
        }

        // Filter by Date Range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        // Filter by Department
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        // Filter by Status (Present, Late, Absent, Half Day, On Leave)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by specific employee ID
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $perPage = $request->get('per_page', 20);
        $attendances = $query->orderBy('date', 'desc')
            ->orderBy('check_in', 'desc')
            ->paginate($perPage);

        return response()->json($attendances);
    }

    /**
     * Get detailed today's attendance summary and listings.
     */
    public function today()
    {
        $today = Carbon::today()->format('Y-m-d');
        $attendances = Attendance::where('date', $today)->get();
        $employees = Employee::where('status', 'Active')->get();

        $recordedEmpIds = $attendances->pluck('employee_id')->toArray();

        // Identify active employees with no attendance record today as unrecorded/absent
        $unrecordedEmployees = $employees->reject(function ($emp) use ($recordedEmpIds) {
            return in_array($emp->employee_id, $recordedEmpIds);
        })->values();

        $presentList = $attendances->where('status', 'Present')->values();
        $lateList = $attendances->where('status', 'Late')->values();
        $absentList = $attendances->where('status', 'Absent')->values();
        $onLeaveList = $attendances->where('status', 'On Leave')->values();

        return response()->json([
            'date' => $today,
            'summary' => [
                'total_active_employees' => $employees->count(),
                'total_recorded' => $attendances->count(),
                'present' => $presentList->count(),
                'late' => $lateList->count(),
                'absent' => $absentList->count() + $unrecordedEmployees->count(),
                'on_leave' => $onLeaveList->count(),
            ],
            'present_employees' => $presentList,
            'late_employees' => $lateList,
            'absent_employees' => $absentList,
            'unrecorded_employees' => $unrecordedEmployees,
            'all_today' => $attendances,
        ]);
    }

    /**
     * Get attendance history for a single employee.
     */
    public function employeeHistory(Request $request, $employeeId)
    {
        $query = Attendance::where('employee_id', $employeeId);

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->filled('month') && $request->filled('year')) {
            $yearMonth = sprintf('%04d-%02d', $request->year, $request->month);
            $query->where('date', 'like', "{$yearMonth}%");
        }

        $records = $query->orderBy('date', 'desc')->get();
        $employee = Employee::where('employee_id', $employeeId)->first();

        return response()->json([
            'employee' => $employee,
            'total_records' => $records->count(),
            'present_count' => $records->where('status', 'Present')->count(),
            'late_count' => $records->where('status', 'Late')->count(),
            'absent_count' => $records->where('status', 'Absent')->count(),
            'records' => $records,
        ]);
    }

    /**
     * Mark or update attendance manually by admin.
     */
    public function markAttendance(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|string',
            'date' => 'required|date',
            'status' => 'required|in:Present,Late,Absent,Half Day,On Leave',
            'check_in' => 'nullable|string',
            'check_out' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $employee = Employee::where('employee_id', $request->employee_id)->first();
        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $workHours = 0;
        if ($request->filled('check_in') && $request->filled('check_out')) {
            try {
                $start = Carbon::parse($request->date . ' ' . $request->check_in);
                $end = Carbon::parse($request->date . ' ' . $request->check_out);
                $workHours = round($end->diffInMinutes($start) / 60, 2);
            } catch (\Exception $e) {
                $workHours = 8.0;
            }
        } elseif ($request->status === 'Present') {
            $workHours = 8.0;
        }

        $attendance = Attendance::updateOrCreate(
            ['employee_id' => $employee->employee_id, 'date' => $request->date],
            [
                'employee_name' => $employee->full_name,
                'department' => $employee->department,
                'check_in' => $request->check_in,
                'check_out' => $request->check_out,
                'status' => $request->status,
                'work_hours' => $workHours,
                'notes' => $request->notes,
            ]
        );

        return response()->json([
            'message' => 'Attendance recorded successfully',
            'attendance' => $attendance,
        ]);
    }
}
