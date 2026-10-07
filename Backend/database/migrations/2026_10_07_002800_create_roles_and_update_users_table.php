<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Admin, Staff
            $table->string('slug')->unique(); // admin, staff
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('password')->constrained('roles')->nullOnDelete();
            $table->string('role')->default('staff')->after('role_id'); // admin, staff
            $table->boolean('is_active')->default(true)->after('role');
            $table->string('employee_id')->nullable()->after('is_active'); // Links to MongoDB employee_id
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn(['role_id', 'role', 'is_active', 'employee_id']);
        });

        Schema::dropIfExists('roles');
    }
};
