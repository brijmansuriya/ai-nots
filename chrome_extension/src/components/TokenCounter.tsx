import React, { useMemo } from 'react';
import './TokenCounter.css';

interface Platform {
    id: number | string;
    name: string;
    max_prompt_length?: number | null;
    cost?: string | number | null;
}

interface TokenCounterProps {
    text: string;
    selectedPlatformIds?: (number | string)[];
    platforms?: Platform[];
    compact?: boolean;
}

const Icons = {
    Zap: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
    ),
    AlertCircle: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    ),
    DollarSign: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    )
};

const DEFAULT_LIMIT = 8000;
const DEFAULT_COST = 0.002;

/**
 * Utility to get active limit from a list of platforms or selection
 */
export const getActiveLimit = (platforms: Platform[], selectedPlatformIds: (number | string)[] = []) => {
    if (!selectedPlatformIds.length) {
        return DEFAULT_LIMIT;
    }

    const limits = selectedPlatformIds.map(id => {
        const platform = platforms.find(p => String(p.id) === String(id) || p.name === id);
        return platform?.max_prompt_length || DEFAULT_LIMIT;
    });

    return Math.min(...limits);
};

export const TokenCounter: React.FC<TokenCounterProps> = ({ text, selectedPlatformIds = [], platforms = [], compact = false }) => {
    const charCount = text.length;
    const tokenCount = Math.ceil(charCount / 4);
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    const selectedConfigs = useMemo(() => {
        if (!selectedPlatformIds.length) return [{ limit: DEFAULT_LIMIT, costPer1k: DEFAULT_COST }];

        return selectedPlatformIds.map(id => {
            const platform = platforms.find(p => String(p.id) === String(id) || p.name === id);
            if (!platform) return { limit: DEFAULT_LIMIT, costPer1k: DEFAULT_COST };
            return {
                limit: platform.max_prompt_length || DEFAULT_LIMIT,
                costPer1k: typeof platform.cost === 'string' ? parseFloat(platform.cost) : (platform.cost || DEFAULT_COST)
            };
        });
    }, [selectedPlatformIds, platforms]);

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

    const activeLimit = Math.min(...selectedConfigs.map(c => c.limit));
    const activeCostPer1k = Math.max(...selectedConfigs.map(c => c.costPer1k));

    const estimatedCost = (tokenCount / 1000) * activeCostPer1k;
    const progress = Math.min((tokenCount / activeLimit) * 100, 100);

    const statusColor = useMemo(() => {
        if (tokenCount > activeLimit * 0.9 || tokenCount > 4000) return 'danger';
        if (tokenCount > activeLimit * 0.7 || tokenCount > 2000) return 'warning';
        return 'success';
    }, [tokenCount, activeLimit]);

    const warnings = useMemo(() => {
        const msgs = [];
        if (tokenCount > activeLimit) {
            msgs.push(`Exceeds limit (${activeLimit})`);
        } else if (tokenCount > activeLimit * 0.8) {
            msgs.push(`Approach limit`);
        }

        if (tokenCount > 4000) {
            msgs.push("High usage");
        }

        return msgs;
    }, [tokenCount, activeLimit]);

    if (compact) {
        return (
            <div className={`ainots-token-counter-compact ${statusColor}`}>
                <Icons.Zap />
                <span className="stats-text">{tokenCount.toLocaleString()} T | {wordCount.toLocaleString()} W</span>
            </div>
        );
    }

    return (
        <div className="ainots-token-counter">
            <div className="ainots-token-stats">
                <div className="ainots-stat-badge">
                    <Icons.Zap />
                    <span>{charCount.toLocaleString()} Chars</span>
                </div>
                <div className={`ainots-stat-badge ${statusColor}`}>
                    <Icons.AlertCircle />
                    <span>{tokenCount.toLocaleString()} Tokens</span>
                </div>
                <div className="ainots-stat-badge">
                    <Icons.DollarSign />
                    <span>${estimatedCost.toFixed(4)}</span>
                </div>
                {variableCount > 0 && (
                    <div className="ainots-stat-badge variables" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'rgb(99, 102, 241)' }}>
                        <Icons.AlertCircle />
                        <span>{variableCount} Variables</span>
                    </div>
                )}
            </div>

            <div className="ainots-progress-section">
                <div className="ainots-progress-labels">
                    <span>Usage</span>
                    <span>{tokenCount.toLocaleString()} / {activeLimit.toLocaleString()}</span>
                </div>
                <div className="ainots-progress-bar-bg">
                    <div
                        className={`ainots-progress-bar-fill ${statusColor}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {warnings.length > 0 && (
                <div className="ainots-token-warnings">
                    {warnings.map((msg, i) => (
                        <span key={i} className="ainots-warning-tag">{msg}</span>
                    ))}
                </div>
            )}
        </div>
    );
};
