<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Report;
use App\Models\SalaryPayment;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. MySQL Roles
        $adminRole = Role::updateOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin', 'description' => 'Organization Administrator with full access']
        );

        $staffRole = Role::updateOrCreate(
            ['slug' => 'staff'],
            ['name' => 'Staff', 'description' => 'Regular employee with self-service access']
        );

        // 2. MongoDB Departments
        $deptData = [
            [
                'name' => 'Engineering',
                'code' => 'ENG',
                'description' => 'Software development, infrastructure, and technical architecture.',
                'head_of_department' => 'John Doe',
                'status' => 'active',
            ],
            [
                'name' => 'Human Resources',
                'code' => 'HR',
                'description' => 'Talent acquisition, employee relations, and organizational culture.',
                'head_of_department' => 'Jane Smith',
                'status' => 'active',
            ],
            [
                'name' => 'Marketing',
                'code' => 'MKT',
                'description' => 'Brand strategy, social media campaigns, and product outreach.',
                'head_of_department' => 'Alex Wong',
                'status' => 'active',
            ],
            [
                'name' => 'Finance',
                'code' => 'FIN',
                'description' => 'Financial accounting, payroll processing, and budgeting.',
                'head_of_department' => 'Sarah Connor',
                'status' => 'active',
            ],
            [
                'name' => 'Operations',
                'code' => 'OPS',
                'description' => 'Daily workplace operations, logistics, and facilities.',
                'head_of_department' => 'David Miller',
                'status' => 'active',
            ],
        ];

        foreach ($deptData as $d) {
            Department::updateOrCreate(['name' => $d['name']], $d);
        }

        // 3. MySQL Users & MongoDB Employees
        // Admin User
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@ems.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'role_id' => $adminRole->id,
                'is_active' => true,
                'employee_id' => 'ADMIN-001',
            ]
        );

        // Staff 1
        $staff1 = User::updateOrCreate(
            ['email' => 'john.doe@ems.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('password123'),
                'role' => 'staff',
                'role_id' => $staffRole->id,
                'is_active' => true,
                'employee_id' => 'EMP-1001',
            ]
        );

        // Staff 2
        $staff2 = User::updateOrCreate(
            ['email' => 'jane.smith@ems.com'],
            [
                'name' => 'Jane Smith',
                'password' => Hash::make('password123'),
                'role' => 'staff',
                'role_id' => $staffRole->id,
                'is_active' => true,
                'employee_id' => 'EMP-1002',
            ]
        );

        // Staff 3
        $staff3 = User::updateOrCreate(
            ['email' => 'alex.wong@ems.com'],
            [
                'name' => 'Alex Wong',
                'password' => Hash::make('password123'),
                'role' => 'staff',
                'role_id' => $staffRole->id,
                'is_active' => true,
                'employee_id' => 'EMP-1003',
            ]
        );

        // Staff 4
        $staff4 = User::updateOrCreate(
            ['email' => 'sarah.c@ems.com'],
            [
                'name' => 'Sarah Connor',
                'password' => Hash::make('password123'),
                'role' => 'staff',
                'role_id' => $staffRole->id,
                'is_active' => true,
                'employee_id' => 'EMP-1004',
            ]
        );

        // MongoDB Employees
        $employees = [
            [
                'employee_id' => 'EMP-1001',
                'user_id' => $staff1->id,
                'full_name' => 'John Doe',
                'gender' => 'Male',
                'date_of_birth' => '1992-04-15',
                'phone' => '+855 12 345 678',
                'email' => 'john.doe@ems.com',
                'address' => 'Street 271, Phnom Penh, Cambodia',
                'department' => 'Engineering',
                'position' => 'Senior Full Stack Engineer',
                'hire_date' => '2022-03-01',
                'salary' => 3500.00,
                'status' => 'Active',
                'profile_image' => null,
            ],
            [
                'employee_id' => 'EMP-1002',
                'user_id' => $staff2->id,
                'full_name' => 'Jane Smith',
                'gender' => 'Female',
                'date_of_birth' => '1995-08-20',
                'phone' => '+855 89 654 321',
                'email' => 'jane.smith@ems.com',
                'address' => 'Norodom Blvd, Phnom Penh, Cambodia',
                'department' => 'Human Resources',
                'position' => 'HR Manager',
                'hire_date' => '2021-06-15',
                'salary' => 2800.00,
                'status' => 'Active',
                'profile_image' => null,
            ],
            [
                'employee_id' => 'EMP-1003',
                'user_id' => $staff3->id,
                'full_name' => 'Alex Wong',
                'gender' => 'Male',
                'date_of_birth' => '1994-11-10',
                'phone' => '+855 93 112 233',
                'email' => 'alex.wong@ems.com',
                'address' => 'Russian Federation Blvd, Phnom Penh',
                'department' => 'Marketing',
                'position' => 'Marketing Lead',
                'hire_date' => '2023-01-10',
                'salary' => 3000.00,
                'status' => 'Active',
                'profile_image' => null,
            ],
            [
                'employee_id' => 'EMP-1004',
                'user_id' => $staff4->id,
                'full_name' => 'Sarah Connor',
                'gender' => 'Female',
                'date_of_birth' => '1990-02-28',
                'phone' => '+855 10 998 877',
                'email' => 'sarah.c@ems.com',
                'address' => 'Mao Tse Toung Blvd, Phnom Penh',
                'department' => 'Finance',
                'position' => 'Senior Accountant',
                'hire_date' => '2020-09-01',
                'salary' => 3200.00,
                'status' => 'Active',
                'profile_image' => null,
            ],
            [
                'employee_id' => 'EMP-1005',
                'user_id' => null,
                'full_name' => 'David Miller',
                'gender' => 'Male',
                'date_of_birth' => '1996-07-04',
                'phone' => '+855 77 445 566',
                'email' => 'david.m@ems.com',
                'address' => 'Monivong Blvd, Phnom Penh',
                'department' => 'Operations',
                'position' => 'Operations Officer',
                'hire_date' => '2023-08-15',
                'salary' => 2200.00,
                'status' => 'Active',
                'profile_image' => null,
            ],
        ];

        foreach ($employees as $emp) {
            Employee::updateOrCreate(['employee_id' => $emp['employee_id']], $emp);
        }

        // 4. Attendance Seeding (Today + Recent days)
        $today = Carbon::today()->format('Y-m-d');
        $yesterday = Carbon::yesterday()->format('Y-m-d');

        $attendanceData = [
            [
                'employee_id' => 'EMP-1001',
                'employee_name' => 'John Doe',
                'department' => 'Engineering',
                'date' => $today,
                'check_in' => '08:02:15',
                'check_out' => null,
                'status' => 'Present',
                'work_hours' => 0,
                'notes' => 'On time arrival',
            ],
            [
                'employee_id' => 'EMP-1002',
                'employee_name' => 'Jane Smith',
                'department' => 'Human Resources',
                'date' => $today,
                'check_in' => '08:45:00',
                'check_out' => null,
                'status' => 'Late',
                'work_hours' => 0,
                'notes' => 'Traffic congestion',
            ],
            [
                'employee_id' => 'EMP-1003',
                'employee_name' => 'Alex Wong',
                'department' => 'Marketing',
                'date' => $today,
                'check_in' => '07:55:00',
                'check_out' => null,
                'status' => 'Present',
                'work_hours' => 0,
                'notes' => 'Early bird',
            ],
            [
                'employee_id' => 'EMP-1004',
                'employee_name' => 'Sarah Connor',
                'department' => 'Finance',
                'date' => $today,
                'check_in' => null,
                'check_out' => null,
                'status' => 'Absent',
                'work_hours' => 0,
                'notes' => 'Sick leave requested',
            ],
            // Yesterday record
            [
                'employee_id' => 'EMP-1001',
                'employee_name' => 'John Doe',
                'department' => 'Engineering',
                'date' => $yesterday,
                'check_in' => '08:00:00',
                'check_out' => '17:05:00',
                'status' => 'Present',
                'work_hours' => 8.0,
                'notes' => 'Completed all tasks',
            ],
        ];

        foreach ($attendanceData as $att) {
            Attendance::updateOrCreate(
                ['employee_id' => $att['employee_id'], 'date' => $att['date']],
                $att
            );
        }

        // 5. Staff Reports Seeding
        $reportData = [
            [
                'title' => 'Weekly Sprint 42 Technical Progress',
                'description' => 'Completed the core microservices migration and optimized MongoDB aggregation pipelines.',
                'employee_id' => 'EMP-1001',
                'user_id' => $staff1->id,
                'staff_name' => 'John Doe',
                'department' => 'Engineering',
                'date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'attachment' => null,
                'attachment_name' => null,
                'status' => 'Reviewed',
                'admin_comment' => 'Great work on the MongoDB performance optimization!',
                'reviewed_by' => 'System Administrator',
                'reviewed_at' => Carbon::now()->subDay(),
            ],
            [
                'title' => 'Q4 Recruitment Strategy and Onboarding Plan',
                'description' => 'Drafted guidelines for recruiting 5 new senior engineers and updated employee handbook.',
                'employee_id' => 'EMP-1002',
                'user_id' => $staff2->id,
                'staff_name' => 'Jane Smith',
                'department' => 'Human Resources',
                'date' => Carbon::now()->format('Y-m-d'),
                'attachment' => null,
                'attachment_name' => null,
                'status' => 'Pending',
                'admin_comment' => null,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ],
            [
                'title' => 'Product Launch Campaign Analytics',
                'description' => 'Social media ads conversion reached 14.8% with 25k click-throughs in the first 48 hours.',
                'employee_id' => 'EMP-1003',
                'user_id' => $staff3->id,
                'staff_name' => 'Alex Wong',
                'department' => 'Marketing',
                'date' => Carbon::now()->subDays(1)->format('Y-m-d'),
                'attachment' => null,
                'attachment_name' => null,
                'status' => 'Pending',
                'admin_comment' => null,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ],
        ];

        foreach ($reportData as $rep) {
            Report::updateOrCreate(
                ['title' => $rep['title'], 'employee_id' => $rep['employee_id']],
                $rep
            );
        }

        // 6. Salary Payments Seeding
        $currentMonth = Carbon::now()->format('F');
        $currentYear = (int) Carbon::now()->format('Y');
        $prevMonth = Carbon::now()->subMonth()->format('F');

        $salaryData = [
            [
                'employee_id' => 'EMP-1001',
                'user_id' => $staff1->id,
                'employee_name' => 'John Doe',
                'department' => 'Engineering',
                'month' => $currentMonth,
                'year' => $currentYear,
                'basic_salary' => 3500.00,
                'bonus' => 300.00,
                'deduction' => 0.00,
                'net_salary' => 3800.00,
                'payment_date' => Carbon::now()->format('Y-m-d'),
                'payment_status' => 'Paid',
                'note' => 'Monthly salary with performance bonus',
            ],
            [
                'employee_id' => 'EMP-1002',
                'user_id' => $staff2->id,
                'employee_name' => 'Jane Smith',
                'department' => 'Human Resources',
                'month' => $currentMonth,
                'year' => $currentYear,
                'basic_salary' => 2800.00,
                'bonus' => 150.00,
                'deduction' => 50.00,
                'net_salary' => 2900.00,
                'payment_date' => null,
                'payment_status' => 'Unpaid',
                'note' => 'Pending monthly review',
            ],
            [
                'employee_id' => 'EMP-1003',
                'user_id' => $staff3->id,
                'employee_name' => 'Alex Wong',
                'department' => 'Marketing',
                'month' => $currentMonth,
                'year' => $currentYear,
                'basic_salary' => 3000.00,
                'bonus' => 200.00,
                'deduction' => 0.00,
                'net_salary' => 3200.00,
                'payment_date' => Carbon::now()->format('Y-m-d'),
                'payment_status' => 'Paid',
                'note' => 'Campaign bonus included',
            ],
            [
                'employee_id' => 'EMP-1004',
                'user_id' => $staff4->id,
                'employee_name' => 'Sarah Connor',
                'department' => 'Finance',
                'month' => $currentMonth,
                'year' => $currentYear,
                'basic_salary' => 3200.00,
                'bonus' => 0.00,
                'deduction' => 100.00,
                'net_salary' => 3100.00,
                'payment_date' => null,
                'payment_status' => 'Unpaid',
                'note' => 'Under processing',
            ],
            // Previous month
            [
                'employee_id' => 'EMP-1001',
                'user_id' => $staff1->id,
                'employee_name' => 'John Doe',
                'department' => 'Engineering',
                'month' => $prevMonth,
                'year' => $currentYear,
                'basic_salary' => 3500.00,
                'bonus' => 0.00,
                'deduction' => 0.00,
                'net_salary' => 3500.00,
                'payment_date' => Carbon::now()->subMonth()->endOfMonth()->format('Y-m-d'),
                'payment_status' => 'Paid',
                'note' => 'Regular monthly payout',
            ],
        ];

        foreach ($salaryData as $sal) {
            SalaryPayment::updateOrCreate(
                ['employee_id' => $sal['employee_id'], 'month' => $sal['month'], 'year' => $sal['year']],
                $sal
            );
        }
    }
}
