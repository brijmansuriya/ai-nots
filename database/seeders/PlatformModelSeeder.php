<?php

namespace Database\Seeders;

use App\Models\Platform;
use App\Models\PlatformModel;
use Illuminate\Database\Seeder;

class PlatformModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $platformModels = [
            'chatgpt' => [
                [
                    'model_name' => 'gpt-4o-mini',
                    'max_input_tokens' => 128000,
                    'max_output_tokens' => 16384,
                    'cost_per_1k_input' => 0.000150,
                    'cost_per_1k_output' => 0.000600,
                    'is_default' => true,
                ],
                [
                    'model_name' => 'gpt-4o',
                    'max_input_tokens' => 128000,
                    'max_output_tokens' => 4096,
                    'cost_per_1k_input' => 0.002500,
                    'cost_per_1k_output' => 0.010000,
                    'is_default' => false,
                ],
            ],
            'claude' => [
                [
                    'model_name' => 'claude-3-sonnet',
                    'max_input_tokens' => 200000,
                    'max_output_tokens' => 4096,
                    'cost_per_1k_input' => 0.003000,
                    'cost_per_1k_output' => 0.015000,
                    'is_default' => true,
                ],
            ],
            'gemini' => [
                [
                    'model_name' => 'gemini-1.5-pro',
                    'max_input_tokens' => 2000000,
                    'max_output_tokens' => 8192,
                    'cost_per_1k_input' => 0.001250,
                    'cost_per_1k_output' => 0.003750,
                    'is_default' => true,
                ],
            ],
        ];

        foreach ($platformModels as $platformSlug => $models) {
            $platform = Platform::where('slug', $platformSlug)->first();

            if ($platform) {
                foreach ($models as $modelData) {
                    PlatformModel::updateOrCreate(
                        [
                            'platform_id' => $platform->id,
                            'model_name' => $modelData['model_name'],
                        ],
                        $modelData
                    );
                }
            }
        }
    }
}
