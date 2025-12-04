<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Folder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'parent_id',
        'name',
        'color',
        'emoji',
        'position',
    ];

    /**
     * Get the user that owns the folder.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent folder.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    /**
     * Get child folders.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Folder::class, 'parent_id')->orderBy('position');
    }

    /**
     * Get all prompts in this folder.
     */
    public function prompts(): HasMany
    {
        return $this->hasMany(PromptNote::class, 'folder_id');
    }

    /**
     * Get all descendants (recursive).
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    /**
     * Scope to get root folders (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope to get folders for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get the count of prompts in this folder (including descendants).
     */
    public function getPromptsCountAttribute(): int
    {
        return $this->prompts()->count() + $this->children()->withCount('prompts')->get()->sum('prompts_count');
    }
}
