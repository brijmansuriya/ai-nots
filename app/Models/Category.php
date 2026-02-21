<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'slug',
        'status', //'0', '1', '2'
    ];

    protected $casts = [
        'status' => \App\Enums\PromptStatus::class,
    ];

    /**
     * Get the prompts for this category.
     */
    public function promptNotes(): HasMany
    {
        return $this->hasMany(PromptNote::class);
    }

}
