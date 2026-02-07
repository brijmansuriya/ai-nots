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
        if (!Schema::hasTable('tags')) { // Check if the table already exists
            Schema::create('tags', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->string('created_by_type');
                $table->unsignedBigInteger('created_by_id');
                $table->enum('status', ['0', '1', '2'])->comment('0 : pending, 1 : approved, 2 : rejected')->default('1');
                $table->enum('is_public', ['0', '1','2'])->comment('0 : pending, 1 : approved, 2 : rejected')->default('1'); // Add this column
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};
