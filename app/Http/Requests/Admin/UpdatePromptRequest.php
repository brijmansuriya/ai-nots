<?php
namespace App\Http\Requests\Admin;

use App\Enums\PromptStatus;
use App\Models\PromptNote;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePromptRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $prompt = $this->route('prompt');
        $admin  = auth()->guard('admin')->user();

        // Only allow admin to update templates (admin-created prompts)
        return $admin && $prompt instanceof PromptNote && $prompt->promptable_type === 'admin';
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert category_id to integer if it's a string
        if ($this->has('category_id')) {
            $categoryId = $this->input('category_id');
            if (is_string($categoryId) && trim($categoryId) !== '' && is_numeric($categoryId)) {
                $this->merge([
                    'category_id' => (int) $categoryId,
                ]);
            } elseif (is_string($categoryId) && trim($categoryId) === '') {
                // Convert empty string to null so validation can properly fail
                $this->merge([
                    'category_id' => null,
                ]);
            } elseif (is_numeric($categoryId)) {
                // Already numeric, ensure it's an integer
                $this->merge([
                    'category_id' => (int) $categoryId,
                ]);
            }
        }

        // Ensure platform is an array
        if ($this->has('platform') && ! is_array($this->input('platform'))) {
            $platform = $this->input('platform');
            if (is_string($platform)) {
                $this->merge([
                    'platform' => [$platform],
                ]);
            } else {
                $this->merge([
                    'platform' => [],
                ]);
            }
        }

        // Ensure tags is an array
        if ($this->has('tags') && ! is_array($this->input('tags'))) {
            $tags = $this->input('tags');
            if (is_string($tags)) {
                $this->merge([
                    'tags' => [$tags],
                ]);
            } else {
                $this->merge([
                    'tags' => [],
                ]);
            }
        }

        // Ensure dynamic_variables is an array if provided
        if ($this->has('dynamic_variables') && ! is_array($this->input('dynamic_variables'))) {
            $this->merge([
                'dynamic_variables' => [],
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'               => ['required', 'string', 'max:255'],
            'prompt'              => ['required', 'string', 'max:1000'],
            'description'         => ['nullable', 'string', 'max:500'],
            'category_id'         => ['required', 'integer', 'exists:categories,id'],
            'tags'                => ['required', 'array', 'min:1'],
            'tags.*'              => ['required', 'string', 'max:50'],
            'platform'            => ['required', 'array', 'min:1'],
            'platform.*'          => ['required', 'string', 'max:50'],
            'dynamic_variables'   => ['nullable', 'array'],
            'dynamic_variables.*' => ['required', 'string', 'max:50'],
            'image'               => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp,gif', 'max:2048'],     // Max 2MB before conversion
            'remove_image'        => ['nullable', 'boolean'],                                              // Flag to remove existing image
            'status'              => ['nullable', 'string', 'in:' . implode(',', PromptStatus::values())], // Use enum values
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required'       => 'The title field is required.',
            'prompt.required'      => 'The prompt field is required.',
            'category_id.required' => 'Please select a category.',
            'tags.required'        => 'At least one tag is required.',
            'tags.min'             => 'At least one tag is required.',
            'platform.required'    => 'At least one platform is required.',
            'platform.min'         => 'At least one platform is required.',
        ];
    }
}

