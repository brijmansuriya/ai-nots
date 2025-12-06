// Content script for quick access to prompts on any page
// Note: This is optional and can be disabled by removing it from manifest.json

// Inject a floating button for quick access
function injectQuickAccessButton() {
  // Check if button already exists
  if (document.getElementById('ai-notes-quick-access')) {
    return;
  }

  const button = document.createElement('div');
  button.id = 'ai-notes-quick-access';
  
  const buttonElement = document.createElement('button');
  buttonElement.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #6366f1;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: transform 0.2s;
  `;
  buttonElement.textContent = '📝';
  buttonElement.title = 'AI Notes - Quick Access';
  
  buttonElement.addEventListener('mouseenter', () => {
    buttonElement.style.transform = 'scale(1.1)';
  });
  
  buttonElement.addEventListener('mouseleave', () => {
    buttonElement.style.transform = 'scale(1)';
  });
  
  buttonElement.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' }, () => {
      // Open popup programmatically
      chrome.action.openPopup();
    });
  });

  button.appendChild(buttonElement);
  document.body.appendChild(button);
}

// Only inject on certain conditions (optional - can be removed if not needed)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectQuickAccessButton);
} else {
  injectQuickAccessButton();
}

