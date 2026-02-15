// Utility to wait for AI prompt input using MutationObserver
import { debug } from './debug';
import { getPlatformConfig } from '../config/platforms';

export function waitForPromptInput(callback: (input: HTMLElement) => void): (() => void) | undefined {
  console.log('🔵 [waitForPromptInput] Starting to wait for prompt input...');

  const findPromptInput = (): HTMLElement | null => {
    const config = getPlatformConfig();

    // 1. Try Platform Specific Selector from registry
    if (config) {
      const specificInput = document.querySelector(config.selectors.input) as HTMLElement;
      if (specificInput && specificInput.offsetParent !== null) {
        return specificInput;
      }
    }

    // 2. Fallback: any visible contenteditable div with role="textbox" (covers many AIs)
    const textbox = Array.from(document.querySelectorAll('div[contenteditable="true"][role="textbox"]'))
      .find(el => (el as HTMLElement).offsetParent !== null) as HTMLElement;
    if (textbox) {
      return textbox;
    }

    // 3. Fallback: any visible contenteditable div
    const contentEditable = Array.from(document.querySelectorAll('div[contenteditable="true"]'))
      .find(el => (el as HTMLElement).offsetParent !== null) as HTMLElement;
    if (contentEditable) {
      return contentEditable;
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
    debug.info('Found prompt input immediately', 'waitForPromptInput', {
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
      debug.info('Found prompt input via MutationObserver', 'waitForPromptInput', {
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


