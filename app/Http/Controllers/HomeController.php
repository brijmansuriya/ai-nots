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
        $search = $request->input('search');
        // dd($search);
        // Fetch prompts with eager loading to avoid N+1 query issue
        $prompts = PromptNote::with(['tags', 'platforms'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('prompt', 'like', "%{$search}%")
                      ->orWhereHas('tags', function ($tagQuery) use ($search) {
                          $tagQuery->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('platforms', function ($platformQuery) use ($search) {
                          $platformQuery->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->latest()
            ->paginate(10);  // Pagination for better performance with large data

        return Inertia::render('home', [
            'prompts' => $prompts,
            'search' => $search,
        ]);
    }

    //home
    public function home(Request $request)
    {
        $search = $request->input('search');
        // dd($search);
        // Fetch prompts with eager loading to avoid N+1 query issue
        $prompts = PromptNote::with(['tags', 'platforms'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('prompt', 'like', "%{$search}%")
                      ->orWhereHas('tags', function ($tagQuery) use ($search) {
                          $tagQuery->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('platforms', function ($platformQuery) use ($search) {
                          $platformQuery->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->latest()
            ->paginate(10); 

                return response()->json([
                    'data' => $prompts->items(),            // The array of prompts
                    'current_page' => $prompts->currentPage(),
                    'last_page' => $prompts->lastPage(),
                ]);
    }

    // public function dashboard()
    public function dashboard(Request $request)
    {
        return Inertia::render('dashboard');
    }

    //get tags list
    public function tags()
    {
        $tags = Tag::all();
        return response()->json([
            'tags' => $tags
        ]);
    }

    //platform
    public function platform()
    {
        $platforms = Platform::all();
        return response()->json([
            'platforms' => $platforms
        ]);
    }

    //categories
    public function categories()
    {
        $categories = Category::all();
        return response()->json([
            'categories' => $categories
        ]);
    }
}
