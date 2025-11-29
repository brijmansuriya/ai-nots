<?php
namespace App\Http\Controllers;

use App\Http\Requests\StorePromptRequest;
use App\Http\Requests\UpdatePromptRequest;
use App\Models\PromptNote;
use App\Services\ImageService;
use Inertia\Inertia;
use \App\Models\Tag;

class PromptController extends Controller
{

    /**
     * Show the form for editing the specified prompt.
     */
    public function edit(PromptNote $prompt)
    {
        $user = auth()->user();

        // Only allow the owner of the prompt to edit it
        if (
            ! $user ||
            $prompt->promptable_id !== $user->id ||
            $prompt->promptable_type !== $user->getMorphClass()
        ) {
            abort(403, 'You are not allowed to edit this prompt.');
        }

        $prompt->load(['tags', 'platforms', 'variables', 'media']);

        // Add image URL to prompt data
        $promptData              = $prompt->toArray();
        $promptData['image_url'] = $prompt->image_url;

        return Inertia::render('edit-prompt', [
            'prompt' => $promptData,
        ]);
    }

    /**
     * Store a newly created prompt in storage.
     */
    public function store(StorePromptRequest $request)
    {
        $validated = $request->validated();

        $promptData = $request->only(['title', 'prompt', 'description', 'category_id']);

        $promptData['promptable_type'] = auth()->user()?->getMorphClass() ?? null;
        $promptData['promptable_id']   = auth()->user()->id ?? null;
        $promptNote                    = PromptNote::create($promptData);

        // Handle tags - support both existing tags (by name or id) and create new ones
        $tags   = $validated['tags'];
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
                $slug         = \Str::slug($tag);
                $originalSlug = $slug;
                $counter      = 1;

                // Check if the slug already exists and append a number if it does
                while (Tag::where('slug', $slug)->exists()) {
                    $slug = "{$originalSlug}-{$counter}";
                    $counter++;
                }

                $createdTag = Tag::create([
                    'name'            => $tag,
                    'slug'            => $slug,
                    'created_by_type' => auth()->user()->getMorphClass(),
                    'created_by_id'   => auth()->user()->id,
                    'status'          => Tag::STATUS_ACTIVE,
                ]);
                $tagIds[] = $createdTag->id;
            }
        }

        // Attach tags (remove duplicates)
        $promptNote->tags()->sync(array_unique($tagIds));
        $promptNote->platforms()->attach($validated['platform']);
        // Attach dynamic variables to the promptvariables
        if ($request->has('dynamic_variables') && ! empty($validated['dynamic_variables'])) {
            $variables = array_map(function ($variable) {
                return ['name' => $variable];
            }, $validated['dynamic_variables']);

            $promptNote->variables()->createMany($variables);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                $imageService = new ImageService();
                $webpPath     = $imageService->convertToWebP($request->file('image'), 90, 1048576); // 1MB max, quality 90

                // Get the full path to the saved file
                $fullPath = storage_path('app/public/' . $webpPath);

                // Add media using Spatie Media Library - use the full storage path
                $promptNote->addMedia($fullPath)
                    ->toMediaCollection('prompt_images');
            } catch (\Exception $e) {
                // Log error but don't fail the request
                \Log::error('Image upload failed: ' . $e->getMessage());
                \Log::error('Image upload error trace: ' . $e->getTraceAsString());
            }
        }

        return redirect()->route('home')->with('success', 'Prompt created successfully.');
    }

    public function show($id)
    {
        $prompt = PromptNote::with(['tags', 'promptable', 'platforms', 'media'])->findOrFail($id);

        // Add image URL to prompt data
        $promptData              = $prompt->toArray();
        $promptData['image_url'] = $prompt->image_url;

        // Get recent prompts (excluding current one)
        $recentPrompts = PromptNote::with(['tags', 'media'])
            ->where('id', '!=', $id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($prompt) {
                $data              = $prompt->toArray();
                $data['image_url'] = $prompt->image_url;
                return $data;
            });

        return Inertia::render('promptDetails', [
            'prompt'        => $promptData,
            'recentPrompts' => $recentPrompts,
        ]);
    }

    /**
     * Update the specified prompt in storage.
     */
    public function update(UpdatePromptRequest $request, PromptNote $prompt)
    {
        $validated = $request->validated();
        $user      = auth()->user();

        $promptData = $request->only(['title', 'prompt', 'description', 'category_id']);

        $prompt->update($promptData);

        // Handle tags - same logic as store()
        $tags   = $validated['tags'];
        $tagIds = [];

        foreach ($tags as $tag) {
            if (is_numeric($tag)) {
                $existingTag = Tag::find($tag);
                if ($existingTag) {
                    $tagIds[] = $existingTag->id;
                    continue;
                }
            }

            $existingTag = Tag::whereRaw('LOWER(name) = ?', [strtolower($tag)])->first();

            if ($existingTag) {
                $tagIds[] = $existingTag->id;
            } else {
                $slug         = \Str::slug($tag);
                $originalSlug = $slug;
                $counter      = 1;

                while (Tag::where('slug', $slug)->exists()) {
                    $slug = "{$originalSlug}-{$counter}";
                    $counter++;
                }

                $createdTag = Tag::create([
                    'name'            => $tag,
                    'slug'            => $slug,
                    'created_by_type' => $user->getMorphClass(),
                    'created_by_id'   => $user->id,
                    'status'          => Tag::STATUS_ACTIVE,
                ]);
                $tagIds[] = $createdTag->id;
            }
        }

        // Sync tags and platforms
        $prompt->tags()->sync(array_unique($tagIds));
        $prompt->platforms()->sync($validated['platform']);

        // Sync dynamic variables
        $prompt->variables()->delete();
        if ($request->has('dynamic_variables') && ! empty($validated['dynamic_variables'])) {
            $variables = array_map(function ($variable) {
                return ['name' => $variable];
            }, $validated['dynamic_variables']);

            $prompt->variables()->createMany($variables);
        }

        // Handle image removal
        if ($request->input('remove_image')) {
            $prompt->clearMediaCollection('prompt_images');
        }

        // Handle image upload (replace existing if new image is uploaded)
        if ($request->hasFile('image')) {
            try {
                // Delete existing image first
                $prompt->clearMediaCollection('prompt_images');

                $imageService = new ImageService();
                $webpPath     = $imageService->convertToWebP($request->file('image'), 90, 1048576); // 1MB max, quality 90

                // Get the full path to the saved file
                $fullPath = storage_path('app/public/' . $webpPath);

                // Add new media using Spatie Media Library
                $prompt->addMedia($fullPath)
                    ->toMediaCollection('prompt_images');
            } catch (\Exception $e) {
                // Log error but don't fail the request
                \Log::error('Image upload failed: ' . $e->getMessage());
                \Log::error('Image upload error trace: ' . $e->getTraceAsString());
            }
        }

        return redirect()->route('home')->with('success', 'Prompt updated successfully.');
    }

    /**
     * Remove the specified prompt from storage.
     */
    public function destroy(PromptNote $prompt)
    {
        $user = auth()->user();

        // Only allow the owner of the prompt to delete it
        if (
            ! $user ||
            $prompt->promptable_id !== $user->id ||
            $prompt->promptable_type !== $user->getMorphClass()
        ) {
            abort(403, 'You are not allowed to delete this prompt.');
        }

        // Cleanup related records
        $prompt->tags()->detach();
        $prompt->platforms()->detach();
        $prompt->variables()->delete();

        // Soft delete the prompt
        $prompt->delete();

        return redirect()->back()->with('success', 'Prompt deleted successfully.');
    }
}
