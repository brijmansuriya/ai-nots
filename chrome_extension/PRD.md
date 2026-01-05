# AI Notes Chrome Extension - Product Requirement Document (PRD)

## 1. Product Overview
The **AI Notes Chrome Extension** is a productivity tool designed to bridge the gap between ChatGPT and the AI Notes platform. It enables users to seamlessly save their ChatGPT prompts directly to their AI Notes account without leaving the ChatGPT interface. Additionally, it offers a "bottom bar" on other websites (configurable) to provide quick access to AI tools.

## 2. Technical Stack
- **Framework**: React 18
- **Build Tool**: Vite (with `@crxjs/vite-plugin` for Chrome Extension hot-reloading)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (and potentially Tailwind if configured, currently mostly Vanilla)
- **State Management**: React Hooks (Context API likely used for Auth)
- **Authentication**: OAuth (Google) and Standard Email/Password

## 3. Key Features
1.  **Authentication**:
    - **Google OAuth**: One-click login.
    - **Email/Password**: Traditional login support.
    - **Session Sync**: Automatically detects active sessions from the web application (`http://ai-nots.test/` or production URL) to log the user in without manual credential entry.
2.  **ChatGPT Integration**:
    - **Injection**: Automatically injects a "Save Prompt" button or toolbar into the ChatGPT interface (`chatgpt.com`).
    - **Prompt Capture**: Reads the user's input from the chat box.
    - **Saving**: Sends the captured prompt to the AI Notes backend.
3.  **Extension Popup**:
    - **Dashboard**: View recent activity or status.
    - **Configuration**: Set API Base URL for development/production switching.

## 4. Project Structure
The codebase follows a modular React structure adapted for a Chrome Extension.

### Root Directory
- **`manifest.json`** (`public/manifest.json`): The entry point configuration. Defines permissions (`activeTab`, `storage`), host permissions, and content scripts.
- **`vite.config.ts`**: Configuration for Vite, handling the build process.
- **`vite.content.config.ts`**: Specific configuration for building the content script.
- **`package.json`**: Dependencies and scripts (`dev`, `build`).

### Source Directory (`src/`)
The core logic resides here.

#### `src/components/` (UI Components)
- **`AuthSetup.tsx`**: Handles the initial user onboarding and login options (OAuth/Email).
- **`ExtensionDashboard.tsx`**: The main view inside the extension popup once logged in.
- **`ChatGPTBottomBar.tsx`**: The floating bar injected into the ChatGPT interface.
- **`ChatGPTDetector.tsx`**: Logic to detect when the user is on ChatGPT and where to inject UI elements.
- **`SavePromptModal.tsx`**: A modal dialog for confirming/editing the prompt before saving.
- **`BottomBar.tsx`**: A generic bottom bar component for non-ChatGPT pages.

#### `src/services/` (Data & Networking)
- **`api.ts`**: Centralized HTTP client (likely `fetch` or `axios` wrapper) to communicate with the AI Notes backend.
- **`authService.ts`**: Manages authentication state (login, logout, token storage) and session synchronization logic.

#### `src/utils/` (Helpers)
- **`debug.ts`**: Utilities for logging and debugging in the extension environment.
- **`waitForPromptInput.ts`**: helper function to reliably detect DOM elements (like the ChatGPT textarea) which might load asynchronously.

#### `src/config/`
- **`env.ts`**: Environment configuration (API URLs, etc).

#### Entry Points
- **`content.tsx`**: The main content script that runs on web pages. It initializes the `ChatGPTDetector` and handles the injection of the React app into the DOM.
- **`main.tsx`**: The entry point for the Extension Popup (`index.html`).
- **`App.tsx`**: The root React component for the Popup.

## 5. Data Flow
1.  **Initialization**: `content.tsx` loads on pages. If it matches ChatGPT, it spins up `ChatGPTDetector`.
2.  **Interaction**: User types a prompt. The extension detects the input.
3.  **Action**: User clicks "Save".
4.  **Processing**:
    - `SavePromptModal` opens using data from the DOM.
    - User confirms.
    - `api.ts` sends a POST request to the backend.
5.  **Feedback**: User gets a success notification.

## 6. Setup & Build
- **Install**: `npm install`
- **Dev**: `npm run dev` (Hot reload)
- **Build**: `npm run build` (Outputs to `dist/`)
