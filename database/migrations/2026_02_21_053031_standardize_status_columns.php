<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Standardize categories table
        if (Schema::hasColumn('categories', 'status')) {
            // Convert existing data if any
            DB::table('categories')->where('status', 'active')->update(['status' => '1']);
            DB::table('categories')->where('status', 'pending')->update(['status' => '0']);
            DB::table('categories')->where('status', 'deactive')->update(['status' => '2']);

            Schema::table('categories', function (Blueprint $table) {
                $table->enum('status', ['0', '1', '2'])
                    ->default('1')
                    ->comment('0: pending, 1: active, 2: deactive/rejected')
                    ->change();
            });
        }

        // Standardize tags table (ensuring it matches the latest format)
        if (Schema::hasColumn('tags', 'status')) {
            // Convert existing data if any strings exist
            DB::table('tags')->where('status', 'active')->update(['status' => '1']);
            DB::table('tags')->where('status', 'pending')->update(['status' => '0']);
            DB::table('tags')->where('status', 'deactive')->update(['status' => '2']);

            Schema::table('tags', function (Blueprint $table) {
                $table->enum('status', ['0', '1', '2'])
                    ->default('1')
                    ->comment('0: pending, 1: active, 2: deactive/rejected')
                    ->change();
            });
        }

        // Ensure platforms table is also consistent (it already uses '0', '1', '2' in its latest migration)
        if (Schema::hasColumn('platforms', 'status')) {
            Schema::table('platforms', function (Blueprint $table) {
                $table->enum('status', ['0', '1', '2'])
                    ->default('1')
                    ->comment('0: pending, 1: active, 2: deactive/rejected')
                    ->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Categories
        Schema::table('categories', function (Blueprint $table) {
            $table->enum('status', ['pending', 'active', 'deactive'])->default('pending')->change();
        });

        // Tags
        Schema::table('tags', function (Blueprint $table) {
            $table->enum('status', ['pending', 'active', 'deactive'])->default('pending')->change();
        });

        // Platforms (keep as '0', '1', '2' since it was created that way in the original file we're trying to fix)
    }
};
