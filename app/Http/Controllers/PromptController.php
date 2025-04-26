<?php

namespace App\Http\Controllers;

use \App\Models\Tag;
use App\Models\PromptNote;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromptController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'prompt' => 'required|string|max:1000',
            'category_id' => 'required|integer|exists:categories,id',
            'tags' => 'required|array',
            'tags.*' => 'string|max:50',
            'platform' => 'required|array',
            'platform.*' => 'string|max:50',
            'dynamic_variables' => 'nullable|array',
            'dynamic_variables.*' => 'string|max:50',
        ]);

        $promptData = $request->only(['title', 'prompt', 'description']);
    
        $promptData['promptable_type'] = auth()->user()?->getMorphClass() ?? null; 
        $promptData['promptable_id'] = auth()->user()->id ?? null; 
        $promptNote = PromptNote::create($promptData);

        // Attach tags and platforms to the prompt
        $tags = $request->input('tags');
        $tagIds = Tag::whereIn('name', $tags)->pluck('id', 'name')->toArray();

        $newTags = array_diff($tags, array_keys($tagIds));

        foreach ($newTags as $newTag) {
            $slug = \Str::slug($newTag);
            $originalSlug = $slug;
            $counter = 1;

            // Check if the slug already exists and append a number if it does
            while (Tag::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-{$counter}";
                $counter++;
            }

            $createdTag = Tag::create([
                'name' => $newTag,
                'slug' => $slug,
                'created_by_type' => auth()->user()->getMorphClass(), // Ensure 'created_by_type' is set
                'created_by_id' => auth()->user()->id,
            ]);
            $tagIds[$newTag] = $createdTag->id;
        }

        $promptNote->tags()->attach(array_values($tagIds));
        $promptNote->platforms()->attach($request->input('platform'));
        // Attach dynamic variables to the promptvariables
        if ($request->has('dynamic_variables')) {
            $variables = array_map(function ($variable) {
                return ['name' => $variable];
            }, $request->input('dynamic_variables'));

            $promptNote->variables()->createMany($variables);
        }

        return redirect()->route('home')->with('success', 'Prompt created successfully.');
    }

    public function show($id)
    {
        $prompt = PromptNote::with(['tags','promptable'])->findOrFail($id);

        return Inertia::render('promptDetails', [
            'prompt' => $prompt,
        ]);
    }
}
