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
use Illuminate\Support\Str;

class PromptController extends Controller
{
    /**
     * Store a new prompt from extension
     */
    public function store(StorePromptRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = auth()->user();

        // Prepare prompt data
        $promptData = [
            'title'           => $validated['title'],
            'prompt'          => $validated['prompt'],
            'description'     => $validated['description'] ?? null,
            'category_id'     => $validated['category_id'],
            'promptable_type' => $user->getMorphClass(),
            'promptable_id'   => $user->id,
            'status'          => $validated['status'] ?? PromptStatus::PENDING->value,
        ];

        $promptNote = PromptNote::create($promptData);

        // Handle tags - support both existing tags (by name) and create new ones
        $tags   = $validated['tags'];
        $tagIds = [];

        foreach ($tags as $tag) {
            // Check if tag exists by name (case-insensitive)
            $existingTag = Tag::whereRaw('LOWER(name) = ?', [strtolower($tag)])->first();

            if ($existingTag) {
                $tagIds[] = $existingTag->id;
            } else {
                // Create new tag if it doesn't exist
                $slug         = Str::slug($tag);
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
                    'created_by_type' => $user->getMorphClass(),
                    'created_by_id'   => $user->id,
                    'status'          => 'active',
                ]);
                $tagIds[] = $createdTag->id;
            }
        }

        // Attach tags (remove duplicates)
        $promptNote->tags()->sync(array_unique($tagIds));

        // Handle platforms - find by name
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

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            try {
                $imageService = new ImageService();
                $webpPath     = $imageService->convertToWebP($request->file('image'), 90, 1048576);

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
}

