<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class GuestUser
{
    /**
     * Handle an incoming request.
     * This middleware should only be used on guest routes (login, register, etc.)
     * It redirects authenticated users away from guest pages.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only handle user guest routes (login, register, etc.)
        // This middleware should only be applied to user guest routes, not public routes like home
        
        // If admin is logged in and trying to access user guest pages, redirect to admin dashboard
        if (Auth::guard('admin')->check()) {
            return redirect()->route('admin.dashboard');
        }

        // If regular user is already logged in, redirect to their dashboard
        if (Auth::guard('web')->check()) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
