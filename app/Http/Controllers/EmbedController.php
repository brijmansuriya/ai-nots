<?php

namespace App\Http\Controllers;

use App\Models\PromptNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;

class EmbedController extends Controller
{
    /**
     * Resolve a public and active prompt or fail with 403.
     */
    private function resolvePublicPrompt($id)
    {
        $prompt = PromptNote::with(['tags', 'platforms', 'variables'])->findOrFail($id);

        // Always allow the owner to see their own prompt preview/embedding
        $user = auth()->user();
        if ($user && $prompt->promptable_id === $user->id && $prompt->promptable_type === $user->getMorphClass()) {
            return $prompt;
        }

        // Check if prompt is public and active for everyone else
        // is_public = 1 (public), status = 1 (active)
        if (!$prompt->is_public || $prompt->status != '1') {
            abort(403, 'This prompt is not available for embedding.');
        }

        return $prompt;
    }

    /**
     * Display the embed HTML fragment.
     */
    public function show($id, Request $request)
    {
        $prompt = $this->resolvePublicPrompt($id);
        $theme = $request->query('theme', 'light');

        return view('embed.prompt', [
            'prompt' => $prompt,
            'theme' => $theme,
        ]);
    }

    /**
     * Return prompt data as JSON.
     */
    public function json($id)
    {
        $prompt = $this->resolvePublicPrompt($id);

        return response()->json([
            'id' => $prompt->id,
            'title' => $prompt->title,
            'description' => $prompt->description,
            'prompt' => $prompt->prompt,
            'tags' => $prompt->tags->pluck('name'),
            'created_at' => $prompt->created_at,
        ]);
    }

    /**
     * Export prompt as Markdown.
     */
    public function markdown($id)
    {
        $prompt = $this->resolvePublicPrompt($id);
        $tags = $prompt->tags->pluck('name')->join(', ');

        $content = "# {$prompt->title}\n\n";
        if ($prompt->description) {
            $content .= "## Description\n\n{$prompt->description}\n\n";
        }
        $content .= "## Prompt\n\n```\n{$prompt->prompt}\n```\n\n";
        if ($tags) {
            $content .= "## Tags\n\n{$tags}\n";
        }

        $filename = Str::slug($prompt->title) . '.md';

        return Response::make($content, 200, [
            'Content-Type' => 'text/markdown',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Export prompt as Text.
     */
    public function text($id)
    {
        $prompt = $this->resolvePublicPrompt($id);

        $content = "TITLE: {$prompt->title}\n";
        if ($prompt->description) {
            $content .= "DESCRIPTION: {$prompt->description}\n";
        }
        $content .= "\nPROMPT:\n{$prompt->prompt}\n";

        $filename = Str::slug($prompt->title) . '.txt';

        return Response::make($content, 200, [
            'Content-Type' => 'text/plain',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Serve the embed script.
     */
    public function script()
    {
        $path = public_path('embed/prompt.js');

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path, [
            'Content-Type' => 'application/javascript',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
