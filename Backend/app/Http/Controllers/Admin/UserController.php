<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of user accounts.
     */
    public function index(Request $request)
    {
        $query = User::with('roleModel');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('is_active') && $request->is_active !== '' && $request->is_active !== null) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = $request->get('per_page', 15);
        $users = $query->orderBy('id', 'desc')->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Store a newly created user account.
     */
    public function store(Request $request)
    {
        if ($request->has('is_active')) {
            $request->merge([
                'is_active' => $request->boolean('is_active'),
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,staff',
            'is_active' => 'required|boolean',
            'employee_id' => 'nullable|string',
        ]);

        $roleModel = Role::where('slug', strtolower($request->role))->first();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => strtolower($request->role),
            'role_id' => $roleModel ? $roleModel->id : null,
            'is_active' => $request->boolean('is_active', true),
            'employee_id' => $request->employee_id,
        ]);

        // If employee_id is given, sync MongoDB employee user_id
        if ($request->filled('employee_id')) {
            $emp = Employee::where('employee_id', $request->employee_id)->first();
            if ($emp) {
                $emp->update(['user_id' => $user->id]);
            }
        }

        return response()->json([
            'message' => 'User account created successfully',
            'user' => $user->load('roleModel'),
        ], 201);
    }

    /**
     * Update user details.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => 'required|in:admin,staff',
            'is_active' => 'required|boolean',
            'employee_id' => 'nullable|string',
        ]);

        $roleModel = Role::where('slug', strtolower($request->role))->first();

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => strtolower($request->role),
            'role_id' => $roleModel ? $roleModel->id : $user->role_id,
            'is_active' => $request->boolean('is_active'),
            'employee_id' => $request->employee_id,
        ]);

        return response()->json([
            'message' => 'User account updated successfully',
            'user' => $user->load('roleModel'),
        ]);
    }

    /**
     * Toggle active / inactive status of user.
     */
    public function toggleStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent admin deactivating themselves
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot deactivate your own admin account.'], 422);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        // If deactivated, revoke all their active tokens
        if (!$user->is_active) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => $user->is_active ? 'User activated successfully' : 'User deactivated successfully',
            'is_active' => $user->is_active,
        ]);
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user->password = Hash::make($request->password);
        $user->save();

        // Invalidate active sessions
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successfully for user: ' . $user->email,
        ]);
    }

    /**
     * Get all available roles from MySQL.
     */
    public function roles()
    {
        return response()->json(Role::all());
    }
}
