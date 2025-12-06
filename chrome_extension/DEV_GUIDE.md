# Chrome Extension Development Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Icons (Required)
Before building, you need to create icon files in the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use placeholder icons for development or generate them from a logo.

### 3. Build the Extension
```bash
npm run build
```

This will:
- Type-check TypeScript
- Build with Vite
- Copy `manifest.json` and `icons/` to `dist/`

### 4. Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `chrome_extension/dist` folder

### 5. Test the Extension
- Click the extension icon in Chrome toolbar
- The popup should open
- Configure your API URL and token in settings

## Development Workflow

### Watch Mode (Auto-rebuild)
```bash
npm run build:watch
```

This will watch for file changes and rebuild automatically. After each rebuild:
1. Go to `chrome://extensions/`
2. Click the reload icon on your extension card

### Manual Build
```bash
npm run build
```

Then reload the extension in Chrome.

## Testing with Local Backend

If your backend is running on `http://localhost:8000`:

1. **Configure the Extension**:
   - Click extension icon
   - Click Settings
   - Enter API URL: `http://localhost:8000`
   - Enter your auth token

2. **Backend Setup** (see `BACKEND_SETUP.md`):
   - Add `/api/user` endpoint
   - Configure CORS to allow Chrome extensions
   - Ensure authentication works

## Common Issues

### Extension won't load
- Make sure you're loading the `dist` folder, not the root
- Check browser console for errors
- Verify `manifest.json` is in `dist/`

### Icons not found
- Create icon files in `icons/` folder
- Run `npm run build` again
- Check that icons were copied to `dist/icons/`

### API Connection Errors
- Verify API URL is correct (no trailing slash)
- Check CORS settings in backend
- Verify auth token is valid
- Open DevTools (right-click extension icon → Inspect popup) to see errors

### Build Errors
- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors: `npm run type-check`
- Verify Node.js version is 18+

## File Structure

```
chrome_extension/
├── dist/              # Built extension (load this in Chrome)
├── src/
│   ├── popup/        # Main popup UI
│   ├── background/   # Service worker
│   ├── content/      # Content scripts
│   └── ...
├── icons/            # Extension icons (required)
├── manifest.json      # Extension manifest
└── popup.html        # Popup HTML entry
```

## Hot Reload (Future Enhancement)

For true hot reload during development, you could use:
- `chrome.runtime.reload()` in background script
- Browser extension development tools
- Or manually reload after each build

## Debugging

### Popup Debugging
1. Right-click extension icon
2. Select "Inspect popup"
3. DevTools opens for popup

### Background Script Debugging
1. Go to `chrome://extensions/`
2. Find your extension
3. Click "service worker" link
4. DevTools opens for background script

### Content Script Debugging
1. Open any webpage
2. Open DevTools (F12)
3. Check Console tab
4. Content script logs appear here

## Production Build

Before publishing:
1. Update version in `manifest.json`
2. Test thoroughly
3. Build: `npm run build`
4. Verify `dist/` folder contains all files
5. Test loading unpacked extension
6. Zip the `dist/` folder for Chrome Web Store

