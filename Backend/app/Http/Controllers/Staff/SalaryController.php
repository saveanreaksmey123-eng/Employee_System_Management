<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\SalaryPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SalaryController extends Controller
{
    /**
     * View salary payment history for logged-in staff.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        if (!$employee) {
            return response()->json(['message' => 'Linked employee profile not found'], 404);
        }

        $query = SalaryPayment::where('employee_id', $employee->employee_id);

        if ($request->filled('year')) {
            $query->where('year', (int) $request->year);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $salaries = $query->orderBy('year', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json($salaries);
    }

    /**
     * View current month salary status and current basic salary.
     */
    public function current(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        if (!$employee) {
            return response()->json(['message' => 'Linked employee profile not found'], 404);
        }

        $currentMonth = Carbon::now()->format('F');
        $currentYear = (int) Carbon::now()->format('Y');

        $currentPayment = SalaryPayment::where('employee_id', $employee->employee_id)
            ->where('month', $currentMonth)
            ->where('year', $currentYear)
            ->first();

        return response()->json([
            'employee' => [
                'employee_id' => $employee->employee_id,
                'full_name' => $employee->full_name,
                'department' => $employee->department,
                'position' => $employee->position,
                'basic_salary' => $employee->salary,
            ],
            'current_month' => $currentMonth,
            'current_year' => $currentYear,
            'current_payment' => $currentPayment,
        ]);
    }
}
