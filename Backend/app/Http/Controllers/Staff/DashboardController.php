<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Report;
use App\Models\SalaryPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get aggregated metrics and current status for authenticated staff.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        if (!$employee) {
            return response()->json([
                'message' => 'No employee profile is currently linked to your user account. Please contact an administrator.',
                'employee' => null,
            ], 200);
        }

        $today = Carbon::today()->format('Y-m-d');
        $currentMonth = Carbon::now()->format('F');
        $currentYear = (int) Carbon::now()->format('Y');

        // Today's attendance
        $todayAttendance = Attendance::where('employee_id', $employee->employee_id)
            ->where('date', $today)
            ->first();

        // Recent attendance history (last 10 days)
        $recentAttendance = Attendance::where('employee_id', $employee->employee_id)
            ->orderBy('date', 'desc')
            ->take(10)
            ->get();

        // Current month salary status
        $currentSalary = SalaryPayment::where('employee_id', $employee->employee_id)
            ->where('month', $currentMonth)
            ->where('year', $currentYear)
            ->first();

        // Previous salary records
        $recentSalaries = SalaryPayment::where('employee_id', $employee->employee_id)
            ->orderBy('year', 'desc')
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        // Staff submitted reports
        $reports = Report::where('employee_id', $employee->employee_id)
            ->orderBy('created_at', 'desc')
            ->get();

        $pendingReportsCount = $reports->where('status', 'Pending')->count();
        $reviewedReportsCount = $reports->where('status', 'Reviewed')->count();

        // Calculate this month attendance summary
        $monthStart = Carbon::now()->startOfMonth()->format('Y-m-d');
        $monthAttendances = Attendance::where('employee_id', $employee->employee_id)
            ->whereBetween('date', [$monthStart, $today])
            ->get();

        return response()->json([
            'employee' => $employee,
            'today_attendance' => $todayAttendance,
            'current_month_salary' => $currentSalary,
            'attendance_summary' => [
                'days_present' => $monthAttendances->where('status', 'Present')->count(),
                'days_late' => $monthAttendances->where('status', 'Late')->count(),
                'days_absent' => $monthAttendances->where('status', 'Absent')->count(),
                'total_work_hours' => round($monthAttendances->sum('work_hours'), 1),
            ],
            'reports_summary' => [
                'total_reports' => $reports->count(),
                'pending' => $pendingReportsCount,
                'reviewed' => $reviewedReportsCount,
            ],
            'recent_attendance' => $recentAttendance,
            'recent_reports' => $reports->take(5)->values(),
            'recent_salaries' => $recentSalaries,
        ]);
    }
}
