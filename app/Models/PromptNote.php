<?php
namespace App\Models;

use App\Enums\PromptStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
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
        // 'dynamic_variables',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'image_url',
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
}
