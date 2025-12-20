# AI Notes Chrome Extension

Chrome extension for saving ChatGPT prompts to AI Notes backend.

## Setup

### Environment Variables

1. Create a `.env` file in the `chrome_extension` directory:
```env
VITE_API_BASE_URL=http://ai-nots.test/
```

2. For production, update the URL:
```env
VITE_API_BASE_URL=https://your-production-domain.com/
```

### Development

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chrome_extension/dist` directory

## Features

- **Environment Configuration**: Default URL set to `http://ai-nots.test/` for development
- **OAuth Login**: Login with Google OAuth
- **Email/Password Login**: Traditional login form
- **Session Sync**: Automatically detects if you're logged in on the web and uses that session
- **Register**: Quick access to registration page
- **ChatGPT Integration**: Detects ChatGPT input fields and allows saving prompts

## Authentication

The extension supports multiple authentication methods:

1. **Web Session Sync**: If you're already logged in on the web app, the extension will automatically use your existing session
2. **OAuth Login**: Click "Login with Google" to open OAuth flow in a new tab
3. **Email/Password Login**: Use the login form in the extension popup
4. **Register**: Click "Register" to open registration page in a new tab

After logging in via OAuth or registration, refresh the extension popup to sync your session.

## Configuration

1. Open the extension popup
2. Set your API Base URL (default: `http://ai-nots.test/`)
3. Click "Save Configuration"
4. Login using one of the available methods
5. Start using the extension!
