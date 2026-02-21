<?php

namespace App\Http\Controllers\Api\Extension;

use App\Enums\PromptStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StorePromptRequest;
use App\Http\Resources\Api\PromptResource;
use App\Models\Platform;
use App\Models\PromptNote;
use App\Models\Tag;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PromptController extends Controller
{
    /**
     * Get list of user prompts (non-templates)
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = PromptNote::where('is_template', false)
            ->where('promptable_id', $user->id)
            ->where('promptable_type', $user->getMorphClass())
            ->active()
            ->with(['category', 'tags', 'platforms']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 20);
        $prompts = $query->paginate($perPage);

        return PromptResource::collection($prompts)->additional([
            'status' => true,
            'message' => 'Prompts fetched successfully',
        ]);
    }

    /**
     * Store a new prompt from extension
     */
    public function store(StorePromptRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = auth()->user();

        // Prepare prompt data
        $promptData = [
            'title' => $validated['title'],
            'prompt' => $validated['prompt'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'promptable_type' => $user->getMorphClass(),
            'promptable_id' => $user->id,
            'status' => $validated['status'] ?? PromptStatus::PENDING->value,
            'folder_id' => $validated['folder_id'] ?? null,
            'is_template' => false,
        ];

        $promptNote = PromptNote::create($promptData);

        // Handle tags
        $tags = $validated['tags'];
        $tagIds = [];

        foreach ($tags as $tag) {
            $existingTag = Tag::whereRaw('LOWER(name) = ?', [strtolower($tag)])->first();

            if ($existingTag) {
                $tagIds[] = $existingTag->id;
            } else {
                $slug = Str::slug($tag);
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
                    'status' => PromptStatus::ACTIVE->value,
                ]);
                $tagIds[] = $createdTag->id;
            }
        }

        $promptNote->tags()->sync(array_unique($tagIds));

        // Handle platforms
        $platformIds = [];
        foreach ($validated['platform'] as $platformName) {
            $platform = Platform::whereRaw('LOWER(name) = ?', [strtolower($platformName)])->first();
            if ($platform) {
                $platformIds[] = $platform->id;
            }
        }
        $promptNote->platforms()->sync($platformIds);

        // Attach dynamic variables
        if (!empty($validated['dynamic_variables'])) {
            $variables = array_map(function ($variable) {
                return ['name' => $variable];
            }, $validated['dynamic_variables']);

            $promptNote->variables()->createMany($variables);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                $imageService = new ImageService();
                $webpPath = $imageService->convertToWebP($request->file('image'), 90, 1048576);

                $fullPath = storage_path('app/public/' . $webpPath);
                $promptNote->addMedia($fullPath)
                    ->toMediaCollection('prompt_images');
            } catch (\Exception $e) {
                \Log::error('Image upload failed: ' . $e->getMessage());
            }
        }

        $promptNote->load(['category', 'tags', 'platforms']);

        return (new PromptResource($promptNote))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing prompt
     */
    public function update(StorePromptRequest $request, PromptNote $prompt): JsonResponse
    {
        $user = auth()->user();

        // Check ownership
        if ($prompt->promptable_id !== $user->id || $prompt->promptable_type !== $user->getMorphClass()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validated();

        $prompt->update([
            'title' => $validated['title'],
            'prompt' => $validated['prompt'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'folder_id' => $validated['folder_id'] ?? $prompt->folder_id,
            'status' => $validated['status'] ?? $prompt->status,
        ]);

        // Sync tags
        if (isset($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = Tag::firstOrCreate(
                    ['name' => $tagName],
                    [
                        'slug' => Str::slug($tagName),
                        'created_by_type' => $user->getMorphClass(),
                        'created_by_id' => $user->id,
                        'status' => PromptStatus::ACTIVE->value
                    ]
                );
                $tagIds[] = $tag->id;
            }
            $prompt->tags()->sync($tagIds);
        }

        // Sync platforms
        if (isset($validated['platform'])) {
            $platformIds = [];
            foreach ($validated['platform'] as $platformName) {
                $platform = Platform::whereRaw('LOWER(name) = ?', [strtolower($platformName)])->first();
                if ($platform) {
                    $platformIds[] = $platform->id;
                }
            }
            $prompt->platforms()->sync($platformIds);
        }

        $prompt->load(['category', 'tags', 'platforms']);

        return response()->json([
            'data' => new PromptResource($prompt),
            'message' => 'Prompt updated successfully'
        ]);
    }

    /**
     * Delete a prompt
     */
    public function destroy(PromptNote $prompt): JsonResponse
    {
        $user = auth()->user();

        // Check ownership
        if ($prompt->promptable_id !== $user->id || $prompt->promptable_type !== $user->getMorphClass()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $prompt->delete();

        return response()->json(['message' => 'Prompt deleted successfully']);
    }
}
