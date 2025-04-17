<?php

namespace Database\Factories;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tag>
 */
class TagFactory extends Factory
{
    protected $model = Tag::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'slug'=> $this->faker->slug,
            'created_by_type' => $this->faker->randomElement(['admin', 'user']),
            'created_by_id' => $this->faker->randomNumber(),
            'status' => $this->faker->randomElement(['0', '1']),
            // 'is_public' => $this->faker->randomElement(['0', '1']),  
        ];
    }
}
