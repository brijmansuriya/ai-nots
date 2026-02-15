<?php
namespace App\Http\Controllers;

use App\Enums\PromptStatus;
use App\Http\Requests\StorePromptRequest;
use App\Http\Requests\UpdatePromptRequest;
use App\Models\PromptNote;
use App\Models\PromptVersion;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            !$user ||
            $prompt->promptable_id !== $user->id ||
            $prompt->promptable_type !== $user->getMorphClass()
        ) {
            abort(403, 'You are not allowed to edit this prompt.');
        }

        $prompt->load(['tags', 'platforms', 'variables', 'media']);

        // Add image URL to prompt data
        $promptData = $prompt->toArray();
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

        $promptData = $request->only(['title', 'prompt', 'description', 'category_id', 'status']);

        $promptData['promptable_type'] = auth()->user()?->getMorphClass() ?? null;
        $promptData['promptable_id'] = auth()->user()->id ?? null;
        $promptData['status'] = $request->input('status', PromptStatus::PENDING->value); // Default to pending if not provided
        $promptData['is_public'] = $promptData['status']; // Sync is_public with status
        $promptNote = PromptNote::create($promptData);

        // Handle tags - support both existing tags (by name or id) and create new ones
        $tags = $validated['tags'];
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
        $promptNote->platforms()->attach($validated['platform']);
        // Attach dynamic variables to the promptvariables
        if ($request->has('dynamic_variables') && !empty($validated['dynamic_variables'])) {
            $variables = array_map(function ($variable) {
                return ['name' => $variable];
            }, $validated['dynamic_variables']);

            $promptNote->variables()->createMany($variables);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                $imageService = new ImageService();
                $webpPath = $imageService->convertToWebP($request->file('image'), 90, 1048576); // 1MB max, quality 90

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

        // Return JSON response for API requests (e.g., from Chrome extension)
        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Prompt created successfully.',
                'data' => $promptNote->load(['tags', 'platforms']),
            ], 201);
        }

        return redirect()->route('home')->with('success', 'Prompt created successfully.');
    }

    public function show($id, Request $request)
    {
        $prompt = PromptNote::with(['tags', 'promptable', 'platforms', 'media'])->findOrFail($id);
        $user = auth()->user();

        // Check if user can view this prompt
        // Allow if: prompt is active OR user is the owner
        $canView = $prompt->isActive() || ($user && $prompt->promptable_id === $user->id && $prompt->promptable_type === $user->getMorphClass());

        if (!$canView) {
            abort(404, 'Prompt not found or not available.');
        }

        // Track view
        $prompt->incrementView(
            $user?->id,
            $request->ip(),
            $request->userAgent()
        );

        // Refresh to get updated metrics
        $prompt->refresh();

        // Get recent prompts (excluding current one, only active prompts)
        $recentPrompts = PromptNote::with(['tags', 'media'])
            ->where('id', '!=', $id)
            ->active() // Only show active prompts
            ->latest()
            ->limit(5)
            ->get();

        // Prepare prompt data with metrics
        $promptData = $prompt->toArray();
        $promptData['save_count'] = $prompt->save_count ?? 0;
        $promptData['copy_count'] = $prompt->copy_count ?? 0;
        $promptData['likes_count'] = $prompt->likes_count ?? 0;
        $promptData['views_count'] = $prompt->views_count ?? 0;
        $promptData['popularity_score'] = $prompt->popularity_score ?? 0.00;

        // Build share URL
        $shareUrl = $prompt->slug
            ? route('prompt.share', ['slug' => $prompt->slug], absolute: true)
            : route('prompt.show', ['id' => $prompt->id], absolute: true);

        return Inertia::render('promptDetails', [
            'prompt' => $promptData,
            'recentPrompts' => $recentPrompts,
            'shareUrl' => $shareUrl,
        ]);
    }

    /**
     * Show prompt by slug (short URL for sharing).
     */
    public function showBySlug(string $slug, Request $request)
    {
        $prompt = PromptNote::with(['tags', 'promptable', 'platforms', 'media', 'category'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Get user from correct guard (web or admin)
        $webUser = Auth::guard('web')->user();
        $adminUser = Auth::guard('admin')->user();

        // Check if user can view this prompt
        // Allow if: prompt is active OR user is the owner (from either guard)
        $isOwner = false;
        if ($prompt->promptable_type === 'user' && $webUser && $prompt->promptable_id === $webUser->id) {
            $isOwner = true;
        } elseif ($prompt->promptable_type === 'admin' && $adminUser && $prompt->promptable_id === $adminUser->id) {
            $isOwner = true;
        }

        $canView = $prompt->isActive() || $isOwner;

        if (!$canView) {
            abort(404, 'Prompt not found or not available.');
        }

        // Determine which user to use for tracking (prefer web user, then admin)
        $user = $webUser ?? $adminUser;

        // Track view (use user ID if authenticated, otherwise use IP only)
        $prompt->incrementView(
            $user?->id,
            $request->ip(),
            $request->userAgent()
        );

        // Refresh to get updated metrics
        $prompt->refresh();

        // Get recent prompts (excluding current one, only active prompts)
        $recentPrompts = PromptNote::with(['tags', 'media'])
            ->where('id', '!=', $prompt->id)
            ->active()
            ->latest()
            ->limit(5)
            ->get();

        // Prepare prompt data with metrics
        $promptData = $prompt->toArray();
        $promptData['save_count'] = $prompt->save_count ?? 0;
        $promptData['copy_count'] = $prompt->copy_count ?? 0;
        $promptData['likes_count'] = $prompt->likes_count ?? 0;
        $promptData['views_count'] = $prompt->views_count ?? 0;
        $promptData['popularity_score'] = $prompt->popularity_score ?? 0.00;

        // Build share URL
        $shareUrl = route('prompt.share', ['slug' => $prompt->slug], absolute: true);

        // Get OG image URL
        $ogImageUrl = $prompt->image_url
            ? url($prompt->image_url)
            : asset('images/og-default.png'); // Fallback image

        return Inertia::render('promptDetails', [
            'prompt' => $promptData,
            'recentPrompts' => $recentPrompts,
            'shareUrl' => $shareUrl,
            'ogImageUrl' => $ogImageUrl,
        ]);
    }

    /**
     * Update the specified prompt in storage.
     */
    public function update(UpdatePromptRequest $request, PromptNote $prompt)
    {
        $validated = $request->validated();
        $user = auth()->user();

        $promptData = $request->only(['title', 'prompt', 'description', 'category_id', 'status']);

        // Update status if provided, otherwise keep existing
        if ($request->has('status')) {
            $promptData['status'] = $request->input('status');
            $promptData['is_public'] = $promptData['status']; // Sync is_public with status
        }

        // Check if there are actual changes to save a version
        $hasChanges = false;
        $changes = [];

        if (isset($promptData['title']) && $prompt->title !== $promptData['title']) {
            $hasChanges = true;
            $changes[] = 'title';
        }

        if (isset($promptData['prompt']) && $prompt->prompt !== $promptData['prompt']) {
            $hasChanges = true;
            $changes[] = 'prompt';
        }

        if (isset($promptData['description']) && $prompt->description !== $promptData['description']) {
            $hasChanges = true;
            $changes[] = 'description';
        }

        if (isset($promptData['category_id']) && $prompt->category_id != $promptData['category_id']) {
            $hasChanges = true;
            $changes[] = 'category';
        }

        // Save version before updating if there are changes
        // Pattern: prompts table = latest version, prompt_versions table = old versions
        // Every edit = store old version to prompt_versions, then update prompts table
        if ($hasChanges) {
            // Get the next version number (1, 2, 3, ...)
            $lastVersion = PromptVersion::where('prompt_note_id', $prompt->id)
                ->orderBy('version_number', 'desc')
                ->first();

            $versionNumber = $lastVersion ? $lastVersion->version_number + 1 : 1;

            // Store metadata (tags, category, etc.)
            $metadata = [
                'category_id' => $prompt->category_id,
                'tags' => $prompt->tags->pluck('name')->toArray(),
                'platforms' => $prompt->platforms->pluck('name')->toArray(),
                'variables' => $prompt->variables->pluck('name')->toArray(),
            ];

            // Save current state to prompt_versions table (old version)
            // This happens BEFORE updating the prompts table with new content
            PromptVersion::create([
                'prompt_note_id' => $prompt->id,
                'version_number' => $versionNumber,
                'title' => $prompt->title,
                'prompt' => $prompt->prompt,
                'description' => $prompt->description,
                'created_by' => $user->id,
                'change_summary' => 'Changed: ' . implode(', ', $changes),
                'metadata' => $metadata,
            ]);
        }

        $prompt->update($promptData);

        // Handle tags - same logic as store()
        $tags = $validated['tags'];
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
                $slug = \Str::slug($tag);
                $originalSlug = $slug;
                $counter = 1;

                while (Tag::where('slug', $slug)->exists()) {
                    $slug = "{$originalSlug}-{$counter}";
                    $counter++;
                }

                $createdTag = Tag::create([
                    'name' => $tag,
                    'slug' => $slug,
                    'created_by_type' => $user->getMorphClass(),
                    'created_by_id' => $user->id,
                    'status' => Tag::STATUS_ACTIVE,
                ]);
                $tagIds[] = $createdTag->id;
            }
        }

        // Sync tags and platforms
        $prompt->tags()->sync(array_unique($tagIds));
        $prompt->platforms()->sync($validated['platform']);

        // Sync dynamic variables
        $prompt->variables()->delete();
        if ($request->has('dynamic_variables') && !empty($validated['dynamic_variables'])) {
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
                $webpPath = $imageService->convertToWebP($request->file('image'), 90, 1048576); // 1MB max, quality 90

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
            !$user ||
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

    /**
     * Get all versions for a prompt (API endpoint).
     */
    public function versionsApi(PromptNote $prompt)
    {
        $user = auth()->user();

        // Only allow the owner to view versions
        if (
            !$user ||
            $prompt->promptable_id !== $user->id ||
            $prompt->promptable_type !== $user->getMorphClass()
        ) {
            abort(403, 'You are not allowed to view versions of this prompt.');
        }

        $versions = $prompt->versions()
            ->with('creator:id,name')
            ->get()
            ->map(function ($version) {
                return [
                    'id' => $version->id,
                    'version_number' => $version->version_number,
                    'title' => $version->title,
                    'prompt' => $version->prompt,
                    'description' => $version->description,
                    'change_summary' => $version->change_summary,
                    'metadata' => $version->metadata,
                    'created_by' => $version->creator?->name,
                    'created_at' => $version->created_at->toIso8601String(),
                    'formatted_date' => $version->formatted_date,
                    'relative_time' => $version->relative_time,
                ];
            });

        return response()->json([
            'versions' => $versions,
            'current_prompt' => [
                'id' => $prompt->id,
                'title' => $prompt->title,
                'prompt' => $prompt->prompt,
                'description' => $prompt->description,
            ],
        ]);
    }

    /**
     * Show version history page.
     */
    public function versions(PromptNote $prompt)
    {
        $user = auth()->user();

        // Only allow the owner to view versions
        if (
            !$user ||
            $prompt->promptable_id !== $user->id ||
            $prompt->promptable_type !== $user->getMorphClass()
        ) {
            abort(403, 'You are not allowed to view versions of this prompt.');
        }

        $versions = $prompt->versions()
            ->with('creator:id,name')
            ->orderBy('version_number', 'desc')
            ->get()
            ->map(function ($version) {
                return [
                    'id' => $version->id,
                    'version_number' => $version->version_number,
                    'title' => $version->title,
                    'prompt' => $version->prompt,
                    'description' => $version->description,
                    'change_summary' => $version->change_summary,
                    'metadata' => $version->metadata,
                    'created_by' => $version->creator?->name,
                    'created_at' => $version->created_at->toIso8601String(),
                    'formatted_date' => $version->formatted_date,
                    'relative_time' => $version->relative_time,
                ];
            });

        return Inertia::render('prompt-versions', [
            'prompt' => [
                'id' => $prompt->id,
                'title' => $prompt->title,
            ],
            'versions' => $versions,
            'currentPrompt' => [
                'title' => $prompt->title,
                'prompt' => $prompt->prompt,
                'description' => $prompt->description,
            ],
        ]);
    }

    /**
     * Restore a specific version of a prompt.
     */
    public function restore(Request $request, PromptNote $prompt, PromptVersion $version)
    {
        $user = auth()->user();

        // Only allow the owner to restore versions
        if (
            !$user ||
            $prompt->promptable_id !== $user->id ||
            $prompt->promptable_type !== $user->getMorphClass()
        ) {
            abort(403, 'You are not allowed to restore versions of this prompt.');
        }

        // Verify version belongs to this prompt
        if ($version->prompt_note_id !== $prompt->id) {
            abort(404, 'Version not found for this prompt.');
        }

        // Restore flow (as per requirements):
        // 1. Take version's content
        // 2. Save current (latest) into versions table
        // 3. Update main prompt with the older content
        // This creates a new version while restoring

        // Step 1: Get next version number for saving current state
        $lastVersion = PromptVersion::where('prompt_note_id', $prompt->id)
            ->orderBy('version_number', 'desc')
            ->first();

        $versionNumber = $lastVersion ? $lastVersion->version_number + 1 : 1;

        // Step 2: Save current (latest) state to prompt_versions table
        $metadata = [
            'category_id' => $prompt->category_id,
            'tags' => $prompt->tags->pluck('name')->toArray(),
            'platforms' => $prompt->platforms->pluck('name')->toArray(),
            'variables' => $prompt->variables->pluck('name')->toArray(),
        ];

        PromptVersion::create([
            'prompt_note_id' => $prompt->id,
            'version_number' => $versionNumber,
            'title' => $prompt->title,
            'prompt' => $prompt->prompt,
            'description' => $prompt->description,
            'created_by' => $user->id,
            'change_summary' => 'Restored from version ' . $version->version_number,
            'metadata' => $metadata,
        ]);

        // Step 3: Update main prompt (prompts table) with the older version's content
        $prompt->update([
            'title' => $version->title,
            'prompt' => $version->prompt,
            'description' => $version->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Prompt restored to version ' . $version->version_number . ' successfully.',
            'prompt' => [
                'id' => $prompt->id,
                'title' => $prompt->title,
                'prompt' => $prompt->prompt,
                'description' => $prompt->description,
            ],
        ]);
    }

    /**
     * Compare two versions of a prompt.
     */
    public function compare(Request $request, PromptNote $prompt, $versionId1)
    {
        $user = auth()->user();

        // Only allow the owner to compare versions
        if (
            !$user ||
            $prompt->promptable_id !== $user->id ||
            $prompt->promptable_type !== $user->getMorphClass()
        ) {
            abort(403, 'You are not allowed to compare versions of this prompt.');
        }

        $versionId2 = $request->input('version2');

        $version1 = PromptVersion::where('id', $versionId1)
            ->where('prompt_note_id', $prompt->id)
            ->firstOrFail();

        // If no second version, compare with current
        if ($versionId2 === null) {
            $version2 = [
                'id' => $prompt->id,
                'version_number' => 'current',
                'title' => $prompt->title,
                'prompt' => $prompt->prompt,
                'description' => $prompt->description,
                'created_at' => $prompt->updated_at->toIso8601String(),
            ];
        } else {
            $version2Model = PromptVersion::where('id', $versionId2)
                ->where('prompt_note_id', $prompt->id)
                ->firstOrFail();

            $version2 = [
                'id' => $version2Model->id,
                'version_number' => $version2Model->version_number,
                'title' => $version2Model->title,
                'prompt' => $version2Model->prompt,
                'description' => $version2Model->description,
                'created_at' => $version2Model->created_at->toIso8601String(),
                'formatted_date' => $version2Model->formatted_date,
            ];
        }

        return response()->json([
            'version1' => [
                'id' => $version1->id,
                'version_number' => $version1->version_number,
                'title' => $version1->title,
                'prompt' => $version1->prompt,
                'description' => $version1->description,
                'created_at' => $version1->created_at->toIso8601String(),
                'formatted_date' => $version1->formatted_date,
            ],
            'version2' => $version2,
        ]);
    }

    /**
     * Delete a specific version of a prompt.
     */
    public function deleteVersion(PromptNote $prompt, PromptVersion $version)
    {
        $user = auth()->user();

        // Only allow the owner to delete versions
        if (
            !$user ||
            $prompt->promptable_id !== $user->id ||
            $prompt->promptable_type !== $user->getMorphClass()
        ) {
            abort(403, 'You are not allowed to delete versions of this prompt.');
        }

        // Verify version belongs to this prompt
        if ($version->prompt_note_id !== $prompt->id) {
            abort(404, 'Version not found for this prompt.');
        }

        $version->delete();

        return response()->json([
            'success' => true,
            'message' => 'Version deleted successfully.',
        ]);
    }
}
