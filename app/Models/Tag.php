<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Tag extends Model
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
        'created_by_type',
        'created_by_id',
        'status',
        'is_public',
    ];

    protected $casts = [
        'status' => \App\Enums\PromptStatus::class,
    ];



    public function createdBy(): MorphTo
    {
        return $this->morphTo();
    }

}
