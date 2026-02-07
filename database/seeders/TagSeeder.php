<?php
namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate old data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Tag::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Get or create an admin user for created_by
        $admin = Admin::first();

        // If no admin exists, create one
        if (! $admin) {
            $admin = Admin::create([
                'name'     => 'System Admin',
                'email'    => 'admin@system.com',
                'password' => 'password', // The 'hashed' cast in Admin model will automatically hash this
            ]);
        }

        $tags = [
            'SEO',
            'Keyword',
            'Strategy',
            'Content',
            'Copywriting',
            'Prompt Builder',
            'AI Tools',
        ];

        foreach ($tags as $tagName) {
            $slug         = Str::slug($tagName);
            $originalSlug = $slug;
            $counter      = 1;

            // Check if the slug already exists and append a number if it does
            while (Tag::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-{$counter}";
                $counter++;
            }

            Tag::create([
                'name'            => $tagName,
                'slug'            => $slug,
                'created_by_type' => Admin::class,
                'created_by_id'   => $admin->id,
                'status'          => Tag::STATUS_ACTIVE,
            ]);
        }
    }
}
