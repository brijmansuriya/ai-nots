<?php
namespace App\Http\Controllers\Api\Extension;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Extension\LoginRequest;
use App\Http\Requests\Api\Extension\RegisterRequest;
use App\Http\Resources\Api\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user via extension
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Create API token for the extension
        $token = $user->createToken('extension-token', ['extension:access'])->plainTextToken;

        return response()->json([
            'user'    => new UserResource($user),
            'token'   => $token,
            'message' => 'Registration successful',
        ], 201);
    }

    /**
     * Login user via extension
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Revoke all existing tokens for this user (optional - for security)
        // $user->tokens()->delete();

        // Create new API token for the extension
        $token = $user->createToken('extension-token', ['extension:access'])->plainTextToken;

        return response()->json([
            'user'    => new UserResource($user),
            'token'   => $token,
            'message' => 'Login successful',
        ]);
    }

    /**
     * Logout user (revoke current token)
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }
}
