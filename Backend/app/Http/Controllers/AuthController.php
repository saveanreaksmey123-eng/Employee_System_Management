<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate user and issue Sanctum token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('roleModel')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact an administrator.',
            ], 403);
        }

        // Revoke existing tokens for a clean single/multi session
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        // Fetch employee details from MongoDB
        $employee = $user->employee();

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_id' => $user->role_id,
                'is_active' => $user->is_active,
                'employee_id' => $user->employee_id,
            ],
            'employee' => $employee,
        ]);
    }

    /**
     * Get authenticated user profile & linked employee info.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('roleModel');
        $employee = $user->employee();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_id' => $user->role_id,
                'is_active' => $user->is_active,
                'employee_id' => $user->employee_id,
            ],
            'employee' => $employee,
        ]);
    }

    /**
     * Log out current user & revoke token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
