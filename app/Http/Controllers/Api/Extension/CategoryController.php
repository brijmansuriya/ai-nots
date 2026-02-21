<?php
namespace App\Http\Controllers\Api\Extension;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\CategoryResource;
use App\Models\Category;
use App\Enums\PromptStatus;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Get all active categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::where('status', PromptStatus::ACTIVE->value)
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories)->response();
    }
}
