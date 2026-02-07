<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromptNote;
use App\Models\Tag;
use App\Models\Category;
use App\Models\Platform;
use Illuminate\Http\Request;
use Inertia\Inertia;


class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/welcome');
    }

    public function dashboard(Request $request)
    {
        // Get statistics for admin templates (prompts created by admin)
        $totalTemplates = PromptNote::where('promptable_type', 'admin')
            ->whereNull('deleted_at')
            ->count();

        $activeTemplates = PromptNote::where('promptable_type', 'admin')
            ->where('status', '1')
            ->whereNull('deleted_at')
            ->count();

        $pendingTemplates = PromptNote::where('promptable_type', 'admin')
            ->where('status', '0')
            ->whereNull('deleted_at')
            ->count();

        $rejectedTemplates = PromptNote::where('promptable_type', 'admin')
            ->where('status', '2')
            ->whereNull('deleted_at')
            ->count();

        // Get other statistics
        $totalTags = Tag::count();
        $totalCategories = Category::count();
        $totalPlatforms = Platform::count();

        // Get recent templates
        $recentTemplates = PromptNote::where('promptable_type', 'admin')
            ->whereNull('deleted_at')
            ->latest('created_at')
            ->limit(5)
            ->get(['id', 'title', 'status', 'created_at']);

        return Inertia::render('admin/dashboard', [
            'statistics' => [
                'total_templates' => $totalTemplates,
                'active_templates' => $activeTemplates,
                'pending_templates' => $pendingTemplates,
                'rejected_templates' => $rejectedTemplates,
                'total_tags' => $totalTags,
                'total_categories' => $totalCategories,
                'total_platforms' => $totalPlatforms,
            ],
            'recent_templates' => $recentTemplates,
        ]);
    }
}
