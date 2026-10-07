<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Department extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'departments';

    protected $fillable = [
        'name',
        'code',
        'description',
        'head_of_department',
        'status', // active, inactive
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class, 'department', 'name');
    }
}
