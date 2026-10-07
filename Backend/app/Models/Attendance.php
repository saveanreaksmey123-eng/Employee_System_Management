<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Attendance extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'attendance';

    protected $fillable = [
        'employee_id',
        'employee_name',
        'department',
        'date',
        'check_in',
        'check_out',
        'status', // Present, Late, Absent, Half Day, On Leave
        'work_hours',
        'notes',
    ];

    protected $casts = [
        'work_hours' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}
