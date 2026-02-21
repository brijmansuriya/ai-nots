<?php
namespace App\Http\Controllers\Api\Extension;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\PlatformResource;
use App\Models\Platform;
use App\Enums\PromptStatus;
use Illuminate\Http\JsonResponse;

class PlatformController extends Controller
{
    /**
     * Get all active platforms
     */
    public function index(): JsonResponse
    {
        $platforms = Platform::where('status', PromptStatus::ACTIVE->value)
            ->orderBy('name')
            ->get();

        return PlatformResource::collection($platforms)->response();
    }
}
