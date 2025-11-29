<?php

use App\Http\Middleware\AuthAdmin;
use App\Http\Middleware\AuthUser;
use App\Http\Middleware\GuestAdmin;
use App\Http\Middleware\GuestUser;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',

        api: __DIR__ . '/../routes/api.php',
        apiPrefix: 'api/admin',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Global Middleware Here
        // Note: GuestUser should not be global as it interferes with public routes

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        //alias middleware
        $middleware->alias([
            'auth.admin'  => AuthAdmin::class,
            'auth.user'   => AuthUser::class,
            'guest.admin' => GuestAdmin::class,
            'guest.user'  => GuestUser::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
