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
        Schema::table('prompt_notes', function (Blueprint $table) {
            $table->unsignedInteger('save_count')->default(0)->after('category_id');
            $table->unsignedInteger('copy_count')->default(0)->after('save_count');
            $table->unsignedInteger('likes_count')->default(0)->after('copy_count');
            $table->unsignedInteger('views_count')->default(0)->after('likes_count');
            $table->decimal('popularity_score', 10, 2)->default(0.00)->after('views_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prompt_notes', function (Blueprint $table) {
            $table->dropColumn(['save_count', 'copy_count', 'likes_count', 'views_count', 'popularity_score']);
        });
    }
};
