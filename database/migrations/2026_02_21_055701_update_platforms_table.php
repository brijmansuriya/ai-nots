<?php

use App\Enums\ProviderType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('platforms', function (Blueprint $table) {
            $table->string('slug')->unique()->after('name');
            $table->text('description')->nullable()->after('slug');
            $table->string('provider_type')->default(ProviderType::OPENAI->value)->after('description');
            $table->string('api_base_url')->nullable()->after('provider_type');
            $table->boolean('is_active')->default(true)->after('api_base_url');

            // Validation Defaults
            $table->integer('max_prompt_length')->default(8000)->after('is_active');
            $table->integer('max_output_tokens')->default(4000)->after('max_prompt_length');

            // Feature Flags
            $table->boolean('supports_system_prompt')->default(true)->after('max_output_tokens');
            $table->boolean('supports_temperature')->default(true)->after('supports_system_prompt');
            $table->boolean('supports_top_p')->default(true)->after('supports_temperature');
            $table->boolean('supports_streaming')->default(true)->after('supports_top_p');
            $table->boolean('supports_frequency_penalty')->default(true)->after('supports_streaming');
            $table->boolean('supports_presence_penalty')->default(true)->after('supports_frequency_penalty');

            // Variable Config
            $table->string('variable_pattern')->default('/\[(.*?)\]/')->after('supports_presence_penalty');

            // Default AI Config
            $table->decimal('default_temperature', 3, 2)->default(1.00)->after('variable_pattern');
            $table->integer('default_max_tokens')->default(1000)->after('default_temperature');

            // Remove old status column if you want, but maybe keep it if it's used elsewhere
            // For now, I'll keep it or rename it if needed.
            // The user requested is_active, so I'll use that for the platform status.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('platforms', function (Blueprint $table) {
            $table->dropColumn([
                'slug',
                'description',
                'provider_type',
                'api_base_url',
                'is_active',
                'max_prompt_length',
                'max_output_tokens',
                'supports_system_prompt',
                'supports_temperature',
                'supports_top_p',
                'supports_streaming',
                'supports_frequency_penalty',
                'supports_presence_penalty',
                'variable_pattern',
                'default_temperature',
                'default_max_tokens',
            ]);
        });
    }
};
