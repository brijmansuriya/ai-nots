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
        Schema::create('platform_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('platform_id')->constrained()->onDelete('cascade');
            $table->string('model_name');
            $table->integer('max_input_tokens')->default(128000);
            $table->integer('max_output_tokens')->default(4096);
            $table->decimal('cost_per_1k_input', 10, 6)->default(0.000000);
            $table->decimal('cost_per_1k_output', 10, 6)->default(0.000000);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_models');
    }
};
