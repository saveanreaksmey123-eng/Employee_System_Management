<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EmployeeController as AdminEmployeeController;
use App\Http\Controllers\Admin\DepartmentController as AdminDepartmentController;
use App\Http\Controllers\Admin\AttendanceController as AdminAttendanceController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\SalaryController as AdminSalaryController;

use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\Staff\ProfileController as StaffProfileController;
use App\Http\Controllers\Staff\AttendanceController as StaffAttendanceController;
use App\Http\Controllers\Staff\ReportController as StaffReportController;
use App\Http\Controllers\Staff\SalaryController as StaffSalaryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
});

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Admin Only Routes
    Route::prefix('admin')->middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {
        // Dashboard
        Route::get('dashboard/stats', [AdminDashboardController::class, 'stats']);

        // Employees Management
        Route::get('employees', [AdminEmployeeController::class, 'index']);
        Route::post('employees', [AdminEmployeeController::class, 'store']);
        Route::get('employees/{id}', [AdminEmployeeController::class, 'show']);
        Route::post('employees/{id}', [AdminEmployeeController::class, 'update']); // for multipart update
        Route::put('employees/{id}', [AdminEmployeeController::class, 'update']);
        Route::delete('employees/{id}', [AdminEmployeeController::class, 'destroy']);

        // Departments Management
        Route::get('departments', [AdminDepartmentController::class, 'index']);
        Route::post('departments', [AdminDepartmentController::class, 'store']);
        Route::get('departments/{id}', [AdminDepartmentController::class, 'show']);
        Route::put('departments/{id}', [AdminDepartmentController::class, 'update']);
        Route::delete('departments/{id}', [AdminDepartmentController::class, 'destroy']);

        // Attendance Management
        Route::get('attendance', [AdminAttendanceController::class, 'index']);
        Route::get('attendance/today', [AdminAttendanceController::class, 'today']);
        Route::get('attendance/employee/{employeeId}', [AdminAttendanceController::class, 'employeeHistory']);
        Route::post('attendance/mark', [AdminAttendanceController::class, 'markAttendance']);

        // Staff Reports Management
        Route::get('reports', [AdminReportController::class, 'index']);
        Route::get('reports/{id}', [AdminReportController::class, 'show']);
        Route::put('reports/{id}/review', [AdminReportController::class, 'review']);
        Route::delete('reports/{id}', [AdminReportController::class, 'destroy']);

        // User Accounts Management
        Route::get('users', [AdminUserController::class, 'index']);
        Route::post('users', [AdminUserController::class, 'store']);
        Route::put('users/{id}', [AdminUserController::class, 'update']);
        Route::patch('users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);
        Route::post('users/{id}/reset-password', [AdminUserController::class, 'resetPassword']);
        Route::get('roles', [AdminUserController::class, 'roles']);

        // Salary / Payroll Management
        Route::get('salaries', [AdminSalaryController::class, 'index']);
        Route::post('salaries', [AdminSalaryController::class, 'store']);
        Route::get('salaries/{id}', [AdminSalaryController::class, 'show']);
        Route::put('salaries/{id}', [AdminSalaryController::class, 'update']);
        Route::patch('salaries/{id}/mark-paid', [AdminSalaryController::class, 'markPaid']);
        Route::post('salaries/generate-monthly', [AdminSalaryController::class, 'generateMonthly']);
        Route::delete('salaries/{id}', [AdminSalaryController::class, 'destroy']);
    });

    // Staff Only Routes
    Route::prefix('staff')->middleware(\App\Http\Middleware\StaffMiddleware::class)->group(function () {
        // Staff Dashboard
        Route::get('dashboard', [StaffDashboardController::class, 'index']);

        // My Profile
        Route::get('profile', [StaffProfileController::class, 'getProfile']);
        Route::put('profile', [StaffProfileController::class, 'updateProfile']);
        Route::post('profile/avatar', [StaffProfileController::class, 'uploadAvatar']);
        Route::post('profile/change-password', [StaffProfileController::class, 'changePassword']);

        // My Attendance
        Route::get('attendance/today', [StaffAttendanceController::class, 'today']);
        Route::post('attendance/check-in', [StaffAttendanceController::class, 'checkIn']);
        Route::post('attendance/check-out', [StaffAttendanceController::class, 'checkOut']);
        Route::get('attendance/history', [StaffAttendanceController::class, 'history']);

        // My Reports
        Route::get('reports', [StaffReportController::class, 'index']);
        Route::post('reports', [StaffReportController::class, 'store']);
        Route::get('reports/{id}', [StaffReportController::class, 'show']);
        Route::post('reports/{id}/update', [StaffReportController::class, 'update']); // for multipart update
        Route::put('reports/{id}', [StaffReportController::class, 'update']);
        Route::delete('reports/{id}', [StaffReportController::class, 'destroy']);

        // My Salary
        Route::get('salaries', [StaffSalaryController::class, 'index']);
        Route::get('salaries/current', [StaffSalaryController::class, 'current']);
    });
});
