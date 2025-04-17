<?php
namespace Database\Factories;

use App\Models\Platform;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlatformFactory extends Factory
{
    protected $model = Platform::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
            'status' => $this->faker->randomElement(['0', '1']),
            
        ];
    }
}
