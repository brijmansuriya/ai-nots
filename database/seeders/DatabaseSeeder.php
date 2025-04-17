<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\PromptNote;
use App\Models\Tag;
use App\Models\Platform;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed platforms
        $platforms = Platform::factory(5)->create();

        // Seed tags
        $tags = Tag::factory(10)->create();

        // Seed prompt notes and attach tags and platforms
        PromptNote::factory(20)->create()->each(function ($promptNote) use ($tags, $platforms) {
            $promptNote->tags()->attach($tags->random(3));
            $promptNote->platforms()->attach($platforms->random(2));
        });

        // Seed users
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
