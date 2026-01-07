<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Folder;
use App\Models\Platform;
use App\Models\PromptNote;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        // Get statistics for the home page
        $totalPrompts = PromptNote::active()->count();
        $totalCategories = Category::count();
        $totalTags = Tag::count();
        $totalPlatforms = Platform::where('status', 'active')->count();

        // Get popular/top prompts (most saved/liked)
        $popularPrompts = PromptNote::with(['tags', 'platforms', 'media'])
            ->active()
            ->orderByRaw('(COALESCE(save_count, 0) + COALESCE(likes_count, 0) + COALESCE(copy_count, 0)) DESC')
            ->limit(6)
            ->get();

        // Get recent prompts
        $recentPrompts = PromptNote::with(['tags', 'platforms', 'media'])
            ->active()
            ->latest()
            ->limit(6)
            ->get();

        // Get popular categories (categories with most active prompts)
        $popularCategories = Category::withCount(['promptNotes' => function ($query) {
                $query->where('status', '1')
                    ->whereNull('deleted_at');
            }])
            ->orderBy('prompt_notes_count', 'desc')
            ->limit(6)
            ->get();

        return Inertia::render('home', [
            'search' => $request->input('search', ''),
            'statistics' => [
                'total_prompts' => $totalPrompts,
                'total_categories' => $totalCategories,
                'total_tags' => $totalTags,
                'total_platforms' => $totalPlatforms,
            ],
            'popular_prompts' => $popularPrompts,
            'recent_prompts' => $recentPrompts,
            'popular_categories' => $popularCategories,
        ]);
    }

    public function home(Request $request)
    {
        $search = $request->input('search', '');
        $categoryId = $request->input('category_id');
        $user   = $request->user();

        $prompts = PromptNote::with(['tags', 'platforms', 'media'])
            ->active() // Only show active/approved prompts
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('prompt', 'like', "%{$search}%")
                        ->orWhereHas('tags', fn($tq) => $tq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('platforms', fn($pq) => $pq->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($categoryId, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->latest()
            ->paginate(10);

        return response()->json([
            'data'         => $prompts->items(), // Return the items array directly
            'current_page' => $prompts->currentPage(),
            'last_page'    => $prompts->lastPage(),
        ]);
    }

    public function dashboard(Request $request)
    {
        $user    = $request->user(); // Get the logged-in user
        $prompts = PromptNote::with(['tags', 'platforms', 'media'])
            ->withTrashed()                                    // Include soft-deleted prompts for user's own prompts
            ->where('promptable_id', $user->id)                // Filter by user ID
            ->where('promptable_type', $user->getMorphClass()) // Filter by user type
            ->latest()
            ->paginate(10); // Ensure pagination is working
        return Inertia::render('dashboard', [
            'prompts' => $prompts,
        ]);
    }

    public function getUserPrompts(Request $request)
    {
        $user     = $request->user();              // Get the logged-in user
        $search   = $request->input('search', ''); // Get the search query
        $folderId = $request->input('folder_id');  // Get folder filter

        $prompts = PromptNote::with(['tags', 'platforms', 'media', 'folder'])
            ->withTrashed()                                    // Include soft-deleted prompts for user's own prompts
            ->where('promptable_id', $user->id)                // Filter by user ID
            ->where('promptable_type', $user->getMorphClass()) // Filter by user type
            ->when($folderId !== null, function ($query) use ($folderId) {
                if ($folderId === 'unfoldered') {
                    // Show prompts without a folder
                    $query->whereNull('folder_id');
                } else {
                    // Show prompts in specific folder
                    $query->where('folder_id', $folderId);
                }
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('prompt', 'like', "%{$search}%"); // Filter by title or prompt content
                });
            })
            ->latest()
            ->paginate(10); // Laravel automatically reads 'page' from request query string

        return response()->json([
            'data'         => $prompts->items(), // Return the items array directly
            'current_page' => $prompts->currentPage(),
            'last_page'    => $prompts->lastPage(),
        ]);
    }

    /**
     * Get statistics for the authenticated user
     */
    public function getStatistics(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Total prompts count (excluding soft-deleted)
        $totalPrompts = PromptNote::where('promptable_id', $user->id)
            ->where('promptable_type', $user->getMorphClass())
            ->whereNull('deleted_at')
            ->count();

        // Total folders count
        $totalFolders = Folder::forUser($user->id)
            ->whereNull('deleted_at')
            ->count();

        // Saved prompts count (prompts saved by the user)
        $savedPrompts = DB::table('prompt_saves')
            ->where('user_id', $user->id)
            ->count();

        // Prompts created this week
        $promptsThisWeek = PromptNote::where('promptable_id', $user->id)
            ->where('promptable_type', $user->getMorphClass())
            ->whereNull('deleted_at')
            ->where('created_at', '>=', now()->startOfWeek())
            ->count();

        // Prompts created this month
        $promptsThisMonth = PromptNote::where('promptable_id', $user->id)
            ->where('promptable_type', $user->getMorphClass())
            ->whereNull('deleted_at')
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        // Recent activity (last 5 prompts created)
        $recentActivity = PromptNote::where('promptable_id', $user->id)
            ->where('promptable_type', $user->getMorphClass())
            ->whereNull('deleted_at')
            ->latest('created_at')
            ->limit(5)
            ->get(['id', 'title', 'created_at'])
            ->map(function ($prompt) {
                return [
                    'id'         => $prompt->id,
                    'title'      => $prompt->title,
                    'created_at' => $prompt->created_at->diffForHumans(),
                    'date'       => $prompt->created_at->format('Y-m-d H:i'),
                ];
            });

        return response()->json([
            'total_prompts'      => $totalPrompts,
            'total_folders'      => $totalFolders,
            'saved_prompts'      => $savedPrompts,
            'prompts_this_week'  => $promptsThisWeek,
            'prompts_this_month' => $promptsThisMonth,
            'recent_activity'    => $recentActivity,
        ]);
    }

    public function tags()
    {
        $tags = Tag::all();
        return response()->json([
            'tags' => $tags,
        ]);
    }

    public function platform()
    {
        $platforms = Platform::all();
        return response()->json([
            'platforms' => $platforms,
        ]);
    }

    public function categories()
    {
        $categories = Category::all();
        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Get all meta data (tags, categories, platforms) in one request
     */
    public function metaAll()
    {
        return response()->json([
            'tags'       => Tag::all(),
            'categories' => Category::all(),
            'platforms'  => Platform::all(),
        ]);
    }

    /**
     * Export all user data (prompts, folders, tags, platforms) in multiple formats
     */
    public function export(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $format = $request->input('format', 'json');
        $scope  = $request->input('scope', 'all');

        // Get prompts based on scope
        $prompts = collect();
        if ($scope === 'all' || $scope === 'prompts') {
            $prompts = PromptNote::with(['tags', 'platforms', 'variables', 'category', 'folder'])
                ->where('promptable_id', $user->id)
                ->where('promptable_type', $user->getMorphClass())
                ->get();
        }

        // Get folders based on scope
        $folders = collect();
        if ($scope === 'all' || $scope === 'folders') {
            $folders = Folder::forUser($user->id)
                ->orderBy('position')
                ->get();
        }

        switch ($format) {
            case 'csv':
                return $this->exportAsCsv($prompts);
            case 'excel':
                return $this->exportAsExcel($prompts, $folders);
            case 'markdown':
                return $this->exportAsMarkdown($prompts, $folders);
            case 'json':
            default:
                return $this->exportAsJson($prompts, $folders);
        }
    }

    /**
     * Export as JSON format
     */
    private function exportAsJson($prompts, $folders)
    {
        $promptsData = $prompts->map(function ($prompt) {
            return [
                'title'             => $prompt->title,
                'prompt'            => $prompt->prompt,
                'description'       => $prompt->description,
                'category_name'     => $prompt->category?->name,
                'folder_name'       => $prompt->folder?->name,
                'tags'              => $prompt->tags->pluck('name')->toArray(),
                'platforms'         => $prompt->platforms->pluck('name')->toArray(),
                'dynamic_variables' => $prompt->variables->pluck('name')->toArray(),
                'is_public'         => $prompt->is_public,
                'status'            => $prompt->status,
                'created_at'        => $prompt->created_at?->toISOString(),
            ];
        });

        $foldersData = $folders->map(function ($folder) {
            return [
                'name'        => $folder->name,
                'parent_name' => $folder->parent?->name,
                'color'       => $folder->color,
                'emoji'       => $folder->emoji,
                'position'    => $folder->position,
            ];
        });

        $exportData = [
            'version'     => '1.0',
            'exported_at' => now()->toISOString(),
            'prompts'     => $promptsData,
            'folders'     => $foldersData,
        ];

        return response()->json($exportData)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', 'attachment; filename="ai-nots-export-' . now()->format('Y-m-d') . '.json"');
    }

    /**
     * Export as CSV format
     */
    private function exportAsCsv($prompts)
    {
        $headers = [
            'Title',
            'Prompt',
            'Description',
            'Category',
            'Folder',
            'Tags',
            'Platforms',
            'Dynamic Variables',
            'Status',
            'Created At',
        ];

        $csv   = [];
        $csv[] = '"' . implode('","', $headers) . '"';

        foreach ($prompts as $prompt) {
            $row = [
                $this->escapeCsvField($prompt->title),
                $this->escapeCsvField($prompt->prompt),
                $this->escapeCsvField($prompt->description ?? ''),
                $this->escapeCsvField($prompt->category?->name ?? ''),
                $this->escapeCsvField($prompt->folder?->name ?? ''),
                $this->escapeCsvField(implode(';', $prompt->tags->pluck('name')->toArray())),
                $this->escapeCsvField(implode(';', $prompt->platforms->pluck('name')->toArray())),
                $this->escapeCsvField(implode(';', $prompt->variables->pluck('name')->toArray())),
                $prompt->status,
                $prompt->created_at?->toISOString() ?? '',
            ];
            $csv[] = '"' . implode('","', $row) . '"';
        }

        $content = implode("\n", $csv);

        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="ai-nots-export-' . now()->format('Y-m-d') . '.csv"');
    }

    /**
     * Export as Markdown format
     */
    private function exportAsMarkdown($prompts, $folders)
    {
        $md   = [];
        $md[] = '# AI Notes Export';
        $md[] = '';
        $md[] = '**Exported:** ' . now()->format('Y-m-d H:i:s');
        $md[] = '**Total Prompts:** ' . $prompts->count();
        $md[] = '**Total Folders:** ' . $folders->count();
        $md[] = '';
        $md[] = '---';
        $md[] = '';

        // Export folders structure
        if ($folders->count() > 0) {
            $md[] = '## Folders';
            $md[] = '';
            foreach ($folders as $folder) {
                $parent = $folder->parent ? " (in: {$folder->parent->name})" : '';
                $md[]   = "- **{$folder->name}**{$parent}";
            }
            $md[] = '';
            $md[] = '---';
            $md[] = '';
        }

        // Export prompts
        $md[] = '## Prompts';
        $md[] = '';

        foreach ($prompts as $index => $prompt) {
            $md[] = '### ' . ($index + 1) . '. ' . $prompt->title;
            $md[] = '';

            if ($prompt->description) {
                $md[] = $prompt->description;
                $md[] = '';
            }

            if ($prompt->category) {
                $md[] = '**Category:** ' . $prompt->category->name;
            }

            if ($prompt->folder) {
                $md[] = '**Folder:** ' . $prompt->folder->name;
            }

            if ($prompt->tags->count() > 0) {
                $tags = $prompt->tags->pluck('name')->map(fn($tag) => "`{$tag}`")->implode(', ');
                $md[] = '**Tags:** ' . $tags;
            }

            if ($prompt->platforms->count() > 0) {
                $platforms = $prompt->platforms->pluck('name')->implode(', ');
                $md[]      = '**Platforms:** ' . $platforms;
            }

            if ($prompt->variables->count() > 0) {
                $vars = $prompt->variables->pluck('name')->map(fn($var) => "`[{$var}]`")->implode(', ');
                $md[] = '**Variables:** ' . $vars;
            }

            $md[] = '';
            $md[] = '```';
            $md[] = $prompt->prompt;
            $md[] = '```';
            $md[] = '';
            $md[] = '---';
            $md[] = '';
        }

        $content = implode("\n", $md);

        return response($content)
            ->header('Content-Type', 'text/markdown')
            ->header('Content-Disposition', 'attachment; filename="ai-nots-export-' . now()->format('Y-m-d') . '.md"');
    }

    /**
     * Export as Excel format (XLSX)
     */
    private function exportAsExcel($prompts, $folders)
    {
        // Create CSV-like structure that Excel can open
        // For true XLSX, we'd need PhpSpreadsheet, but this works for basic needs
        $csv = [];

        // Sheet 1: Prompts
        if ($prompts->count() > 0) {
            $csv[]   = '=== PROMPTS ===';
            $headers = [
                'Title',
                'Prompt',
                'Description',
                'Category',
                'Folder',
                'Tags',
                'Platforms',
                'Dynamic Variables',
                'Status',
                'Created At',
            ];
            $csv[] = '"' . implode('","', $headers) . '"';

            foreach ($prompts as $prompt) {
                $row = [
                    $this->escapeCsvField($prompt->title),
                    $this->escapeCsvField($prompt->prompt),
                    $this->escapeCsvField($prompt->description ?? ''),
                    $this->escapeCsvField($prompt->category?->name ?? ''),
                    $this->escapeCsvField($prompt->folder?->name ?? ''),
                    $this->escapeCsvField(implode(';', $prompt->tags->pluck('name')->toArray())),
                    $this->escapeCsvField(implode(';', $prompt->platforms->pluck('name')->toArray())),
                    $this->escapeCsvField(implode(';', $prompt->variables->pluck('name')->toArray())),
                    $prompt->status,
                    $prompt->created_at?->toISOString() ?? '',
                ];
                $csv[] = '"' . implode('","', $row) . '"';
            }
        }

        // Sheet 2: Folders
        if ($folders->count() > 0) {
            $csv[]   = '';
            $csv[]   = '=== FOLDERS ===';
            $headers = ['Name', 'Parent', 'Color', 'Emoji', 'Position'];
            $csv[]   = '"' . implode('","', $headers) . '"';

            foreach ($folders as $folder) {
                $row = [
                    $this->escapeCsvField($folder->name),
                    $this->escapeCsvField($folder->parent?->name ?? ''),
                    $this->escapeCsvField($folder->color ?? ''),
                    $this->escapeCsvField($folder->emoji ?? ''),
                    $folder->position,
                ];
                $csv[] = '"' . implode('","', $row) . '"';
            }
        }

        $content = implode("\n", $csv);

        // Return as CSV but with .xlsx extension (Excel will open it)
        // For true XLSX, install: composer require phpoffice/phpspreadsheet
        return response($content)
            ->header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            ->header('Content-Disposition', 'attachment; filename="ai-nots-export-' . now()->format('Y-m-d') . '.xlsx"');
    }

    /**
     * Export template file for import
     */
    public function exportTemplate(Request $request)
    {
        $format = $request->input('format', 'json');

        switch ($format) {
            case 'csv':
                return $this->exportCsvTemplate();
            case 'excel':
                return $this->exportExcelTemplate();
            case 'json':
            default:
                return $this->exportJsonTemplate();
        }
    }

    /**
     * Export JSON template
     */
    private function exportJsonTemplate()
    {
        $template = [
            'version'     => '1.0',
            'exported_at' => now()->toISOString(),
            'prompts'     => [
                [
                    'title'             => 'Example Prompt Title',
                    'prompt'            => 'This is an example prompt with [variable] support',
                    'description'       => 'Optional description of the prompt',
                    'category_name'     => 'Example Category',
                    'folder_name'       => 'Example Folder',
                    'tags'              => ['tag1', 'tag2'],
                    'platforms'         => ['ChatGPT', 'Claude'],
                    'dynamic_variables' => ['variable'],
                    'is_public'         => 0,
                    'status'            => 1,
                ],
            ],
            'folders'     => [
                [
                    'name'        => 'Example Folder',
                    'parent_name' => null,
                    'color'       => '#3B82F6',
                    'emoji'       => '📁',
                    'position'    => 0,
                ],
            ],
        ];

        return response()->json($template)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', 'attachment; filename="import-template.json"');
    }

    /**
     * Export CSV template
     */
    private function exportCsvTemplate()
    {
        $headers = [
            'Title',
            'Prompt',
            'Description',
            'Category',
            'Folder',
            'Tags',
            'Platforms',
            'Dynamic Variables',
            'Status',
            'Created At',
        ];

        $example = [
            'Example Prompt',
            'This is an example prompt with [variable] support',
            'Optional description',
            'Example Category',
            'Example Folder',
            'tag1;tag2',
            'ChatGPT;Claude',
            'variable',
            '1',
            now()->toISOString(),
        ];

        $csv   = [];
        $csv[] = '"' . implode('","', $headers) . '"';
        $csv[] = '"' . implode('","', array_map([$this, 'escapeCsvField'], $example)) . '"';

        $content = implode("\n", $csv);

        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="import-template.csv"');
    }

    /**
     * Export Excel template
     */
    private function exportExcelTemplate()
    {
        return $this->exportCsvTemplate()
            ->header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            ->header('Content-Disposition', 'attachment; filename="import-template.xlsx"');
    }

    /**
     * Escape CSV field
     */
    private function escapeCsvField($field)
    {
        if ($field === null) {
            return '';
        }
        $field = (string) $field;
        $field = str_replace('"', '""', $field);
        return $field;
    }

    /**
     * Import user data from JSON file
     */
    public function import(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'file'   => 'required|file|mimes:json,csv,txt,xlsx,xls|max:10240', // 10MB max
            'format' => 'nullable|in:json,csv,excel',
        ]);

        try {
            $file   = $request->file('file');
            $format = $request->input('format');

            // Auto-detect format if not provided
            if (! $format) {
                $extension = strtolower($file->getClientOriginalExtension());
                if (in_array($extension, ['xlsx', 'xls'])) {
                    $format = 'excel';
                } elseif ($extension === 'csv') {
                    $format = 'csv';
                } else {
                    $format = 'json';
                }
            }

            // Parse based on format
            if ($format === 'excel' || $format === 'csv') {
                // For Excel, read as text (Excel can be opened as CSV)
                // For true Excel parsing, would need PhpSpreadsheet library
                $fileContent = file_get_contents($file->getRealPath());
                $data        = $this->parseCsvImport($fileContent);
            } else {
                // JSON format
                $fileContent = file_get_contents($file->getRealPath());
                $data        = json_decode($fileContent, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return response()->json([
                        'error' => 'Invalid JSON file: ' . json_last_error_msg(),
                    ], 400);
                }
            }

            // CSV format doesn't require folders, but JSON should have at least prompts or folders
            if ($format === 'json' && ! isset($data['prompts']) && ! isset($data['folders'])) {
                return response()->json([
                    'error' => 'Invalid export format. Missing prompts or folders data.',
                ], 400);
            }

            // CSV format requires prompts
            if ($format === 'csv' && (! isset($data['prompts']) || empty($data['prompts']))) {
                return response()->json([
                    'error' => 'Invalid CSV format. No prompts found.',
                ], 400);
            }

            $promptsImported = 0;
            $foldersImported = 0;
            $errors          = [];

            DB::beginTransaction();

            try {
                                 // Import folders first (they might be referenced by prompts)
                $folderMap = []; // Maps old folder names to new folder IDs
                if (isset($data['folders']) && is_array($data['folders'])) {
                    // Build folder hierarchy
                    $rootFolders  = [];
                    $childFolders = [];

                    foreach ($data['folders'] as $folderData) {
                        if (empty($folderData['parent_name'])) {
                            $rootFolders[] = $folderData;
                        } else {
                            $childFolders[] = $folderData;
                        }
                    }

                    // Import root folders first
                    foreach ($rootFolders as $folderData) {
                        try {
                            $folder = Folder::create([
                                'user_id'   => $user->id,
                                'parent_id' => null,
                                'name'      => $folderData['name'],
                                'color'     => $folderData['color'] ?? null,
                                'emoji'     => $folderData['emoji'] ?? null,
                                'position'  => $folderData['position'] ?? 0,
                            ]);
                            $folderMap[$folderData['name']] = $folder->id;
                            $foldersImported++;
                        } catch (\Exception $e) {
                            $errors[] = "Failed to import folder '{$folderData['name']}': " . $e->getMessage();
                        }
                    }

                    // Import child folders (simple approach - may need recursion for deep nesting)
                    $maxDepth     = 10;
                    $currentDepth = 0;
                    while (! empty($childFolders) && $currentDepth < $maxDepth) {
                        $remaining = [];
                        foreach ($childFolders as $folderData) {
                            $parentName = $folderData['parent_name'];
                            if (isset($folderMap[$parentName])) {
                                try {
                                    $folder = Folder::create([
                                        'user_id'   => $user->id,
                                        'parent_id' => $folderMap[$parentName],
                                        'name'      => $folderData['name'],
                                        'color'     => $folderData['color'] ?? null,
                                        'emoji'     => $folderData['emoji'] ?? null,
                                        'position'  => $folderData['position'] ?? 0,
                                    ]);
                                    $folderMap[$folderData['name']] = $folder->id;
                                    $foldersImported++;
                                } catch (\Exception $e) {
                                    $errors[] = "Failed to import folder '{$folderData['name']}': " . $e->getMessage();
                                }
                            } else {
                                $remaining[] = $folderData;
                            }
                        }
                        $childFolders = $remaining;
                        $currentDepth++;
                    }

                    if (! empty($childFolders)) {
                        $errors[] = 'Some folders could not be imported due to missing parent folders.';
                    }
                }

                // Import prompts
                if (isset($data['prompts']) && is_array($data['prompts'])) {
                    foreach ($data['prompts'] as $promptData) {
                        try {
                            // Get or create category
                            $categoryId = null;
                            if (! empty($promptData['category_name'])) {
                                $category = Category::firstOrCreate(
                                    ['name' => $promptData['category_name']],
                                    [
                                        'name'   => $promptData['category_name'],
                                        'slug'   => Str::slug($promptData['category_name']),
                                        'status' => Category::STATUS_ACTIVE,
                                    ]
                                );
                                $categoryId = $category->id;
                            }

                            // Get folder ID if folder name is provided
                            $folderId = null;
                            if (! empty($promptData['folder_name']) && isset($folderMap[$promptData['folder_name']])) {
                                $folderId = $folderMap[$promptData['folder_name']];
                            }

                            // Create prompt
                            $prompt = PromptNote::create([
                                'title'           => $promptData['title'] ?? 'Untitled Prompt',
                                'prompt'          => $promptData['prompt'] ?? '',
                                'description'     => $promptData['description'] ?? null,
                                'category_id'     => $categoryId,
                                'folder_id'       => $folderId,
                                'promptable_id'   => $user->id,
                                'promptable_type' => $user->getMorphClass(),
                                'is_public'       => $promptData['is_public'] ?? 0,
                                'status'          => $promptData['status'] ?? 0,
                            ]);

                            // Attach tags
                            if (! empty($promptData['tags']) && is_array($promptData['tags'])) {
                                $tagIds = [];
                                foreach ($promptData['tags'] as $tagName) {
                                    $tag = Tag::whereRaw('LOWER(name) = ?', [strtolower($tagName)])->first();
                                    if (! $tag) {
                                        $slug         = Str::slug($tagName);
                                        $originalSlug = $slug;
                                        $counter      = 1;
                                        while (Tag::where('slug', $slug)->exists()) {
                                            $slug = "{$originalSlug}-{$counter}";
                                            $counter++;
                                        }
                                        $tag = Tag::create([
                                            'name'            => $tagName,
                                            'slug'            => $slug,
                                            'created_by_type' => $user->getMorphClass(),
                                            'created_by_id'   => $user->id,
                                            'status'          => Tag::STATUS_ACTIVE,
                                        ]);
                                    }
                                    $tagIds[] = $tag->id;
                                }
                                $prompt->tags()->sync($tagIds);
                            }

                            // Attach platforms
                            if (! empty($promptData['platforms']) && is_array($promptData['platforms'])) {
                                $platformIds = [];
                                foreach ($promptData['platforms'] as $platformName) {
                                    $platform = Platform::whereRaw('LOWER(name) = ?', [strtolower($platformName)])->first();
                                    if ($platform) {
                                        $platformIds[] = $platform->id;
                                    }
                                }
                                $prompt->platforms()->sync($platformIds);
                            }

                            // Create dynamic variables
                            if (! empty($promptData['dynamic_variables']) && is_array($promptData['dynamic_variables'])) {
                                $variables = array_map(function ($variable) {
                                    return ['name' => $variable];
                                }, $promptData['dynamic_variables']);
                                $prompt->variables()->createMany($variables);
                            }

                            $promptsImported++;
                        } catch (\Exception $e) {
                            $errors[] = "Failed to import prompt '{$promptData['title']}': " . $e->getMessage();
                        }
                    }
                }

                DB::commit();

                return response()->json([
                    'message' => 'Import completed successfully',
                    'data'    => [
                        'prompts_imported' => $promptsImported,
                        'folders_imported' => $foldersImported,
                        'errors'           => $errors,
                    ],
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Parse CSV import file
     */
    private function parseCsvImport($csvContent)
    {
        $lines = array_filter(explode("\n", $csvContent), function ($line) {
            return trim($line) !== '';
        });

        if (empty($lines)) {
            throw new \Exception('CSV file is empty');
        }

        // Parse header
        $headerLine = array_shift($lines);
        $headers    = str_getcsv($headerLine);
        $headers    = array_map('trim', $headers);

        // Map headers to our format
        $headerMap = [
            'title'             => 'title',
            'prompt'            => 'prompt',
            'description'       => 'description',
            'category'          => 'category_name',
            'folder'            => 'folder_name',
            'tags'              => 'tags',
            'platforms'         => 'platforms',
            'dynamic variables' => 'dynamic_variables',
            'status'            => 'status',
        ];

        $normalizedHeaders = [];
        foreach ($headers as $header) {
            $normalized          = strtolower(trim($header));
            $normalizedHeaders[] = $headerMap[$normalized] ?? $normalized;
        }

        // Parse data rows
        $prompts = [];
        foreach ($lines as $line) {
            $values = str_getcsv($line);
            $row    = [];

            foreach ($normalizedHeaders as $index => $header) {
                $value = isset($values[$index]) ? trim($values[$index], '"') : '';

                // Handle array fields (tags, platforms, dynamic_variables)
                if (in_array($header, ['tags', 'platforms', 'dynamic_variables'])) {
                    $row[$header] = $value ? array_filter(array_map('trim', explode(';', $value))) : [];
                } else {
                    $row[$header] = $value ?: null;
                }
            }

            if (! empty($row['title']) || ! empty($row['prompt'])) {
                $prompts[] = $row;
            }
        }

        return [
            'version'     => '1.0',
            'exported_at' => now()->toISOString(),
            'prompts'     => $prompts,
            'folders'     => [], // CSV doesn't support folders
        ];
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }

}
