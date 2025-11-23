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
            'Writing & Content',
            'Code & Development',
            'Marketing & SEO',
            'Business & Strategy',
            'Education & Learning',
            'Creative & Design',
            'Data & Analysis',
            'Productivity & Automation',
            'Research & Analysis',
            'Communication & Social',
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
