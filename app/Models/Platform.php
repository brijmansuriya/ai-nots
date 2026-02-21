<?php

namespace App\Models;

use App\Enums\PromptStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Platform extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'status'];

    protected $casts = [
        'status' => PromptStatus::class,
    ];
}
