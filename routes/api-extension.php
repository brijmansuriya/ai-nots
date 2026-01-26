<?php

use App\Http\Controllers\Api\Extension\AuthController;
use App\Http\Controllers\Api\Extension\CategoryController;
use App\Http\Controllers\Api\Extension\PlatformController;
use App\Http\Controllers\Api\Extension\PromptController;
use App\Http\Controllers\Api\Extension\TagController;
use App\Http\Controllers\Api\Extension\TemplateController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| Extension API Routes
|--------------------------------------------------------------------------
|
| These routes are for the Chrome extension. They use API token
| authentication (Sanctum) and don't require CSRF tokens.
|
*/

// Authentication routes (public)
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    // Protected auth routes
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// Public endpoints (no auth required for listing)
Route::get('categories', [CategoryController::class, 'index']);
Route::get('tags', [TagController::class, 'index']);
Route::get('platforms', [PlatformController::class, 'index']);
Route::get('templates', [TemplateController::class, 'index']);

// Protected endpoints (require API token auth)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('prompts', [PromptController::class, 'index']);
    Route::post('prompts', [PromptController::class, 'store']);
    Route::post('templates', [TemplateController::class, 'store']);
});
