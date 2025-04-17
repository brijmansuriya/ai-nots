<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\PromptController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', [HomeController::class, 'index'])->name('home');

//create prompt
Route::prefix('prompt')->group(function () {
    // Route::get('create', [HomeController::class, 'createPrompt'])->name('prompt.create');
    Route::post('store', [PromptController::class, 'storePrompt'])->name('prompt.store');
});

Route::get('list/tags', [HomeController::class, 'tags'])->name('tags');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [HomeController::class, 'dashboard'])->name('dashboard');
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
