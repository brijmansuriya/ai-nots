<?php
namespace App\Http\Controllers\Api\Extension;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\PlatformResource;
use App\Models\Platform;
use Illuminate\Http\JsonResponse;

class PlatformController extends Controller
{
    /**
     * Get all active platforms
     */
    public function index(): JsonResponse
    {
        $platforms = Platform::where('status', 'active')
            ->orderBy('name')
            ->get();

        return PlatformResource::collection($platforms)->response();
    }
}
