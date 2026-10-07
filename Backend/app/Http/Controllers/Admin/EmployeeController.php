<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Department;
use App\Models\User;
use App\Models\Role;
use App\Models\Attendance;
use App\Models\Report;
use App\Models\SalaryPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees with search and filters.
     */
    public function index(Request $request)
    {
        $query = Employee::query();

        // Search by name, email, phone, employee_id, position
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }

        // Filter by Department
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        // Filter by Status (Active, On Leave, Resigned, Terminated)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by Gender
        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        $perPage = $request->get('per_page', 15);
        $employees = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($employees);
    }

    /**
     * Store a newly created employee in MongoDB.
     */
    public function store(Request $request)
    {
        if ($request->has('create_user_account')) {
            $request->merge([
                'create_user_account' => $request->boolean('create_user_account'),
            ]);
        }

        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:50',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'department' => 'required|string',
            'position' => 'required|string|max:255',
            'hire_date' => 'required|date',
            'salary' => 'required|numeric|min:0',
            'status' => 'required|in:Active,On Leave,Resigned,Terminated',
            'address' => 'nullable|string',
            'profile_image' => 'nullable|image|max:3072',
            'create_user_account' => 'nullable|boolean',
            'password' => 'nullable|string|min:6',
        ]);

        // Auto generate Employee ID if not provided
        $employeeId = $request->employee_id;
        if (empty($employeeId)) {
            $lastEmployee = Employee::orderBy('created_at', 'desc')->first();
            $num = 1001;
            if ($lastEmployee && preg_match('/EMP-(\d+)/', $lastEmployee->employee_id, $matches)) {
                $num = intval($matches[1]) + 1;
            }
            $employeeId = 'EMP-' . $num;
        }

        // Check if employee_id or email already exists in MongoDB
        if (Employee::where('employee_id', $employeeId)->exists()) {
            return response()->json(['message' => 'An employee with this Employee ID already exists.'], 422);
        }

        $imagePath = null;
        if ($request->hasFile('profile_image')) {
            $imagePath = $request->file('profile_image')->store('profiles', 'public');
        }

        $employee = Employee::create([
            'employee_id' => $employeeId,
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'gender' => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'department' => $request->department,
            'position' => $request->position,
            'hire_date' => $request->hire_date,
            'salary' => (float) $request->salary,
            'status' => $request->status,
            'address' => $request->address,
            'profile_image' => $imagePath,
        ]);

        // Create associated MySQL user account if requested
        if ($request->boolean('create_user_account')) {
            $staffRole = Role::where('slug', 'staff')->first();
            $password = $request->filled('password') ? $request->password : 'password123';

            $user = User::updateOrCreate(
                ['email' => $request->email],
                [
                    'name' => $request->full_name,
                    'password' => Hash::make($password),
                    'role' => 'staff',
                    'role_id' => $staffRole ? $staffRole->id : null,
                    'is_active' => true,
                    'employee_id' => $employeeId,
                ]
            );

            $employee->update(['user_id' => $user->id]);
        }

        return response()->json([
            'message' => 'Employee created successfully',
            'employee' => $employee,
        ], 201);
    }

    /**
     * Display the specified employee along with historical data.
     */
    public function show($id)
    {
        $employee = Employee::where('employee_id', $id)->first() ?? Employee::find($id);

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $attendances = Attendance::where('employee_id', $employee->employee_id)
            ->orderBy('date', 'desc')
            ->take(30)
            ->get();

        $reports = Report::where('employee_id', $employee->employee_id)
            ->orderBy('date', 'desc')
            ->get();

        $salaries = SalaryPayment::where('employee_id', $employee->employee_id)
            ->orderBy('year', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $user = User::where('employee_id', $employee->employee_id)->orWhere('email', $employee->email)->first();

        return response()->json([
            'employee' => $employee,
            'attendances' => $attendances,
            'reports' => $reports,
            'salaries' => $salaries,
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
            ] : null,
        ]);
    }

    /**
     * Update the specified employee in MongoDB.
     */
    public function update(Request $request, $id)
    {
        $employee = Employee::where('employee_id', $id)->first() ?? Employee::find($id);

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:50',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'department' => 'required|string',
            'position' => 'required|string|max:255',
            'hire_date' => 'required|date',
            'salary' => 'required|numeric|min:0',
            'status' => 'required|in:Active,On Leave,Resigned,Terminated',
            'address' => 'nullable|string',
            'profile_image' => 'nullable|image|max:3072',
        ]);

        $data = [
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'gender' => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'department' => $request->department,
            'position' => $request->position,
            'hire_date' => $request->hire_date,
            'salary' => (float) $request->salary,
            'status' => $request->status,
            'address' => $request->address,
        ];

        if ($request->hasFile('profile_image')) {
            if ($employee->profile_image) {
                Storage::disk('public')->delete($employee->profile_image);
            }
            $data['profile_image'] = $request->file('profile_image')->store('profiles', 'public');
        }

        $employee->update($data);

        // Keep MySQL user synchronized if exists
        $user = User::where('employee_id', $employee->employee_id)->orWhere('id', $employee->user_id)->first();
        if ($user) {
            $user->update([
                'name' => $request->full_name,
                'email' => $request->email,
            ]);
        }

        return response()->json([
            'message' => 'Employee updated successfully',
            'employee' => $employee,
        ]);
    }

    /**
     * Remove the specified employee from MongoDB.
     */
    public function destroy($id)
    {
        $employee = Employee::where('employee_id', $id)->first() ?? Employee::find($id);

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        if ($employee->profile_image) {
            Storage::disk('public')->delete($employee->profile_image);
        }

        $employee->delete();

        return response()->json(['message' => 'Employee deleted successfully']);
    }
}
