<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Platform;
use App\Models\PromptNote;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('home', [
            'search' => $request->input('search', ''),
        ]);
    }

    public function home(Request $request)
    {
        $search = $request->input('search', '');
        $user   = $request->user();

        $prompts = PromptNote::with(['tags', 'platforms', 'media'])
            ->active() // Only show active/approved prompts
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('prompt', 'like', "%{$search}%")
                        ->orWhereHas('tags', fn($tq) => $tq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('platforms', fn($pq) => $pq->where('name', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(10);

        return response()->json([
            'data'         => $prompts->items(), // Return the items array directly
            'current_page' => $prompts->currentPage(),
            'last_page'    => $prompts->lastPage(),
        ]);
    }

    public function dashboard(Request $request)
    {
        $user    = $request->user(); // Get the logged-in user
        $prompts = PromptNote::with(['tags', 'platforms', 'media'])
            ->withTrashed()                                    // Include soft-deleted prompts for user's own prompts
            ->where('promptable_id', $user->id)                // Filter by user ID
            ->where('promptable_type', $user->getMorphClass()) // Filter by user type
            ->latest()
            ->paginate(10); // Ensure pagination is working
        return Inertia::render('dashboard', [
            'prompts' => $prompts,
        ]);
    }

    public function getUserPrompts(Request $request)
    {
        $user     = $request->user();              // Get the logged-in user
        $search   = $request->input('search', ''); // Get the search query
        $folderId = $request->input('folder_id');  // Get folder filter

        $prompts = PromptNote::with(['tags', 'platforms', 'media', 'folder'])
            ->withTrashed()                                    // Include soft-deleted prompts for user's own prompts
            ->where('promptable_id', $user->id)                // Filter by user ID
            ->where('promptable_type', $user->getMorphClass()) // Filter by user type
            ->when($folderId !== null, function ($query) use ($folderId) {
                if ($folderId === 'unfoldered') {
                    // Show prompts without a folder
                    $query->whereNull('folder_id');
                } else {
                    // Show prompts in specific folder
                    $query->where('folder_id', $folderId);
                }
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('prompt', 'like', "%{$search}%"); // Filter by title or prompt content
                });
            })
            ->latest()
            ->paginate(10); // Laravel automatically reads 'page' from request query string

        return response()->json([
            'data'         => $prompts->items(), // Return the items array directly
            'current_page' => $prompts->currentPage(),
            'last_page'    => $prompts->lastPage(),
        ]);
    }

    public function tags()
    {
        $tags = Tag::all();
        return response()->json([
            'tags' => $tags,
        ]);
    }

    public function platform()
    {
        $platforms = Platform::all();
        return response()->json([
            'platforms' => $platforms,
        ]);
    }

    public function categories()
    {
        $categories = Category::all();
        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Get all meta data (tags, categories, platforms) in one request
     */
    public function metaAll()
    {
        return response()->json([
            'tags'       => Tag::all(),
            'categories' => Category::all(),
            'platforms'  => Platform::all(),
        ]);
    }

}
