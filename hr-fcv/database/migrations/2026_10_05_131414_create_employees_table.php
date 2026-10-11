<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->uuid('id')->primary();

            /*
             |--------------------------------------------------------------------------
             | Employee Information
             |--------------------------------------------------------------------------
             */

            $table->string('first_name');

            $table->string('middle_name')
                ->nullable();

            $table->string('last_name');

            $table->date('date_birth');

            $table->string('email')
                ->unique();

            $table->string('contact_number')
                ->unique();

            $table->foreignId('section_id')
                ->constrained('sections')
                ->restrictOnDelete();

            $table->string('status')
                ->default('active');

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
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
