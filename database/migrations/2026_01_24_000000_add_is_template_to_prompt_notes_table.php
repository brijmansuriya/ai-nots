<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prompt_notes', function (Blueprint $table) {
            $table->boolean('is_template')->default(false)->after('promptable_type')->index();
        });

        // Populate is_template based on current logic (if needed)
        // \DB::table('prompt_notes')->where('promptable_type', 'admin')->update(['is_template' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prompt_notes', function (Blueprint $table) {
            $table->dropColumn('is_template');
        });
    }
};
