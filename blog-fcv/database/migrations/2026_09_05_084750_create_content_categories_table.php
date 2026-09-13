<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contents_categories_pivot', function (Blueprint $table) {
            $table->id();

            $table->foreignId('content_id')
                ->constrained('contents')
                ->cascadeOnDelete();

            $table->foreignId('category_id')
                ->constrained('content_categories')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique([
                'content_id',
                'category_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contents_categories_pivot');
    }
};
