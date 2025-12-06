# Chrome Extension Setup Checklist

## ✅ Pre-Build Checklist

- [ ] Run `npm install` (dependencies installed)
- [ ] Icons created (run `npm run create-icons` or add your own PNGs)
- [ ] Backend API endpoint `/api/user` created (see `BACKEND_SETUP.md`)
- [ ] CORS configured in Laravel backend

## 🔨 Build Steps

1. **Create Icons** (if not done):
   ```bash
   npm run create-icons
   ```
   This creates SVG placeholders. Convert to PNG for production.

2. **Build Extension**:
   ```bash
   npm run build
   ```
   This should output:
   - ✓ TypeScript compilation
   - ✓ Vite build
   - ✓ Copied manifest.json
   - ✓ Copied icons directory

3. **Verify Build Output**:
   Check that `dist/` folder contains:
   - `manifest.json`
   - `popup.html`
   - `background.js`
   - `content.js`
   - `icons/` folder with icon files
   - `assets/` folder with JS/CSS

## 🚀 Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select `chrome_extension/dist` folder
5. Extension should appear in list

## ⚙️ Configure Extension

1. Click extension icon in Chrome toolbar
2. Click **Configure API** or Settings icon
3. Enter:
   - **API URL**: `http://localhost:8000` (or your backend URL)
   - **Auth Token**: Your Laravel Sanctum token
4. Click **Save**

## 🧪 Test Extension

- [ ] Extension icon appears in toolbar
- [ ] Popup opens when clicking icon
- [ ] Settings modal works
- [ ] Can save API URL and token
- [ ] Prompts load after authentication
- [ ] Search functionality works
- [ ] Copy to clipboard works
- [ ] Background sync works (check background script console)

## 🐛 Debugging

### Check Popup Console
- Right-click extension icon → **Inspect popup**
- Check for errors in Console tab

### Check Background Script
- Go to `chrome://extensions/`
- Find your extension
- Click **service worker** link
- Check console for errors

### Check Network Requests
- In popup DevTools → Network tab
- Verify API requests are being made
- Check CORS headers
- Verify authentication headers

## 📝 Common Issues

### "Icons not found"
- Run `npm run create-icons`
- Or add PNG files manually to `icons/` folder
- Rebuild: `npm run build`

### "API not configured"
- Click Settings icon
- Enter API URL and token
- Make sure no trailing slash in URL

### "Failed to fetch user"
- Check `/api/user` endpoint exists
- Verify CORS allows Chrome extensions
- Check auth token is valid
- Verify API URL is correct

### Extension won't load
- Check `dist/manifest.json` exists
- Verify all required files in `dist/`
- Check browser console for manifest errors

## 🎯 Next Steps

After extension is working:
- [ ] Replace placeholder icons with real icons
- [ ] Test with production API
- [ ] Add more features as needed
- [ ] Prepare for Chrome Web Store (if publishing)

