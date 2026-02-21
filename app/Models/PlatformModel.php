<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlatformModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform_id',
        'model_name',
        'max_input_tokens',
        'max_output_tokens',
        'cost_per_1k_input',
        'cost_per_1k_output',
        'is_default',
        'is_active',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'max_input_tokens' => 'integer',
        'max_output_tokens' => 'integer',
        'cost_per_1k_input' => 'decimal:6',
        'cost_per_1k_output' => 'decimal:6',
    ];

    public function platform(): BelongsTo
    {
        return $this->belongsTo(Platform::class);
    }
}
