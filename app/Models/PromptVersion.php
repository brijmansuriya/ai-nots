<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromptVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'prompt_note_id',
        'version_number',
        'title',
        'prompt',
        'description',
        'created_by',
        'change_summary',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the prompt note this version belongs to.
     */
    public function promptNote(): BelongsTo
    {
        return $this->belongsTo(PromptNote::class, 'prompt_note_id');
    }

    /**
     * Get the user who created this version.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get a formatted date string for display.
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->created_at->format('M d, Y g:i A');
    }

    /**
     * Get a relative time string (e.g., "2 hours ago").
     */
    public function getRelativeTimeAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }
}

