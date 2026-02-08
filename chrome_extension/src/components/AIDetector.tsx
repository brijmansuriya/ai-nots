import { useEffect, useState, useRef } from 'react';
import SavePromptModal from './SavePromptModal';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { debug } from '../utils/debug';
import './AIDetector.css';

interface AIInput {
  element: HTMLElement;
  input: HTMLElement; // Use HTMLElement to support contenteditable
  value: string;
}

const AIDetector = () => {
  const [detectedInput, setDetectedInput] = useState<AIInput | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const checkIntervalRef = useRef<number | null>(null);

  const findAIInput = (): AIInput | null => {
    debug.info('Searching for AI input', 'AIDetector');

    // 1. ChatGPT Selectors
    const chatgptContainers = document.querySelectorAll('[class*="group/composer"][class*="w-full"]');
    for (const container of chatgptContainers) {
      const inputElement = container.querySelector('textarea') || container.querySelector('input[type="text"]');
      if (inputElement && (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT')) {
        return {

          element: container as HTMLElement,
          input: inputElement,
          value: inputElement.value || '',
        };
      }
    }

    // 2. Gemini Selectors
    const geminiInput = document.querySelector('div[contenteditable="true"][role="textbox"]') as HTMLElement;
    if (geminiInput && geminiInput.offsetParent !== null) {
      // Find a suitable container for positioning the save button
      const container = geminiInput.closest('.input-area') as HTMLElement || geminiInput.parentElement;
      if (container) {
        return {
          element: container,
          input: geminiInput,
          value: geminiInput.innerText || '',
        };
      }
    }

    // 3. Fallback: Look for any visible contenteditable or textarea
    const textareas = document.querySelectorAll('textarea');
    for (const textarea of textareas) {
      const rect = textarea.getBoundingClientRect();
      if (rect.width > 200 && rect.height > 40 && textarea.offsetParent !== null) {
        return {
          element: textarea.parentElement || textarea,
          input: textarea,
          value: textarea.value || '',
        };
      }
    }

    return null;
  };

  const updateDetectedInput = () => {
    const found = findAIInput();
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
    debug.render('AIDetector');
    debug.info('Setting up AI detector', 'AIDetector');

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
          const isInputOrTextarea = ['INPUT', 'TEXTAREA'].includes(prev.input.tagName);
          const newValue = isInputOrTextarea
            ? (prev.input as HTMLInputElement | HTMLTextAreaElement).value
            : prev.input.innerText;
          return {
            ...prev,
            value: newValue || '',
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

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiService.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
  });

  if (!detectedInput) {
    return null;
  }

  const hasValue = detectedInput.value.trim().length > 0;
  const rect = detectedInput.element.getBoundingClientRect();
  const isAuthenticated = !!user;

  return (
    <>
      {hasValue && (
        <div
          className="ai-save-button-container"
          style={{
            position: 'fixed',
            top: `${rect.top - 50}px`,
            left: `${rect.right - 120}px`,
            zIndex: 999998,
          }}
        >
          <button
            className="ai-save-button"
            onClick={handleSaveClick}
            disabled={!isAuthenticated}
            title={isAuthenticated ? "Save prompt to AI Notes" : "Login to save prompts"}
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

export default AIDetector;

