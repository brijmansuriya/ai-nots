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
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere("id", "LIKE", "%{$search}%")
                ->orWhere('prompt', 'like', "%{$search}%")
                ->orWhereHas('tags', fn($q) => $q->where('name', 'like', "%{$search}%"))
                ->orWhereHas('platforms', fn($q) => $q->where('name', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => $prompts->items(),
            'current_page' => $prompts->currentPage(),
            'last_page' => $prompts->lastPage(),
        ]);
    }

    public function dashboard(Request $request)
    {
        return Inertia::render('dashboard');
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
