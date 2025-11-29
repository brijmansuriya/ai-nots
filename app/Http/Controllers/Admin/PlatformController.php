<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlatformController extends Controller
{
    /**
     * Display a listing of the platforms.
     */
    public function index()
    {
        $platforms = Platform::paginate(10);
        return Inertia::render('admin/platforms/index', ['platforms' => $platforms]);
    }

    /**
     * Show the form for creating a new platform.
     */
    public function create()
    {
        return Inertia::render('admin/platforms/create');
    }

    /**
     * Store a newly created platform in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:' . Platform::STATUS_PENDING . ',' . Platform::STATUS_ACTIVE . ',' . Platform::STATUS_DEACTIVE,
        ]);

        $platform = Platform::create($validated);
        return redirect()->route('admin.platforms.index')->with('success', 'Platform created successfully!');
    }

    /**
     * Show the form for editing the specified platform.
     */
    public function edit(Platform $platform)
    {
        return Inertia::render('admin/platforms/edit', ['platform' => $platform]);
    }

    /**
     * Update the specified platform in storage.
     */
    public function update(Request $request, Platform $platform)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:' . Platform::STATUS_PENDING . ',' . Platform::STATUS_ACTIVE . ',' . Platform::STATUS_DEACTIVE,
        ]);

        $platform->update($validated);

        return redirect()->route('admin.platforms.index')->with('success', 'Platform updated successfully!');
    }

    /**
     * Display the specified platform.
     */
    public function show(Platform $platform)
    {
        return Inertia::render('admin/platforms/show', ['platform' => $platform]);
    }

    /**
     * Remove the specified platform from storage.
     */
    public function destroy(Platform $platform)
    {
        $platform->delete();

        return redirect()->route('admin.platforms.index')->with('success', 'Platform deleted successfully!');
    }
}

