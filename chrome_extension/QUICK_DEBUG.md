# Quick Debug Guide

## Enable Debug Mode (3 Methods)

### Method 1: Extension Dashboard (Easiest)
1. Open extension popup
2. If authenticated, you'll see "Debug Mode" section
3. Click the debug button to toggle ON/OFF

### Method 2: Browser Console
1. Open any webpage
2. Press F12 to open DevTools
3. Go to Console tab
4. Paste and run:
```javascript
chrome.storage.local.set({ DEBUG: true, DEBUG_LEVEL: 'all' });
location.reload();
```

### Method 3: Extension Popup Console
1. Right-click extension icon → "Inspect popup"
2. In console, run:
```javascript
chrome.storage.local.set({ DEBUG: true, DEBUG_LEVEL: 'all' });
```

## View Logs

### Bottom Bar Logs
1. Go to any website (not ChatGPT)
2. Press F12 (DevTools)
3. Console tab
4. Look for logs starting with `[ContentScript]` or `[BottomBar]`

### ChatGPT Detector Logs
1. Go to chat.openai.com
2. Press F12 (DevTools)
3. Console tab
4. Look for logs starting with `[ChatGPTDetector]`

### Extension Popup Logs
1. Right-click extension icon
2. Select "Inspect popup"
3. View Console tab

## Common Issues

### ❌ Bottom Bar Not Showing

**Check Console for:**
```
[ContentScript] Initializing extension...
[ContentScript] Container appended to body
[ContentScript] Successfully rendered BottomBar
[BottomBar] BottomBar component mounted
```

**If you see errors:**
- `document.body is null` → Page not fully loaded, wait a bit
- `Failed to render` → Check React errors
- No logs at all → Content script not running

**Quick Fix:**
1. Enable debug mode
2. Refresh the page
3. Check console for errors
4. Verify container exists: `document.getElementById('ai-notes-bottom-bar-root')`

### ❌ Component Not Rendering

**Check:**
1. Is React root created?
2. Are there JavaScript errors?
3. Is the container in DOM?

**Debug:**
```javascript
// In browser console
const container = document.getElementById('ai-notes-bottom-bar-root');
console.log('Container:', container);
console.log('Container parent:', container?.parentElement);
console.log('Container visible:', container?.offsetParent !== null);
```

### ❌ Network Errors

**Check logs for:**
```
[Network] GET http://ai-nots.test/list/categories → 401
```

**Common causes:**
- Not authenticated
- Wrong API URL
- CORS issues

## Debug Levels

- `all` - Everything (recommended for debugging)
- `error` - Only errors
- `warn` - Warnings + errors
- `info` - Info + warnings + errors

## Disable Debug

```javascript
chrome.storage.local.set({ DEBUG: false });
```

## Test Bottom Bar Visibility

Run in console:
```javascript
const container = document.getElementById('ai-notes-bottom-bar-root');
if (container) {
  console.log('✅ Container exists');
  console.log('Styles:', window.getComputedStyle(container));
  console.log('Visible:', container.offsetParent !== null);
  console.log('Z-index:', window.getComputedStyle(container).zIndex);
} else {
  console.log('❌ Container not found');
}
```


