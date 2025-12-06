# AI Notes Chrome Extension

A Chrome extension for quick access to your AI Notes prompts. Built with React 19, TypeScript, Tailwind CSS, and Manifest v3.

## Features

- 🔍 Search your prompts quickly
- 📋 Copy prompts to clipboard with one click
- 💾 Offline caching with Chrome storage
- 🔄 Automatic background sync
- 🎨 Modern UI matching your main application
- ⚡ Fast and lightweight

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Mode

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

## Configuration

1. Click the extension icon
2. Click "Configure API" or the settings icon
3. Enter your API URL (e.g., `https://your-domain.com`)
4. Enter your authentication token
5. Click "Save"

## Building Icons

You'll need to create icon files in the `icons` folder:
- `icon16.png` (16x16)
- `icon32.png` (32x32)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

You can use a tool like [Favicon Generator](https://favicon.io/) to create these from a single image.

## Project Structure

```
chrome_extension/
├── src/
│   ├── popup/           # Popup UI components
│   ├── background/      # Service worker
│   ├── content/         # Content scripts
│   ├── hooks/           # React hooks
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── styles/          # Global styles
├── icons/               # Extension icons
├── manifest.json        # Extension manifest
├── popup.html          # Popup HTML
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite build config
└── tailwind.config.js  # Tailwind config
```

## API Integration

The extension integrates with your Laravel backend using:
- `/dashboard/prompts` - Fetch user prompts
- `/dashboard` - Get user information
- `/prompt/{id}/copy` - Track copy actions
- `/prompt/{id}/usage` - Track usage

Make sure your backend API supports CORS and authentication tokens.

## Caching

The extension uses Chrome storage API for caching:
- Prompts are cached for 5 minutes
- Cache is automatically invalidated on auth changes
- Background sync updates cache every 15 minutes

## License

Same as the main project.

