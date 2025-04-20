<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\Platform;
use App\Models\PromptNote;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class HomeController extends Controller
{
    public function index()
    {
        $prompts = PromptNote::with('tags', 'platforms')
        ->latest()
        ->get();
        // dd($prompts);
        $tags = Tag::all();
        // $prompts = [
        //     [
        //         'id' => 1,
        //         'text' => 'Generate a futuristic cityscape description for a sci-fi novel.',
        //         'tags' => ['Creative', 'Sci-Fi', 'Writing', 'Fiction', 'Worldbuilding'],
        //     ],
        //     [
        //         'id' => 2,
        //         'text' => 'Write a Python script to analyze sentiment in customer reviews.',
        //         'tags' => ['Coding', 'Python', 'Data Analysis', 'NLP'],
        //     ],
        //     [
        //         'id' => 3,
        //         'text' => 'Create a marketing slogan for an AI-powered assistant.',
        //         'tags' => ['Marketing', 'Branding', 'Creative', 'Advertising', 'AI'],
        //     ],
        //     [
        //         'id' => 4,
        //         'text' => 'Design a workout plan for beginners using AI optimization.',
        //         'tags' => ['Fitness', 'Health', 'AI Optimization', 'Beginner'],
        //     ],
        // ];

        return Inertia::render('home', [
            'prompts' => $prompts,
            'tags' => $tags,
        ]);
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

    //categories
    public function categories(){
        $categories = Category::all();
        return response()->json([
            'categories' => $categories
        ]);
    }
}
