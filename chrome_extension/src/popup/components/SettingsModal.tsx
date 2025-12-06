import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SettingsModalProps {
  onClose: () => void;
  onSave: (apiUrl: string, token: string) => Promise<void>;
}

export function SettingsModal({ onClose, onSave }: SettingsModalProps) {
  const [apiUrl, setApiUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing settings
    chrome.storage.local.get(['apiUrl', 'authToken'], (result) => {
      if (result.apiUrl) setApiUrl(result.apiUrl);
      if (result.authToken) setToken(result.authToken);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(apiUrl, token);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              API URL
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://your-domain.com"
              required
              className={cn(
                "w-full px-3 py-2 bg-background border border-border rounded-lg",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your AI Notes application URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Auth Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Your authentication token"
              required
              className={cn(
                "w-full px-3 py-2 bg-background border border-border rounded-lg",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get your token from your account settings
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !apiUrl || !token}
              className={cn(
                "px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg",
                "hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

