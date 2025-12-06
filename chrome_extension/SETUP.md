# Chrome Extension Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd chrome_extension
   npm install
   ```

2. **Create Icons**
   - Create icon files in the `icons/` directory:
     - `icon16.png` (16x16)
     - `icon32.png` (32x32)
     - `icon48.png` (48x48)
     - `icon128.png` (128x128)
   - You can use a tool like [Favicon Generator](https://favicon.io/) to generate these from a single image

3. **Build the Extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `chrome_extension/dist` folder

5. **Configure the Extension**
   - Click the extension icon in Chrome
   - Click "Configure API" or the settings icon
   - Enter your API URL (e.g., `http://localhost:8000` or your production URL)
   - Enter your authentication token
   - Click "Save"

## Development

### Watch Mode
```bash
npm run dev
```

This will watch for changes and rebuild automatically. You'll need to reload the extension in Chrome after each build.

### Type Checking
```bash
npm run type-check
```

## Getting Your Auth Token

The extension needs an authentication token to access your prompts. You can get this from:

1. **Laravel Sanctum Token** (if using API tokens):
   - Go to your application
   - Create a personal access token in your account settings
   - Copy the token

2. **Session Cookie** (alternative):
   - The extension can also use session-based auth if your backend supports it
   - Make sure CORS is configured correctly

## Troubleshooting

### Extension won't load
- Make sure you're loading the `dist` folder, not the root `chrome_extension` folder
- Check the browser console for errors (right-click extension icon → Inspect popup)

### API Connection Issues
- Verify your API URL is correct (no trailing slash)
- Check CORS settings on your backend
- Ensure your auth token is valid
- Check the Network tab in DevTools to see API requests

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check that TypeScript is properly configured
- Verify Node.js version is 18+

## Project Structure

```
chrome_extension/
├── dist/              # Built extension (load this in Chrome)
├── src/
│   ├── popup/        # Main popup UI
│   ├── background/   # Service worker
│   ├── content/      # Content scripts
│   ├── hooks/        # React hooks
│   ├── services/     # API services
│   └── types/        # TypeScript types
├── icons/            # Extension icons
└── manifest.json     # Extension manifest
```

## Features

- ✅ Search prompts
- ✅ Copy to clipboard
- ✅ Offline caching (5 min cache)
- ✅ Background sync (every 15 min)
- ✅ Settings modal
- ✅ Modern UI with Tailwind CSS

## Next Steps

- Add more features as needed
- Customize the UI to match your brand
- Add keyboard shortcuts
- Implement prompt creation from extension

