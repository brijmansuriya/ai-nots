<?php

namespace App\Http\Controllers\Auth;

use Laravel\Socialite\Facades\Socialite;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class SocialAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver('google')->user();

        // Find or create a user in the database
        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName(),
                'password' => bcrypt(str()->random(16)), // Generate a random password
                'google_id' => $googleUser->getId(), // Store Google ID
            ]
        );

        // Log the user in
        Auth::login($user);

        // Extension Login Support
        $extensionId = session('auth_extension_id');
        Log::info('Checking for extension ID in social login session', ['ext_id' => $extensionId]);

        if ($extensionId) {
            session()->forget('auth_extension_id');
            return app(\App\Http\Controllers\Api\Extension\AuthRedirectController::class)
                ->issueTokenAndRedirect($user, $extensionId);
        }

        // Redirect to the intended page or home
        return redirect()->intended('/');
    }
}
