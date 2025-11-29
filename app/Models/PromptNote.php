<?php
namespace App\Models;

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
     * Register media collections for the model.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
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
            ->performOnCollections('images')
            ->nonQueued();
    }

    /**
     * Get the image URL (getter).
     *
     * @return string|null
     */
    public function getImageUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('images');

        if (! $media) {
            return null;
        }

        // Return WebP version if available, otherwise original
        $webpMedia = $this->getFirstMedia('images', ['conversion' => 'webp']);

        return $webpMedia ? $webpMedia->getUrl() : $media->getUrl();
    }

    /**
     * Get the image path (getter).
     *
     * @return string|null
     */
    public function getImagePathAttribute(): ?string
    {
        $media = $this->getFirstMedia('images');

        if (! $media) {
            return null;
        }

        $webpMedia = $this->getFirstMedia('images', ['conversion' => 'webp']);

        return $webpMedia ? $webpMedia->getPath() : $media->getPath();
    }

    /**
     * Check if prompt has an image (getter).
     *
     * @return bool
     */
    public function getHasImageAttribute(): bool
    {
        return $this->hasMedia('images');
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
        $media = $this->getFirstMedia('images');

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
}
