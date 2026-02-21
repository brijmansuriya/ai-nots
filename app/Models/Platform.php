<?php

namespace App\Models;

use App\Enums\PromptStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Enums\ProviderType;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Platform extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'provider_type',
        'api_base_url',
        'is_active',
        'max_prompt_length',
        'max_output_tokens',
        'supports_system_prompt',
        'supports_temperature',
        'supports_top_p',
        'supports_streaming',
        'supports_frequency_penalty',
        'supports_presence_penalty',
        'variable_pattern',
        'default_temperature',
        'default_max_tokens',
        'status'
    ];

    protected $casts = [
        'status' => PromptStatus::class,
        'provider_type' => ProviderType::class,
        'is_active' => 'boolean',
        'supports_system_prompt' => 'boolean',
        'supports_temperature' => 'boolean',
        'supports_top_p' => 'boolean',
        'supports_streaming' => 'boolean',
        'supports_frequency_penalty' => 'boolean',
        'supports_presence_penalty' => 'boolean',
        'default_temperature' => 'decimal:2',
        'max_prompt_length' => 'integer',
        'max_output_tokens' => 'integer',
        'default_max_tokens' => 'integer',
    ];

    public function models(): HasMany
    {
        return $this->hasMany(PlatformModel::class);
    }
}
