<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contents_media_pivot', function (Blueprint $table) {
            $table->id();

            $table->foreignId('content_id')
                ->constrained('contents')
                ->cascadeOnDelete();

            $table->foreignId('media_id')
                ->constrained('content_media')
                ->cascadeOnDelete();

            $table->enum('type', [
                'banner',
                'featured',
                'attachment',
                'gallery',
                'inline',
            ])->default('attachment');

            $table->timestamps();

            $table->index(['content_id', 'type']);
            $table->index(['media_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contents_media_pivot');
    }
};
