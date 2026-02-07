<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FolderResource extends JsonResource
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
            'emoji' => $this->emoji,
            'color' => $this->color,
            'parent_id' => $this->parent_id,
            'prompts_count' => $this->prompts_count,
            'children' => FolderResource::collection($this->whenLoaded('children', $this->children, $this->whenLoaded('descendants'))),
        ];
    }
}
