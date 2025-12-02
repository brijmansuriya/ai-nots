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
        Schema::create('prompt_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prompt_note_id')->constrained('prompt_notes')->onDelete('cascade');
            $table->unsignedInteger('version_number'); // Version number (1, 2, 3, etc.)
            $table->string('title'); // Snapshot of title
            $table->text('prompt'); // Snapshot of prompt content
            $table->text('description')->nullable(); // Snapshot of description
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null'); // Who created this version
            $table->text('change_summary')->nullable(); // Optional summary of what changed
            $table->json('metadata')->nullable(); // Store additional data like tags, category, etc.
            $table->timestamps();

            // Ensure version numbers are unique per prompt
            $table->unique(['prompt_note_id', 'version_number']);
            
            // Index for faster queries
            $table->index('prompt_note_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prompt_versions');
    }
};
