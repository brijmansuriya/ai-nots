import React, { useState, useEffect } from 'react';
import { Search, FileText, Folder, Plus, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface CommandBarProps {
  folders?: any[];
  onNewPrompt?: () => void;
  onNewFolder?: () => void;
}

export default function CommandBar({ folders = [], onNewPrompt, onNewFolder }: CommandBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleAction = (action: string, id?: number) => {
    setOpen(false);
    setQuery('');
    
    switch (action) {
      case 'new-prompt':
        if (onNewPrompt) onNewPrompt();
        else router.visit('/prompt/create');
        break;
      case 'new-folder':
        if (onNewFolder) onNewFolder();
        break;
      case 'open-folder':
        if (id) router.visit(`/dashboard?folder=${id}`);
        break;
      case 'search':
        router.visit(`/dashboard?search=${query}`);
        break;
    }
  };

  const filteredFolders = folders.filter(folder => 
    folder.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-card border-border">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
          <Input
            placeholder="Search prompts, folders, or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-foreground placeholder:text-muted-foreground flex-1"
            autoFocus
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span>ESC</span>
          </kbd>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto p-2">
          {query.length === 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</div>
              <button
                onClick={() => handleAction('new-prompt')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent text-left transition-colors group"
              >
                <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">Create New Prompt</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Add a new prompt to your collection</div>
                </div>
              </button>
              <button
                onClick={() => handleAction('new-folder')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent text-left transition-colors group"
              >
                <Folder className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">Create New Folder</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Organize your prompts</div>
                </div>
              </button>
            </div>
          )}

          {query.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Folders</div>
              {filteredFolders.length > 0 ? (
                filteredFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleAction('open-folder', folder.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent text-left transition-colors group"
                  >
                    <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="font-medium text-foreground truncate">{folder.name}</div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">No folders found</div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

