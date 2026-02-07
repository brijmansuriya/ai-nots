# Image Upload Feature - Installation Instructions

## Required Packages

This feature requires the following packages to be installed:

### 1. Spatie Media Library
```bash
composer require spatie/laravel-medialibrary
```

### 2. Intervention Image (for WebP conversion)
```bash
composer require intervention/image
```

## Setup Steps

### 1. Publish Spatie Media Library Migration
```bash
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-migrations"
```

### 2. Run Migrations
```bash
php artisan migrate
```

### 3. Publish Spatie Media Library Config (Optional)
```bash
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-config"
```

### 4. Ensure Storage Link is Created
```bash
php artisan storage:link
```

### 5. Install GD or Imagick Extension
The Intervention Image library requires either GD or Imagick PHP extension.

**For Ubuntu/Debian:**
```bash
sudo apt-get install php-gd
# OR
sudo apt-get install php-imagick
```

**For macOS (Homebrew):**
```bash
brew install php-gd
# OR
brew install imagemagick
```

**For Windows:**
Enable the extension in `php.ini`:
```ini
extension=gd
# OR
extension=imagick
```

## Features Implemented

✅ **Optional Image Upload** - Users can optionally add an image when creating/editing prompts

✅ **WebP Conversion** - Images are automatically converted to WebP format with quality 90 (high quality, 50-80% size reduction)

✅ **Size Optimization** - Images are optimized to max 1MB while maintaining quality

✅ **Spatie Media Library** - Professional media management with automatic conversions

✅ **Model Getters/Setters** - Easy access via `$prompt->image_url`, `$prompt->has_image`, etc.

## Usage

### In Controllers
```php
// Image is automatically handled in store() and update() methods
// No additional code needed
```

### In Models
```php
// Get image URL
$imageUrl = $prompt->image_url;

// Check if has image
if ($prompt->has_image) {
    // Show image
}

// Get image path
$imagePath = $prompt->image_path;
```

### In Frontend (React/Inertia)
```tsx
// Image upload field is already added to add-prompt.tsx
// Image preview and removal functionality included
```

## Image Quality Settings

- **Quality**: 90 (High-quality lossy WebP)
- **Max Size**: 1MB after conversion
- **Max Dimensions**: 1920x1920px (auto-resized if larger)
- **Format**: WebP (converted from any supported format)

## File Structure

- Images stored in: `storage/app/public/prompts/`
- Media Library metadata: `media` table (created by migration)
- WebP conversions: Handled automatically by Spatie Media Library

