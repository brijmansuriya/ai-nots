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
        Schema::create('prompt_note_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prompt_note_id');
            $table->foreignId('tag_id');
            $table->softDeletes(); // only needed if you really want to soft-delete pivot records
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prompt_note_tag');
    }
};
