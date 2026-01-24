// Utility to wait for ChatGPT prompt input using MutationObserver
// ChatGPT now uses contenteditable div instead of textarea
import { debug } from './debug';

export function waitForPromptInput(callback: (input: HTMLElement) => void): (() => void) | undefined {
  console.log('🔵 [waitForPromptInput] Starting to wait for ChatGPT prompt input...');

  // ChatGPT uses contenteditable div, not textarea
  const findPromptInput = (): HTMLElement | null => {
    // 1. Specific ChatGPT Selector (Contenteditable) - Most reliable
    const chatgptInput = document.querySelector('#prompt-textarea[contenteditable="true"]') as HTMLElement;
    if (chatgptInput && chatgptInput.offsetParent !== null) {
      return chatgptInput;
    }

    // 2. Primary fallback: any visible contenteditable div with role="textbox"
    const input = Array.from(document.querySelectorAll('div[contenteditable="true"][role="textbox"]'))
      .find(el => (el as HTMLElement).offsetParent !== null) as HTMLElement;
    if (input) {
      return input;
    }

    // 3. Fallback: any visible contenteditable div
    const fallback = Array.from(document.querySelectorAll('div[contenteditable="true"]'))
      .find(el => (el as HTMLElement).offsetParent !== null) as HTMLElement;
    if (fallback) {
      return fallback;
    }

    // 4. Visible Textarea fallback
    const textarea = Array.from(document.querySelectorAll('textarea'))
      .find(el => (el as HTMLElement).offsetParent !== null) as HTMLTextAreaElement;

    return textarea || null;
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

