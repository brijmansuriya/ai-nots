<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PromptStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePromptRequest;
use App\Http\Requests\Admin\UpdatePromptRequest;
use App\Models\PromptNote;
use App\Models\Tag;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromptController extends Controller
{
    /**
     * Display a listing of the templates (admin prompts).
     */
    public function index()
    {
        $prompts = PromptNote::templates()
            ->with(['tags', 'platforms', 'category', 'media'])
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/prompts/index', ['prompts' => $prompts]);
    }

    /**
     * Show the form for creating a new template.
     */
    public function create()
    {
        $tags = \App\Models\Tag::all();
        $platforms = \App\Models\Platform::all();
        $categories = \App\Models\Category::all();

        return Inertia::render('admin/prompts/create', [
            'tags' => $tags,
            'platforms' => $platforms,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created template in storage.
     */
    public function store(StorePromptRequest $request)
    {
        $validated = $request->validated();
        $admin     = auth()->guard('admin')->user();

        $promptData = $request->only(['title', 'prompt', 'description', 'category_id', 'status']);

        // Set promptable_type to 'admin' for templates
        $promptData['promptable_type'] = 'admin';
        $promptData['promptable_id']   = $admin->id;
        $promptData['status']          = $request->input('status', PromptStatus::PENDING->value); // Default to pending if not provided
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
                    'created_by_type' => $admin->getMorphClass(),
                    'created_by_id'   => $admin->id,
                    'status'          => Tag::STATUS_ACTIVE,
                ]);
                $tagIds[] = $createdTag->id;
            }
        }

        // Attach tags (remove duplicates)
        $promptNote->tags()->sync(array_unique($tagIds));
        $promptNote->platforms()->sync($validated['platform']);

        // Attach dynamic variables to the prompt variables
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

        return redirect()->route('admin.prompts.index')->with('success', 'Template created successfully.');
    }

    /**
     * Display the specified template.
     */
    public function show(PromptNote $prompt)
    {
        // Ensure this is a template (admin-created prompt)
        if ($prompt->promptable_type !== 'admin') {
            abort(404, 'Template not found.');
        }

        $prompt->load(['tags', 'platforms', 'category', 'media', 'variables']);

        // Add image URL to prompt data
        $promptData              = $prompt->toArray();
        $promptData['image_url'] = $prompt->image_url;

        return Inertia::render('admin/prompts/show', ['prompt' => $promptData]);
    }

    /**
     * Show the form for editing the specified template.
     */
    public function edit(PromptNote $prompt)
    {
        // Ensure this is a template (admin-created prompt)
        if ($prompt->promptable_type !== 'admin') {
            abort(404, 'Template not found.');
        }

        $prompt->load(['tags', 'platforms', 'variables', 'media']);

        // Add image URL to prompt data
        $promptData              = $prompt->toArray();
        $promptData['image_url'] = $prompt->image_url;

        // Load all tags, platforms, and categories for the form
        $tags = \App\Models\Tag::all();
        $platforms = \App\Models\Platform::all();
        $categories = \App\Models\Category::all();

        return Inertia::render('admin/prompts/edit', [
            'prompt' => $promptData,
            'tags' => $tags,
            'platforms' => $platforms,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified template in storage.
     */
    public function update(UpdatePromptRequest $request, PromptNote $prompt)
    {
        // Ensure this is a template (admin-created prompt)
        if ($prompt->promptable_type !== 'admin') {
            abort(404, 'Template not found.');
        }

        $validated = $request->validated();
        $admin     = auth()->guard('admin')->user();

        $promptData = $request->only(['title', 'prompt', 'description', 'category_id', 'status']);

        // Update status if provided, otherwise keep existing
        if ($request->has('status')) {
            $promptData['status'] = $request->input('status');
        }

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
                    'created_by_type' => $admin->getMorphClass(),
                    'created_by_id'   => $admin->id,
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

        return redirect()->route('admin.prompts.index')->with('success', 'Template updated successfully.');
    }

    /**
     * Remove the specified template from storage.
     */
    public function destroy(PromptNote $prompt)
    {
        // Ensure this is a template (admin-created prompt)
        if ($prompt->promptable_type !== 'admin') {
            abort(404, 'Template not found.');
        }

        // Cleanup related records
        $prompt->tags()->detach();
        $prompt->platforms()->detach();
        $prompt->variables()->delete();

        // Soft delete the template
        $prompt->delete();

        return redirect()->route('admin.prompts.index')->with('success', 'Template deleted successfully.');
    }
}

