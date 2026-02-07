<?php

namespace App\Http\Controllers\Api\Extension;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    /**
     * Store a newly created feedback in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'nullable|string|max:50',
            'message' => 'required|string',
            'metadata' => 'nullable|array',
        ]);

        $feedback = Feedback::create([
            'user_id' => Auth::id(),
            'type' => $validated['type'] ?? 'general',
            'message' => $validated['message'],
            'metadata' => $validated['metadata'] ?? [],
        ]);

        return response()->json([
            'message' => 'Feedback submitted successfully',
            'data' => $feedback
        ], 201);
    }
}
