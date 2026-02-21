<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlatformResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'variable_pattern' => $this->variable_pattern,
            'max_prompt_length' => $this->max_prompt_length,
            'cost' => $this->cost,
            'provider_type' => $this->provider_type,
            'feature_flags' => $this->feature_flags,
            'status' => $this->status,
        ];
    }
}
