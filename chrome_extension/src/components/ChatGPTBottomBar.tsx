import { useEffect, useRef, useState } from 'react';
import { waitForPromptInput } from '../utils/waitForPromptInput';
import { debug } from '../utils/debug';
import './ChatGPTBottomBar.css';

// Function to insert text into ChatGPT prompt input
// ChatGPT uses contenteditable div, so we need to use execCommand
function insertTextIntoChatGPT(input: HTMLElement, text: string) {
  console.log('🔵 [ChatGPTBottomBar] Inserting text into ChatGPT:', text);

  try {
    input.focus();

    // For contenteditable divs, use execCommand (works with React)
    if (input.getAttribute('contenteditable') === 'true') {
      // Use execCommand for contenteditable elements
      const success = document.execCommand('insertText', false, text);
      if (!success) {
        // Fallback: set textContent and trigger input event
        console.warn('⚠️ [ChatGPTBottomBar] execCommand failed, using fallback');
        input.textContent = (input.textContent || '') + text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else if (input instanceof HTMLTextAreaElement) {
      // Legacy support for textarea
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // Fallback for other input types
      input.textContent = (input.textContent || '') + text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    debug.action('Inserted text into ChatGPT', 'ChatGPTBottomBar', { textLength: text.length });
  } catch (error) {
    console.error('❌ [ChatGPTBottomBar] Failed to insert text:', error);
    debug.error('Failed to insert text', 'ChatGPTBottomBar', error);
  }
}

const ChatGPTBottomBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    console.log('🔵 [ChatGPTBottomBar] Component mounted');
    debug.render('ChatGPTBottomBar');

    // Load visibility state
    chrome.storage.local.get(['bottomBarVisible'], (result: { [key: string]: any }) => {
      const visible = result.bottomBarVisible !== false; // Default to true
      setIsVisible(visible);
      console.log('🔵 [ChatGPTBottomBar] Loaded visibility state:', visible);
    });

    // Listen for visibility changes from popup
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.bottomBarVisible) {
        const visible = changes.bottomBarVisible.newValue !== false;
        setIsVisible(visible);
        console.log('🔵 [ChatGPTBottomBar] Visibility changed from storage:', visible);
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Function to attach toolbar below prompt input
    const attachToolbar = (foundInput: HTMLElement) => {
      console.log('🔵 [ChatGPTBottomBar] Attaching toolbar below prompt input', {
        tagName: foundInput.tagName,
        contenteditable: foundInput.getAttribute('contenteditable'),
      });

      // Check if toolbar already exists
      const existingToolbar = document.getElementById('ai-nots-chatgpt-toolbar');
      if (existingToolbar) {
        console.log('🔵 [ChatGPTBottomBar] Toolbar already exists, updating visibility');
        // Update visibility of existing toolbar
        chrome.storage.local.get(['bottomBarVisible'], (result: { [key: string]: any }) => {
          const visible = result.bottomBarVisible !== false;
          existingToolbar.style.display = visible ? 'flex' : 'none';
          console.log('🔵 [ChatGPTBottomBar] Updated existing toolbar visibility:', visible);
        });
        return;
      }

      // Find the parent container - ChatGPT uses form or a wrapper div
      // Use closest('form') first, then fallback to parent
      let parent: HTMLElement | null = foundInput.closest('form') as HTMLElement | null;

      if (!parent) {
        // Look for a container div
        parent = foundInput.parentElement;
        let depth = 0;
        const maxDepth = 10;

        while (parent && depth < maxDepth) {
          const rect = parent.getBoundingClientRect();
          // Look for a container with reasonable width (ChatGPT's main container)
          if (rect.width > 200) {
            break;
          }
          parent = parent.parentElement;
          depth++;
        }
      }

      // Final fallback: use immediate parent
      if (!parent) {
        parent = foundInput.parentElement;
        console.log('🔵 [ChatGPTBottomBar] Using immediate parent as fallback');
      }

      if (!parent) {
        console.warn('⚠️ [ChatGPTBottomBar] Could not find suitable parent for toolbar');
        return;
      }

      console.log('🔵 [ChatGPTBottomBar] Found parent container:', {
        tagName: parent.tagName,
        id: parent.id,
        className: parent.className?.substring(0, 50), // Limit log size
      });

      // Get current visibility state from storage
      chrome.storage.local.get(['bottomBarVisible'], (result: { [key: string]: any }) => {
        const visible = result.bottomBarVisible !== false; // Default to true
        console.log('🔵 [ChatGPTBottomBar] Creating toolbar with visibility:', visible);

        // Create toolbar
        const toolbar = document.createElement('div');
        toolbar.id = 'ai-nots-chatgpt-toolbar';
        toolbar.className = 'ai-nots-chatgpt-toolbar';
        toolbar.style.display = visible ? 'flex' : 'none';

        toolbar.innerHTML = `
          <div class="ai-nots-toolbar-content">
            <input 
              type="text" 
              class="ai-nots-toolbar-input" 
              placeholder="Ask anything…" 
              id="ai-nots-toolbar-input"
            />
            <div class="ai-nots-toolbar-buttons">
              <button class="ai-nots-toolbar-btn" id="ai-nots-generate-prompt">Generate Prompt</button>
              <button class="ai-nots-toolbar-btn" id="ai-nots-templates">Templates</button>
              <button class="ai-nots-toolbar-btn" id="ai-nots-personas">Personas</button>
            </div>
          </div>
        `;

        // Insert toolbar - append to the container (form or parent div)
        try {
          parent.appendChild(toolbar);
          console.log('🔵 [ChatGPTBottomBar] Toolbar appended to container');
        } catch (e) {
          console.error('❌ [ChatGPTBottomBar] Failed to append toolbar:', e);
          return;
        }

        toolbarRef.current = toolbar;
        setIsVisible(visible);

        // Attach event handlers
        const toolbarInput = toolbar.querySelector('#ai-nots-toolbar-input') as HTMLInputElement;
        const generateBtn = toolbar.querySelector('#ai-nots-generate-prompt') as HTMLButtonElement;
        const templatesBtn = toolbar.querySelector('#ai-nots-templates') as HTMLButtonElement;
        const personasBtn = toolbar.querySelector('#ai-nots-personas') as HTMLButtonElement;

        if (toolbarInput) {
          toolbarInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && toolbarInput.value.trim()) {
              insertTextIntoChatGPT(foundInput, toolbarInput.value);
              toolbarInput.value = '';
            }
          });
        }

        if (generateBtn) {
          generateBtn.addEventListener('click', () => {
            if (toolbarInput?.value.trim()) {
              insertTextIntoChatGPT(foundInput, toolbarInput.value);
              toolbarInput.value = '';
            }
          });
        }

        if (templatesBtn) {
          templatesBtn.addEventListener('click', () => {
            console.log('🔵 [ChatGPTBottomBar] Templates clicked');
            debug.action('Templates clicked', 'ChatGPTBottomBar');
          });
        }

        if (personasBtn) {
          personasBtn.addEventListener('click', () => {
            console.log('🔵 [ChatGPTBottomBar] Personas clicked');
            debug.action('Personas clicked', 'ChatGPTBottomBar');
          });
        }

        console.log('🔵 [ChatGPTBottomBar] Toolbar attached successfully, visible:', visible);
      });
    };

    // Wait for prompt input and attach toolbar
    const cleanup = waitForPromptInput(attachToolbar);
    cleanupRef.current = cleanup || null;

    // Watch for toolbar removal (ChatGPT re-renders)
    observerRef.current = new MutationObserver(() => {
      const toolbar = document.getElementById('ai-nots-chatgpt-toolbar');

      // Find current prompt input (contenteditable div)
      const findCurrentInput = (): HTMLElement | null => {
        return document.querySelector('div[contenteditable="true"][role="textbox"]') as HTMLElement ||
          document.querySelector('div[contenteditable="true"]') as HTMLElement ||
          document.querySelector('textarea') as HTMLElement;
      };

      const currentInput = findCurrentInput();

      if (!toolbar && currentInput) {
        console.log('🔵 [ChatGPTBottomBar] Toolbar removed, re-attaching...');
        // Re-attach toolbar
        attachToolbar(currentInput);
      } else if (toolbar && currentInput && !toolbar.isConnected) {
        // Toolbar exists but is disconnected from DOM
        console.log('🔵 [ChatGPTBottomBar] Toolbar disconnected, re-attaching...');
        attachToolbar(currentInput);
      }
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      console.log('🔵 [ChatGPTBottomBar] Cleaning up');
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Update toolbar visibility when state changes
  useEffect(() => {
    const toolbar = document.getElementById('ai-nots-chatgpt-toolbar');
    if (toolbar) {
      toolbar.style.display = isVisible ? 'flex' : 'none';
      console.log('🔵 [ChatGPTBottomBar] Toolbar visibility updated via state:', isVisible, {
        currentDisplay: toolbar.style.display,
        computedDisplay: window.getComputedStyle(toolbar).display,
      });
    } else {
      console.log('🔵 [ChatGPTBottomBar] Toolbar not found when updating visibility');
    }
  }, [isVisible]);

  // Also listen for direct storage changes and update toolbar
  useEffect(() => {
    const checkAndUpdateToolbar = () => {
      const toolbar = document.getElementById('ai-nots-chatgpt-toolbar');
      if (toolbar) {
        chrome.storage.local.get(['bottomBarVisible'], (result: { [key: string]: any }) => {
          const visible = result.bottomBarVisible !== false;
          toolbar.style.display = visible ? 'flex' : 'none';
          console.log('🔵 [ChatGPTBottomBar] Toolbar visibility synced from storage:', visible);
        });
      }
    };

    // Check periodically to ensure toolbar visibility is correct
    const interval = setInterval(checkAndUpdateToolbar, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // This component doesn't render anything - it injects DOM directly
  return null;
};

export default ChatGPTBottomBar;

