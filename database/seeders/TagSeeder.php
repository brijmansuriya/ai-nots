<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create an admin user for created_by
        $admin = Admin::first();
        
        // If no admin exists, create one
        if (!$admin) {
            $admin = Admin::create([
                'name' => 'System Admin',
                'email' => 'admin@system.com',
                'password' => bcrypt('password'),
            ]);
        }

        $tags = [
            'AI Assistant',
            'Content Writing',
            'Code Generation',
            'Image Generation',
            'Text Analysis',
            'Data Processing',
            'SEO Optimization',
            'Social Media',
            'Email Marketing',
            'Productivity',
            'Automation',
            'Research',
            'Translation',
            'Summarization',
            'Creative Writing',
            'Technical Writing',
            'Business Strategy',
            'Customer Service',
            'Education',
            'Design',
        ];

        foreach ($tags as $tagName) {
            $slug = Str::slug($tagName);
            $originalSlug = $slug;
            $counter = 1;

            // Check if the slug already exists and append a number if it does
            while (Tag::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-{$counter}";
                $counter++;
            }

            Tag::create([
                'name' => $tagName,
                'slug' => $slug,
                'created_by_type' => Admin::class,
                'created_by_id' => $admin->id,
                'status' => Tag::STATUS_ACTIVE,
            ]);
        }
    }
}

