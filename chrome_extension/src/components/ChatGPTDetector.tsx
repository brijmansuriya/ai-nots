import { useEffect, useState, useRef } from 'react';
import SavePromptModal from './SavePromptModal';
import { debug } from '../utils/debug';
import './ChatGPTDetector.css';

interface ChatGPTInput {
  element: HTMLElement;
  input: HTMLInputElement | HTMLTextAreaElement;
  value: string;
}

const ChatGPTDetector = () => {
  const [detectedInput, setDetectedInput] = useState<ChatGPTInput | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const checkIntervalRef = useRef<number | null>(null);

  const findChatGPTInput = (): ChatGPTInput | null => {
    debug.info('Searching for ChatGPT input', 'ChatGPTDetector');
    // Look for elements with class containing "group/composer" and "w-full"
    // ChatGPT uses Tailwind classes, so we need to check for the combination
    const containers = document.querySelectorAll('[class*="group/composer"][class*="w-full"]');
    debug.info(`Found ${containers.length} containers with group/composer class`, 'ChatGPTDetector');

    for (const container of containers) {
      // Look for textarea or input within the container
      const textarea = container.querySelector('textarea');
      const input = container.querySelector('input[type="text"]');

      const inputElement = textarea || input;
      if (inputElement && (inputElement instanceof HTMLTextAreaElement || inputElement instanceof HTMLInputElement)) {
        return {
          element: container as HTMLElement,
          input: inputElement,
          value: inputElement.value || '',
        };
      }
    }

    // Fallback: Look for any textarea in the main content area
    // ChatGPT's main input is usually a textarea
    const textareas = document.querySelectorAll('textarea');
    for (const textarea of textareas) {
      // Check if it's likely the main input (has reasonable size and is visible)
      const rect = textarea.getBoundingClientRect();
      if (rect.width > 200 && rect.height > 40 && textarea.offsetParent !== null) {
        // Check if it's in a composer-like container
        let parent = textarea.parentElement;
        let depth = 0;
        while (parent && depth < 5) {
          const classList = Array.from(parent.classList);
          if (classList.some(cls => cls.includes('composer') || cls.includes('group'))) {
            return {
              element: parent,
              input: textarea,
              value: textarea.value || '',
            };
          }
          parent = parent.parentElement;
          depth++;
        }
      }
    }

    return null;
  };

  const updateDetectedInput = () => {
    const found = findChatGPTInput();
    if (found) {
      setDetectedInput((prev) => {
        // Only update if the element or value changed
        if (!prev || prev.input !== found.input || prev.value !== found.value) {
          return found;
        }
        return prev;
      });
    } else {
      setDetectedInput(null);
    }
  };

  useEffect(() => {
    debug.render('ChatGPTDetector');
    debug.info('Setting up ChatGPT detector', 'ChatGPTDetector');

    // Initial check
    updateDetectedInput();

    // Set up MutationObserver to watch for DOM changes
    observerRef.current = new MutationObserver(() => {
      if (!chrome.runtime?.id) {
        // Context invalidated, silence observer
        observerRef.current?.disconnect();
        return;
      }
      debug.info('DOM mutation detected, checking for input', 'ChatGPTDetector');
      updateDetectedInput();
    });

    // Observe the entire document for changes
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also check periodically in case MutationObserver misses something
    checkIntervalRef.current = window.setInterval(() => {
      if (!chrome.runtime?.id) {
        // Context invalidated, clear interval
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        return;
      }
      updateDetectedInput();
    }, 1000);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // Update value when input changes
  useEffect(() => {
    if (!detectedInput?.input) return;

    const handleInput = () => {
      setDetectedInput((prev) => {
        if (prev && prev.input === detectedInput.input) {
          return {
            ...prev,
            value: prev.input.value || '',
          };
        }
        return prev;
      });
    };

    const inputElement = detectedInput.input;
    inputElement.addEventListener('input', handleInput);
    inputElement.addEventListener('change', handleInput);

    return () => {
      inputElement.removeEventListener('input', handleInput);
      inputElement.removeEventListener('change', handleInput);
    };
  }, [detectedInput?.input]);

  const handleSaveClick = () => {
    if (detectedInput && detectedInput.value.trim()) {
      setShowSaveModal(true);
    }
  };

  const handleSaveSuccess = () => {
    setShowSaveModal(false);
    // Optionally show a success notification
  };

  const handleSaveCancel = () => {
    setShowSaveModal(false);
  };

  if (!detectedInput) {
    return null;
  }

  const hasValue = detectedInput.value.trim().length > 0;
  const rect = detectedInput.element.getBoundingClientRect();

  return (
    <>
      {hasValue && (
        <div
          className="chatgpt-save-button-container"
          style={{
            position: 'fixed',
            top: `${rect.top - 50}px`,
            left: `${rect.right - 120}px`,
            zIndex: 999998,
          }}
        >
          <button
            className="chatgpt-save-button"
            onClick={handleSaveClick}
            title="Save prompt to AI Notes"
          >
            💾 Save Prompt
          </button>
        </div>
      )}
      {showSaveModal && detectedInput && (
        <SavePromptModal
          promptText={detectedInput.value}
          onSuccess={handleSaveSuccess}
          onCancel={handleSaveCancel}
        />
      )}
    </>
  );
};

export default ChatGPTDetector;

