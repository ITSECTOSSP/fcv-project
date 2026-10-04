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
        Schema::create('equipment_assignments', function (Blueprint $table) {
            /*
            |--------------------------------------------------------------------------
            | Primary Key
            |--------------------------------------------------------------------------
            */

            $table->uuid('id')->primary();

            /*
            |--------------------------------------------------------------------------
            | Assignment Group
            |--------------------------------------------------------------------------
            |
            | Groups all assignment records belonging to the same equipment
            | assignment lifecycle.
            |
            | Example:
            |
            | Assignment #1 → Employee A
            | Assignment #2 → Employee B
            | Assignment #3 → Employee C
            |
            | All three assignments share the same assignment_group_id.
            |
            */

            $table->uuid('assignment_group_id');

            /*
            |--------------------------------------------------------------------------
            | Equipment
            |--------------------------------------------------------------------------
            */

            $table->foreignUuid('equipment_id')
                ->constrained('equipments')
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Equipment Identification
            |--------------------------------------------------------------------------
            |
            | These values identify the specific equipment unit at the time
            | of assignment.
            |
            | Example:
            |
            | Equipment property number: PN-001
            |
            | Assignment property numbers:
            | PN-001-001
            | PN-001-002
            | PN-001-003
            |
            */

            $table->string('property_number');

            $table->string('serial_number')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Care Of
            |--------------------------------------------------------------------------
            |
            | Determines whether the equipment is officially under
            | the care of an employee.
            |
            */

            $table->boolean('is_care_of')
                ->default(false);

            /*
            |--------------------------------------------------------------------------
            | Care Of Employee
            |--------------------------------------------------------------------------
            |
            | References employees.id in hr-fcv.
            | No database foreign key is used because HR-FCV
            | is a separate microservice/database.
            |
            */

            $table->uuid('care_of_employee_id')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Actual User
            |--------------------------------------------------------------------------
            |
            | References employees.id in hr-fcv.
            | No database foreign key is used because HR-FCV
            | is a separate microservice/database.
            |
            */

            $table->uuid('user_employee_id');

            /*
            |--------------------------------------------------------------------------
            | Assignment Quantity
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('quantity');

            /*
            |--------------------------------------------------------------------------
            | Assignment Dates
            |--------------------------------------------------------------------------
            */

            $table->date('assigned_at');

            $table->date('returned_at')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Assignment Status
            |--------------------------------------------------------------------------
            |
            | active      = Currently assigned to the employee.
            | returned    = Returned to the office/inventory.
            | transferred = Transferred to another employee.
            | disposed    = Equipment was disposed.
            |
            */

            $table->enum('status', [
                'active',
                'returned',
                'transferred',
                'disposed',
            ])->default('active');

            /*
            |--------------------------------------------------------------------------
            | Remarks
            |--------------------------------------------------------------------------
            */

            $table->text('remarks')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Audit Information
            |--------------------------------------------------------------------------
            |
            | These reference users.id in auth-fcv.
            | No database foreign key is used because auth-fcv
            | is a separate microservice/database.
            |
            */

            $table->uuid('encoded_by');

            $table->uuid('updated_by')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Timestamps
            |--------------------------------------------------------------------------
            */

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index('assignment_group_id');

            $table->index('care_of_employee_id');
            $table->index('user_employee_id');
            $table->index('property_number');
            $table->index('serial_number');
            $table->index('encoded_by');
            $table->index('updated_by');
            $table->index('assigned_at');
            $table->index('returned_at');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_assignments');
    }
};
