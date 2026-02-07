<?php
namespace App\Http\Requests\Admin;

use App\Enums\PromptStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePromptRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->guard('admin')->check();
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

