<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     */
    public function index()
    {
        $departments = Department::all();

        // Calculate dynamic employee count for each department
        $data = $departments->map(function ($dept) {
            $count = Employee::where('department', $dept->name)->count();
            return [
                'id' => $dept->_id ?? $dept->id,
                'name' => $dept->name,
                'code' => $dept->code,
                'description' => $dept->description,
                'head_of_department' => $dept->head_of_department,
                'status' => $dept->status,
                'employee_count' => $count,
                'created_at' => $dept->created_at,
            ];
        });

        return response()->json($data);
    }

    /**
     * Store a newly created department.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'description' => 'nullable|string',
            'head_of_department' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        if (Department::where('name', $request->name)->exists()) {
            return response()->json(['message' => 'Department name already exists.'], 422);
        }

        $department = Department::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'head_of_department' => $request->head_of_department,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Department created successfully',
            'department' => $department,
        ], 201);
    }

    /**
     * Display department details along with its employees.
     */
    public function show($id)
    {
        $department = Department::find($id) ?? Department::where('name', $id)->first();

        if (!$department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        $employees = Employee::where('department', $department->name)->get();

        return response()->json([
            'department' => $department,
            'employee_count' => $employees->count(),
            'employees' => $employees,
        ]);
    }

    /**
     * Update the specified department.
     */
    public function update(Request $request, $id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'description' => 'nullable|string',
            'head_of_department' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $oldName = $department->name;

        $department->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'head_of_department' => $request->head_of_department,
            'status' => $request->status,
        ]);

        // If department name changed, sync employees
        if ($oldName !== $request->name) {
            Employee::where('department', $oldName)->update(['department' => $request->name]);
        }

        return response()->json([
            'message' => 'Department updated successfully',
            'department' => $department,
        ]);
    }

    /**
     * Remove the specified department.
     */
    public function destroy($id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        $assignedEmployees = Employee::where('department', $department->name)->count();
        if ($assignedEmployees > 0) {
            return response()->json([
                'message' => "Cannot delete department '{$department->name}' because it contains {$assignedEmployees} employee(s). Please reassign them first.",
            ], 422);
        }

        $department->delete();

        return response()->json(['message' => 'Department deleted successfully']);
    }
}
