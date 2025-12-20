// Utility to wait for ChatGPT prompt input using MutationObserver
// ChatGPT now uses contenteditable div instead of textarea
import { debug } from './debug';

export function waitForPromptInput(callback: (input: HTMLElement) => void): (() => void) | undefined {
  console.log('🔵 [waitForPromptInput] Starting to wait for ChatGPT prompt input...');

  // ChatGPT uses contenteditable div, not textarea
  const findPromptInput = (): HTMLElement | null => {
    // Primary selector: contenteditable div with role="textbox"
    const input = document.querySelector('div[contenteditable="true"][role="textbox"]') as HTMLElement;
    if (input) {
      return input;
    }

    // Fallback: any contenteditable div
    const fallback = document.querySelector('div[contenteditable="true"]') as HTMLElement;
    if (fallback) {
      return fallback;
    }

    // Legacy fallback: textarea (for older ChatGPT versions or other sites)
    const textarea = document.querySelector('textarea[data-id="root"]') as HTMLTextAreaElement ||
      document.querySelector('textarea') as HTMLTextAreaElement;
    return textarea;
  };

  // Try to find immediately first
  const input = findPromptInput();

  if (input) {
    console.log('🔵 [waitForPromptInput] Found prompt input immediately', {
      tagName: input.tagName,
      contenteditable: input.getAttribute('contenteditable'),
      role: input.getAttribute('role'),
    });
    debug.info('Found ChatGPT prompt input immediately', 'waitForPromptInput', {
      tagName: input.tagName,
      contenteditable: input.getAttribute('contenteditable'),
      role: input.getAttribute('role'),
      id: input.id,
      className: input.className,
    });
    callback(input);
    return undefined;
  }

  console.log('🔵 [waitForPromptInput] Prompt input not found, setting up MutationObserver...');

  const observer = new MutationObserver(() => {
    const foundInput = findPromptInput();

    if (foundInput) {
      console.log('🔵 [waitForPromptInput] Found prompt input via MutationObserver', {
        tagName: foundInput.tagName,
        contenteditable: foundInput.getAttribute('contenteditable'),
        role: foundInput.getAttribute('role'),
      });
      debug.info('Found ChatGPT prompt input via MutationObserver', 'waitForPromptInput', {
        tagName: foundInput.tagName,
        contenteditable: foundInput.getAttribute('contenteditable'),
        role: foundInput.getAttribute('role'),
        id: foundInput.id,
        className: foundInput.className,
      });
      observer.disconnect();
      callback(foundInput);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Cleanup function
  return () => {
    observer.disconnect();
  };
}

