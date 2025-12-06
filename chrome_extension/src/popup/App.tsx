import { useState, useEffect } from 'react';
import { Settings, LogOut, Loader2 } from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';
import { useAuth } from '../hooks/useAuth';
import { PromptCard } from './components/PromptCard';
import { SearchBar } from './components/SearchBar';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const { user, isAuthenticated, login, logout, loading: authLoading } = useAuth();
  const { prompts, loading, error, refresh } = usePrompts(searchQuery);

  useEffect(() => {
    // Check if user is already authenticated
    if (!authLoading && !isAuthenticated) {
      // Try to load from storage
      chrome.storage.local.get(['authToken', 'apiUrl'], (result) => {
        if (result.authToken && result.apiUrl) {
          // Token exists, verify it
          refresh();
        }
      });
    }
  }, [authLoading, isAuthenticated]); // Removed refresh from deps to avoid infinite loop

  const handleCopy = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      // Show toast notification
      chrome.runtime.sendMessage({
        type: 'SHOW_NOTIFICATION',
        message: 'Prompt copied to clipboard!'
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="w-[400px] h-[600px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-[400px] h-[600px] p-6 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">AI Notes</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Connect to your account to access your prompts
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Configure API
        </button>
        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            onSave={async (apiUrl, token) => {
              await login(apiUrl, token);
              setShowSettings(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[600px] flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold">My Prompts</h1>
            <p className="text-xs text-muted-foreground">
              {user?.name || user?.email || 'User'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-destructive mb-4">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? 'No prompts found' : 'No prompts yet'}
            </p>
            {!searchQuery && (
              <a
                href={`${user?.apiUrl || ''}/prompt/create`}
                target="_blank"
                className="text-sm text-primary hover:underline"
              >
                Create your first prompt
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

