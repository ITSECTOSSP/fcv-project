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
        Schema::create('equipment_transfers', function (Blueprint $table) {
            /*
            |--------------------------------------------------------------------------
            | Primary Key
            |--------------------------------------------------------------------------
            */

            $table->uuid('id')->primary();

            /*
            |--------------------------------------------------------------------------
            | Equipment
            |--------------------------------------------------------------------------
            |
            | References the equipment involved in the transfer.
            |
            */

            $table->foreignUuid('equipment_id')
                ->constrained('equipments')
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Source Assignment
            |--------------------------------------------------------------------------
            |
            | The assignment from which the equipment is being transferred.
            |
            */

            $table->foreignUuid('from_assignment_id')
                ->constrained('equipment_assignments')
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Destination Assignment
            |--------------------------------------------------------------------------
            |
            | The new assignment created for the receiving employee.
            |
            */

            $table->foreignUuid('to_assignment_id')
                ->constrained('equipment_assignments')
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Transfer Quantity
            |--------------------------------------------------------------------------
            |
            | Allows full or partial quantity transfers.
            |
            */

            $table->unsignedInteger('quantity');

            /*
            |--------------------------------------------------------------------------
            | Transfer Date
            |--------------------------------------------------------------------------
            */

            $table->date('transferred_at');

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
            | References users.id in auth-fcv.
            | No database foreign key is used because auth-fcv
            | is a separate microservice/database.
            |
            */

            $table->uuid('encoded_by');

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

            $table->index('equipment_id');
            $table->index('from_assignment_id');
            $table->index('to_assignment_id');
            $table->index('transferred_at');
            $table->index('encoded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_transfers');
    }
};
