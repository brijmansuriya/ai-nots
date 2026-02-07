<?php
namespace App\Http\Controllers\Api\Extension;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Get all active categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::where('status', 'active')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories)->response();
    }
}
