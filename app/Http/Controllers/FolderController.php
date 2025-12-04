<?php
namespace App\Http\Controllers;

use App\Models\Folder;
use App\Models\PromptNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class FolderController extends Controller
{
    /**
     * Display a listing of folders for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $folders = Folder::forUser($user->id)
            ->withCount('prompts')
            ->with(['children' => function ($query) {
                $query->withCount('prompts')->orderBy('position');
            }])
            ->root()
            ->orderBy('position')
            ->get();

        return response()->json(['data' => $folders]);
    }

    /**
     * Store a newly created folder.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id',
            'color'     => 'nullable|string|max:7',
            'emoji'     => 'nullable|string|max:10',
        ]);

        // Verify parent belongs to user if provided
        if (isset($validated['parent_id'])) {
            $parent = Folder::find($validated['parent_id']);
            if (! $parent || $parent->user_id !== $user->id) {
                return response()->json(['error' => 'Invalid parent folder'], 403);
            }
        }

        // Get the next position
        $position = Folder::forUser($user->id)
            ->where('parent_id', $validated['parent_id'] ?? null)
            ->max('position') + 1;

        $folder = Folder::create([
            'user_id'   => $user->id,
            'name'      => $validated['name'],
            'parent_id' => $validated['parent_id'] ?? null,
            'color'     => $validated['color'] ?? null,
            'emoji'     => $validated['emoji'] ?? null,
            'position'  => $position,
        ]);

        $folder->loadCount('prompts');

        return response()->json(['data' => $folder], 201);
    }

    /**
     * Display the specified folder.
     */
    public function show(Request $request, Folder $folder)
    {
        $user = $request->user();

        if (! $user || $folder->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $folder->loadCount('prompts');
        $folder->load(['children' => function ($query) {
            $query->withCount('prompts')->orderBy('position');
        }]);

        return response()->json(['data' => $folder]);
    }

    /**
     * Update the specified folder.
     */
    public function update(Request $request, Folder $folder)
    {
        $user = $request->user();

        if (! $user || $folder->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'parent_id' => [
                'nullable',
                'exists:folders,id',
                Rule::notIn([$folder->id]), // Can't be its own parent
            ],
            'color'     => 'nullable|string|max:7',
            'emoji'     => 'nullable|string|max:10',
        ]);

        // Prevent circular references
        if (isset($validated['parent_id'])) {
            $parent = Folder::find($validated['parent_id']);
            if (! $parent || $parent->user_id !== $user->id) {
                return response()->json(['error' => 'Invalid parent folder'], 403);
            }

            // Check if new parent is a descendant (would create cycle)
            $descendants = $folder->descendants()->pluck('id')->toArray();
            if (in_array($validated['parent_id'], $descendants)) {
                return response()->json(['error' => 'Cannot move folder into its own descendant'], 422);
            }
        }

        $folder->update($validated);
        $folder->loadCount('prompts');

        return response()->json(['data' => $folder]);
    }

    /**
     * Remove the specified folder (soft delete).
     */
    public function destroy(Request $request, Folder $folder)
    {
        $user = $request->user();

        if (! $user || $folder->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Soft delete folder and all descendants (cascading)
        DB::transaction(function () use ($folder) {
            $this->softDeleteFolderAndDescendants($folder);
        });

        return response()->json(['message' => 'Folder deleted successfully']);
    }

    /**
     * Recursively soft delete folder and all descendants.
     */
    private function softDeleteFolderAndDescendants(Folder $folder)
    {
        // Soft delete all child folders first
        foreach ($folder->children as $child) {
            $this->softDeleteFolderAndDescendants($child);
        }

        // Soft delete prompts in this folder
        $folder->prompts()->delete();

        // Soft delete the folder itself
        $folder->delete();
    }

    /**
     * Restore a soft-deleted folder.
     */
    public function restore(Request $request, $id)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $folder = Folder::withTrashed()->findOrFail($id);

        if ($folder->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Restore parent first if it's deleted
        if ($folder->parent_id) {
            $parent = Folder::withTrashed()->find($folder->parent_id);
            if ($parent && $parent->trashed()) {
                $parent->restore();
            }
        }

        $folder->restore();
        $folder->loadCount('prompts');

        return response()->json(['data' => $folder]);
    }

    /**
     * Reorder folders (update positions).
     */
    public function reorder(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'folders'             => 'required|array',
            'folders.*.id'        => 'required|exists:folders,id',
            'folders.*.position'  => 'required|integer',
            'folders.*.parent_id' => 'nullable|exists:folders,id',
        ]);

        DB::transaction(function () use ($validated, $user) {
            foreach ($validated['folders'] as $folderData) {
                $folder = Folder::find($folderData['id']);

                // Verify ownership
                if (! $folder || $folder->user_id !== $user->id) {
                    continue;
                }

                $folder->update([
                    'position'  => $folderData['position'],
                    'parent_id' => $folderData['parent_id'] ?? null,
                ]);
            }
        });

        return response()->json(['message' => 'Folders reordered successfully']);
    }

    /**
     * Move a prompt to a folder.
     */
    public function movePrompt(Request $request, PromptNote $prompt)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Verify prompt ownership
        if (
            $prompt->promptable_id !== $user->id ||
            $prompt->promptable_type !== $user->getMorphClass()
        ) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'folder_id' => 'nullable|exists:folders,id',
        ]);

        // Verify folder ownership if provided
        if ($validated['folder_id']) {
            $folder = Folder::find($validated['folder_id']);
            if (! $folder || $folder->user_id !== $user->id) {
                return response()->json(['error' => 'Invalid folder'], 403);
            }
        }

        $prompt->update(['folder_id' => $validated['folder_id'] ?? null]);
        $prompt->load(['tags', 'platforms', 'media']);

        return response()->json(['data' => $prompt]);
    }

    /**
     * Get all folders in a tree structure.
     */
    public function tree(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $folders = Folder::forUser($user->id)
            ->withCount('prompts')
            ->orderBy('position')
            ->get();

        // Build tree structure
        $tree = $this->buildTree($folders);

        return response()->json(['data' => $tree]);
    }

    /**
     * Build a tree structure from flat folder list.
     */
    private function buildTree($folders, $parentId = null)
    {
        $branch = [];

        foreach ($folders as $folder) {
            if ($folder->parent_id == $parentId) {
                $children = $this->buildTree($folders, $folder->id);
                if ($children) {
                    $folder->children = $children;
                }
                $branch[] = $folder;
            }
        }

        return $branch;
    }
}
