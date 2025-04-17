<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlatformsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('platforms')->insert([
            ['name' => 'ChatGPT'],
            ['name' => 'Midjourney'],
            ['name' => 'DALL·E'],
            ['name' => 'Stable Diffusion'],
            ['name' => 'Bing AI'],
            
        ]);
    }
}
