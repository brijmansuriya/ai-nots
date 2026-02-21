<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use App\Models\PlatformModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlatformModelController extends Controller
{
    /**
     * Show the form for creating a new model.
     */
    public function create(Platform $platform)
    {
        return Inertia::render('admin/platforms/models/create', [
            'platform' => $platform,
        ]);
    }

    /**
     * Store a newly created model in storage.
     */
    public function store(Request $request, Platform $platform)
    {
        $validated = $request->validate([
            'model_name' => 'required|string|max:255',
            'max_input_tokens' => 'required|integer|min:1',
            'max_output_tokens' => 'required|integer|min:1',
            'cost_per_1k_input' => 'required|numeric|min:0',
            'cost_per_1k_output' => 'required|numeric|min:0',
            'is_default' => 'required|boolean',
            'is_active' => 'required|boolean',
        ]);

        // If this is set as default, unset others
        if ($validated['is_default']) {
            $platform->models()->update(['is_default' => false]);
        }

        $platform->models()->create($validated);

        return redirect()->route('admin.platforms.edit', $platform->id)
            ->with('success', 'Model added successfully.');
    }

    /**
     * Show the form for editing the specified model.
     */
    public function edit(Platform $platform, PlatformModel $model)
    {
        return Inertia::render('admin/platforms/models/edit', [
            'platform' => $platform,
            'model' => $model,
        ]);
    }

    /**
     * Update the specified model in storage.
     */
    public function update(Request $request, Platform $platform, PlatformModel $model)
    {
        $validated = $request->validate([
            'model_name' => 'required|string|max:255',
            'max_input_tokens' => 'required|integer|min:1',
            'max_output_tokens' => 'required|integer|min:1',
            'cost_per_1k_input' => 'required|numeric|min:0',
            'cost_per_1k_output' => 'required|numeric|min:0',
            'is_default' => 'required|boolean',
            'is_active' => 'required|boolean',
        ]);

        if ($validated['is_default']) {
            $platform->models()->where('id', '!=', $model->id)->update(['is_default' => false]);
        }

        $model->update($validated);

        return redirect()->route('admin.platforms.edit', $platform->id)
            ->with('success', 'Model updated successfully.');
    }

    /**
     * Remove the specified model from storage.
     */
    public function destroy(Platform $platform, PlatformModel $model)
    {
        $model->delete();

        return redirect()->route('admin.platforms.edit', $platform->id)
            ->with('success', 'Model deleted successfully.');
    }
}
