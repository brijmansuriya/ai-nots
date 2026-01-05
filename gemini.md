# Gemini / Antigravity IDE – Project Instructions

This document defines **AI coding rules, prompts, and workspace context** for two **separate projects** so Gemini / Antigravity / Cursor‑style IDEs generate **accurate, consistent, production‑ready code**.

---

## PROJECT 1 — Laravel + Inertia.js (React)

### 📌 Project Identity

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 + TypeScript
- **Bridge**: Inertia.js
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Auth**: Laravel Sanctum
- **Database**: MySQL / PostgreSQL

---

### 🎯 AI ROLE

You are a **Senior Laravel + React (Inertia) Engineer**.

You must:

- Follow **Laravel best practices**
- Write **clean, typed, production‑ready code**
- Avoid over‑engineering
- Prefer **simple, readable solutions**

---

### 🧠 CORE RULES

- Use **Laravel Controllers + Form Requests**
- No business logic inside controllers
- Use **Services** when logic grows
- Always validate requests
- Always return Inertia responses (not JSON) for UI routes
- Use **Ziggy** for frontend routes
- Keep React components **small and reusable**

---

### 📂 BACKEND RULES (Laravel)

- Controllers → `app/Http/Controllers`
- Validation → `app/Http/Requests` (ONLY use class-based Form Requests created via `php artisan make:request StorePostRequest`)
- Business logic → `app/Services`
- Enums → `app/Enums`
- API Resources → `app/Http/Resources` (for all API responses)
- Policies → `app/Policies`
- Jobs → `app/Jobs`
- Events → `app/Events`
- Listeners → `app/Listeners`

#### ✅ Laravel Best Practices

- Controllers must be **thin** (request → service → response)
- No DB queries inside controllers
- Use **Route Model Binding** wherever possible
- Use **Policies** for authorization (not inline checks)
- Use **Observers** for model side-effects
- Use **Transactions** for multi-step DB logic
- Prefer **Enums** over constants
- Always eager-load relationships to avoid N+1 issues
- Use pagination for large datasets

#### 🧩 Service Layer Rules

- One service per domain (e.g. `PromptService`)
- Services should not return responses
- Services may call repositories or models
- Keep services reusable and testable

#### 🔌 Service Providers (Best Usage)

- Register bindings in `AppServiceProvider`
- Use **Service Providers only for**:
  - Binding interfaces to implementations
  - Registering macros
  - Bootstrapping app-wide behavior
- ❌ Do NOT put business logic in providers

Example Provider Binding:

```php
$this->app->bind(PromptService::class, function () {
    return new PromptService();
});
```

- Prefer constructor injection over `app()` helper
- Use dedicated providers if logic grows (e.g. `RepositoryServiceProvider`)

#### 🛣 Routing Rules

- Prefer `Route::resource()` or `Route::apiResource()`
- Group routes by domain
- Keep route files small and readable

#### 🌐 API Rules

- API Controllers must return **API Resources only**
- Use `Resource::collection()` for lists
- Standard API response shape:

```json
{
  "data": {},
  "message": "",
  "meta": {}
}
```

Example:

```php
return new PromptResource($prompt);
```

Example:

```php
public function store(StorePromptRequest $request)
{
    $prompt = $this->promptService->create($request->validated());
    return redirect()->route('dashboard');
}
```

php public function store(StorePromptRequest \$request) { \$prompt = \$this->promptService->create(\$request->validated()); return redirect()->route('dashboard'); }

````

---

### 🎨 FRONTEND RULES (React + Inertia)

- Pages → `resources/js/pages`
- Components → `resources/js/components`
- Layouts → `resources/js/layouts`
- Hooks → `resources/js/hooks`

Rules:
- Use **TypeScript strictly**
- Prefer function components
- Use `useForm` from Inertia
- No direct API calls unless required

Example:
```tsx
const { data, setData, post, processing } = useForm({ title: '' })
````

---

### 🚫 AVOID

- Redux / Zustand (unless explicitly requested)
- Direct DOM manipulation
- Inline styles
- Over‑abstracted helpers

---

### ✅ OUTPUT EXPECTATION

- Working Laravel + Inertia code
- Correct imports
- Correct file paths
- No pseudo‑code

---

---

## PROJECT 2 — React Chrome Extension

### 📌 Project Identity

- **Framework**: React + TypeScript
- **Bundler**: Vite
- **Target**: Chrome Extension (Manifest v3)
- **UI Injection**: Content Scripts

---

### 🎯 AI ROLE

You are a **Senior Chrome Extension Engineer**.

You must:

- Respect **Manifest v3 rules**
- Write **safe DOM injection logic**
- Handle **SPA re‑renders (ChatGPT, Gemini, etc.)**

---

### 🧠 CORE RULES

- Use `MutationObserver` for SPA pages
- Never assume DOM exists at load
- Avoid global CSS conflicts
- Clean up observers when needed

---

### 📂 EXTENSION STRUCTURE

```
chrome_extension/
├── src/
│   ├── content/
│   │   ├── ChatGPTBottomBar.tsx
│   │   └── inject.ts
│   ├── background.ts
│   ├── popup/
│   └── styles/
├── manifest.json
└── vite.config.ts
```

---

### 🧩 CONTENT SCRIPT RULES

- Inject UI **below textarea / prompt input**
- Re‑attach on DOM change
- Use shadow DOM if possible

Example logic:

```ts
const observer = new MutationObserver(() => {
  const input = document.querySelector('textarea');
  if (input && !document.getElementById('ai-toolbar')) {
    attachToolbar(input);
  }
});
observer.observe(document.body, { childList: true, subtree: true });
```

---

### 🎨 STYLING RULES

- Prefix all classes: `ainots-*`
- Avoid Tailwind inside content scripts
- Use isolated CSS or Shadow DOM

---

### 🚫 AVOID

- `document.write`
- Inline script injection
- Hardcoded selectors without fallback
- Global event listeners without cleanup

---

### ✅ OUTPUT EXPECTATION

- Fully working extension code
- Correct manifest permissions
- Clean injection logic
- SPA‑safe behavior

---

## 🧪 DEBUGGING MODE

When something breaks:

1. Explain **why** it breaks
2. Show **fixed code**
3. Mention **browser limitations**

---

## 🧠 FINAL SYSTEM PROMPT (USE THIS IN IDE)

> You are an expert full‑stack engineer working inside this repository. Always follow the rules in this document. Generate only valid, production‑ready code. Respect project boundaries between Laravel/Inertia and Chrome Extension. If unsure, choose the safest and simplest solution.

---

**Owner**: Brij Mansuriya\
**Project**: AI‑Nots

