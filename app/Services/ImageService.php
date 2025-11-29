<?php
namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ImageService
{
    protected ImageManager $imageManager;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver());
    }

    /**
     * Convert and optimize image to WebP format.
     *
     * @param UploadedFile $file
     * @param int $quality Quality setting (85-90 recommended, 100 for lossless)
     * @param int $maxSize Maximum file size in bytes (default: 1MB)
     * @return string Path to saved file
     * @throws \Exception
     */
    public function convertToWebP(UploadedFile $file, int $quality = 90, int $maxSize = 1048576): string
    {
                                               // Validate file size before processing
        if ($file->getSize() > $maxSize * 2) { // Allow 2x for initial processing
            throw new \Exception('Image file is too large. Maximum size is ' . ($maxSize / 1024) . 'KB.');
        }

        // Read image
        $image = $this->imageManager->read($file->getRealPath());

        // Resize if needed to reduce file size while maintaining quality
        $image = $this->optimizeImageSize($image, $maxSize, $quality);

        // Convert to WebP
        $webpData = $image->toWebp($quality);

        // If still too large, reduce quality progressively
        $currentQuality = $quality;
        while (strlen($webpData) > $maxSize && $currentQuality > 70) {
            $currentQuality -= 5;
            $webpData = $image->toWebp($currentQuality);
        }

        // Final check
        if (strlen($webpData) > $maxSize) {
            // Last resort: resize image dimensions
            $image    = $image->scaleDown(width: 1920, height: 1920);
            $webpData = $image->toWebp(85);
        }

        // Generate unique filename
        $filename  = uniqid('prompt_', true) . '.webp';
        $directory = 'prompts';
        $path      = $directory . '/' . $filename;

        // Ensure directory exists
        if (! Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->makeDirectory($directory);
        }

        // Save to storage
        Storage::disk('public')->put($path, $webpData);

        return $path;
    }

    /**
     * Optimize image dimensions to reduce file size.
     *
     * @param mixed $image
     * @param int $maxSize
     * @param int $quality
     * @return mixed
     */
    protected function optimizeImageSize($image, int $maxSize, int $quality): mixed
    {
        $width  = $image->width();
        $height = $image->height();

        // If image is very large, scale it down
        // Max dimensions: 1920x1920 for high quality
        if ($width > 1920 || $height > 1920) {
            $image = $image->scaleDown(width: 1920, height: 1920);
        }

        return $image;
    }

    /**
     * Validate image file.
     *
     * @param UploadedFile $file
     * @param int $maxSize Maximum size in bytes
     * @return bool
     */
    public function validateImage(UploadedFile $file, int $maxSize = 1048576): bool
    {
        $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

        return in_array($file->getMimeType(), $allowedMimes)
        && $file->getSize() <= $maxSize * 2; // Allow 2x for initial upload
    }
}
