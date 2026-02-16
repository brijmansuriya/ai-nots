import React, { useMemo } from 'react';
import { AlertCircle, Zap, DollarSign, Info } from 'lucide-react';

interface Platform {
    id: number | string;
    name: string;
}

interface TokenCounterProps {
    text: string;
    selectedPlatformIds: (number | string)[];
    platforms: Platform[];
}

const PLATFORM_CONFIGS: Record<string, { limit: number; costPer1k: number }> = {
    'ChatGPT': { limit: 16385, costPer1k: 0.002 },
    'GPT-4 Turbo': { limit: 128000, costPer1k: 0.01 },
    'GPT-4': { limit: 8192, costPer1k: 0.03 },
    'GPT-3.5 Turbo': { limit: 16385, costPer1k: 0.002 },
    'GPT-3.5': { limit: 16385, costPer1k: 0.002 },
    'Claude 3 Opus': { limit: 200000, costPer1k: 0.015 },
    'Claude 3 Sonnet': { limit: 200000, costPer1k: 0.003 },
    'Claude 3 Haiku': { limit: 200000, costPer1k: 0.00025 },
    'Claude 2': { limit: 100000, costPer1k: 0.008 },
    'Gemini 1.5 Pro': { limit: 1000000, costPer1k: 0.0035 },
    'Gemini 1.0 Pro': { limit: 30720, costPer1k: 0.0005 },
    'Midjourney': { limit: 1000, costPer1k: 0 }, // Often based on jobs, but we'll set a low "token" limit for prompts
    'DALL·E': { limit: 1000, costPer1k: 0.02 }, // Cost per image, but we'll approximate
    'Stable Diffusion': { limit: 1000, costPer1k: 0 },
    'Bing AI': { limit: 4000, costPer1k: 0 },
};

const DEFAULT_CONFIG = { limit: 8000, costPer1k: 0.002 };

export const TokenCounter: React.FC<TokenCounterProps> = ({ text, selectedPlatformIds, platforms }) => {
    const charCount = text.length;
    const tokenCount = Math.ceil(charCount / 4); // Basic estimation

    const selectedConfigs = useMemo(() => {
        if (!selectedPlatformIds.length) return [DEFAULT_CONFIG];

        return selectedPlatformIds.map(id => {
            const platform = platforms.find(p => String(p.id) === String(id));
            if (!platform) return DEFAULT_CONFIG;

            // Try to match platform name with config
            const match = Object.keys(PLATFORM_CONFIGS).find(name =>
                platform.name.toLowerCase().includes(name.toLowerCase())
            );

            return match ? PLATFORM_CONFIGS[match] : DEFAULT_CONFIG;
        });
    }, [selectedPlatformIds, platforms]);

    // Use the most restrictive limit for the progress bar if multiple are selected
    const activeLimit = Math.min(...selectedConfigs.map(c => c.limit));
    const activeCostPer1k = Math.max(...selectedConfigs.map(c => c.costPer1k));

    const estimatedCost = (tokenCount / 1000) * activeCostPer1k;
    const progress = Math.min((tokenCount / activeLimit) * 100, 100);

    const colorClass = useMemo(() => {
        if (tokenCount > activeLimit * 0.9 || tokenCount > 4000) return 'text-red-500 bg-red-500';
        if (tokenCount > activeLimit * 0.7 || tokenCount > 2000) return 'text-yellow-500 bg-yellow-500';
        return 'text-green-500 bg-green-500';
    }, [tokenCount, activeLimit]);

    const textColorClass = colorClass.split(' ')[0];
    const bgColorClass = colorClass.split(' ')[1];

    const warnings = useMemo(() => {
        const msgs = [];
        if (tokenCount > activeLimit) {
            msgs.push(`⚠️ This prompt exceeds the recommended limit for your selected platform (${activeLimit} tokens).`);
        } else if (tokenCount > activeLimit * 0.8) {
            msgs.push(`⚠️ Approaching platform limit.`);
        }

        if (tokenCount > 4000) {
            msgs.push("💡 High token usage – consider optimizing your prompt for better performance and lower cost.");
        }

        // Check for repeated instructions (simple heuristic)
        const lines = text.split('\n');
        const uniqueLines = new Set(lines.map(l => l.trim().toLowerCase()));
        if (lines.length > 5 && uniqueLines.size < lines.length * 0.6) {
            msgs.push("💡 Try shortening repeated instructions to save tokens.");
        }

        return msgs;
    }, [tokenCount, activeLimit, text]);

    return (
        <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                    <span>{charCount.toLocaleString()} Characters</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${textColorClass.replace('text-', 'border-').replace('500', '200')} dark:${textColorClass.replace('text-', 'border-').replace('500', '800')} ${textColorClass.replace('text-', 'bg-').replace('500', '50')} dark:${textColorClass.replace('text-', 'bg-').replace('500', '950')} ${textColorClass}`}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{tokenCount.toLocaleString()} Tokens</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    <DollarSign className="w-3.5 h-3.5 text-green-500" />
                    <span>Est. Cost: ${estimatedCost.toFixed(4)}</span>
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span>Usage Intensity</span>
                    <span>{tokenCount.toLocaleString()} / {activeLimit.toLocaleString()} tokens</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${bgColorClass}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {warnings.length > 0 && (
                <div className="space-y-1">
                    {warnings.map((msg, i) => (
                        <div key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-400 italic">
                            <span>{msg}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
