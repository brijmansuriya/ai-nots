# Backend API Setup for Chrome Extension

The Chrome extension needs a few API endpoints to work properly. Here's what you need to add to your Laravel backend.

## Required API Endpoints

### 1. Get Current User (Recommended)

Add this route to `routes/api.php` or `routes/web.php`:

```php
// routes/api.php or routes/web.php
Route::middleware(['auth:sanctum'])->get('/api/user', function (Request $request) {
    return response()->json([
        'id' => $request->user()->id,
        'name' => $request->user()->name,
        'email' => $request->user()->email,
    ]);
});
```

### 2. CORS Configuration

Make sure your `config/cors.php` allows credentials:

```php
'paths' => ['api/*', 'dashboard/*', 'saved/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['chrome-extension://*'], // Allow Chrome extensions
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true, // Important!
```

### 3. Sanctum Configuration (if using API tokens)

If you're using Laravel Sanctum for API authentication:

1. **Create Personal Access Tokens**:
   - Add a route to create tokens in your backend
   - Or use the existing Sanctum token creation

2. **Token Format**:
   - The extension expects: `Authorization: Bearer {token}`
   - Or you can use cookie-based auth if configured

### 4. Alternative: Session-Based Auth

If you prefer session-based auth instead of tokens:

1. Update `config/sanctum.php`:
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

2. Update the extension's API service to use cookies instead of Bearer tokens.

## Testing the API

You can test your API endpoints using curl:

```bash
# Test user endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json" \
     http://localhost:8000/api/user

# Test prompts endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json" \
     "http://localhost:8000/dashboard/prompts?page=1"
```

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS for API calls in production
2. **Token Expiration**: Implement token refresh if needed
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **CORS**: Only allow specific origins, not `*`

## Example Laravel Route Setup

```php
// routes/api.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;

Route::middleware(['auth:sanctum'])->group(function () {
    // Get current user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Get user prompts (already exists, but ensure it works with API)
    Route::get('/prompts', [HomeController::class, 'getUserPrompts']);
});
```

## Troubleshooting

### CORS Errors
- Check `config/cors.php` settings
- Verify `supports_credentials` is `true`
- Check browser console for specific CORS errors

### Authentication Issues
- Verify token format matches what your backend expects
- Check if token has expired
- Ensure middleware is correctly applied

### API Not Found
- Verify routes are registered
- Check route caching: `php artisan route:clear`
- Ensure API routes are in the correct file

