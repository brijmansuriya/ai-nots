# Complete Import/Export Feature Plan

## Overview
Comprehensive import/export system with multiple file formats, export scopes, and user-friendly templates.

## Feature Set

### 1. Export Options

#### File Formats (4 types)
- **JSON** - Complete data structure with all relationships
- **CSV** - Simple spreadsheet format, easy to edit
- **Excel (XLSX)** - Multi-sheet workbook format
- **Markdown** - Documentation format for sharing

#### Export Scope (3 options)
- **All** - Export prompts + folders + relationships
- **Prompts Only** - Export only prompts data
- **Folders Only** - Export only folder structure

### 2. Import Options

#### Supported Formats
- **JSON** - Full import with folders and relationships
- **CSV** - Prompts only import
- **Excel (XLSX)** - Prompts only import (parsed as CSV)

#### Import Templates
- Downloadable templates for each format
- Pre-filled with example data
- Shows exact structure needed

### 3. User Experience Features

#### Export Section
- **Scope Selector**: Choose what to export (All/Prompts/Folders)
- **Format Selector**: Choose file format (JSON/CSV/Excel/Markdown)
- **One-Click Export**: Simple export button
- **Format Descriptions**: Clear explanation of each format

#### Import Section
- **Template Downloads**: Get sample files in any format
- **File Upload**: Drag & drop or click to select
- **Auto-Detection**: Automatically detects file format
- **Preview**: Shows file stats before import
- **Format Indicator**: Shows detected format

### 4. Data Structure

#### Simple Import Template Structure

**JSON Template:**
```json
{
  "version": "1.0",
  "exported_at": "2025-01-15T10:30:00.000Z",
  "prompts": [
    {
      "title": "Example Prompt Title",
      "prompt": "This is an example prompt with [variable] support",
      "description": "Optional description",
      "category_name": "Example Category",
      "folder_name": "Example Folder",
      "tags": ["tag1", "tag2"],
      "platforms": ["ChatGPT", "Claude"],
      "dynamic_variables": ["variable"],
      "is_public": 0,
      "status": 1
    }
  ],
  "folders": [
    {
      "name": "Example Folder",
      "parent_name": null,
      "color": "#3B82F6",
      "emoji": "📁",
      "position": 0
    }
  ]
}
```

**CSV/Excel Template:**
```
Title,Prompt,Description,Category,Folder,Tags,Platforms,Dynamic Variables,Status,Created At
Example Prompt,This is an example prompt with [variable] support,Optional description,Example Category,Example Folder,tag1;tag2,ChatGPT;Claude,variable,1,2025-01-15T10:30:00.000Z
```

### 5. Format Comparison

| Feature | JSON | CSV | Excel | Markdown |
|---------|------|-----|-------|----------|
| Prompts | ✅ | ✅ | ✅ | ✅ |
| Folders | ✅ | ❌ | ✅ | ✅ |
| Relationships | ✅ | ❌ | Partial | ✅ |
| Editable | ⚠️ | ✅ | ✅ | ⚠️ |
| Best For | Backups | Editing | Spreadsheets | Sharing |

### 6. Implementation Details

#### Backend Endpoints
- `GET /dashboard/export` - Export data
  - Parameters: `format` (json/csv/excel/markdown), `scope` (all/prompts/folders)
- `GET /dashboard/export/template` - Download template
  - Parameters: `format` (json/csv/excel)
- `POST /dashboard/import` - Import data
  - Body: `file` (multipart), `format` (optional, auto-detected)

#### Export Logic
1. **Scope Filtering**: Filter data based on scope selection
2. **Format Conversion**: Convert to selected format
3. **File Generation**: Generate file with proper headers
4. **Download**: Stream file to user

#### Import Logic
1. **File Validation**: Check file type and size
2. **Format Detection**: Auto-detect or use provided format
3. **Parsing**: Parse file based on format
4. **Data Import**: Create records with relationships
5. **Error Handling**: Collect and report errors

### 7. Best Practices for Users

#### Export Recommendations
- **For Backups**: Use JSON format with "All" scope
- **For Editing**: Use CSV or Excel format
- **For Sharing**: Use Markdown format
- **For Specific Data**: Use scope filters (Prompts/Folders only)

#### Import Recommendations
1. **Download Template First**: See the exact format needed
2. **Start Small**: Test with a few items first
3. **Backup First**: Always export before importing
4. **Check Format**: Ensure file matches template structure
5. **Review Preview**: Check preview stats before importing

### 8. Error Handling

#### Export Errors
- Unauthorized access
- Invalid format selection
- Data processing errors

#### Import Errors
- Invalid file format
- Missing required fields
- Duplicate folder names
- Invalid data types
- Individual item failures (collected and reported)

### 9. File Size Limits
- Maximum file size: 10MB
- Recommended: Keep exports under 5MB for best performance

### 10. Future Enhancements

#### Potential Additions
- **Selected Items Export**: Export only selected prompts/folders
- **Incremental Export**: Export only changes since last export
- **Cloud Integration**: Direct export to Google Drive/Dropbox
- **Scheduled Exports**: Automatic backups
- **Export Filters**: Filter by date, tags, category
- **Import Preview**: Show detailed preview before import
- **Conflict Resolution**: Handle duplicate names during import
- **Batch Operations**: Import/export multiple files

## Usage Examples

### Example 1: Full Backup
1. Select "All" scope
2. Select "JSON" format
3. Click "Export"
4. Save file securely

### Example 2: Edit in Excel
1. Select "Prompts" scope
2. Select "Excel" format
3. Click "Export"
4. Open in Excel, edit, save
5. Import back

### Example 3: Share Documentation
1. Select "All" scope
2. Select "Markdown" format
3. Click "Export"
4. Share .md file

### Example 4: Import from Template
1. Click "Excel Template" to download
2. Fill in your data following the template
3. Upload the file
4. Review preview
5. Click "Import Data"

## Technical Notes

### Excel Format
- Currently uses CSV format with .xlsx extension
- Excel will open it correctly
- For true XLSX with multiple sheets, install PhpSpreadsheet:
  ```bash
  composer require phpoffice/phpspreadsheet
  ```

### CSV Format
- Uses semicolon (;) to separate array values (tags, platforms)
- Properly escapes quotes and special characters
- UTF-8 encoded

### JSON Format
- Complete data structure
- Preserves all relationships
- Versioned format for future compatibility

## Security Considerations

- All exports are user-scoped (only user's own data)
- File size limits prevent abuse
- File type validation prevents malicious uploads
- Import validation prevents data corruption
- Transaction-based imports ensure data integrity

## Testing Checklist

- [x] Export all formats with all scopes
- [x] Import JSON files
- [x] Import CSV files
- [x] Import Excel files
- [x] Template downloads
- [x] Format auto-detection
- [x] Error handling
- [x] Large file handling
- [x] Special character handling
- [x] Relationship preservation

