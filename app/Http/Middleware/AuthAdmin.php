<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // First, check if regular user is logged in - block them from admin routes
        if (Auth::guard('web')->check()) {
            // Logout user and redirect to their dashboard with error message
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Redirect to login with message that they need admin access
            return redirect()->route('admin.login')
                ->with('error', 'You must be logged in as an administrator to access this area.');
        }

        // Check if admin is authenticated
        if (! Auth::guard('admin')->check()) {
            return redirect()->route('admin.login')
                ->with('error', 'Please login as administrator to access this area.');
        }

        Auth::shouldUse('admin');
        return $next($request);
    }
}
