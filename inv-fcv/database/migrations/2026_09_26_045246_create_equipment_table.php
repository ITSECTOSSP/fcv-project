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
        Schema::create('equipments', function (Blueprint $table) {
            /*
            |--------------------------------------------------------------------------
            | Primary Key
            |--------------------------------------------------------------------------
            */

            $table->uuid('id')->primary();

            /*
            |--------------------------------------------------------------------------
            | Equipment Information
            |--------------------------------------------------------------------------
            */

            $table->date('date_acquired');

            $table->unsignedInteger('quantity')
                ->default(1);

            $table->foreignUuid('equipment_type_id')
                ->constrained('equipment_types')
                ->restrictOnDelete();

            $table->text('description');

            $table->string('property_number')
                ->unique();

            $table->string('serial_number')
                ->nullable()
                ->unique();

            $table->decimal('unit_cost', 15, 2);

            /*
            |--------------------------------------------------------------------------
            | Audit Information
            |--------------------------------------------------------------------------
            |
            | These UUIDs reference users.id in auth-fcv.
            | No database foreign keys are used because auth-fcv
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

            $table->index('encoded_by');
            $table->index('updated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipments');
    }
};