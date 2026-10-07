<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Employee extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'employees';

    protected $fillable = [
        'employee_id',
        'user_id',
        'full_name',
        'gender',
        'date_of_birth',
        'phone',
        'email',
        'address',
        'department',
        'position',
        'hire_date',
        'salary',
        'status',
        'profile_image',
    ];

    protected $casts = [
        'salary' => 'float',
        'user_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function departmentModel()
    {
        return $this->belongsTo(Department::class, 'department', 'name');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'employee_id', 'employee_id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'employee_id', 'employee_id');
    }

    public function salaryPayments()
    {
        return $this->hasMany(SalaryPayment::class, 'employee_id', 'employee_id');
    }
}
