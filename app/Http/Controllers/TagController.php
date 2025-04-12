<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TagController extends Controller
{
    /**
     * Display a listing of the tags.
     */
    public function index()
    {
        $tags = Tag::paginate(10);
        return Inertia::render('admin/tags/index', ['tags' => $tags]);
    }

    /**
     * Show the form for creating a new tag.
     */
    public function create()
    {
        return Inertia::render('admin/tags/create');
    }

    /**
     * Store a newly created tag in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tags,slug|regex:/^[a-zA-Z0-9\-]+$/',
            'description' => 'nullable|string|max:500',
            'status' => 'required|in:' . Tag::STATUS_PENDING . ',' . Tag::STATUS_ACTIVE . ',' . Tag::STATUS_DEACTIVE,
        ]);

        $tag = auth()->user()->tags()->create($validated);
        return redirect()->route('admin.tags.index')->with('success', 'Tag created successfully!');
    }

    /**
     * Show the form for editing the specified tag.
     */
    public function edit(Tag $tag)
    {
        return Inertia::render('admin/tags/edit', ['tag' => $tag]);
    }

    /**
     * Update the specified tag in storage.
     */
    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tags,slug,' . $tag->id . '|regex:/^[a-zA-Z0-9\-]+$/', 
            'description' => 'nullable|string|max:500',
            'status' => 'required|in:' . Tag::STATUS_PENDING . ',' . Tag::STATUS_ACTIVE . ',' . Tag::STATUS_DEACTIVE,


        ]);

       $tag->update($validated);

        return redirect()->route('admin.tags.index')->with('success', 'Tag updated successfully!');
    }

    /**
     * Show 
     */
    public function show(Tag $tag)
    {
        return Inertia::render('admin/tags/show', ['tag' => $tag]);
    }

    /**
     * Remove the specified tag from storage.
     */
    public function destroy(Tag $tag)
    {
        $tag->delete();

        return redirect()->route('admin.tags.index')->with('success', 'Tag deleted successfully!');
    }
}