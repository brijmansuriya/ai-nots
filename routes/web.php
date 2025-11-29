<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PromptController;
use App\Http\Controllers\PromptMetricsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/home', [HomeController::class, 'home'])->name('homedata'); // Ensure this route is correct

Route::get('/about', [AboutController::class, 'index'])->name('about');

Route::prefix('prompt')->group(function () {
    Route::get('create', function () {
        return Inertia::render('add-prompt');
    })->name('prompt.create');

    Route::post('store', [PromptController::class, 'store'])->name('prompt.store');
    Route::get('show/{id}', [PromptController::class, 'show'])->name('prompt.show');

    // Metrics routes (some require auth, some don't)
    Route::post('{prompt}/copy', [PromptMetricsController::class, 'trackCopy'])->name('prompt.copy');
    Route::post('{prompt}/usage', [PromptMetricsController::class, 'trackUsage'])->name('prompt.usage');

    // Edit & delete require authenticated user
    Route::middleware(['auth.user', 'verified'])->group(function () {
        Route::get('{prompt}/edit', [PromptController::class, 'edit'])->name('prompt.edit');
        Route::match(['put', 'post'], '{prompt}', [PromptController::class, 'update'])->name('prompt.update');
        Route::delete('{prompt}', [PromptController::class, 'destroy'])->name('prompt.destroy');

        // Metrics routes that require authentication
        Route::post('{prompt}/save', [PromptMetricsController::class, 'save'])->name('prompt.save');
        Route::delete('{prompt}/save', [PromptMetricsController::class, 'unsave'])->name('prompt.unsave');
        Route::post('{prompt}/like', [PromptMetricsController::class, 'like'])->name('prompt.like');
        Route::delete('{prompt}/like', [PromptMetricsController::class, 'unlike'])->name('prompt.unlike');
    });
});

Route::get('list/tags', [HomeController::class, 'tags'])->name('tags');
Route::get('list/platform', [HomeController::class, 'platform'])->name('platform');
Route::get('list/categories', [HomeController::class, 'categories'])->name('categories');
Route::get('list/meta/all', [HomeController::class, 'metaAll'])->name('meta.all');

Route::middleware(['auth.user', 'verified'])->group(function () {
    Route::get('dashboard', [HomeController::class, 'dashboard'])->name('dashboard');
    Route::get('dashboard/prompts', [HomeController::class, 'getUserPrompts'])->name('dashboard.prompts'); // New route
    Route::get('saved', function () {
        return Inertia::render('saved-prompts');
    })->name('saved');
    Route::get('saved/prompts', [PromptMetricsController::class, 'getSavedPrompts'])->name('saved.prompts');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
