<?php

namespace App\Http\Controllers\Api\Extension;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\PromptResource;
use App\Models\PromptNote;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    /**
     * Get list of templates (admin-created prompts)
     */
    public function index(Request $request)
    {
        // Use the templates scope to filter admin-created prompts
        $query = PromptNote::templates()
            ->active() // Only active templates
            ->with(['category', 'tags', 'platforms']);

        // Optional: Support simple search/filtering if needed
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Pagination
        $perPage = $request->input('per_page', 20);
        $templates = $query->paginate($perPage);

        return PromptResource::collection($templates)->additional([
            'status' => true,
            'message' => 'Templates fetched successfully',
        ]);
    }
}
