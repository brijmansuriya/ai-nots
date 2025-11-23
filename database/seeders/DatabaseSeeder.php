<?php

namespace Database\Seeders;

use App\Models\Platform;
use App\Models\PromptNote;
use App\Models\Tag;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed categories first
        $this->call(CategorySeeder::class);
        
        // Seed tags (created by admin)
        $this->call(TagSeeder::class);
        
        // Seed platforms
        $platformNames = ['ChatGPT', 'Midjourney', 'DALL·E', 'Stable Diffusion', 'Bing AI'];
        $platforms = collect();

        foreach ($platformNames as $name) {
            $platforms->push(Platform::create(['name' => $name]));
        }
        
        // Get seeded tags for prompt notes
        $tags = Tag::where('status', Tag::STATUS_ACTIVE)->get();
        
        // Get seeded categories for prompt notes
        $categories = \App\Models\Category::where('status', \App\Models\Category::STATUS_ACTIVE)->get();

        // Seed prompt notes and attach tags, platforms, and categories
        PromptNote::factory(20)->create()->each(function ($promptNote) use ($tags, $platforms, $categories) {
            $promptNote->tags()->attach($tags->random(3));
            $promptNote->platforms()->attach($platforms->random(2));
            
            // Assign a random category if categories exist
            if ($categories->isNotEmpty()) {
                $promptNote->update([
                    'category_id' => $categories->random()->id,
                ]);
            }
        });

        // Seed users
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
