<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Enums\PromptStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategorieController extends Controller
{
    /**
     * Display a listing of the categories.     
     */
    public function index()
    {
        $categories = Category::paginate(10);
        return Inertia::render('admin/categories/index', ['categories' => $categories]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create()
    {
        return Inertia::render('admin/categories/create');
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug|regex:/^[a-zA-Z0-9\-]+$/',
            'status' => 'required|in:' . implode(',', PromptStatus::values()),
        ]);

        $category = Category::create($validated);
        return redirect()->route('admin.categories.index')->with('success', 'Category created successfully!');
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Category $category)
    {
        return Inertia::render('admin/categories/edit', ['category' => $category]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug,' . $category->id . '|regex:/^[a-zA-Z0-9\-]+$/',
            'status' => 'required|in:' . implode(',', PromptStatus::values()),
        ]);

        $category->update($validated);

        return redirect()->route('admin.categories.index')->with('success', 'Category updated successfully!');
    }

    /**
     * Show 
     */
    public function show(Category $category)
    {
        return Inertia::render('admin/categories/show', ['category' => $category]);
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('admin.categories.index')->with('success', 'Category deleted successfully!');
    }
}