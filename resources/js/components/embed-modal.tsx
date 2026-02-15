import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code, Sun, Moon } from 'lucide-react';

interface EmbedModalProps {
    promptId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmbedModal({ promptId, open, onOpenChange }: EmbedModalProps) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [copied, setCopied] = useState(false);

    const baseUrl = window.location.origin;
    const scriptUrl = `${baseUrl}/embed/prompt.js`;

    const embedCode = `<script src="${scriptUrl}" \n        data-id="${promptId}" \n        data-theme="${theme}"></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl bg-card border-border p-0 overflow-hidden shadow-2xl transition-colors">
                <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                    {/* Left side: Configuration and Code */}
                    <div className="flex-1 p-6 border-r border-border space-y-6 transition-colors">
                        <DialogHeader className="p-0">
                            <DialogTitle className="flex items-center gap-2 text-foreground">
                                <Code className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Embed Prompt
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Configure and copy the embed code.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">Widget Theme</span>
                                <div className="flex bg-muted rounded-lg p-1">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${theme === 'light'
                                            ? 'bg-card text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <Sun className="w-3.5 h-3.5" />
                                        Light
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${theme === 'dark'
                                            ? 'bg-card text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <Moon className="w-3.5 h-3.5" />
                                        Dark
                                    </button>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -top-2.5 left-4 px-2 bg-card text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                                    Embed Code
                                </div>
                                <pre className="bg-black p-4 pt-6 rounded-xl border border-border text-[12px] font-mono text-gray-300 overflow-x-auto leading-relaxed shadow-inner max-h-[200px] scrollbar-thin scrollbar-thumb-gray-800">
                                    {embedCode}
                                </pre>
                                <Button
                                    size="sm"
                                    className="absolute top-4 right-3 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 shadow-md"
                                    onClick={handleCopy}
                                >
                                    {copied ? (
                                        <Check className="w-3.5 h-3.5 mr-1.5" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                                    )}
                                    {copied ? 'Copied' : 'Copy'}
                                </Button>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <span>Widget only appears for public and active prompts. Private prompts will not render on external sites.</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Live Preview */}
                    <div className="flex-1 bg-background flex flex-col transition-colors">
                        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80 shadow-sm" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 shadow-sm" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80 shadow-sm" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Preview</span>
                        </div>
                        <div className="flex-1 p-4 overflow-hidden relative">
                            <iframe
                                src={`${baseUrl}/embed/prompt/${promptId}?theme=${theme}`}
                                className="w-full h-full border-0 rounded-lg shadow-sm"
                                title="Embed Preview"
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
