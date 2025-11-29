import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export function CopyButton({
    value,
    label = 'Copy',
    copiedLabel = 'Copied!',
    variant = 'primary',
    size = 'md',
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
            ? 'bg-transparent border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            : isCopied
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                : 'bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 text-white dark:text-gray-900 hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5';

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


