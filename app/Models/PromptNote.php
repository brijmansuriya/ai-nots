<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PromptNote extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'prompt',
        'promptable_id',
        'promptable_type',
        'is_public', //'0 : pending, 1 : approved, 2 : rejected'
        'status', //'0 : pending, 1 : approved, 2 : rejected'
        'category_id',
        // 'dynamic_variables',
    ];
    
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'prompt_note_tag');
    }

    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class, 'prompt_note_platform');
    }

    public function variables()
    {
        return $this->hasMany(PromptNoteVariable::class);
    }

    //promptable
    public function promptable(): MorphTo
    {
        return $this->morphTo();
    }
}
