<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Attendance;
use App\Models\Report;
use App\Models\SalaryPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get aggregated admin dashboard metrics.
     */
    public function stats()
    {
        $today = Carbon::today()->format('Y-m-d');
        $currentMonth = Carbon::now()->format('F');
        $currentYear = (int) Carbon::now()->format('Y');

        // Total Counts
        $totalEmployees = Employee::count();
        $activeEmployees = Employee::where('status', 'Active')->count();
        $totalDepartments = Department::count();

        // Today's Attendance Metrics
        $todayAttendances = Attendance::where('date', $today)->get();
        $presentToday = $todayAttendances->where('status', 'Present')->count();
        $lateToday = $todayAttendances->where('status', 'Late')->count();
        $absentToday = $todayAttendances->where('status', 'Absent')->count();
        $onLeaveToday = $todayAttendances->where('status', 'On Leave')->count();
        $totalRecordedToday = $todayAttendances->count();

        // If some active employees haven't recorded attendance today, count them as unrecorded / potential absent
        $unrecordedCount = max(0, $activeEmployees - $totalRecordedToday);

        // Reports
        $pendingReports = Report::where('status', 'Pending')->count();
        $totalReports = Report::count();

        // Salary paid for current month
        $currentMonthSalaries = SalaryPayment::where('month', $currentMonth)
            ->where('year', $currentYear)
            ->get();
        
        $totalSalaryPaid = (float) $currentMonthSalaries->where('payment_status', 'Paid')->sum('net_salary');
        $totalSalaryUnpaid = (float) $currentMonthSalaries->where('payment_status', 'Unpaid')->sum('net_salary');
        $paidCount = $currentMonthSalaries->where('payment_status', 'Paid')->count();
        $unpaidCount = $currentMonthSalaries->where('payment_status', 'Unpaid')->count();

        // Recent submitted reports
        $recentReports = Report::orderBy('created_at', 'desc')->take(5)->get();

        // Recent attendance today
        $recentAttendance = Attendance::where('date', $today)
            ->orderBy('check_in', 'desc')
            ->take(6)
            ->get();

        // Department breakdown
        $departments = Department::all();
        $deptDistribution = [];
        foreach ($departments as $dept) {
            $count = Employee::where('department', $dept->name)->count();
            $deptDistribution[] = [
                'name' => $dept->name,
                'code' => $dept->code,
                'count' => $count,
            ];
        }

        return response()->json([
            'summary' => [
                'total_employees' => $totalEmployees,
                'active_employees' => $activeEmployees,
                'total_departments' => $totalDepartments,
                'today_date' => $today,
                'today_present' => $presentToday,
                'today_late' => $lateToday,
                'today_absent' => $absentToday,
                'today_on_leave' => $onLeaveToday,
                'today_unrecorded' => $unrecordedCount,
                'pending_reports' => $pendingReports,
                'total_reports' => $totalReports,
                'current_month' => $currentMonth,
                'current_year' => $currentYear,
                'total_salary_paid_month' => $totalSalaryPaid,
                'total_salary_unpaid_month' => $totalSalaryUnpaid,
                'paid_slips_count' => $paidCount,
                'unpaid_slips_count' => $unpaidCount,
            ],
            'recent_reports' => $recentReports,
            'recent_attendance' => $recentAttendance,
            'department_distribution' => $deptDistribution,
        ]);
    }
}
