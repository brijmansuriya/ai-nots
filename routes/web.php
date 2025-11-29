<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PromptController;
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

    // Edit & delete require authenticated user
    Route::middleware(['auth.user', 'verified'])->group(function () {
        Route::get('{prompt}/edit', [PromptController::class, 'edit'])->name('prompt.edit');
        Route::put('{prompt}', [PromptController::class, 'update'])->name('prompt.update');
        Route::delete('{prompt}', [PromptController::class, 'destroy'])->name('prompt.destroy');
    });
});

Route::get('list/tags', [HomeController::class, 'tags'])->name('tags');
Route::get('list/platform', [HomeController::class, 'platform'])->name('platform');
//category_id
Route::get('list/categories', [HomeController::class, 'categories'])->name('categories');

Route::middleware(['auth.user', 'verified'])->group(function () {
    Route::get('dashboard', [HomeController::class, 'dashboard'])->name('dashboard');
    Route::get('dashboard/prompts', [HomeController::class, 'getUserPrompts'])->name('dashboard.prompts'); // New route
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
