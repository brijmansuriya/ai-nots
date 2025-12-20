# Debugging Chrome Extension

## How to Enable Debug Mode

### Method 1: Using Browser Console

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Run this command:
```javascript
chrome.storage.local.set({ DEBUG: true, DEBUG_LEVEL: 'all' }, () => {
  console.log('Debug mode enabled! Refresh the page.');
});
```

### Method 2: Using Extension Popup

1. Open the extension popup
2. Open DevTools (Right-click → Inspect)
3. Run the same command as above

### Method 3: Programmatically

Add this to any component:
```typescript
import { enableDebug } from './utils/debug';
enableDebug();
```

## How to View Logs

### Content Script Logs (Bottom Bar / ChatGPT Detector)

1. Go to any webpage where the extension is active
2. Open DevTools (F12)
3. Go to Console tab
4. Look for logs prefixed with:
   - `ℹ️` - Info logs
   - `⚠️` - Warnings
   - `❌` - Errors
   - `🔹` - User actions
   - `🎨` - Component renders
   - `📊` - State changes
   - `🔧` - Debug mode status

### Extension Popup Logs

1. Right-click the extension icon
2. Select "Inspect popup"
3. View logs in the Console tab

### Background Script Logs (if any)

1. Go to `chrome://extensions/`
2. Find your extension
3. Click "service worker" or "background page"
4. View logs in the console

## Common Issues and Debugging

### Bottom Bar Not Showing

**Check these logs:**
1. Look for `[ContentScript] Initializing extension...`
2. Check if container is created: `[ContentScript] Container appended to body`
3. Check if component renders: `[React] Rendering: BottomBar`
4. Check for errors: `❌ [ContentScript] Failed to...`

**Common fixes:**
- Check if `document.body` exists when script runs
- Check if container element is in DOM
- Check CSS z-index and visibility
- Check if page has conflicting styles

### Component Not Rendering

**Check these logs:**
1. `[ContentScript] Checking if ChatGPT page: ...`
2. `[ContentScript] Successfully rendered ...`
3. `[BottomBar] BottomBar component mounted`

**Common fixes:**
- Check React root creation
- Check for JavaScript errors
- Verify component imports

### Network Errors

**Check these logs:**
1. `[Network] GET/POST ... → status`
2. Look for error status codes (400, 401, 500, etc.)

**Common fixes:**
- Check API base URL
- Check CORS settings
- Check authentication

## Debug Levels

- `all` - Log everything (default when enabled)
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Info, warnings, and errors

Set level:
```javascript
chrome.storage.local.set({ DEBUG_LEVEL: 'error' });
```

## Disable Debug Mode

```javascript
chrome.storage.local.set({ DEBUG: false });
```

## Quick Debug Checklist

1. ✅ Enable debug mode
2. ✅ Refresh the page/extension
3. ✅ Open DevTools Console
4. ✅ Look for initialization logs
5. ✅ Check for error messages
6. ✅ Verify component renders
7. ✅ Check network requests
8. ✅ Verify DOM elements exist

## Example Debug Output

```
ℹ️ [2024-01-15T10:30:00.000Z] [ContentScript] Content script loaded | Data: {"readyState":"complete","url":"https://example.com"}
ℹ️ [2024-01-15T10:30:00.100Z] [ContentScript] DOM is already ready, initializing immediately
ℹ️ [2024-01-15T10:30:00.101Z] [ContentScript] Initializing extension... | Data: {"readyState":"complete","url":"https://example.com"}
ℹ️ [2024-01-15T10:30:00.102Z] [ContentScript] Creating container element
ℹ️ [2024-01-15T10:30:00.103Z] [ContentScript] Container appended to body | Data: {"containerId":"ai-notes-bottom-bar-root","bodyChildren":5}
🎨 [2024-01-15T10:30:00.104Z] [React] Rendering: BottomBar | Data: {"isChatGPT":false,"hostname":"example.com"}
ℹ️ [2024-01-15T10:30:00.105Z] [ContentScript] Successfully rendered BottomBar
ℹ️ [2024-01-15T10:30:00.200Z] [BottomBar] BottomBar component mounted | Data: {"containerExists":true,"bodyExists":true}
```


