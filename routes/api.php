<?php

use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
|
| These routes are for admin API access. They require Sanctum authentication.
|
*/

// Admin routes are already prefixed with 'api/admin' from bootstrap/app.php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('tags', TagController::class);
});
