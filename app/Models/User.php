<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function tags(): MorphMany
    {
        return $this->morphMany(Tag::class, 'created_by');
    }

    //promptable
    public function promptable(): MorphMany
    {
        return $this->morphMany(PromptNote::class, 'promptable');
    }

    /**
     * Get all prompts saved by this user.
     */
    public function savedPrompts(): BelongsToMany
    {
        return $this->belongsToMany(PromptNote::class, 'prompt_saves', 'user_id', 'prompt_note_id')
            ->withTimestamps();
    }

    /**
     * Get all prompts liked by this user.
     */
    public function likedPrompts(): BelongsToMany
    {
        return $this->belongsToMany(PromptNote::class, 'prompt_likes', 'user_id', 'prompt_note_id')
            ->withTimestamps();
    }
}
