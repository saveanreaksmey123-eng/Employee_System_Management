<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Get staff profile details.
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'employee' => $employee,
        ]);
    }

    /**
     * Update allowed staff profile information.
     * RESTRICTION: Employee ID, Department, Position, Salary, Hire Date are strictly locked for staff.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        if (!$employee) {
            return response()->json(['message' => 'Linked employee profile not found'], 404);
        }

        $request->validate([
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
        ]);

        // Explicitly only permit updating allowed fields
        $employee->update([
            'phone' => $request->phone,
            'address' => $request->address,
            'gender' => $request->gender,
            'date_of_birth' => $request->date_of_birth,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'employee' => $employee,
        ]);
    }

    /**
     * Upload staff avatar image.
     */
    public function uploadAvatar(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee();

        if (!$employee) {
            return response()->json(['message' => 'Linked employee profile not found'], 404);
        }

        $request->validate([
            'profile_image' => 'required|image|max:4096',
        ]);

        if ($employee->profile_image) {
            Storage::disk('public')->delete($employee->profile_image);
        }

        $path = $request->file('profile_image')->store('profiles', 'public');
        $employee->update(['profile_image' => $path]);

        return response()->json([
            'message' => 'Profile image uploaded successfully',
            'profile_image' => $path,
            'employee' => $employee,
        ]);
    }

    /**
     * Change staff password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Your current password is incorrect.'],
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }
}
