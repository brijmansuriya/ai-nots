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
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Changed 'name' to 'title' for clarity
            $table->string('slug')->unique(); // Unique slug for SEO-friendly URLs
            $table->text('description')->nullable(); // Single description field
            $table->enum('status', ['pending', 'active', 'deactive'])->default('pending'); // Status field
            $table->morphs('created_by'); // Polymorphic: created_by_id and created_by_type
            $table->timestamps();
            // Soft delete field
            $table->softDeletes();
            // Indexes for better performance
            $table->index(['created_by_id', 'created_by_type']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};
