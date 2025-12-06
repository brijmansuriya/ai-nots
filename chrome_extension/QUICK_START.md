# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd chrome_extension
npm install
```

### Step 2: Create Icons
```bash
npm run create-icons
```

This creates SVG placeholders. **For Chrome to work properly, convert them to PNG:**
- Option A: Use online converter (https://cloudconvert.com/svg-to-png)
- Option B: Use ImageMagick: `magick icon16.svg icon16.png` (repeat for all sizes)
- Option C: Chrome will use default icon if PNGs missing (for testing only)

### Step 3: Build Extension
```bash
npm run build
```

You should see:
- ✓ TypeScript compiled
- ✓ Vite build completed
- ✓ Copied manifest.json
- ✓ Copied icons directory

### Step 4: Load in Chrome
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select `chrome_extension/dist` folder
5. Extension appears in list ✅

### Step 5: Configure
1. Click extension icon in toolbar
2. Click **Configure API** or Settings ⚙️
3. Enter:
   - **API URL**: `http://localhost:8000` (your Laravel backend)
   - **Auth Token**: Your Sanctum token
4. Click **Save**

### Step 6: Test
- Click extension icon
- Should see your prompts (if authenticated)
- Try searching
- Try copying a prompt

## 🐛 Troubleshooting

### Extension won't load
- Make sure you're loading the `dist` folder
- Check browser console for errors
- Verify `dist/manifest.json` exists

### Icons missing
- Convert SVG to PNG (see Step 2)
- Or Chrome will use default icon for testing

### API Connection fails
- Verify backend is running
- Check API URL (no trailing slash)
- Verify `/api/user` endpoint exists (see `BACKEND_SETUP.md`)
- Check CORS settings

### Build errors
- Run `npm install` again
- Check TypeScript: `npm run type-check`
- Verify Node.js 18+

## 📚 More Info

- **Full Setup**: See `SETUP.md`
- **Backend Setup**: See `BACKEND_SETUP.md`
- **Development**: See `DEV_GUIDE.md`
- **Checklist**: See `CHECKLIST.md`

## 🎯 What's Next?

After extension works:
- Replace placeholder icons with real ones
- Add more features
- Test with production API
- Prepare for Chrome Web Store (if publishing)

