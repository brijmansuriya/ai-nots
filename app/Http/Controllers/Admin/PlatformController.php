<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use App\Enums\PromptStatus;
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
            'slug' => 'required|string|max:255|unique:platforms,slug',
            'description' => 'nullable|string',
            'provider_type' => 'required|string|in:' . implode(',', \App\Enums\ProviderType::values()),
            'api_base_url' => 'nullable|url',
            'is_active' => 'required|boolean',
            'max_prompt_length' => 'required|integer|min:1',
            'max_output_tokens' => 'required|integer|min:1',
            'supports_system_prompt' => 'required|boolean',
            'supports_temperature' => 'required|boolean',
            'supports_top_p' => 'required|boolean',
            'supports_streaming' => 'required|boolean',
            'supports_frequency_penalty' => 'required|boolean',
            'supports_presence_penalty' => 'required|boolean',
            'variable_pattern' => 'required|string',
            'default_temperature' => 'required|numeric|between:0,2',
            'default_max_tokens' => 'required|integer|min:1',
            'status' => 'required|in:' . implode(',', PromptStatus::values()),
        ]);

        $platform = Platform::create($validated);
        return redirect()->route('admin.platforms.index')->with('success', 'Platform created successfully!');
    }

    /**
     * Show the form for editing the specified platform.
     */
    public function edit(Platform $platform)
    {
        $platform->load('models');
        return Inertia::render('admin/platforms/edit', [
            'platform' => $platform,
            'providerTypes' => \App\Enums\ProviderType::cases(),
        ]);
    }

    /**
     * Update the specified platform in storage.
     */
    public function update(Request $request, Platform $platform)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:platforms,slug,' . $platform->id,
            'description' => 'nullable|string',
            'provider_type' => 'required|string|in:' . implode(',', \App\Enums\ProviderType::values()),
            'api_base_url' => 'nullable|url',
            'is_active' => 'required|boolean',
            'max_prompt_length' => 'required|integer|min:1',
            'max_output_tokens' => 'required|integer|min:1',
            'supports_system_prompt' => 'required|boolean',
            'supports_temperature' => 'required|boolean',
            'supports_top_p' => 'required|boolean',
            'supports_streaming' => 'required|boolean',
            'supports_frequency_penalty' => 'required|boolean',
            'supports_presence_penalty' => 'required|boolean',
            'variable_pattern' => 'required|string',
            'default_temperature' => 'required|numeric|between:0,2',
            'default_max_tokens' => 'required|integer|min:1',
            'status' => 'required|in:' . implode(',', PromptStatus::values()),
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

