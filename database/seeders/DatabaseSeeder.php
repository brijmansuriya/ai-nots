<?php
namespace Database\Seeders;

use App\Models\Platform;
use App\Models\PromptNote;
use App\Models\Tag;
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
        // Truncate prompt notes and related pivot tables first
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('prompt_note_variables')->truncate();
        DB::table('prompt_note_tag')->truncate();
        DB::table('prompt_note_platform')->truncate();
        PromptNote::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Seed categories first
        $this->call(CategorySeeder::class);

        // Seed tags (created by admin)
        $this->call(TagSeeder::class);

        // Seed platforms
        $this->call(PlatformsTableSeeder::class);

        // Get seeded tags for prompt notes
        $tags = Tag::where('status', Tag::STATUS_ACTIVE)->get();

        // Get seeded platforms for prompt notes
        $platforms = Platform::where('status', '1')->get();

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
