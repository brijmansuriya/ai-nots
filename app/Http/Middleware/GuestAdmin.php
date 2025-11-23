<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class GuestAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If admin is already logged in, redirect to admin dashboard
        if (Auth::guard('admin')->check()) {
            return redirect()->route('admin.dashboard');
        }

        // If regular user is logged in, redirect to user dashboard
        // (Logout will happen when they actually try to login as admin)
        if (Auth::guard('web')->check()) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
