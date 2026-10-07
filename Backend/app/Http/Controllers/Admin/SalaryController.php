<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SalaryPayment;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SalaryController extends Controller
{
    /**
     * Display a listing of salary payments.
     */
    public function index(Request $request)
    {
        $query = SalaryPayment::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('employee_name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('month')) {
            $query->where('month', $request->month);
        }

        if ($request->filled('year')) {
            $query->where('year', (int) $request->year);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        $perPage = $request->get('per_page', 15);
        $salaries = $query->orderBy('year', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($salaries);
    }

    /**
     * Store a newly created salary payment.
     */
    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|string',
            'month' => 'required|string',
            'year' => 'required|integer|min:2000|max:2100',
            'basic_salary' => 'required|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'deduction' => 'nullable|numeric|min:0',
            'payment_status' => 'required|in:Paid,Unpaid',
            'payment_date' => 'nullable|date',
            'note' => 'nullable|string',
        ]);

        $employee = Employee::where('employee_id', $request->employee_id)->first();
        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        // Check if salary record already exists for this employee for this month/year
        $exists = SalaryPayment::where('employee_id', $employee->employee_id)
            ->where('month', $request->month)
            ->where('year', (int) $request->year)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => "Salary payment for {$employee->full_name} for {$request->month} {$request->year} already exists.",
            ], 422);
        }

        $basicSalary = (float) $request->basic_salary;
        $bonus = (float) ($request->bonus ?? 0);
        $deduction = (float) ($request->deduction ?? 0);
        $netSalary = $basicSalary + $bonus - $deduction;

        $paymentDate = $request->payment_date;
        if ($request->payment_status === 'Paid' && empty($paymentDate)) {
            $paymentDate = Carbon::today()->format('Y-m-d');
        }

        $salary = SalaryPayment::create([
            'employee_id' => $employee->employee_id,
            'user_id' => $employee->user_id,
            'employee_name' => $employee->full_name,
            'department' => $employee->department,
            'month' => $request->month,
            'year' => (int) $request->year,
            'basic_salary' => $basicSalary,
            'bonus' => $bonus,
            'deduction' => $deduction,
            'net_salary' => $netSalary,
            'payment_date' => $paymentDate,
            'payment_status' => $request->payment_status,
            'note' => $request->note,
        ]);

        return response()->json([
            'message' => 'Salary payment record created successfully',
            'salary' => $salary,
        ], 201);
    }

    /**
     * Display salary payment details.
     */
    public function show($id)
    {
        $salary = SalaryPayment::find($id);

        if (!$salary) {
            return response()->json(['message' => 'Salary payment not found'], 404);
        }

        return response()->json($salary);
    }

    /**
     * Update the specified salary payment.
     */
    public function update(Request $request, $id)
    {
        $salary = SalaryPayment::find($id);

        if (!$salary) {
            return response()->json(['message' => 'Salary payment not found'], 404);
        }

        $request->validate([
            'basic_salary' => 'required|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'deduction' => 'nullable|numeric|min:0',
            'payment_status' => 'required|in:Paid,Unpaid',
            'payment_date' => 'nullable|date',
            'note' => 'nullable|string',
        ]);

        $basicSalary = (float) $request->basic_salary;
        $bonus = (float) ($request->bonus ?? 0);
        $deduction = (float) ($request->deduction ?? 0);
        $netSalary = $basicSalary + $bonus - $deduction;

        $paymentDate = $request->payment_date;
        if ($request->payment_status === 'Paid' && empty($paymentDate)) {
            $paymentDate = $salary->payment_date ?? Carbon::today()->format('Y-m-d');
        } elseif ($request->payment_status === 'Unpaid') {
            $paymentDate = null;
        }

        $salary->update([
            'basic_salary' => $basicSalary,
            'bonus' => $bonus,
            'deduction' => $deduction,
            'net_salary' => $netSalary,
            'payment_date' => $paymentDate,
            'payment_status' => $request->payment_status,
            'note' => $request->note,
        ]);

        return response()->json([
            'message' => 'Salary payment updated successfully',
            'salary' => $salary,
        ]);
    }

    /**
     * Quick mark salary as paid.
     */
    public function markPaid(Request $request, $id)
    {
        $salary = SalaryPayment::find($id);

        if (!$salary) {
            return response()->json(['message' => 'Salary payment not found'], 404);
        }

        $salary->update([
            'payment_status' => 'Paid',
            'payment_date' => Carbon::today()->format('Y-m-d'),
        ]);

        return response()->json([
            'message' => 'Salary payment marked as Paid',
            'salary' => $salary,
        ]);
    }

    /**
     * Generate draft monthly salary records for all active employees.
     */
    public function generateMonthly(Request $request)
    {
        $request->validate([
            'month' => 'required|string',
            'year' => 'required|integer',
        ]);

        $activeEmployees = Employee::where('status', 'Active')->get();
        $generatedCount = 0;

        foreach ($activeEmployees as $emp) {
            $exists = SalaryPayment::where('employee_id', $emp->employee_id)
                ->where('month', $request->month)
                ->where('year', (int) $request->year)
                ->exists();

            if (!$exists) {
                SalaryPayment::create([
                    'employee_id' => $emp->employee_id,
                    'user_id' => $emp->user_id,
                    'employee_name' => $emp->full_name,
                    'department' => $emp->department,
                    'month' => $request->month,
                    'year' => (int) $request->year,
                    'basic_salary' => (float) $emp->salary,
                    'bonus' => 0.0,
                    'deduction' => 0.0,
                    'net_salary' => (float) $emp->salary,
                    'payment_date' => null,
                    'payment_status' => 'Unpaid',
                    'note' => "Auto-generated payroll draft for {$request->month} {$request->year}",
                ]);
                $generatedCount++;
            }
        }

        return response()->json([
            'message' => "Generated {$generatedCount} salary payment records for {$request->month} {$request->year}.",
            'generated_count' => $generatedCount,
        ]);
    }

    /**
     * Remove the specified salary payment.
     */
    public function destroy($id)
    {
        $salary = SalaryPayment::find($id);

        if (!$salary) {
            return response()->json(['message' => 'Salary payment not found'], 404);
        }

        $salary->delete();

        return response()->json(['message' => 'Salary payment deleted successfully']);
    }
}
