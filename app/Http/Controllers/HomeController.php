<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\Platform;
use App\Models\PromptNote;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

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
       
        $prompts = PromptNote::with(['tags', 'platforms'])
            ->when($search, function ($query, $search) {

                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('prompt', 'like', "%{$search}%")
                    ->orWhereHas('tags', fn($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('platforms', fn($q) => $q->where('name', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(10); // Ensure pagination is working
            sleep(1);
        return response()->json([
            'data' => $prompts->items(),
            'current_page' => $prompts->currentPage(),
            'last_page' => $prompts->lastPage(),
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user(); // Get the logged-in user
        $prompts = PromptNote::with(['tags', 'platforms'])
            ->where('promptable_id', $user->id) // Filter by user ID
            ->where('promptable_type', $user->getMorphClass()) // Filter by user ID
            ->latest()
            ->paginate(10); // Ensure pagination is working

        return Inertia::render('dashboard', [
            'prompts' => $prompts,
        ]);
    }

    public function getUserPrompts(Request $request)
    {
        $user = $request->user(); // Get the logged-in user
        $search = $request->input('search', ''); // Get the search query
        $prompts = PromptNote::with(['tags', 'platforms'])
            ->where('promptable_id', $user->id) // Filter by user ID
            ->where('promptable_type', $user->getMorphClass()) // Filter by user type
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('prompt', 'like', "%{$search}%"); // Filter by title or prompt content
            })
            ->latest()
            ->paginate(10); // Ensure pagination is working

        return response()->json([
            'data' => $prompts->items(),
            'current_page' => $prompts->currentPage(),
            'last_page' => $prompts->lastPage(),
        ]);
    }

    public function tags()
    {
        $tags = Tag::all();
        return response()->json([
            'tags' => $tags
        ]);
    }

    public function platform()
    {
        $platforms = Platform::all();
        return response()->json([
            'platforms' => $platforms
        ]);
    }

    public function categories()
    {
        $categories = Category::all();
        return response()->json([
            'categories' => $categories
        ]);
    }

    
}
