import React, { useMemo } from 'react';
import './TokenCounter.css';

interface Platform {
    id: number | string;
    name: string;
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

export const PLATFORM_CONFIGS: Record<string, { limit: number; costPer1k: number }> = {
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
    'Midjourney': { limit: 1000, costPer1k: 0 },
    'DALL·E': { limit: 1000, costPer1k: 0.02 },
    'Stable Diffusion': { limit: 1000, costPer1k: 0 },
    'Bing AI': { limit: 4000, costPer1k: 0 },
};

export const DEFAULT_CONFIG = { limit: 8000, costPer1k: 0.002 };

/**
 * Utility to find matching platform config based on platform name
 */
export const getPlatformMatch = (platformName: string) => {
    const match = Object.keys(PLATFORM_CONFIGS).find(name =>
        platformName.toLowerCase().includes(name.toLowerCase())
    );
    return match ? PLATFORM_CONFIGS[match] : DEFAULT_CONFIG;
};

/**
 * Utility to get active limit from a list of platforms or selection
 */
export const getActiveLimit = (platforms: Platform[], selectedPlatformIds: (number | string)[] = []) => {
    if (!selectedPlatformIds.length) {
        // Try to guess from the current URL if no selection
        const hostname = window.location.hostname.toLowerCase();
        const match = Object.keys(PLATFORM_CONFIGS).find(name =>
            hostname.includes(name.toLowerCase().replace(' ', ''))
        );
        if (match) return PLATFORM_CONFIGS[match].limit;
        return DEFAULT_CONFIG.limit;
    }

    const limits = selectedPlatformIds.map(id => {
        const platform = platforms.find(p => String(p.id) === String(id) || p.name === id);
        if (!platform) return DEFAULT_CONFIG.limit;
        return getPlatformMatch(platform.name).limit;
    });

    return Math.min(...limits);
};

export const TokenCounter: React.FC<TokenCounterProps> = ({ text, selectedPlatformIds = [], platforms = [], compact = false }) => {
    const charCount = text.length;
    const tokenCount = Math.ceil(charCount / 4);
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    const selectedConfigs = useMemo(() => {
        if (!selectedPlatformIds.length) return [DEFAULT_CONFIG];

        return selectedPlatformIds.map(id => {
            const platform = platforms.find(p => String(p.id) === String(id) || p.name === id);
            if (!platform) return DEFAULT_CONFIG;
            return getPlatformMatch(platform.name);
        });
    }, [selectedPlatformIds, platforms]);

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
