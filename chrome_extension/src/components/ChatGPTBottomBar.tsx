import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { waitForPromptInput } from '../utils/waitForPromptInput';
import TemplatesPopup from './TemplatesPopup';
import './ChatGPTBottomBar.css';

// SVG Icons (Lucide style)
const Icons = {
  Sparkles: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
  ),
  LayoutTemplate: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="7" x="3" y="3" rx="1" /><rect width="9" height="7" x="3" y="14" rx="1" /><rect width="5" height="7" x="16" y="14" rx="1" /></svg>
  ),
  Users: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  ChevronRight: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
  ),
  ChevronLeft: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
  )
};

interface ToolbarUIProps {
  onInsertText: (text: string) => void;
  isVisible: boolean;
  onOpenTemplates: () => void;
}

const ToolbarUI = ({ onInsertText: _onInsertText, isVisible, onOpenTemplates }: ToolbarUIProps) => {
  const [activeTool, setActiveTool] = useState<string>('generate');
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isVisible) return null;

  const tools = [
    { id: 'generate', label: 'Generate', icon: Icons.Sparkles, action: () => console.log('Generate clicked') },
    { id: 'templates', label: 'Templates', icon: Icons.LayoutTemplate, action: onOpenTemplates },
    { id: 'personas', label: 'Personas', icon: Icons.Users, action: () => console.log('Personas clicked') },
  ];

  return (
    <div className={`ainots-bottom-bar ${isExpanded ? '' : 'collapsed'}`}>
      {isExpanded ? (
        <>
          {tools.map((tool) => {
            const isActive = activeTool === tool.id;
            const Icon = tool.icon;

            if (isActive) {
              return (
                <button
                  key={tool.id}
                  className="ainots-tool-pill"
                  onClick={() => {
                    tool.action();
                    // Keep active, maybe toggle panel?
                  }}
                >
                  <Icon />
                  <span className="ainots-pill-label">{tool.label}</span>
                </button>
              );
            }

            return (
              <button
                key={tool.id}
                className="ainots-icon-btn"
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
              >
                <Icon />
              </button>
            );
          })}

          <div className="ainots-separator" />
        </>
      ) : (
        // Collapsed state - show nothing or maybe a mini toggle? 
        // Design says "Only essential icon(s) visible". 
        // For now let's just show the expand toggle as the "essential" way back
        null
      )}

      <button
        className="ainots-icon-btn ainots-toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? "Collapse" : "Expand"}
      >
        {isExpanded ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
      </button>
    </div>
  );
};

// ... insertTextIntoChatGPT function remains the same ...
function insertTextIntoChatGPT(input: HTMLElement, text: string) {
  if (!input) return;
  input.focus();
  if (input.getAttribute('contenteditable') === 'true') {
    document.execCommand('insertText', false, text);
  } else if (input instanceof HTMLTextAreaElement) {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    input.textContent = (input.textContent || '') + text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

const ChatGPTBottomBar = () => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [promptInput, setPromptInput] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    // Load visibility
    if (chrome.runtime?.id) {
      chrome.storage.local.get(['bottomBarVisible'], (result) => {
        if (chrome.runtime.lastError) {
          console.warn('⚠️ [ChatGPTBottomBar] Storage error:', chrome.runtime.lastError);
          return;
        }
        setIsVisible(result.bottomBarVisible !== false);
      });
    }

    // Listen for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      // Double check context validity in callback
      if (!chrome.runtime?.id) return;

      if (changes.bottomBarVisible) {
        setIsVisible(changes.bottomBarVisible.newValue !== false);
      }
    };

    if (chrome.runtime?.id) {
      try {
        chrome.storage.onChanged.addListener(handleStorageChange);
      } catch (e) {
        console.warn('⚠️ [ChatGPTBottomBar] Failed to add storage listener:', e);
      }
    }

    const attachContainer = (foundInput: HTMLElement) => {
      // Check context at start of action
      if (!chrome.runtime?.id) {
        console.warn('⚠️ [ChatGPTBottomBar] Extension context invalidated, stopping attach.');
        return;
      }

      // Locate parent
      let parent: HTMLElement | null = foundInput.closest('form') as HTMLElement | null;
      if (!parent) parent = foundInput.parentElement;

      if (!parent) return;

      // Create or reuse container
      let toolbarRoot = document.getElementById('ai-nots-toolbar-portal');
      if (!toolbarRoot) {
        toolbarRoot = document.createElement('div');
        toolbarRoot.id = 'ai-nots-toolbar-portal';
        toolbarRoot.className = 'ainots-bottom-bar-root';
        parent.appendChild(toolbarRoot);
      } else if (toolbarRoot.parentElement !== parent) {
        parent.appendChild(toolbarRoot); // Re-attach if parent changed
      }

      setContainer(toolbarRoot);
      setPromptInput(foundInput);
    };

    const cleanup = waitForPromptInput(attachContainer);

    // Observer for re-attachment
    const observer = new MutationObserver(() => {
      const input = document.querySelector('div[contenteditable="true"][role="textbox"]') as HTMLElement ||
        document.querySelector('textarea') as HTMLElement;
      const root = document.getElementById('ai-nots-toolbar-portal');

      if (input && (!root || !root.isConnected)) {
        attachContainer(input);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cleanup && cleanup();
      observer.disconnect();
      if (chrome.runtime?.id) {
        try {
          chrome.storage.onChanged.removeListener(handleStorageChange);
        } catch (e) {
          // Ignore errors during cleanup of invalid context
        }
      }
    };
  }, []);

  if (!container || !promptInput) return null;

  return createPortal(
    <>
      <ToolbarUI
        isVisible={isVisible}
        onInsertText={(text) => insertTextIntoChatGPT(promptInput, text)}
        onOpenTemplates={() => setShowTemplates(true)}
      />
      {showTemplates && (
        <TemplatesPopup
          onSelect={(text) => {
            insertTextIntoChatGPT(promptInput, text);
            // Optional: Close popup after select? User didn't specify, but usually yes.
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </>,
    container
  );
};

export default ChatGPTBottomBar;
