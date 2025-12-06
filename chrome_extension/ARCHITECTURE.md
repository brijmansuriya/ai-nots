# Chrome Extension Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Browser                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Extension Popup (popup.html)                      │    │
│  │  ┌────────────────────────────────────────────┐  │    │
│  │  │  React App (App.tsx)                         │  │    │
│  │  │  ├── useAuth() hook                          │  │    │
│  │  │  ├── usePrompts() hook                       │  │    │
│  │  │  ├── PromptCard components                   │  │    │
│  │  │  └── SettingsModal                           │  │    │
│  │  └────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕ chrome.runtime.sendMessage       │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Background Service Worker (background.js)          │    │
│  │  ├── Periodic sync (15 min)                        │    │
│  │  ├── Notification handling                         │    │
│  │  └── Cache management                              │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕ chrome.storage                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Chrome Storage API                                │    │
│  │  ├── authToken, apiUrl                            │    │
│  │  ├── prompts_cache                                │    │
│  │  └── user data                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Content Script (content.js) - Optional            │    │
│  │  └── Quick access button on web pages             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP Requests
┌─────────────────────────────────────────────────────────────┐
│              Laravel Backend API                             │
│  ├── /api/user                                              │
│  ├── /dashboard/prompts                                     │
│  └── /prompt/{id}/copy                                      │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Component Hierarchy

### Popup UI
```
popup.html
  └── src/popup/index.tsx
      └── App.tsx
          ├── useAuth() hook
          │   └── apiService.getUser()
          ├── usePrompts() hook
          │   └── apiService.getPrompts()
          ├── SearchBar component
          ├── PromptCard components
          │   └── handleCopy()
          └── SettingsModal component
              └── login()
```

### Background Service Worker
```
background.js (src/background/index.ts)
  ├── chrome.runtime.onInstalled
  ├── chrome.runtime.onMessage
  │   ├── SHOW_NOTIFICATION
  │   └── SYNC_PROMPTS
  ├── chrome.alarms (periodic sync)
  └── syncPrompts()
      └── fetch() → Backend API
```

### Content Script
```
content.js (src/content/index.ts)
  └── injectQuickAccessButton()
      └── chrome.runtime.sendMessage()
```

## 🔄 Data Flow

### 1. Authentication Flow
```
User opens popup
  → App.tsx checks useAuth()
  → useAuth() reads chrome.storage.local
  → If no token: Show SettingsModal
  → User enters API URL + Token
  → login() saves to chrome.storage.local
  → apiService.setConfig()
  → apiService.getUser() verifies token
  → User data saved to storage
```

### 2. Prompts Loading Flow
```
App.tsx renders
  → usePrompts(searchQuery) called
  → Check chrome.storage.local cache
  → If cache valid (< 5 min): Use cache
  → Else: apiService.getPrompts()
  → Fetch from /dashboard/prompts
  → Save to cache
  → Update React state
  → Render PromptCard components
```

### 3. Copy Prompt Flow
```
User clicks copy button
  → PromptCard.handleCopy()
  → navigator.clipboard.writeText()
  → chrome.runtime.sendMessage('SHOW_NOTIFICATION')
  → Background shows notification
  → (Optional) apiService.copyPrompt() to track
```

### 4. Background Sync Flow
```
Chrome alarm fires (every 15 min)
  → background.js syncPrompts()
  → Read apiUrl + authToken from storage
  → Fetch /dashboard/prompts
  → Update prompts_cache in storage
  → Popup will use fresh cache on next open
```

## 🗂️ File Organization

```
src/
├── popup/                    # Popup UI
│   ├── index.tsx            # Entry point
│   ├── App.tsx              # Main component
│   └── components/          # UI components
│       ├── PromptCard.tsx
│       ├── SearchBar.tsx
│       └── SettingsModal.tsx
│
├── background/              # Service worker
│   └── index.ts            # Background entry
│
├── content/                # Content script
│   ├── index.ts           # Content entry
│   └── content.css        # Content styles
│
├── hooks/                  # React hooks
│   ├── useAuth.ts         # Authentication
│   └── usePrompts.ts      # Prompts data
│
├── services/               # API services
│   └── api.ts             # API client
│
├── types/                  # TypeScript types
│   └── index.ts           # Type definitions
│
├── utils/                  # Utilities
│   └── cn.ts              # Class name helper
│
└── styles/                 # Global styles
    └── globals.css        # Tailwind + custom CSS
```

## 🔌 Communication Patterns

### Popup ↔ Background
```typescript
// Popup sends message
chrome.runtime.sendMessage({
  type: 'SHOW_NOTIFICATION',
  message: 'Prompt copied!'
});

// Background receives
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    chrome.notifications.create({...});
  }
});
```

### Popup ↔ Storage
```typescript
// Read
chrome.storage.local.get(['authToken'], (result) => {
  const token = result.authToken;
});

// Write
chrome.storage.local.set({
  authToken: '...',
  apiUrl: '...'
});
```

### Popup ↔ Backend API
```typescript
// Via apiService
const prompts = await apiService.getPrompts(searchQuery);
```

## 🎯 Key Design Decisions

1. **React 19**: Modern React with hooks
2. **TypeScript**: Type safety throughout
3. **Tailwind CSS**: Consistent styling
4. **Chrome Storage**: Offline caching
5. **Service Worker**: Background sync
6. **Modular Architecture**: Separated concerns

## 📊 State Management

- **React State**: Component-level state (useState)
- **Chrome Storage**: Persistent data (auth, cache)
- **API Service**: Centralized API calls
- **Hooks**: Reusable logic (useAuth, usePrompts)

## 🔐 Security Considerations

- Auth tokens stored in chrome.storage.local (encrypted by Chrome)
- API requests use HTTPS in production
- CORS configured on backend
- No sensitive data in content scripts

