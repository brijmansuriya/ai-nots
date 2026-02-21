<?php
namespace App\Http\Controllers\Api\Extension;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\TagResource;
use App\Models\Tag;
use App\Enums\PromptStatus;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    /**
     * Get all active tags
     */
    public function index(): JsonResponse
    {
        $tags = Tag::where('status', PromptStatus::ACTIVE->value)
            ->orderBy('name')
            ->get();

        return TagResource::collection($tags)->response();
    }
}
