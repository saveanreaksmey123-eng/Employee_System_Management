<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class SalaryPayment extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'salary_payments';

    protected $fillable = [
        'employee_id',
        'user_id',
        'employee_name',
        'department',
        'month',
        'year',
        'basic_salary',
        'bonus',
        'deduction',
        'net_salary',
        'payment_date',
        'payment_status', // Paid, Unpaid
        'note',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'year' => 'integer',
        'basic_salary' => 'float',
        'bonus' => 'float',
        'deduction' => 'float',
        'net_salary' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}
