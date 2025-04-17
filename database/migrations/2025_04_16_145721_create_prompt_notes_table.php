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
        Schema::create('prompt_notes', function (Blueprint $table) {
            $table->id();
            $table->morphs('promptable');
            $table->string('title');
            $table->text('prompt');
            $table->enum('is_public', ['0', '1', '2'])->comment('0 : pending, 1 : approved, 2 : rejected')->default('0');
            $table->foreignId('category_id')->nullable();
            // $table->string('platform')->nullable(); // e.g., ChatGPT, Midjourney, etc.
            $table->timestamps();
            $table->softDeletes();
        });

        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prompt_notes');
    }
};
