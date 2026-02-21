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

const DEFAULT_LIMIT = 8000;
const DEFAULT_COST = 0.002;

export const TokenCounter: React.FC<TokenCounterProps> = ({ text, selectedPlatformIds, platforms }) => {
    const charCount = text.length;
    const tokenCount = Math.ceil(charCount / 4); // Basic estimation

    const selectedConfigs = useMemo(() => {
        if (!selectedPlatformIds || !selectedPlatformIds.length) {
            return [{ limit: DEFAULT_LIMIT, costPer1k: DEFAULT_COST }];
        }

        return selectedPlatformIds.map(id => {
            const platform = platforms.find(p => String(p.id) === String(id)) as any;
            if (!platform) return { limit: DEFAULT_LIMIT, costPer1k: DEFAULT_COST };

            return {
                limit: platform.max_prompt_length || DEFAULT_LIMIT,
                costPer1k: parseFloat(String(platform.cost)) || DEFAULT_COST
            };
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

    const variableCount = useMemo(() => {
        const defaultPatterns = [
            '\\{\\{([^{}]+)\\}\\}',
            '\\[([^\\[\\]]+)\\]',
            '\\{([^{}]+)\\}'
        ];
        const allVariables = new Set<string>();
        defaultPatterns.forEach(pattern => {
            const regex = new RegExp(pattern, 'g');
            const matches = [...text.matchAll(regex)];
            matches.forEach(m => {
                const val = m[1] || m[0];
                if (val) allVariables.add(val.trim());
            });
        });
        return allVariables.size;
    }, [text]);

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
                {variableCount > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Info className="w-3.5 h-3.5" />
                        <span>{variableCount} Variables</span>
                    </div>
                )}
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
