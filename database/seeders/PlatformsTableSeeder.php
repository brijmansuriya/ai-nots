<?php
namespace Database\Seeders;

use App\Models\Platform;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlatformsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate old data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Platform::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $platforms = [
            'ChatGPT',
            'Midjourney',
            'DALL·E',
            'Stable Diffusion',
            'Bing AI',
        ];

        foreach ($platforms as $platformName) {
            Platform::create([
                'name'   => $platformName,
                'status' => '1', // approved
            ]);
        }
    }
}
