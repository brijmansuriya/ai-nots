import React, { useState } from 'react';
import { Copy, Check, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface CopyLinkButtonProps {
    url: string;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'default' | 'lg';
    showIcon?: boolean;
}

export function CopyLinkButton({
    url,
    className,
    variant = 'outline',
    size = 'default',
    showIcon = true,
}: CopyLinkButtonProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        if (!url) return;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = url;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard', error);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant={variant}
                        size={size}
                        onClick={handleCopy}
                        className={cn(
                            'gap-2 transition-all',
                            isCopied && 'bg-green-600 hover:bg-green-700 text-white border-green-600',
                            className
                        )}
                    >
                        {isCopied ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Copied ✓</span>
                            </>
                        ) : (
                            <>
                                {showIcon && <Link2 className="w-4 h-4" />}
                                <span>Copy Link</span>
                            </>
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Copy shareable link</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
