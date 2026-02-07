<?php
namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate old data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Category::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $categories = [
            'SEO',
            'Copywriting',
            'Marketing',
            'Coding',
            'Research',
            'Social Media',
            'Design',
            'AI Image',
            'Video Creation',
            'E-commerce',
            'Business',
            'Productivity',
        ];

        foreach ($categories as $categoryName) {
            $slug         = Str::slug($categoryName);
            $originalSlug = $slug;
            $counter      = 1;

            // Check if the slug already exists and append a number if it does
            while (Category::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-{$counter}";
                $counter++;
            }

            Category::create([
                'name'   => $categoryName,
                'slug'   => $slug,
                'status' => Category::STATUS_ACTIVE,
            ]);
        }
    }
}
