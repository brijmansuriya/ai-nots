# Import/Export Feature - Full Implementation Plan

## Overview
This document outlines the complete implementation of the Import/Export feature for the AI Notes application, allowing users to backup and restore their prompts and folders.

## Feature Goals
- Allow users to export all their prompts, folders, tags, and relationships
- Enable users to import data from exported JSON files
- Preserve folder hierarchy and relationships during import
- Provide a user-friendly interface for import/export operations

## Implementation Summary

### 1. Frontend Components

#### Dashboard Tab Integration
- **Location**: `resources/js/pages/dashboard.tsx`
- **Changes**:
  - Added new tab type: `'import-export'`
  - Added Import/Export tab to TabsList (4 tabs total)
  - Integrated ImportExportTab component

#### Import/Export Tab Component
- **Location**: `resources/js/components/import-export-tab.tsx`
- **Features**:
  - Export section with download button
  - Import section with file upload
  - File preview showing prompts and folders count
  - Success/Error dialogs
  - Loading states for async operations
  - Responsive design with gradient cards

### 2. Backend Implementation

#### Routes
- **Location**: `routes/web.php`
- **New Routes**:
  - `GET /dashboard/export` - Export user data
  - `POST /dashboard/import` - Import user data
  - Both routes protected by `auth.user` and `verified` middleware

#### Controller Methods
- **Location**: `app/Http/Controllers/HomeController.php`
- **Methods**:

##### `export(Request $request)`
- Exports all user prompts with relationships (tags, platforms, variables, category, folder)
- Exports all user folders with hierarchy information
- Returns JSON file with structure:
  ```json
  {
    "version": "1.0",
    "exported_at": "ISO timestamp",
    "prompts": [...],
    "folders": [...]
  }
  ```
- Sets appropriate headers for file download

##### `import(Request $request)`
- Validates uploaded JSON file (max 10MB)
- Parses JSON and validates structure
- Imports folders first (to establish hierarchy)
- Imports prompts with relationships:
  - Creates/finds categories
  - Creates/finds tags
  - Links platforms
  - Creates dynamic variables
  - Assigns to folders
- Uses database transactions for data integrity
- Returns import statistics and any errors

### 3. Data Structure

#### Export Format
```json
{
  "version": "1.0",
  "exported_at": "2025-01-15T10:30:00.000Z",
  "prompts": [
    {
      "title": "Prompt Title",
      "prompt": "Prompt content",
      "description": "Optional description",
      "category_name": "Category Name",
      "folder_name": "Folder Name",
      "tags": ["tag1", "tag2"],
      "platforms": ["platform1", "platform2"],
      "dynamic_variables": ["var1", "var2"],
      "is_public": 0,
      "status": 1,
      "created_at": "2025-01-15T10:30:00.000Z"
    }
  ],
  "folders": [
    {
      "name": "Folder Name",
      "parent_name": "Parent Folder Name or null",
      "color": "#FF5733",
      "emoji": "📁",
      "position": 0
    }
  ]
}
```

### 4. Import Logic Flow

1. **File Validation**
   - Check file type (JSON)
   - Validate file size (max 10MB)
   - Parse JSON and validate structure

2. **Folder Import**
   - Separate root folders from child folders
   - Import root folders first
   - Import child folders iteratively (handles up to 10 levels deep)
   - Maintain folder name mapping for prompt assignment

3. **Prompt Import**
   - For each prompt:
     - Find or create category
     - Find or create tags (case-insensitive matching)
     - Find platforms (case-insensitive matching)
     - Assign to folder using name mapping
     - Create dynamic variables
     - Set prompt metadata (status, visibility)

4. **Error Handling**
   - Transaction rollback on critical errors
   - Collect and report individual item errors
   - Continue importing other items even if some fail

### 5. User Interface Features

#### Export Section
- Gradient card design (primary colors)
- Export button with loading state
- Information about JSON format
- Automatic file download with timestamped filename

#### Import Section
- Gradient card design (green colors)
- File input with JSON filter
- File preview showing:
  - Number of prompts
  - Number of folders
  - Format version
- Import button (disabled until file selected)
- Loading state during import

#### Information Section
- Important notes about import/export
- Warnings about data preservation
- Best practices

#### Dialogs
- Success dialog with import statistics
- Error dialog with detailed error messages

### 6. Security & Validation

#### Export Security
- User authentication required
- Only exports user's own data
- No sensitive information exposed

#### Import Security
- User authentication required
- File type validation (JSON only)
- File size limits (10MB)
- JSON structure validation
- Transaction-based import (rollback on failure)
- Prevents duplicate folder creation issues

### 7. Error Handling

#### Export Errors
- Unauthorized access handling
- Database query errors
- JSON encoding errors

#### Import Errors
- Invalid file format
- JSON parsing errors
- Missing required fields
- Database constraint violations
- Individual item import failures (collected and reported)

### 8. Testing Considerations

#### Export Testing
- Test with various folder hierarchies
- Test with prompts in different folders
- Test with prompts without folders
- Test with various tags and platforms
- Verify JSON structure

#### Import Testing
- Test with valid export files
- Test with invalid JSON
- Test with missing fields
- Test with duplicate folder names
- Test with deep folder hierarchies
- Test with large datasets

### 9. Future Enhancements

#### Potential Improvements
- Export filtering (by folder, date range, tags)
- Incremental export/import
- Export format versioning
- Import conflict resolution (merge vs replace)
- Export to other formats (CSV, Markdown)
- Cloud backup integration
- Scheduled automatic backups

### 10. File Structure

```
resources/js/
  ├── components/
  │   └── import-export-tab.tsx (NEW)
  └── pages/
      └── dashboard.tsx (MODIFIED)

app/Http/Controllers/
  └── HomeController.php (MODIFIED - added export/import methods)

routes/
  └── web.php (MODIFIED - added routes)
```

## Implementation Status

✅ **Completed**
- Dashboard tab integration
- Import/Export UI component
- Backend export functionality
- Backend import functionality
- Route definitions
- Error handling
- File validation
- Transaction support
- User feedback (dialogs, loading states)

## Usage

### Exporting Data
1. Navigate to Dashboard
2. Click on "Import/Export" tab
3. Click "Export All Data" button
4. File downloads automatically as `ai-nots-export-YYYY-MM-DD.json`

### Importing Data
1. Navigate to Dashboard
2. Click on "Import/Export" tab
3. Click "Select JSON File" and choose exported file
4. Review file preview (shows prompts and folders count)
5. Click "Import Data" button
6. Wait for import to complete
7. Page refreshes automatically to show imported data

## Notes

- Import creates new records (does not delete existing data)
- Folder hierarchy is preserved during import
- Tags and categories are matched or created automatically
- Platform matching is case-insensitive
- Import uses database transactions for data integrity
- Individual item failures don't stop the entire import process

