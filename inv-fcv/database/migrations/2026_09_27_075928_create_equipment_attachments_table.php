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
        Schema::create('equipment_attachments', function (Blueprint $table) {
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
            */
            $table->foreignUuid('equipment_id')
                ->constrained('equipments')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Equipment Assignment
            |--------------------------------------------------------------------------
            */
            $table->foreignUuid('equipment_assignment_id')
                ->nullable()
                ->constrained('equipment_assignments')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Attachment Type
            |--------------------------------------------------------------------------
            */
            $table->foreignUuid('attachment_type_id')
                ->constrained('attachment_types')
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Attachment Information
            |--------------------------------------------------------------------------
            */
            $table->string('name');

            $table->string('file_path');

            $table->string('file_name');

            $table->string('mime_type')
                ->nullable();

            $table->unsignedBigInteger('file_size')
                ->nullable();

            $table->text('description')
                ->nullable();

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
            $table->index('equipment_id');

            $table->index('equipment_assignment_id');

            $table->index('attachment_type_id');

            $table->index('encoded_by');

            $table->index('updated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_attachments');
    }
};
