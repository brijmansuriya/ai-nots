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
        
        $promptData = $request->only(['title', 'prompt', 'description','category_id','platform']);
    
        $promptData['promptable_type'] = auth()->user()?->getMorphClass() ?? null; 
        $promptData['promptable_id'] = auth()->user()->id ?? null; 
        $promptNote = PromptNote::create($promptData);

        // Handle tags - support both existing tags (by name or id) and create new ones
        $tags = $request->input('tags');
        $tagIds = [];
        
        foreach ($tags as $tag) {
            // Check if tag is provided as ID (numeric)
            if (is_numeric($tag)) {
                $existingTag = Tag::find($tag);
                if ($existingTag) {
                    $tagIds[] = $existingTag->id;
                    continue;
                }
            }
            
            // Check if tag exists by name (case-insensitive)
            $existingTag = Tag::whereRaw('LOWER(name) = ?', [strtolower($tag)])->first();
            
            if ($existingTag) {
                // Use existing tag - allows repeated data
                $tagIds[] = $existingTag->id;
            } else {
                // Create new tag if it doesn't exist
                $slug = \Str::slug($tag);
                $originalSlug = $slug;
                $counter = 1;

                // Check if the slug already exists and append a number if it does
                while (Tag::where('slug', $slug)->exists()) {
                    $slug = "{$originalSlug}-{$counter}";
                    $counter++;
                }

                $createdTag = Tag::create([
                    'name' => $tag,
                    'slug' => $slug,
                    'created_by_type' => auth()->user()->getMorphClass(),
                    'created_by_id' => auth()->user()->id,
                    'status' => Tag::STATUS_ACTIVE,
                ]);
                $tagIds[] = $createdTag->id;
            }
        }

        // Attach tags (remove duplicates)
        $promptNote->tags()->sync(array_unique($tagIds));
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
