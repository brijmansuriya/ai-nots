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
        $tables = ['prompt_notes', 'tags', 'categories', 'platforms'];

        foreach ($tables as $table) {
            // Any status that is not '0', '1', or '2' should be set to '1' (Active)
            DB::table($table)
                ->whereNotIn('status', ['0', '1', '2'])
                ->orWhereNull('status')
                ->update(['status' => '1']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No easy way to revert this without knowing old values, 
        // but '1' is a safe default and consistent with the new standard.
    }
};
