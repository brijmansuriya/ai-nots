<?php
namespace App\Models;

use App\Enums\PromptStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PromptNote extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'title',
        'prompt',
        'description',
        'promptable_id',
        'promptable_type',
        'is_public', //'0 : pending, 1 : approved, 2 : rejected'
        'status',    //'0 : pending, 1 : approved, 2 : rejected'
        'category_id',
        'folder_id',
        'save_count',
        'copy_count',
        'likes_count',
        'views_count',
        'popularity_score',
        // 'dynamic_variables',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'image_url',
        'is_template',
    ];

    /**
     * Status constants for backward compatibility
     */
    public const STATUS_PENDING  = '0';
    public const STATUS_ACTIVE   = '1';
    public const STATUS_REJECTED = '2';

    /**
     * Scope a query to only include active prompts.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', PromptStatus::ACTIVE->value);
    }

    /**
     * Scope a query to only include pending prompts.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', PromptStatus::PENDING->value);
    }

    /**
     * Scope a query to only include rejected prompts.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', PromptStatus::REJECTED->value);
    }

    /**
     * Scope a query to filter by status.
     *
     * @param Builder $query
     * @param string|PromptStatus $status
     * @return Builder
     */
    public function scopeStatus(Builder $query, string | PromptStatus $status): Builder
    {
        $statusValue = $status instanceof PromptStatus ? $status->value : $status;
        return $query->where('status', $statusValue);
    }

    /**
     * Scope a query to only include templates (admin-created prompts).
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeTemplates(Builder $query): Builder
    {
        return $query->where('promptable_type', 'admin');
    }

    /**
     * Scope a query to only include personal prompts (user-created prompts).
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopePersonal(Builder $query): Builder
    {
        return $query->where('promptable_type', 'user');
    }

    /**
     * Register media collections for the model.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('prompt_images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'])
            ->singleFile();
    }

    /**
     * Register media conversions for the model.
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('webp')
            ->format('webp')
            ->quality(90) // High quality WebP (85-90 range)
            ->performOnCollections('prompt_images')
            ->nonQueued();
    }

    /**
     * Get the image URL (getter).
     *
     * @return string|null
     */
    public function getImageUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('prompt_images');

        if (! $media) {
            return null;
        }

        // Return the media URL directly (already converted to WebP by ImageService)
        return $media->getUrl();
    }

    /**
     * Get the image path (getter).
     *
     * @return string|null
     */
    public function getImagePathAttribute(): ?string
    {
        $media = $this->getFirstMedia('prompt_images');

        if (! $media) {
            return null;
        }

        return $media->getPath();
    }

    /**
     * Check if prompt has an image (getter).
     *
     * @return bool
     */
    public function getHasImageAttribute(): bool
    {
        return $this->hasMedia('prompt_images');
    }

    /**
     * Get image thumbnail URL (getter).
     *
     * @param int $width
     * @param int $height
     * @return string|null
     */
    public function getImageThumbnailAttribute($width = 300, $height = 300): ?string
    {
        $media = $this->getFirstMedia('prompt_images');

        if (! $media) {
            return null;
        }

        return $media->getUrl();
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'prompt_note_tag');
    }

    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class, 'prompt_note_platform');
    }

    public function variables()
    {
        return $this->hasMany(PromptNoteVariable::class);
    }

    /**
     * Get all saves for this prompt.
     */
    public function saves(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'prompt_saves', 'prompt_note_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Get all likes for this prompt.
     */
    public function likes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'prompt_likes', 'prompt_note_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Get all views for this prompt.
     */
    public function views(): HasMany
    {
        return $this->hasMany(PromptView::class, 'prompt_note_id');
    }

    /**
     * Get all usage history for this prompt.
     */
    public function usageHistory(): HasMany
    {
        return $this->hasMany(PromptUsageHistory::class, 'prompt_note_id');
    }

    /**
     * Get all versions for this prompt.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(PromptVersion::class, 'prompt_note_id')->orderBy('version_number', 'desc');
    }

    //promptable
    public function promptable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Check if prompt is active.
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === PromptStatus::ACTIVE->value;
    }

    /**
     * Check if prompt is pending.
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->status === PromptStatus::PENDING->value;
    }

    /**
     * Check if prompt is rejected.
     *
     * @return bool
     */
    public function isRejected(): bool
    {
        return $this->status === PromptStatus::REJECTED->value;
    }

    /**
     * Check if prompt is a template (created by admin).
     *
     * @return bool
     */
    public function isTemplate(): bool
    {
        return $this->promptable_type === 'admin';
    }

    /**
     * Check if prompt is personal (created by user).
     *
     * @return bool
     */
    public function isPersonal(): bool
    {
        return $this->promptable_type === 'user';
    }

    /**
     * Get the is_template attribute (computed from promptable_type).
     *
     * @return bool
     */
    public function getIsTemplateAttribute(): bool
    {
        return $this->isTemplate();
    }

    /**
     * Check if the current user has saved this prompt.
     *
     * @return bool
     */
    public function getIsSavedAttribute(): bool
    {
        try {
            $user = Auth::user();
            if (! $user) {
                return false;
            }

            // Use relationLoaded to avoid N+1 queries if saves are already loaded
            if ($this->relationLoaded('saves')) {
                return $this->saves->contains('id', $user->id);
            }

            // Otherwise, check if the relation exists without loading all saves
            return $this->saves()->where('user_id', $user->id)->exists();
        } catch (\Exception $e) {
            // Return false on any error to prevent breaking the response
            \Log::warning('Error checking is_saved attribute: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if the current user has liked this prompt.
     *
     * @return bool
     */
    public function getIsLikedAttribute(): bool
    {
        try {
            $user = Auth::user();
            if (! $user) {
                return false;
            }

            // Use relationLoaded to avoid N+1 queries if likes are already loaded
            if ($this->relationLoaded('likes')) {
                return $this->likes->contains('id', $user->id);
            }

            // Otherwise, check if the relation exists without loading all likes
            return $this->likes()->where('user_id', $user->id)->exists();
        } catch (\Exception $e) {
            // Return false on any error to prevent breaking the response
            \Log::warning('Error checking is_liked attribute: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Calculate and update popularity score.
     * Formula: Saves × 2 + Copies × 1 + Likes × 3 + Views × 0.1
     *
     * @return float
     */
    public function calculatePopularityScore(): float
    {
        $score = ($this->save_count * 2)
             + ($this->copy_count * 1)
             + ($this->likes_count * 3)
             + ($this->views_count * 0.1);

        $this->popularity_score = round($score, 2);
        $this->saveQuietly(); // Save without triggering events

        return $this->popularity_score;
    }

    /**
     * Increment view count and track the view.
     *
     * @param int|null $userId
     * @param string|null $ipAddress
     * @param string|null $userAgent
     * @return void
     */
    public function incrementView(?int $userId = null, ?string $ipAddress = null, ?string $userAgent = null): void
    {
        // Check if view already exists (prevent duplicate counting)
        $viewExists = $this->views()
            ->where(function ($query) use ($userId, $ipAddress) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->whereNull('user_id')
                        ->where('ip_address', $ipAddress);
                }
            })
            ->where('created_at', '>=', now()->subHour()) // Within last hour
            ->exists();

        if (! $viewExists) {
            $this->views()->create([
                'user_id'    => $userId,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'created_at' => now(),
            ]);

            $this->increment('views_count');
            $this->calculatePopularityScore();
        }
    }
}
