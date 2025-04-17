<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PromptController extends Controller
{
    public function index()
    {
        return inertia('Prompt/Index');
    }
    public function create()
    {
        return inertia('Prompt/Create');
    }
    public function store(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'tags' => 'required|array',
        ]);

        // Store the prompt in the database
        Prompt::create($request->all());

        // php artisan make:model PromptNote -m


        return redirect()->route('prompt.index')->with('success', 'Prompt created successfully.');
    }
}
