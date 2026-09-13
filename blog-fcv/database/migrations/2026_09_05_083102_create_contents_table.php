<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('content_type_id')
                ->constrained('content_types')
                ->restrictOnDelete();

            /*
             * This is the ID of the authenticated user
             * from auth-fcv.
             *
             * No cross-database foreign key.
             */
            $table->unsignedBigInteger('author_id')->nullable();

            $table->string('title');
            $table->string('slug')->unique();

            $table->text('excerpt')->nullable();

            $table->longText('content')->nullable();

            $table->enum('status', [
                'draft',
                'pending',
                'published',
                'archived',
            ])->default('draft');

            $table->boolean('is_featured')->default(false);

            $table->timestamp('published_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('author_id');
            $table->index('status');
            $table->index('published_at');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contents');
    }
};
