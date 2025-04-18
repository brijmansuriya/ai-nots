<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
    
        $tags = Tag::all();
        $prompts = [
            [
                'id' => 1,
                'text' => 'Generate a futuristic cityscape description for a sci-fi novel.',
                'tags' => ['Creative', 'Sci-Fi', 'Writing', 'Fiction', 'Worldbuilding'],
            ],
            [
                'id' => 2,
                'text' => 'Write a Python script to analyze sentiment in customer reviews.',
                'tags' => ['Coding', 'Python', 'Data Analysis', 'NLP'],
            ],
            [
                'id' => 3,
                'text' => 'Create a marketing slogan for an AI-powered assistant.',
                'tags' => ['Marketing', 'Branding', 'Creative', 'Advertising', 'AI'],
            ],
            [
                'id' => 4,
                'text' => 'Design a workout plan for beginners using AI optimization.',
                'tags' => ['Fitness', 'Health', 'AI Optimization', 'Beginner'],
            ],
        ];

        return Inertia::render('home', [
            'prompts' => $prompts,
            'tags' => $tags,
        ]);
        // return Inertia::render('home');
    }

    // public function dashboard()
    public function dashboard(Request $request)
    {
        return Inertia::render('dashboard');
    }

    //get tags list
    public function tags(){
        $tags = Tag::all();
        return response()->json([
            'tags' => $tags
        ]);
    }

    //platform
    public function platform(){
        $platforms = Platform::all();
        return response()->json([
            'platforms' => $platforms
        ]);
    }
}
