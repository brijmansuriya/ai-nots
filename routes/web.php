<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PromptController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;



Route::get('/', [HomeController::class, 'index'])->name('home');

//create prompt
Route::prefix('prompt')->group(function () {
    // Route::get('create', [HomeController::class, 'createPrompt'])->name('prompt.create');
    Route::post('store', [PromptController::class, 'store'])->name('prompt.store');
});

Route::get('list/tags', [HomeController::class, 'tags'])->name('tags');
Route::get('list/platform', [HomeController::class, 'platform'])->name('platform');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [HomeController::class, 'dashboard'])->name('dashboard');
});


Route::get('/auth/redirect', function () {
    return Socialite::driver('github')->redirect();
});
 
Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();
 
    // $user->token
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
