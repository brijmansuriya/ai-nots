# AI Nots - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [Frontend Architecture](#frontend-architecture)
8. [Backend Architecture](#backend-architecture)
9. [Installation & Setup](#installation--setup)
10. [Development Guide](#development-guide)
11. [Deployment](#deployment)

---

## 🎯 Project Overview

**AI Nots** is a comprehensive AI prompt management platform that allows users to create, organize, share, and manage AI prompts efficiently. The application provides a modern, user-friendly interface for storing prompts with advanced features like folder organization, tagging, version control, and import/export capabilities.

### Key Highlights
- **Modern Stack**: Built with Laravel 12 and React 19
- **Full-Stack Framework**: Inertia.js for seamless SPA experience
- **Type-Safe**: TypeScript throughout the frontend
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Full dark mode support
- **Real-time Features**: Live search, metrics tracking, and more

---

## 🛠 Technologies Used

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **PHP** | ^8.2 | Server-side language |
| **Laravel** | ^12.0 | PHP framework |
| **Laravel Sanctum** | ^4.0 | API authentication |
| **Laravel Socialite** | ^5.19 | Social authentication |
| **Inertia.js Laravel** | ^2.0 | Full-stack framework |
| **Spatie Media Library** | ^11.17 | Media management |
| **Intervention Image** | ^3.2 | Image processing |
| **Ziggy** | ^2.4 | Route helper for JavaScript |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^19.0.0 | UI library |
| **TypeScript** | ^5.7.2 | Type safety |
| **Inertia.js React** | ^2.0.0 | Full-stack framework |
| **Tailwind CSS** | ^4.0.0 | Utility-first CSS |
| **Vite** | ^6.0 | Build tool |
| **Radix UI** | Various | Accessible UI components |
| **Lucide React** | ^0.475.0 | Icon library |
| **React Select** | ^5.10.1 | Select component |
| **NProgress** | ^0.2.0 | Progress indicators |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Pest PHP** | Testing framework |
| **Laravel Pint** | Code style fixer |
| **ESLint** | JavaScript linting |
| **Prettier** | Code formatting |
| **TypeScript** | Type checking |

---

## 📁 Project Structure

```
ai-nots/
├── app/                          # Laravel application core
│   ├── Enums/                    # PHP Enumerations
│   │   └── PromptStatus.php      # Prompt status enum
│   ├── Http/
│   │   ├── Controllers/          # Application controllers
│   │   │   ├── Admin/            # Admin panel controllers
│   │   │   │   ├── Auth/         # Admin authentication
│   │   │   │   ├── CategorieController.php
│   │   │   │   ├── HomeController.php
│   │   │   │   ├── PlatformController.php
│   │   │   │   ├── Settings/     # Admin settings
│   │   │   │   └── TagController.php
│   │   │   ├── Api/              # API controllers
│   │   │   ├── Auth/             # User authentication
│   │   │   ├── AboutController.php
│   │   │   ├── FolderController.php
│   │   │   ├── HomeController.php
│   │   │   ├── PromptController.php
│   │   │   └── PromptMetricsController.php
│   │   ├── Middleware/           # Custom middleware
│   │   │   ├── AuthAdmin.php
│   │   │   ├── AuthUser.php
│   │   │   ├── GuestAdmin.php
│   │   │   ├── GuestUser.php
│   │   │   ├── HandleAppearance.php
│   │   │   └── HandleInertiaRequests.php
│   │   └── Requests/             # Form request validation
│   ├── Models/                   # Eloquent models
│   │   ├── Admin.php
│   │   ├── Category.php
│   │   ├── Folder.php
│   │   ├── Platform.php
│   │   ├── PromptNote.php
│   │   ├── PromptNoteVariable.php
│   │   ├── PromptUsageHistory.php
│   │   ├── PromptVersion.php
│   │   ├── PromptView.php
│   │   ├── Tag.php
│   │   └── User.php
│   ├── Providers/
│   │   └── AppServiceProvider.php
│   └── Services/
│       └── ImageService.php      # Image processing service
│
├── bootstrap/                    # Application bootstrap
│   ├── app.php
│   └── providers.php
│
├── config/                       # Configuration files
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   ├── inertia.php
│   └── ...
│
├── database/
│   ├── factories/                # Model factories
│   ├── migrations/               # Database migrations
│   └── seeders/                 # Database seeders
│
├── public/                       # Public assets
│   ├── build/                   # Compiled assets
│   ├── index.php
│   └── storage/                 # Public storage symlink
│
├── resources/
│   ├── css/                     # Stylesheets
│   │   └── app.css
│   ├── js/                      # JavaScript/TypeScript source
│   │   ├── app.tsx              # Application entry point
│   │   ├── components/          # React components
│   │   │   ├── ui/             # Reusable UI components
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── command-bar.tsx
│   │   │   ├── folder-dialog.tsx
│   │   │   ├── folder-tree.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── import-export-tab.tsx
│   │   │   ├── note-card.tsx
│   │   │   └── ...
│   │   ├── contexts/           # React contexts
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Layout components
│   │   │   ├── admin-layout.tsx
│   │   │   ├── app-layout.tsx
│   │   │   ├── auth-layout.tsx
│   │   │   ├── web-layout.tsx
│   │   │   └── ...
│   │   ├── pages/              # Inertia page components
│   │   │   ├── about.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── features.tsx
│   │   │   ├── home.tsx
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── auth/           # Authentication pages
│   │   │   └── settings/       # Settings pages
│   │   ├── types/              # TypeScript type definitions
│   │   └── lib/                # Utility functions
│   └── views/
│       └── app.blade.php       # Main Inertia template
│
├── routes/                      # Route definitions
│   ├── admin.php               # Admin routes
│   ├── api.php                 # API routes
│   ├── auth.php                # Authentication routes
│   ├── settings.php            # Settings routes
│   └── web.php                 # Web routes
│
├── storage/                     # Storage directory
│   ├── app/                    # Application storage
│   ├── framework/              # Framework files
│   └── logs/                   # Log files
│
├── tests/                       # Test files
│   ├── Feature/                # Feature tests
│   └── Unit/                   # Unit tests
│
├── vendor/                      # Composer dependencies
│
├── .env                        # Environment configuration
├── composer.json               # PHP dependencies
├── package.json                # Node.js dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── tailwind.config.js          # Tailwind CSS configuration
```

---

## ✨ Features

### 1. Prompt Management

#### Create & Edit Prompts
- **Rich Text Editor**: Create prompts with formatted text
- **Dynamic Variables**: Support for `[variable]` placeholders
- **Metadata**: Title, description, category, tags, platforms
- **Version Control**: Automatic version history tracking
- **Version Comparison**: Compare different versions side-by-side
- **Restore Versions**: Restore any previous version
- **Soft Delete**: Archive prompts without permanent deletion

#### Prompt Details
- **Public/Private**: Control prompt visibility
- **Status Management**: Active, draft, archived states
- **Media Support**: Attach images and files
- **Copy to Clipboard**: One-click copy functionality
- **Share Options**: Share prompts via social media

### 2. Folder Organization

#### Hierarchical Structure
- **Nested Folders**: Unlimited folder depth
- **Color Coding**: Custom colors for visual organization
- **Emoji Support**: Add emojis to folder names
- **Drag & Drop**: Reorder folders and prompts
- **Position Control**: Manual position ordering
- **Parent-Child Relationships**: Maintain folder hierarchy

#### Folder Management
- **Create/Edit/Delete**: Full CRUD operations
- **Move Prompts**: Drag prompts between folders
- **Filter by Folder**: Quick filtering in dashboard
- **Folder Tree**: Visual tree structure
- **Soft Delete**: Restore deleted folders

### 3. Tags & Categories

#### Tagging System
- **Multiple Tags**: Assign multiple tags per prompt
- **Tag Management**: Create, edit, delete tags
- **Tag Search**: Filter prompts by tags
- **Case-Insensitive**: Smart tag matching
- **Auto-Complete**: Tag suggestions while typing

#### Categories
- **Category Assignment**: Organize prompts by category
- **Category Management**: Admin-managed categories
- **Category Filtering**: Filter by category in search

### 4. Platform Support

#### Platform Integration
- **Multiple Platforms**: Support for ChatGPT, Claude, etc.
- **Platform Tags**: Tag prompts for specific platforms
- **Platform Filtering**: Filter by platform
- **Platform Management**: Admin-managed platforms

### 5. Import & Export

#### Export Features
- **Multiple Formats**: JSON, CSV, Excel (XLSX), Markdown
- **Export Scopes**: All data, Prompts only, Folders only
- **Template Downloads**: Download sample templates
- **Preserve Structure**: Maintain folder hierarchy
- **Relationships**: Export tags, categories, platforms

#### Import Features
- **Format Support**: JSON, CSV, Excel
- **Auto-Detection**: Automatic format detection
- **File Preview**: Preview before import
- **Bulk Import**: Import multiple prompts at once
- **Error Handling**: Detailed error messages
- **Transaction Safety**: Rollback on errors

### 6. Search & Filtering

#### Advanced Search
- **Full-Text Search**: Search across title, content, tags
- **Real-Time Results**: Instant search results
- **Debounced Input**: Optimized search performance
- **Search History**: Recent searches

#### Filtering Options
- **By Folder**: Filter prompts by folder
- **By Category**: Filter by category
- **By Platform**: Filter by platform
- **By Tags**: Filter by tags
- **By Status**: Active, draft, archived
- **By Visibility**: Public, private

#### Sorting
- **By Date**: Latest, oldest
- **By Popularity**: Most viewed, most copied
- **By Name**: Alphabetical
- **By Usage**: Most used

### 7. Like & Save System

#### Engagement Features
- **Like Prompts**: Like community prompts
- **Save Prompts**: Save favorites to collection
- **View Saved**: Access saved prompts page
- **View Liked**: See all liked prompts
- **Engagement Metrics**: Track likes and saves

### 8. Statistics & Analytics

#### Metrics Tracking
- **View Count**: Track prompt views
- **Copy Count**: Track prompt copies
- **Usage History**: Detailed usage logs
- **Popular Prompts**: Most viewed/copied prompts
- **User Statistics**: Personal usage stats
- **Analytics Dashboard**: Visual statistics

### 9. User Profile & Settings

#### Profile Management
- **Profile Information**: Name, email, bio
- **Avatar Upload**: Profile picture support
- **Password Change**: Secure password updates
- **Email Verification**: Email verification system

#### Appearance Settings
- **Theme Toggle**: Light/Dark mode
- **System Preference**: Auto-detect system theme
- **Persistent Theme**: Theme saved per user

### 10. Admin Panel

#### Admin Features
- **Tag Management**: CRUD operations for tags
- **Category Management**: Manage categories
- **Platform Management**: Manage platforms
- **User Management**: View and manage users
- **Content Moderation**: Approve/reject prompts

### 11. Authentication & Authorization

#### Authentication
- **Email/Password**: Traditional authentication
- **Social Login**: OAuth integration (via Socialite)
- **Email Verification**: Verify email addresses
- **Password Reset**: Forgot password flow
- **Remember Me**: Persistent sessions

#### Authorization
- **Role-Based**: User and Admin roles
- **Middleware Protection**: Route protection
- **Ownership Checks**: Users can only edit own prompts
- **Public/Private**: Visibility controls

---

## 🗄 Database Schema

### Core Tables

#### `users`
- `id` (bigint, primary key)
- `name` (string)
- `email` (string, unique)
- `email_verified_at` (timestamp, nullable)
- `password` (string)
- `bio` (text, nullable)
- `remember_token` (string, nullable)
- `created_at`, `updated_at` (timestamps)

#### `prompt_notes`
- `id` (bigint, primary key)
- `promptable_id` (bigint) - Polymorphic user ID
- `promptable_type` (string) - Polymorphic type
- `title` (string)
- `prompt` (text)
- `description` (text, nullable)
- `category_id` (bigint, foreign key, nullable)
- `folder_id` (bigint, foreign key, nullable)
- `is_public` (boolean, default: false)
- `status` (enum: active, draft, archived)
- `copy_count` (integer, default: 0)
- `view_count` (integer, default: 0)
- `deleted_at` (timestamp, nullable) - Soft deletes
- `created_at`, `updated_at` (timestamps)

#### `folders`
- `id` (bigint, primary key)
- `user_id` (bigint, foreign key)
- `name` (string)
- `parent_id` (bigint, foreign key, nullable)
- `color` (string, nullable)
- `emoji` (string, nullable)
- `position` (integer, default: 0)
- `deleted_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

#### `tags`
- `id` (bigint, primary key)
- `name` (string, unique)
- `created_at`, `updated_at` (timestamps)

#### `categories`
- `id` (bigint, primary key)
- `name` (string, unique)
- `created_at`, `updated_at` (timestamps)

#### `platforms`
- `id` (bigint, primary key)
- `name` (string, unique)
- `created_at`, `updated_at` (timestamps)

### Relationship Tables

#### `prompt_note_tag` (Pivot)
- `prompt_note_id` (bigint, foreign key)
- `tag_id` (bigint, foreign key)

#### `prompt_note_platform` (Pivot)
- `prompt_note_id` (bigint, foreign key)
- `platform_id` (bigint, foreign key)

#### `prompt_note_variables`
- `id` (bigint, primary key)
- `prompt_note_id` (bigint, foreign key)
- `variable_name` (string)
- `created_at`, `updated_at` (timestamps)

### Metrics Tables

#### `prompt_saves`
- `id` (bigint, primary key)
- `user_id` (bigint, foreign key)
- `prompt_note_id` (bigint, foreign key)
- `created_at`, `updated_at` (timestamps)

#### `prompt_likes`
- `id` (bigint, primary key)
- `user_id` (bigint, foreign key)
- `prompt_note_id` (bigint, foreign key)
- `created_at`, `updated_at` (timestamps)

#### `prompt_views`
- `id` (bigint, primary key)
- `prompt_note_id` (bigint, foreign key)
- `user_id` (bigint, foreign key, nullable)
- `ip_address` (string, nullable)
- `created_at`, `updated_at` (timestamps)

#### `prompt_usage_history`
- `id` (bigint, primary key)
- `prompt_note_id` (bigint, foreign key)
- `user_id` (bigint, foreign key, nullable)
- `action` (string) - copy, view, etc.
- `created_at`, `updated_at` (timestamps)

### Version Control

#### `prompt_versions`
- `id` (bigint, primary key)
- `prompt_note_id` (bigint, foreign key)
- `title` (string)
- `prompt` (text)
- `description` (text, nullable)
- `version_number` (integer)
- `created_at`, `updated_at` (timestamps)

### Media

#### `media` (Spatie Media Library)
- `id` (bigint, primary key)
- `model_type` (string)
- `model_id` (bigint)
- `uuid` (string, unique)
- `collection_name` (string)
- `name` (string)
- `file_name` (string)
- `mime_type` (string)
- `disk` (string)
- `conversions_disk` (string)
- `size` (bigint)
- `manipulations` (json)
- `custom_properties` (json)
- `responsive_images` (json)
- `order_column` (integer)
- `created_at`, `updated_at` (timestamps)

---

## 🛣 API Routes

### Public Routes

```
GET  /                          - Home page
GET  /home                      - Home data (API)
GET  /about                     - About page
GET  /features                  - Features page
GET  /prompt/create             - Create prompt page
GET  /prompt/show/{id}          - View prompt details
POST /prompt/{id}/copy          - Track copy action
POST /prompt/{id}/usage         - Track usage
GET  /list/tags                 - Get all tags
GET  /list/platform             - Get all platforms
GET  /list/categories           - Get all categories
GET  /list/meta/all             - Get all metadata
```

### Authenticated User Routes

```
GET  /dashboard                 - User dashboard
GET  /dashboard/prompts         - Get user prompts (API)
GET  /dashboard/export           - Export user data
GET  /dashboard/export/template  - Download export template
POST /dashboard/import          - Import user data
GET  /saved                      - Saved prompts page
GET  /saved/prompts             - Get saved prompts (API)

# Prompt Management
GET    /prompt/{id}/edit         - Edit prompt page
PUT    /prompt/{id}              - Update prompt
DELETE /prompt/{id}              - Delete prompt
POST   /prompt/{id}/save         - Save prompt
DELETE /prompt/{id}/save         - Unsave prompt
POST   /prompt/{id}/like         - Like prompt
DELETE /prompt/{id}/like         - Unlike prompt

# Version Control
GET    /prompt/{id}/versions              - Version history page
GET    /prompt/{id}/versions/api          - Get versions (API)
POST   /prompt/{id}/versions/{v}/restore - Restore version
DELETE /prompt/{id}/versions/{v}          - Delete version
GET    /prompt/{id}/versions/{v1}/compare/{v2} - Compare versions

# Folder Management
GET    /api/folders              - List folders
GET    /api/folders/tree         - Get folder tree
POST   /api/folders              - Create folder
GET    /api/folders/{id}         - Get folder
PUT    /api/folders/{id}         - Update folder
DELETE /api/folders/{id}         - Delete folder
POST   /api/folders/{id}/restore - Restore folder
POST   /api/folders/reorder      - Reorder folders
POST   /api/prompts/{id}/move    - Move prompt to folder
```

### Admin Routes

```
GET  /admin                      - Admin dashboard
GET  /admin/tags                 - Tags management
POST /admin/tags                 - Create tag
PUT  /admin/tags/{id}            - Update tag
DELETE /admin/tags/{id}          - Delete tag

GET  /admin/categories           - Categories management
POST /admin/categories           - Create category
PUT  /admin/categories/{id}      - Update category
DELETE /admin/categories/{id}    - Delete category

GET  /admin/platforms            - Platforms management
POST /admin/platforms            - Create platform
PUT  /admin/platforms/{id}       - Update platform
DELETE /admin/platforms/{id}     - Delete platform
```

---

## 🎨 Frontend Architecture

### Component Structure

#### Layout Components
- **WebLayout**: Main web layout with header/footer
- **AppLayout**: Authenticated app layout with sidebar
- **AdminLayout**: Admin panel layout
- **AuthLayout**: Authentication pages layout

#### Page Components
- **Home**: Public prompt discovery page
- **Dashboard**: User dashboard with tabs
- **Features**: Features showcase page
- **About**: About page
- **Prompt Details**: Individual prompt view
- **Add/Edit Prompt**: Prompt creation/editing

#### Reusable Components

**UI Components** (`components/ui/`)
- Button, Input, Select, Textarea
- Card, Dialog, Alert, Badge
- Tabs, Dropdown, Tooltip
- Sidebar, Navigation components
- Form components

**Feature Components**
- **NoteCard**: Prompt card display
- **FolderTree**: Hierarchical folder display
- **FolderDialog**: Folder creation/editing
- **ImportExportTab**: Import/export interface
- **CommandBar**: Command palette
- **VersionHistory**: Version management UI
- **VersionComparison**: Side-by-side comparison

### State Management

- **Inertia.js**: Server-driven state
- **React Hooks**: Local component state
- **Context API**: Theme management
- **Form State**: Inertia useForm hook

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Dark Mode**: System preference + manual toggle
- **Responsive Design**: Mobile-first approach
- **Custom Components**: Radix UI primitives

---

## ⚙️ Backend Architecture

### MVC Pattern

- **Models**: Eloquent ORM models
- **Controllers**: Request handling and business logic
- **Views**: Inertia.js page components
- **Middleware**: Request filtering and authentication

### Key Services

- **ImageService**: Image processing and optimization
- **Media Library**: File upload and management

### Authentication

- **Laravel Sanctum**: API token authentication
- **Session-Based**: Web authentication
- **Socialite**: OAuth providers

### Database

- **MySQL/PostgreSQL**: Primary database
- **Eloquent ORM**: Database abstraction
- **Migrations**: Version control for schema
- **Seeders**: Database seeding

---

## 🚀 Installation & Setup

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL/PostgreSQL
- Git

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd ai-nots
```

### Step 2: Install PHP Dependencies

```bash
composer install
```

### Step 3: Install Node Dependencies

```bash
npm install
```

### Step 4: Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_nots
DB_USERNAME=root
DB_PASSWORD=
```

### Step 5: Database Setup

```bash
php artisan migrate
php artisan db:seed
```

### Step 6: Storage Link

```bash
php artisan storage:link
```

### Step 7: Build Assets

```bash
npm run build
```

### Step 8: Start Development Server

```bash
# Option 1: Separate commands
php artisan serve
npm run dev

# Option 2: Combined (using composer script)
composer run dev
```

---

## 💻 Development Guide

### Code Style

- **PHP**: Laravel Pint (PSR-12)
- **JavaScript/TypeScript**: ESLint + Prettier
- **Formatting**: Run `composer run format` and `npm run format`

### Testing

```bash
# Run tests
php artisan test

# Run with coverage
php artisan test --coverage
```

### Database Migrations

```bash
# Create migration
php artisan make:migration create_example_table

# Run migrations
php artisan migrate

# Rollback
php artisan migrate:rollback
```

### Creating Components

```bash
# Create Inertia page
php artisan inertia:page Example

# Create controller
php artisan make:controller ExampleController
```

### Asset Compilation

```bash
# Development (watch mode)
npm run dev

# Production build
npm run build

# SSR build
npm run build:ssr
```

---

## 📦 Deployment

### Production Build

```bash
# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Environment Variables

Ensure production `.env` has:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL` set correctly
- Database credentials
- Mail configuration

### Server Requirements

- PHP 8.2+
- MySQL 8.0+ or PostgreSQL 13+
- Node.js 18+ (for build only)
- Web server (Nginx/Apache)
- SSL certificate (recommended)

---

## 📝 Additional Notes

### File Uploads

- Media files stored in `storage/app/public`
- Use `php artisan storage:link` to create symlink
- Max file size configurable in PHP settings

### Caching

- Configuration cache: `php artisan config:cache`
- Route cache: `php artisan route:cache`
- View cache: `php artisan view:cache`

### Queue Jobs

- Configure queue driver in `.env`
- Run queue worker: `php artisan queue:work`

### Email Configuration

- Configure mail settings in `.env`
- Use queue for email sending in production

---

## 🔗 Useful Links

- **Laravel Documentation**: https://laravel.com/docs
- **Inertia.js Documentation**: https://inertiajs.com
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **TypeScript**: https://www.typescriptlang.org

---

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).

---

**Last Updated**: January 2025
**Version**: 1.0.0

