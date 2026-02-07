<?php

namespace App\Http\Controllers;

use App\Models\PromptNote;
use App\Models\PromptUsageHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PromptMetricsController extends Controller
{
    /**
     * Save a prompt to user's favorites.
     */
    public function save(Request $request, PromptNote $prompt)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Check if already saved
        $exists = DB::table('prompt_saves')
            ->where('user_id', $user->id)
            ->where('prompt_note_id', $prompt->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already saved', 'saved' => true], 200);
        }

        // Save the prompt
        DB::table('prompt_saves')->insert([
            'user_id' => $user->id,
            'prompt_note_id' => $prompt->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Increment save count
        $prompt->increment('save_count');
        $prompt->calculatePopularityScore();

        return response()->json([
            'message' => 'Prompt saved',
            'saved' => true,
            'save_count' => $prompt->fresh()->save_count,
        ], 200);
    }

    /**
     * Remove a prompt from user's favorites.
     */
    public function unsave(Request $request, PromptNote $prompt)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Remove the save
        $deleted = DB::table('prompt_saves')
            ->where('user_id', $user->id)
            ->where('prompt_note_id', $prompt->id)
            ->delete();

        if ($deleted) {
            // Decrement save count (but don't go below 0)
            if ($prompt->save_count > 0) {
                $prompt->decrement('save_count');
            }
            $prompt->calculatePopularityScore();
        }

        return response()->json([
            'message' => 'Prompt unsaved',
            'saved' => false,
            'save_count' => $prompt->fresh()->save_count,
        ], 200);
    }

    /**
     * Like a prompt.
     */
    public function like(Request $request, PromptNote $prompt)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Check if already liked
        $exists = DB::table('prompt_likes')
            ->where('user_id', $user->id)
            ->where('prompt_note_id', $prompt->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already liked', 'liked' => true], 200);
        }

        // Like the prompt
        DB::table('prompt_likes')->insert([
            'user_id' => $user->id,
            'prompt_note_id' => $prompt->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Increment likes count
        $prompt->increment('likes_count');
        $prompt->calculatePopularityScore();

        return response()->json([
            'message' => 'Prompt liked',
            'liked' => true,
            'likes_count' => $prompt->fresh()->likes_count,
        ], 200);
    }

    /**
     * Unlike a prompt.
     */
    public function unlike(Request $request, PromptNote $prompt)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Remove the like
        $deleted = DB::table('prompt_likes')
            ->where('user_id', $user->id)
            ->where('prompt_note_id', $prompt->id)
            ->delete();

        if ($deleted) {
            // Decrement likes count (but don't go below 0)
            if ($prompt->likes_count > 0) {
                $prompt->decrement('likes_count');
            }
            $prompt->calculatePopularityScore();
        }

        return response()->json([
            'message' => 'Prompt unliked',
            'liked' => false,
            'likes_count' => $prompt->fresh()->likes_count,
        ], 200);
    }

    /**
     * Track when a prompt is copied.
     */
    public function trackCopy(Request $request, PromptNote $prompt)
    {
        // Increment copy count
        $prompt->increment('copy_count');
        $prompt->calculatePopularityScore();

        return response()->json([
            'message' => 'Copy tracked',
            'copy_count' => $prompt->fresh()->copy_count,
        ], 200);
    }

    /**
     * Track when a prompt is actually used in an AI tool.
     */
    public function trackUsage(Request $request, PromptNote $prompt)
    {
        $user = Auth::user();

        PromptUsageHistory::create([
            'user_id' => $user?->id,
            'prompt_note_id' => $prompt->id,
            'platform_used' => $request->input('platform_used'),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Usage tracked',
        ], 200);
    }

    /**
     * Get all prompts saved by the current user.
     */
    public function getSavedPrompts(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $promptIds = DB::table('prompt_saves')
            ->where('user_id', $user->id)
            ->pluck('prompt_note_id');

        $prompts = PromptNote::with(['tags', 'platforms', 'media'])
            ->whereIn('id', $promptIds)
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => $prompts->through(function ($prompt) {
                $data = $prompt->toArray();
                // Ensure metrics are included
                $data['save_count'] = $prompt->save_count ?? 0;
                $data['copy_count'] = $prompt->copy_count ?? 0;
                $data['likes_count'] = $prompt->likes_count ?? 0;
                $data['views_count'] = $prompt->views_count ?? 0;
                $data['popularity_score'] = $prompt->popularity_score ?? 0.00;
                return $data;
            }),
            'current_page' => $prompts->currentPage(),
            'last_page' => $prompts->lastPage(),
        ]);
    }
}

