<?php

namespace App\Http\Controllers\Api\Extension;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AuthRedirectController extends Controller
{
    /**
     * Handle the extension login request.
     * If logged in, redirect to extension with token.
     * If not logged in, redirect to login page with a return path.
     */
    public function redirect(Request $request)
    {
        $extensionId = $request->query('ext_id');

        if (!$extensionId) {
            Log::warning('Extension login attempt without ext_id');
            return response()->json(['message' => 'Extension ID is required'], 422);
        }

        Log::info('Extension login redirect initiated', ['ext_id' => $extensionId]);

        if (Auth::check()) {
            return $this->issueTokenAndRedirect(Auth::user(), $extensionId);
        }

        // Store extension ID in session to use after login
        session(['auth_extension_id' => $extensionId]);

        return redirect()->route('login');
    }

    /**
     * Issue a Sanctum token and redirect back to the extension.
     */
    public function issueTokenAndRedirect($user, $extensionId)
    {
        $token = $user->createToken('extension-token', ['extension:access'])->plainTextToken;

        $callbackUrl = "chrome-extension://{$extensionId}/callback.html?token={$token}";

        Log::info('Issuing extension token and redirecting', [
            'ext_id' => $extensionId,
            'url' => $callbackUrl,
            'is_inertia' => request()->header('X-Inertia') ? 'yes' : 'no'
        ]);

        if (request()->header('X-Inertia')) {
            return Inertia::location($callbackUrl);
        }

        return redirect()->away($callbackUrl);
    }
}
