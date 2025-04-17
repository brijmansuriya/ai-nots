<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PromptNote extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'prompt',
        'description',
        'is_public',
        'category_id'
    ];

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'prompt_note_tag');
    }

    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class, 'prompt_note_platform');
    }
}
