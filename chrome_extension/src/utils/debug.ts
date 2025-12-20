// Debug utility for Chrome Extension
// Enable debug mode by setting DEBUG=true in chrome.storage.local

interface DebugConfig {
  enabled: boolean;
  logLevel: 'all' | 'error' | 'warn' | 'info';
}

class DebugLogger {
  private config: DebugConfig = {
    enabled: false,
    logLevel: 'all',
  };

  private initialized = false;

  async init() {
    if (this.initialized) return;

    try {
      chrome.storage.local.get(['DEBUG', 'DEBUG_LEVEL'], (result: { [key: string]: any }) => {
        this.config.enabled = result.DEBUG === true || result.DEBUG === 'true';
        this.config.logLevel = (result.DEBUG_LEVEL as DebugConfig['logLevel']) || 'all';
        this.initialized = true;

        if (this.config.enabled) {
          this.log('🔧 Debug mode enabled', 'info');
        }
      });
    } catch (error) {
      // If chrome.storage is not available (e.g., in non-extension context), enable by default
      this.config.enabled = true;
      this.config.logLevel = 'all';
      this.initialized = true;
    }
  }

  private shouldLog(level: string): boolean {
    if (!this.config.enabled) return false;

    const levels = ['error', 'warn', 'info', 'all'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(component: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${component}] ${message}${dataStr}`;
  }

  log(message: string, level: 'info' | 'warn' | 'error' = 'info', component: string = 'Extension', data?: any) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(component, message, data);

    switch (level) {
      case 'error':
        console.error('❌', formattedMessage);
        if (data) console.error('Error details:', data);
        break;
      case 'warn':
        console.warn('⚠️', formattedMessage);
        if (data) console.warn('Warning details:', data);
        break;
      case 'info':
      default:
        console.log('ℹ️', formattedMessage);
        if (data) console.log('Additional data:', data);
        break;
    }
  }

  error(message: string, component: string = 'Extension', error?: any) {
    this.log(message, 'error', component, error);
  }

  warn(message: string, component: string = 'Extension', data?: any) {
    this.log(message, 'warn', component, data);
  }

  info(message: string, component: string = 'Extension', data?: any) {
    this.log(message, 'info', component, data);
  }

  // Action logging (for user interactions)
  action(action: string, component: string = 'Extension', data?: any) {
    this.log(`🔹 Action: ${action}`, 'info', component, data);
  }

  // Network logging
  network(method: string, url: string, status?: number, data?: any) {
    const message = status
      ? `${method} ${url} → ${status}`
      : `${method} ${url}`;
    this.log(message, status && status >= 400 ? 'error' : 'info', 'Network', data);
  }

  // Render logging
  render(component: string, props?: any) {
    this.log(`🎨 Rendering: ${component}`, 'info', 'React', props);
  }

  // State logging
  state(component: string, stateName: string, value: any) {
    this.log(`📊 State: ${stateName}`, 'info', component, value);
  }
}

export const debug = new DebugLogger();

// Initialize debug on import
debug.init();

// Helper to enable debug mode
export const enableDebug = () => {
  chrome.storage.local.set({ DEBUG: true, DEBUG_LEVEL: 'all' }, () => {
    console.log('🔧 Debug mode enabled. Refresh the extension to see logs.');
  });
};

// Helper to disable debug mode
export const disableDebug = () => {
  chrome.storage.local.set({ DEBUG: false }, () => {
    console.log('🔧 Debug mode disabled.');
  });
};


