import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { route } from 'ziggy-js';

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    /**
     * Button label when not yet copied.
     * @default "Copy"
     */
    label?: string;
    /**
     * Button label after a successful copy.
     * @default "Copied!"
     */
    copiedLabel?: string;
    /**
     * Visual style of the button.
     * - `primary`: filled gradient button (default)
     * - `ghost`: subtle / outline style
     */
    variant?: 'primary' | 'ghost';
    /**
     * Size of the button.
     */
    size?: 'sm' | 'md';
    /**
     * Optional prompt ID to track copy events
     */
    promptId?: number;
    /**
     * Callback when copy is successful
     */
    onCopy?: () => void;
}

export function CopyButton({
    value,
    label = 'Copy',
    copiedLabel = 'Copied!',
    variant = 'primary',
    size = 'md',
    promptId,
    onCopy,
    className,
    ...props
}: CopyButtonProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
        // Allow parent onClick handlers to run as well
        props.onClick?.(event);

        if (event.defaultPrevented) return;
        if (!value) return;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(value);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = value;
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

            // Track copy event if promptId is provided
            if (promptId) {
                try {
                    await axios.post(route('prompt.copy', promptId));
                } catch (error) {
                    // Silently fail - don't interrupt user experience
                    console.error('Failed to track copy:', error);
                }
            }

            onCopy?.();
        } catch (error) {
            console.error('Failed to copy to clipboard', error);
        }
    };

    const baseClasses =
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:ring-offset-transparent';

    const sizeClasses =
        size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2';

    const variantClasses =
        variant === 'ghost'
            ? 'bg-transparent border border-border text-foreground hover:bg-accent hover:text-accent-foreground'
            : isCopied
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:border dark:border-zinc-700';

    return (
        <button
            type="button"
            {...props}
            onClick={handleCopy}
            className={cn(baseClasses, sizeClasses, variantClasses, className)}
        >
            {isCopied ? (
                <>
                    <Check className="w-4 h-4" />
                    <span>{copiedLabel}</span>
                </>
            ) : (
                <>
                    <Copy className="w-4 h-4" />
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}


