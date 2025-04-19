<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PromptNoteVariable extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'prompt_note_id',
        'name',
    ];

    public function promptNote()
    {
        return $this->belongsTo(PromptNote::class);
    }
}
