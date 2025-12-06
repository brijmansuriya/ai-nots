# Chrome Extension Entry Points

## 📍 Main Entry Points

The Chrome extension has **3 main entry points**:

### 1. **Popup UI** (Main User Interface)
- **Manifest Entry**: `action.default_popup: "popup.html"`
- **HTML File**: `popup.html`
- **Source Entry**: `src/popup/index.tsx`
- **Main Component**: `src/popup/App.tsx`
- **Build Output**: `dist/popup.html` + `dist/assets/popup-*.js`

**Flow**:
```
popup.html → src/popup/index.tsx → src/popup/App.tsx
```

**What it does**:
- Main UI when user clicks extension icon
- Shows prompts list, search, settings
- Handles user authentication
- Allows copying prompts to clipboard

---

### 2. **Background Service Worker**
- **Manifest Entry**: `background.service_worker: "background.js"`
- **Source Entry**: `src/background/index.ts`
- **Build Output**: `dist/background.js`

**Flow**:
```
manifest.json → background.js (from src/background/index.ts)
```

**What it does**:
- Runs in background (even when popup is closed)
- Handles periodic sync (every 15 minutes)
- Manages notifications
- Listens for messages from popup/content scripts
- Caches prompts data

---

### 3. **Content Script** (Optional)
- **Manifest Entry**: `content_scripts[0].js: ["content.js"]`
- **Source Entry**: `src/content/index.ts`
- **Build Output**: `dist/content.js`

**Flow**:
```
manifest.json → content.js (injected into web pages)
```

**What it does**:
- Injected into all web pages
- Adds floating quick-access button
- Can interact with page content
- Communicates with background script

---

## 🔄 Entry Point Flow Diagram

```
┌─────────────────────────────────────────────────┐
│           Chrome Extension                       │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. POPUP (User Interface)                      │
│     popup.html                                   │
│       ↓                                          │
│     src/popup/index.tsx                          │
│       ↓                                          │
│     src/popup/App.tsx                            │
│       ↓                                          │
│     Components (PromptCard, SearchBar, etc.)    │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  2. BACKGROUND (Service Worker)                  │
│     src/background/index.ts                      │
│       ↓                                          │
│     - Sync prompts                               │
│     - Handle notifications                       │
│     - Cache management                           │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  3. CONTENT SCRIPT (Page Injection)             │
│     src/content/index.ts                         │
│       ↓                                          │
│     - Quick access button                        │
│     - Page interaction                           │
│                                                  │
└─────────────────────────────────────────────────┘
```

## 📁 File Structure

```
chrome_extension/
├── manifest.json              # Extension configuration
│   ├── action.default_popup → popup.html
│   ├── background.service_worker → background.js
│   └── content_scripts[0].js → content.js
│
├── popup.html                 # Popup entry HTML
│   └── <script src="/src/popup/index.tsx">
│
├── src/
│   ├── popup/
│   │   ├── index.tsx          # Popup entry point
│   │   ├── App.tsx            # Main popup component
│   │   └── components/        # Popup components
│   │
│   ├── background/
│   │   └── index.ts           # Background entry point
│   │
│   └── content/
│       └── index.ts           # Content script entry point
│
└── dist/                      # Built files
    ├── popup.html
    ├── background.js
    ├── content.js
    └── assets/
        └── popup-*.js
```

## 🔧 Build Configuration

In `vite.config.ts`:

```typescript
rollupOptions: {
  input: {
    popup: resolve(__dirname, 'popup.html'),        // → dist/popup.html
    background: resolve(__dirname, 'src/background/index.ts'),  // → dist/background.js
    content: resolve(__dirname, 'src/content/index.ts')        // → dist/content.js
  }
}
```

## ✅ Verification Checklist

After building, verify these files exist in `dist/`:

- [ ] `dist/popup.html` - Popup entry point
- [ ] `dist/background.js` - Background service worker
- [ ] `dist/content.js` - Content script
- [ ] `dist/assets/popup-*.js` - Popup JavaScript bundle
- [ ] `dist/assets/*.css` - Styles
- [ ] `dist/manifest.json` - Extension manifest
- [ ] `dist/icons/*.png` - Extension icons

## 🚀 How They Work Together

1. **User clicks extension icon** → Chrome opens `popup.html`
2. **popup.html loads** → Executes `src/popup/index.tsx`
3. **React app renders** → Shows `App.tsx` component
4. **User interacts** → Components use hooks/services
5. **API calls made** → Through `src/services/api.ts`
6. **Background sync** → `background.js` runs periodically
7. **Content script** → Injected into web pages (optional)

## 📝 Notes

- **Popup**: Only runs when user opens it
- **Background**: Always running (service worker)
- **Content**: Runs on every page load (if enabled)
- All entry points can communicate via `chrome.runtime.sendMessage()`

