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

        $prompts = PromptNote::with(['tags', 'platforms', 'media'])
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

        // Add image URLs to each prompt using getCollection() which returns a Collection
        $promptsData = $prompts->getCollection()->map(function ($prompt) {
            $data              = $prompt->toArray();
            $data['image_url'] = $prompt->image_url;
            return $data;
        })->values()->all();

        return response()->json([
            'data'         => $promptsData,
            'current_page' => $prompts->currentPage(),
            'last_page'    => $prompts->lastPage(),
        ]);
    }

    public function dashboard(Request $request)
    {
        $user    = $request->user(); // Get the logged-in user
        $prompts = PromptNote::with(['tags', 'platforms', 'media'])
            ->where('promptable_id', $user->id)                // Filter by user ID
            ->where('promptable_type', $user->getMorphClass()) // Filter by user ID
            ->latest()
            ->paginate(10); // Ensure pagination is working

        // Add image URLs to prompts
        $prompts->getCollection()->transform(function ($prompt) {
            $data              = $prompt->toArray();
            $data['image_url'] = $prompt->image_url;
            return $data;
        });

        return Inertia::render('dashboard', [
            'prompts' => $prompts,
        ]);
    }

    public function getUserPrompts(Request $request)
    {
        $user    = $request->user();              // Get the logged-in user
        $search  = $request->input('search', ''); // Get the search query
        $prompts = PromptNote::with(['tags', 'platforms', 'media'])
            ->where('promptable_id', $user->id)                // Filter by user ID
            ->where('promptable_type', $user->getMorphClass()) // Filter by user type
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('prompt', 'like', "%{$search}%"); // Filter by title or prompt content
            })
            ->latest()
            ->paginate(10); // Ensure pagination is working

        // Add image URLs to each prompt
        $promptsData = $prompts->getCollection()->map(function ($prompt) {
            $data              = $prompt->toArray();
            $data['image_url'] = $prompt->image_url;
            return $data;
        })->values()->all();

        return response()->json([
            'data'         => $promptsData,
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
