import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { waitForPromptInput } from '../utils/waitForPromptInput';
import { apiService } from '../services/api';
import TemplatesPopup from './TemplatesPopup';
import { useTheme } from '../context/ThemeContext';
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
  ),
  ChevronDown: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
  ),
  FileText: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
  ),
  MagicWand: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" /><path d="M17.8 11.8 19 13" /><path d="M15 9h0" /><path d="M17.8 6.2 19 5" /><path d="m3 21 9-9" /><path d="M12.2 6.2 11 5" /></svg>
  ),
  Trash2: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
  ),
  MessageSquare: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  ),
  Plus: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  ),
  MessageCircle: () => (
    <svg className="ainots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
  )
};

interface ToolbarUIProps {
  onInsertText: (text: string) => void;
  isVisible: boolean;
  onOpenTemplates: () => void;
  user: any;
  onLogout: () => void;
  onClear: () => void;
  onFeedback: () => void;
}

const ToolbarUI = ({ onInsertText: _onInsertText, isVisible, onOpenTemplates, user, onLogout, onClear, onFeedback }: ToolbarUIProps) => {
  const [activeTool, setActiveTool] = useState<string>('generate');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Apply hidden class based on visibility settings
  const isHidden = !isVisible;

  const tools = [
    { id: 'templates', label: 'Templates', icon: Icons.FileText, action: onOpenTemplates },
    { id: 'feedback', label: 'Feedback', icon: Icons.MessageCircle, action: onFeedback },
    { id: 'clear', label: 'Clear', icon: Icons.Trash2, action: onClear },
  ];

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 1);
  };

  return (
    <div className={`ainots-bottom-bar ${isExpanded ? '' : 'collapsed'} ${isHidden ? 'hidden' : ''}`}>
      <div className="ainots-left-section">
        {isExpanded ? (
          <>
            {tools.map((tool) => {
              const isActive = activeTool === tool.id;
              const Icon = tool.icon;

              return (
                <button
                  key={tool.id}
                  className={`ainots-toolbar-button ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTool(tool.id);
                    tool.action();
                  }}
                  title={isActive ? '' : tool.label}
                >
                  <Icon />
                  <span className="ainots-button-label">{tool.label}</span>
                </button>
              );
            })}

            <div className="ainots-separator" />
          </>
        ) : null}

        <button
          className="ainots-icon-btn ainots-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
        </button>
      </div>

      <div className="ainots-right-section">
        {user ? (
          <div className="ainots-user-section">
            <div
              className="ainots-user-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="ainots-user-avatar" title={user.name}>
                {user.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt={user.name} />
                ) : (
                  <span>{getInitials(user.name)}</span>
                )}
              </div>
              <Icons.ChevronDown />
            </div>
            {showUserMenu && (
              <div className="ainots-user-menu">
                <div className="ainots-user-menu-header">
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                </div>
                <div className="ainots-user-menu-divider" />
                <button className="ainots-user-menu-item" onClick={onLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="ainots-login-btn"
            onClick={() => window.open(apiService.getLoginUrl(), '_blank')}
            title="Login to AI Notes"
          >
            <Icons.Users />
            <span>Login</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ... insertTextIntoChatGPT function remains the same ...
function insertTextIntoChatGPT(input: HTMLElement | null, text: string) {
  // Always attempt to find the latest VISIBLE input if current is stale
  const currentInput = (input && input.isConnected && (input as HTMLElement).offsetParent !== null) ? input : (
    document.querySelector('#prompt-textarea[contenteditable="true"]') as HTMLElement ||
    Array.from(document.querySelectorAll('div[contenteditable="true"][role="textbox"]'))
      .find(el => (el as HTMLElement).offsetParent !== null) as HTMLElement ||
    Array.from(document.querySelectorAll('textarea'))
      .find(el => (el as HTMLElement).offsetParent !== null) as HTMLElement
  );

  if (!currentInput) {
    console.error('❌ [ChatGPTBottomBar] Could not find any valid prompt input.');
    return;
  }

  console.log('Inserting text into:', currentInput);

  // Robust focus
  currentInput.focus();

  try {
    const isContentEditable = currentInput.getAttribute('contenteditable') === 'true';

    if (isContentEditable) {
      // Clear current content first to "set" the value
      document.execCommand('selectAll', false);
      document.execCommand('delete', false);

      // Insert new text
      const success = document.execCommand('insertText', false, text);

      if (!success) {
        console.warn('⚠️ [ChatGPTBottomBar] execCommand failed, falling back to innerText.');
        currentInput.innerText = text;
      }
    } else if (currentInput instanceof HTMLTextAreaElement || 'value' in currentInput) {
      (currentInput as any).value = text;
    }

    // Always trigger input event to notify React/ProseMirror
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    currentInput.dispatchEvent(inputEvent);

    // Some sites need a 'change' event too
    const changeEvent = new Event('change', { bubbles: true });
    currentInput.dispatchEvent(changeEvent);

  } catch (err) {
    console.error('❌ [ChatGPTBottomBar] Insertion error:', err);
    // Absolute final fallback
    if (currentInput.getAttribute('contenteditable') === 'true') {
      currentInput.innerText = text;
    } else if ('value' in currentInput) {
      (currentInput as any).value = text;
    }
    currentInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

const FeedbackModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await apiService.sendFeedback({
        type,
        message,
        metadata: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ainots-modal-overlay feedback-modal-overlay" onClick={onClose}>
      <div className="ainots-modal-content feedback-modal" onClick={e => e.stopPropagation()}>
        <div className="ainots-modal-header">
          <h3>Submit Feedback</h3>
          <button className="ainots-modal-close" onClick={onClose}>×</button>
        </div>
        <form className="ainots-form" onSubmit={handleSubmit}>
          {error && <div className="ainots-form-error">{error}</div>}
          <div className="ainots-form-field">
            <label>Feedback Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="general">General Feedback</option>
              <option value="bug">Report a Bug</option>
              <option value="feature">Feature Request</option>
              <option value="improvement">UI/UX Improvement</option>
            </select>
          </div>
          <div className="ainots-form-field">
            <label>Message</label>
            <textarea
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell us what you think or report an issue..."
              rows={4}
            />
          </div>
          <div className="ainots-modal-footer">
            <button type="button" className="ainots-btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="ainots-btn primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function clearChatGPTInput(input: HTMLElement | null) {
  const currentInput = (input && input.isConnected && (input as HTMLElement).offsetParent !== null) ? input : (
    document.querySelector('#prompt-textarea[contenteditable="true"]') as HTMLElement ||
    Array.from(document.querySelectorAll('div[contenteditable="true"][role="textbox"]'))
      .find(el => (el as HTMLElement).offsetParent !== null) as HTMLElement ||
    Array.from(document.querySelectorAll('textarea'))
      .find(el => (el as HTMLElement).offsetParent !== null) as HTMLElement
  );

  if (!currentInput) return;

  currentInput.focus();

  try {
    const isContentEditable = currentInput.getAttribute('contenteditable') === 'true';

    if (isContentEditable) {
      document.execCommand('selectAll', false);
      document.execCommand('delete', false);
    } else if (currentInput instanceof HTMLTextAreaElement || 'value' in currentInput) {
      (currentInput as any).value = '';
    }

    currentInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    currentInput.dispatchEvent(new Event('change', { bubbles: true }));
  } catch (err) {
    console.error('❌ [ChatGPTBottomBar] Clear error:', err);
    if (currentInput.getAttribute('contenteditable') === 'true') {
      currentInput.innerText = '';
    } else if ('value' in currentInput) {
      (currentInput as any).value = '';
    }
    currentInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

const ChatGPTBottomBar = () => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [user, setUser] = useState<any>(null);
  const inputRef = useRef<HTMLElement | null>(null);

  const fetchUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.warn('Failed to fetch user in bottom bar');
    }
  };

  useEffect(() => {
    fetchUser();

    // 2. Load Visibility from Storage
    if (chrome.runtime?.id) {
      chrome.storage.local.get(['bottomBarVisible'], (result) => {
        if (chrome.runtime.lastError) return;
        setIsVisible(result.bottomBarVisible !== false);
      });
    }

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (!chrome.runtime?.id) return;
      if (changes.bottomBarVisible) setIsVisible(changes.bottomBarVisible.newValue !== false);
      if (changes.api_token) {
        if (changes.api_token.newValue) {
          fetchUser();
        } else {
          setUser(null);
        }
      }
    };

    const handleMessage = (message: any) => {
      if (!chrome.runtime?.id) return;
      if (message.type === 'AUTH_SUCCESS' || message.type === 'AUTH_LOGOUT') fetchUser();
    };

    if (chrome.runtime?.id) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      chrome.runtime.onMessage.addListener(handleMessage);
    }

    const attachContainer = (foundInput: HTMLElement) => {
      if (!chrome.runtime?.id) return;

      let parent: HTMLElement | null = foundInput.closest('form') as HTMLElement | null;
      if (!parent) parent = foundInput.parentElement;
      if (!parent) return;

      let toolbarRoot = document.getElementById('ai-nots-toolbar-portal');
      if (!toolbarRoot) {
        toolbarRoot = document.createElement('div');
        toolbarRoot.id = 'ai-nots-toolbar-portal';
        toolbarRoot.className = 'ainots-bottom-bar-root';
        parent.appendChild(toolbarRoot);
      } else if (toolbarRoot.parentElement !== parent) {
        parent.appendChild(toolbarRoot);
      }

      setContainer(toolbarRoot);
      inputRef.current = foundInput;

      return () => { };
    };

    fetchUser();
    let inputCleanup = waitForPromptInput(attachContainer);

    const observer = new MutationObserver(() => {
      // Use more robust detection for SPA navigations and Custom GPTs
      const currentInput = document.querySelector('#prompt-textarea[contenteditable="true"]') as HTMLElement ||
        document.querySelector('div[contenteditable="true"][role="textbox"]') as HTMLElement ||
        document.querySelector('textarea#prompt-textarea') as HTMLElement ||
        document.querySelector('textarea') as HTMLElement;

      if (currentInput && inputRef.current !== currentInput) {
        inputCleanup = attachContainer(currentInput);
      }

      const root = document.getElementById('ai-nots-toolbar-portal');
      if (currentInput && (!root || !root.isConnected)) {
        attachContainer(currentInput);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      inputCleanup && inputCleanup();
      if (chrome.runtime?.id) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
        chrome.runtime.onMessage.removeListener(handleMessage);
      }
    };
  }, []);

  if (!container) return null;

  return (
    <>
      {createPortal(
        <div className={`ainots-theme-provider ${theme}`}>
          <ToolbarUI
            isVisible={isVisible}
            onInsertText={(text) => insertTextIntoChatGPT(inputRef.current, text)}
            onOpenTemplates={() => setShowTemplates(true)}
            user={user}
            onLogout={async () => {
              await apiService.logout();
              setUser(null);
            }}
            onClear={() => clearChatGPTInput(inputRef.current)}
            onFeedback={() => setShowFeedback(true)}
          />
        </div>,
        container
      )}
      {showTemplates && createPortal(
        <div className={`ainots-theme-provider ${theme}`}>
          <TemplatesPopup
            onSelect={(text) => {
              insertTextIntoChatGPT(inputRef.current, text);
              setShowTemplates(false);
            }}
            onClose={() => setShowTemplates(false)}
          />
        </div>,
        document.body
      )}
      {showFeedback && createPortal(
        <div className={`ainots-theme-provider ${theme}`}>
          <FeedbackModal
            onClose={() => setShowFeedback(false)}
            onSuccess={() => {
              setShowFeedback(false);
              alert('Thank you for your feedback!');
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
};

export default ChatGPTBottomBar;
