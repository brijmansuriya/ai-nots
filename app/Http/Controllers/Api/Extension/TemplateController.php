<?php

namespace App\Http\Controllers\Api\Extension;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\PromptResource;
use App\Models\PromptNote;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    /**
     * Get list of templates (admin-created prompts)
     */
    public function index(Request $request)
    {
        // Use the templates scope to filter admin-created prompts
        $query = PromptNote::templates()
            ->active() // Only active templates
            ->with(['category', 'tags', 'platforms']);

        // Optional: Support simple search/filtering if needed
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Pagination
        $perPage = $request->input('per_page', 20);
        $templates = $query->paginate($perPage);

        return PromptResource::collection($templates)->additional([
            'status' => true,
            'message' => 'Templates fetched successfully',
        ]);
    }
    /**
     * Store a new template
     */
    public function store(\App\Http\Requests\Api\StorePromptRequest $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validated();
        $user = auth()->user();

        // Prepare prompt data for template
        $promptData = [
            'title' => $validated['title'],
            'prompt' => $validated['prompt'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'promptable_type' => $user->getMorphClass(),
            'promptable_id' => $user->id,
            'status' => $validated['status'] ?? \App\Enums\PromptStatus::ACTIVE->value, // Templates default to active usually, or pending if moderation needed
            'is_template' => true, // Force template
        ];

        $promptNote = PromptNote::create($promptData);

        // Handle tags
        $tags = $validated['tags'];
        $tagIds = [];

        foreach ($tags as $tag) {
            $existingTag = \App\Models\Tag::whereRaw('LOWER(name) = ?', [strtolower($tag)])->first();

            if ($existingTag) {
                $tagIds[] = $existingTag->id;
            } else {
                $slug = \Illuminate\Support\Str::slug($tag);
                $originalSlug = $slug;
                $counter = 1;

                while (\App\Models\Tag::where('slug', $slug)->exists()) {
                    $slug = "{$originalSlug}-{$counter}";
                    $counter++;
                }

                $createdTag = \App\Models\Tag::create([
                    'name' => $tag,
                    'slug' => $slug,
                    'created_by_type' => $user->getMorphClass(),
                    'created_by_id' => $user->id,
                    'status' => 'active',
                ]);
                $tagIds[] = $createdTag->id;
            }
        }

        $promptNote->tags()->sync(array_unique($tagIds));

        // Handle platforms
        $platformIds = [];
        if (isset($validated['platform'])) {
            foreach ($validated['platform'] as $platformName) {
                $platform = \App\Models\Platform::whereRaw('LOWER(name) = ?', [strtolower($platformName)])->first();
                if ($platform) {
                    $platformIds[] = $platform->id;
                }
            }
            $promptNote->platforms()->sync($platformIds);
        }


        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                $imageService = new \App\Services\ImageService();
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
}
