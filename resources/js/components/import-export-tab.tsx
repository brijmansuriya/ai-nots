import React, { useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { Download, Upload, FileJson, CheckCircle, AlertCircle, Loader2, FolderOpen, FileText, FileSpreadsheet, FileCode, File, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ExportFormat = 'json' | 'csv' | 'excel' | 'markdown';
type ExportScope = 'all' | 'prompts' | 'folders';
type ImportFormat = 'json' | 'csv' | 'excel';

export default function ImportExportTab() {
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
    const [exportScope, setExportScope] = useState<ExportScope>('all');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importPreview, setImportPreview] = useState<any>(null);
    const [detectedFormat, setDetectedFormat] = useState<ImportFormat | null>(null);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const getFileExtension = (format: ExportFormat): string => {
        switch (format) {
            case 'json': return 'json';
            case 'csv': return 'csv';
            case 'excel': return 'xlsx';
            case 'markdown': return 'md';
            default: return 'json';
        }
    };

    const downloadTemplate = async (format: 'json' | 'csv' | 'excel') => {
        try {
            const response = await axios.get(route('dashboard.export.template'), {
                params: { format },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = format === 'excel' ? 'xlsx' : format;
            link.setAttribute('download', `import-template.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setSuccessMessage('Template downloaded successfully!');
            setSuccessDialogOpen(true);
        } catch (error: any) {
            console.error('Template download failed:', error);
            setErrorMessage('Failed to download template. Please try again.');
            setErrorDialogOpen(true);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await axios.get(route('dashboard.export'), {
                params: {
                    format: exportFormat,
                    scope: exportScope,
                },
                responseType: 'blob',
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = getFileExtension(exportFormat);
            link.setAttribute('download', `ai-nots-export-${new Date().toISOString().split('T')[0]}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setSuccessMessage(`Your data has been exported successfully as ${exportFormat.toUpperCase()}!`);
            setSuccessDialogOpen(true);
        } catch (error: any) {
            console.error('Export failed:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to export data. Please try again.');
            setErrorDialogOpen(true);
        } finally {
            setExporting(false);
        }
    };

    const detectFileFormat = (fileName: string, content?: string): ImportFormat | null => {
        const extension = fileName.toLowerCase().split('.').pop();

        if (extension === 'xlsx' || extension === 'xls') {
            return 'excel';
        }

        if (extension === 'json' || (content && (content.trim().startsWith('{') || content.trim().startsWith('[')))) {
            return 'json';
        }

        if (extension === 'csv' || (content && content.includes(',') && content.split('\n').length > 1)) {
            // Check if it looks like CSV (has commas and multiple lines)
            const lines = content!.split('\n').filter(line => line.trim());
            if (lines.length > 0 && lines[0].includes(',')) {
                return 'csv';
            }
        }

        return null;
    };

    const parseFileContent = (content: string, format: ImportFormat): any => {
        if (format === 'json') {
            return JSON.parse(content);
        }

        if (format === 'csv') {
            // Parse CSV to JSON structure
            const lines = content.split('\n').filter(line => line.trim());
            if (lines.length === 0) throw new Error('Empty CSV file');

            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const prompts: any[] = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const prompt: any = {};

                headers.forEach((header, index) => {
                    const value = values[index] || '';
                    if (header === 'tags' || header === 'platforms' || header === 'dynamic_variables') {
                        prompt[header] = value ? value.split(';').filter(v => v.trim()) : [];
                    } else {
                        prompt[header] = value || null;
                    }
                });

                prompts.push(prompt);
            }

            return {
                version: '1.0',
                exported_at: new Date().toISOString(),
                prompts,
                folders: [], // CSV doesn't support folders
            };
        }

        throw new Error('Unsupported format');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file extension
        const extension = file.name.toLowerCase().split('.').pop();
        if (!['json', 'csv'].includes(extension || '')) {
            setErrorMessage('Please select a valid JSON or CSV file.');
            setErrorDialogOpen(true);
            return;
        }

        setImportFile(file);

        // Detect format first
        const format = detectFileFormat(file.name);

        if (!format) {
            setErrorMessage('Unsupported file format. Please use JSON, CSV, or Excel (XLSX).');
            setErrorDialogOpen(true);
            return;
        }

        setDetectedFormat(format);

        // For Excel files, we'll preview after upload (can't read binary in browser easily)
        if (format === 'excel') {
            setImportPreview({
                format: 'excel',
                filename: file.name,
                prompts: 'Will be parsed on import',
                folders: 'Will be parsed on import',
            });
            setImportFile(file);
            return;
        }

        // Preview the file for JSON/CSV
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const parsedContent = parseFileContent(content, format);
                setImportPreview(parsedContent);
                setImportFile(file);
            } catch (error: any) {
                setErrorMessage(`Invalid file format: ${error.message}`);
                setErrorDialogOpen(true);
                setImportFile(null);
                setImportPreview(null);
                setDetectedFormat(null);
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!importFile || !importPreview || !detectedFormat) {
            setErrorMessage('Please select a valid file to import.');
            setErrorDialogOpen(true);
            return;
        }

        setImporting(true);
        try {
            const formData = new FormData();
            formData.append('file', importFile);
            formData.append('format', detectedFormat);

            const response = await axios.post(route('dashboard.import'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccessMessage(
                `Import successful! ${response.data.data?.prompts_imported || 0} prompts and ${response.data.data?.folders_imported || 0} folders imported.`
            );
            setSuccessDialogOpen(true);
            setImportFile(null);
            setImportPreview(null);

            // Reset file input
            const fileInput = document.getElementById('import-file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            // Refresh the page after a short delay to show updated data
            setTimeout(() => {
                router.reload();
            }, 2000);
        } catch (error: any) {
            console.error('Import failed:', error);
            setErrorMessage(
                error.response?.data?.message || error.response?.data?.error || 'Failed to import data. Please check the file format and try again.'
            );
            setErrorDialogOpen(true);
        } finally {
            setImporting(false);
        }
    };

    const getPreviewStats = () => {
        if (!importPreview) return null;
        return {
            prompts: importPreview.prompts?.length || 0,
            folders: importPreview.folders?.length || 0,
            version: importPreview.version || 'unknown',
        };
    };

    const previewStats = getPreviewStats();

    return (
        <section className="bg-card border border-border shadow-sm rounded-xl p-6 lg:p-8 transition-colors">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Import & Export</h2>
                    <p className="text-sm text-muted-foreground">
                        Backup your prompts and folders or import them from another account
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Export Section */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/20">
                                <Download className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Export Data</h3>
                                <p className="text-sm text-muted-foreground">Download all your prompts and folders</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="export-scope" className="text-sm font-medium text-foreground mb-2 block">
                                    Export Scope
                                </Label>
                                <Select value={exportScope} onValueChange={(value) => setExportScope(value as ExportScope)}>
                                    <SelectTrigger id="export-scope" className="w-full">
                                        <SelectValue placeholder="Select export scope">
                                            {exportScope === 'all' && (
                                                <span className="flex items-center gap-2">
                                                    <Database className="w-4 h-4 flex-shrink-0" />
                                                    {/* 
                                                        FIX: Text color for 'All Data (Prompts + Folders)' 
                                                        in light mode should be 'text-foreground' with opacity (soft/lite) for readability.
                                                    */}
                                                    <span className="text-foreground/70 dark:text-foreground flex items-center">
                                                        All Data (Prompts + Folders)
                                                    </span>
                                                </span>
                                            )}
                                            {exportScope === 'prompts' && (
                                                <span className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 flex-shrink-0" />
                                                    <span className="text-foreground">Prompts Only</span>
                                                </span>
                                            )}
                                            {exportScope === 'folders' && (
                                                <span className="flex items-center gap-2">
                                                    <FolderOpen className="w-4 h-4 flex-shrink-0" />
                                                    <span className="text-foreground">Folders Only</span>
                                                </span>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            <span className="flex items-center gap-2">
                                                <Database className="w-4 h-4 flex-shrink-0" />
                                                {/* Lite text for light mode, default for dark */}
                                                <span className="text-foreground/70 dark:text-foreground">
                                                    All Data (Prompts + Folders)
                                                </span>
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="prompts">
                                            <span className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 flex-shrink-0" />
                                                <span className="text-foreground">Prompts Only</span>
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="folders">
                                            <span className="flex items-center gap-2">
                                                <FolderOpen className="w-4 h-4 flex-shrink-0" />
                                                <span className="text-foreground">Folders Only</span>
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="export-format" className="text-sm font-medium text-foreground mb-2 block">
                                    File Format
                                </Label>
                                <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                                    <SelectTrigger id="export-format" className="w-full">
                                        <SelectValue placeholder="Select file format">
                                            {exportFormat === 'json' && (
                                                <span className="flex items-center gap-2">
                                                    <FileJson className="w-4 h-4 flex-shrink-0" />
                                                    <span className="text-foreground">JSON</span>
                                                </span>
                                            )}
                                            {exportFormat === 'csv' && (
                                                <span className="flex items-center gap-2">
                                                    <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
                                                    <span className="text-foreground">CSV</span>
                                                </span>
                                            )}
                                            {exportFormat === 'excel' && (
                                                <span className="flex items-center gap-2">
                                                    <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
                                                    Excel (XLSX)
                                                </span>
                                            )}
                                            {exportFormat === 'markdown' && (
                                                <span className="flex items-center gap-2">
                                                    <FileCode className="w-4 h-4 flex-shrink-0" />
                                                    Markdown
                                                </span>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="json">
                                            <span className="flex items-center gap-2">
                                                <FileJson className="w-4 h-4 flex-shrink-0" />
                                                <span>JSON</span>
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="csv">
                                            <span className="flex items-center gap-2">
                                                <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
                                                <span>CSV</span>
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="excel">
                                            <span className="flex items-center gap-2">
                                                <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
                                                <span>Excel (XLSX)</span>
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="markdown">
                                            <span className="flex items-center gap-2">
                                                <FileCode className="w-4 h-4 flex-shrink-0" />
                                                <span>Markdown</span>
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {exportFormat === 'json' && 'Complete data structure with all relationships'}
                                    {exportFormat === 'csv' && 'Simple spreadsheet format, easy to edit'}
                                    {exportFormat === 'excel' && 'Excel workbook with multiple sheets'}
                                    {exportFormat === 'markdown' && 'Documentation format for sharing'}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleExport}
                                    disabled={exporting}
                                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                    size="lg"
                                >
                                    {exporting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Import Section */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10 border border-green-200 dark:border-green-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Import Data</h3>
                                <p className="text-sm text-muted-foreground">Restore prompts and folders from a backup</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-background/50 rounded-lg p-3 border border-border">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Need a Template?</p>
                                        <p className="text-xs text-muted-foreground">Download a sample file to get started</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadTemplate('json')}
                                        className="text-xs flex items-center gap-1.5 whitespace-nowrap"
                                    >
                                        <FileJson className="w-3.5 h-3.5 flex-shrink-0 text-foreground" />
                                        <span className="text-foreground">JSON Template</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadTemplate('csv')}
                                        className="text-xs flex items-center gap-1.5 whitespace-nowrap"
                                    >
                                        <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0 text-foreground" />
                                        <span className="text-foreground">CSV Template</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadTemplate('excel')}
                                        className="text-xs flex items-center gap-1.5 whitespace-nowrap"
                                    >
                                        <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0 text-foreground" />
                                        <span className="text-foreground">Excel Template</span>
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="import-file-input" className="text-sm font-medium text-foreground mb-2 block">
                                    Select File to Import
                                </Label>
                                <Input
                                    id="import-file-input"
                                    type="file"
                                    accept=".json,application/json,.csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,application/vnd.ms-excel"
                                    onChange={handleFileSelect}
                                    className="cursor-pointer text-foreground"
                                    disabled={importing}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Supported formats: JSON (full data), CSV (prompts only), Excel (XLSX)
                                </p>
                            </div>

                            {importPreview && previewStats && (
                                <div className="bg-background/50 rounded-lg p-4 border border-border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        <span className="text-sm font-medium text-foreground">File Preview</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <FileText className="w-4 h-4" />
                                                <span>Prompts</span>
                                            </div>
                                            <span className="font-semibold text-foreground">{previewStats.prompts}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <FolderOpen className="w-4 h-4" />
                                                <span>Folders</span>
                                            </div>
                                            <span className="font-semibold text-foreground">{previewStats.folders}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                                            <span className="text-xs text-muted-foreground">Format</span>
                                            <span className="text-xs font-mono text-foreground uppercase">{detectedFormat || 'unknown'}</span>
                                        </div>
                                        {previewStats.version && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-xs text-muted-foreground">Version</span>
                                                <span className="text-xs font-mono text-foreground">{previewStats.version}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleImport}
                                disabled={!importFile || importing}
                                className="w-full bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                                size="lg"
                            >
                                {importing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Import Data
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Information Section */}
                <div className="mt-8 p-6 bg-accent/50 border border-border rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-foreground mb-2">Format Guide</h4>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-foreground mb-1">Export Formats:</p>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                                        <li><strong>JSON:</strong> Complete data with folders, relationships (best for backups)</li>
                                        <li><strong>CSV:</strong> Simple spreadsheet format, easy to edit in Excel</li>
                                        <li><strong>Excel:</strong> Multi-sheet workbook (Prompts + Folders)</li>
                                        <li><strong>Markdown:</strong> Documentation format for sharing</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-foreground mb-1">Export Scope:</p>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                                        <li><strong>All:</strong> Export everything (prompts + folders)</li>
                                        <li><strong>Prompts:</strong> Export only prompts</li>
                                        <li><strong>Folders:</strong> Export only folder structure</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-foreground mb-1">Import Tips:</p>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                                        <li>Download a template first to see the format</li>
                                        <li>JSON supports folders, CSV/Excel are prompts only</li>
                                        <li>Tags separated by semicolon (;) in CSV/Excel</li>
                                        <li>Importing creates new items (doesn't delete existing)</li>
                                        <li>Always backup before importing</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Dialog */}
            <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            Success
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            {successMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setSuccessDialogOpen(false)}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Error Dialog */}
            <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            Error
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            {errorMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}

