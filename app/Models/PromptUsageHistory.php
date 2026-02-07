<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromptUsageHistory extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'prompt_usage_history';

    protected $fillable = [
        'user_id',
        'prompt_note_id',
        'platform_used',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get the prompt that was used.
     */
    public function promptNote(): BelongsTo
    {
        return $this->belongsTo(PromptNote::class, 'prompt_note_id');
    }

    /**
     * Get the user who used the prompt (if authenticated).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
