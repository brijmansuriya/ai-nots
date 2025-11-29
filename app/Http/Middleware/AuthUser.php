<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (! Auth::guard('web')->check()) {
            return redirect()->route('login');
        }

        // Prevent users from accessing admin routes
        if ($request->is('admin/*')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to access the admin area.');
        }

        // If admin is also logged in, logout admin automatically
        // Admin and user cannot be logged in simultaneously
        if (Auth::guard('admin')->check()) {
            Auth::guard('admin')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        Auth::shouldUse('web');
        return $next($request);
    }
}
