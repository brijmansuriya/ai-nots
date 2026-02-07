<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureGuest
{
    /**
     * Handle an incoming request.
     * 
     * This middleware ensures the user is not authenticated for the specified guard.
     * Admin and user can be logged in simultaneously - no logout of opposite guard.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|null  $guard
     */
    public function handle(Request $request, Closure $next, ?string $guard = null): Response
    {
        // Determine guard from route or parameter
        if (!$guard) {
            $guard = $request->is('admin/*') ? 'admin' : 'web';
        }

        // If the specified guard is authenticated, redirect to appropriate dashboard
        if (Auth::guard($guard)->check()) {
            if ($guard === 'admin') {
                return redirect()->route('admin.dashboard');
            }
            return redirect()->route('dashboard');
        }

        // Allow both guards to be logged in simultaneously
        // No logout of opposite guard - admin and user can both be authenticated

        return $next($request);
    }
}
