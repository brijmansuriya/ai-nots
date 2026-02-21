<?php

namespace Database\Seeders;

use App\Models\Platform;
use App\Enums\ProviderType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlatformSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $platforms = [
            [
                'name' => 'ChatGPT',
                'slug' => 'chatgpt',
                'description' => 'OpenAI\'s powerful conversational AI.',
                'provider_type' => ProviderType::OPENAI,
                'api_base_url' => 'https://api.openai.com/v1',
                'is_active' => true,
                'max_prompt_length' => 8000,
                'max_output_tokens' => 4096,
                'supports_system_prompt' => true,
                'supports_temperature' => true,
                'supports_top_p' => true,
                'supports_streaming' => true,
                'supports_frequency_penalty' => true,
                'supports_presence_penalty' => true,
                'variable_pattern' => '/\[(.*?)\]/',
                'default_temperature' => 1.0,
                'default_max_tokens' => 1000,
            ],
            [
                'name' => 'Claude',
                'slug' => 'claude',
                'description' => 'Anthropic\'s ethical and capable AI models.',
                'provider_type' => ProviderType::ANTHROPIC,
                'api_base_url' => 'https://api.anthropic.com/v1',
                'is_active' => true,
                'max_prompt_length' => 100000,
                'max_output_tokens' => 4096,
                'supports_system_prompt' => true,
                'supports_temperature' => true,
                'supports_top_p' => true,
                'supports_streaming' => true,
                'supports_frequency_penalty' => false,
                'supports_presence_penalty' => false,
                'variable_pattern' => '/\{\{(.*?)\}\}/',
                'default_temperature' => 1.0,
                'default_max_tokens' => 1000,
            ],
            [
                'name' => 'Gemini',
                'slug' => 'gemini',
                'description' => 'Google\'s state-of-the-art multimodal AI.',
                'provider_type' => ProviderType::GOOGLE,
                'api_base_url' => 'https://generativelanguage.googleapis.com/v1beta',
                'is_active' => true,
                'max_prompt_length' => 32000,
                'max_output_tokens' => 4096,
                'supports_system_prompt' => true,
                'supports_temperature' => true,
                'supports_top_p' => true,
                'supports_streaming' => true,
                'supports_frequency_penalty' => false,
                'supports_presence_penalty' => false,
                'variable_pattern' => '/\{(.*?)\}/',
                'default_temperature' => 1.0,
                'default_max_tokens' => 1000,
            ],
        ];

        foreach ($platforms as $platformData) {
            Platform::updateOrCreate(
                ['slug' => $platformData['slug']],
                $platformData
            );
        }
    }
}
