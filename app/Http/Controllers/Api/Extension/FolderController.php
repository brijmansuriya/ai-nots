<?php

namespace App\Http\Controllers\Api\Extension;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\FolderResource;
use App\Models\Folder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    /**
     * Get all folders for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $folders = Folder::root()
            ->forUser($userId)
            ->withCount('prompts')
            ->with('descendants')
            ->orderBy('position')
            ->get();

        $this->aggregatePromptCounts($folders);

        return FolderResource::collection($folders)->response();
    }

    /**
     * Store a new folder
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer|exists:folders,id',
            'emoji' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $folder = Folder::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'parent_id' => $validated['parent_id'],
            'emoji' => $validated['emoji'] ?? '📁',
            'color' => $validated['color'] ?? '#3b82f6',
            'position' => Folder::where('user_id', $request->user()->id)
                ->where('parent_id', $validated['parent_id'])
                ->count(),
        ]);

        return (new FolderResource($folder))->response();
    }

    /**
     * Update an existing folder
     */
    public function update(Request $request, Folder $folder): JsonResponse
    {
        if ($folder->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'parent_id' => 'nullable|integer|exists:folders,id',
            'emoji' => 'sometimes|string',
            'color' => 'sometimes|string',
        ]);

        $folder->update($validated);

        return (new FolderResource($folder))->response();
    }

    /**
     * Delete a folder
     */
    public function destroy(Request $request, Folder $folder): JsonResponse
    {
        if ($folder->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Decision: Move prompts to root or parent when folder is deleted
        // For now, let's move prompts to parent_id or null
        $folder->prompts()->update(['folder_id' => $folder->parent_id]);

        // Move children to parent_id or null
        $folder->children()->update(['parent_id' => $folder->parent_id]);

        $folder->delete();

        return response()->json(['message' => 'Folder deleted successfully']);
    }

    /**
     * Recursively aggregate prompt counts from children to parents
     */
    private function aggregatePromptCounts($folders): void
    {
        foreach ($folders as $folder) {
            $total = (int) $folder->prompts_count;
            if ($folder->relationLoaded('descendants') && $folder->descendants->isNotEmpty()) {
                $this->aggregatePromptCounts($folder->descendants);
                $total += $folder->descendants->sum('prompts_count');
            }
            $folder->prompts_count = $total;
        }
    }
}
