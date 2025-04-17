<?php

namespace Database\Factories;

use App\Models\PromptNote;
use Illuminate\Database\Eloquent\Factories\Factory;

class PromptNoteFactory extends Factory
{
    protected $model = PromptNote::class;

    public function definition()
    {
        return [
            'title' => $this->faker->sentence,
            'prompt' => $this->faker->paragraph,
            'is_public' => $this->faker->randomElement(['0', '1']),
            'category_id' => $this->faker->numberBetween(1, 10),
            'promptable_type' => $this->faker->randomElement(['admin', 'user']),
            'promptable_id' => $this->faker->randomNumber(),
            'created_at' => $this->faker->dateTime,
            'updated_at' => $this->faker->dateTime,
        ];
    }
}
