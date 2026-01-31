import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { debug, enableDebug, disableDebug } from '../utils/debug';
import { ThemeToggle } from './ThemeToggle';
import './ExtensionDashboard.css';

interface UserInfo {
  name: string;
  email: string;
}

const ExtensionDashboard = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPrompts: 0,
    savedPrompts: 0,
    categories: 0,
  });

  const [debugEnabled, setDebugEnabled] = useState(false);
  const [bottomBarVisible, setBottomBarVisible] = useState(true);

  useEffect(() => {
    debug.render('ExtensionDashboard');
    console.log('🔵 [ExtensionDashboard] Component mounted');
    loadUserInfo();
    loadStats();

    if (!chrome.runtime?.id) return;

    // Check debug status
    chrome.storage.local.get(['DEBUG'], (result: { [key: string]: any }) => {
      if (chrome.runtime.lastError) return;
      setDebugEnabled(result.DEBUG === true || result.DEBUG === 'true');
      console.log('🔵 [ExtensionDashboard] Debug status:', result.DEBUG);
    });

    // Load bottom bar visibility state
    chrome.storage.local.get(['bottomBarVisible'], (result: { [key: string]: any }) => {
      if (chrome.runtime.lastError) return;
      const visible = result.bottomBarVisible !== false; // Default to true
      setBottomBarVisible(visible);
      console.log('🔵 [ExtensionDashboard] Bottom bar visibility loaded:', visible);
    });
  }, []);

  const loadUserInfo = async () => {
    try {
      console.log('🔵 [ExtensionDashboard] Loading user info...');
      const { authService } = await import('../services/authService');
      const user = await authService.getUser();

      if (user) {
        console.log('🔵 [ExtensionDashboard] User info loaded from storage:', { name: user.name, email: user.email });
        setUserInfo({
          name: user.name,
          email: user.email,
        });
      } else {
        console.log('🔵 [ExtensionDashboard] No user in storage, fetching from API...');
        // Try to get from API
        const meResponse = await authService.getMe();
        if (meResponse.user) {
          console.log('🔵 [ExtensionDashboard] User info loaded from API:', { name: meResponse.user.name, email: meResponse.user.email });
          setUserInfo({
            name: meResponse.user.name,
            email: meResponse.user.email,
          });
        }
      }
    } catch (error) {
      console.error('❌ [ExtensionDashboard] Failed to load user info:', error);
      debug.error('Failed to load user info', 'ExtensionDashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('🔵 [ExtensionDashboard] Loading stats...');
      await apiService.initialize();
      const categories = await apiService.getCategories();
      console.log('🔵 [ExtensionDashboard] Stats loaded:', { categories: categories.length });
      setStats({
        totalPrompts: 0, // Would need API endpoint for this
        savedPrompts: 0, // Would need API endpoint for this
        categories: categories.length,
      });
    } catch (error) {
      console.error('❌ [ExtensionDashboard] Failed to load stats:', error);
      debug.error('Failed to load stats', 'ExtensionDashboard', error);
    }
  };

  const getBaseUrl = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!chrome.runtime?.id) {
        resolve('http://ai-nots.test/');
        return;
      }
      chrome.storage.local.get(['apiBaseUrl'], (result: { [key: string]: any }) => {
        if (chrome.runtime.lastError) {
          resolve('http://ai-nots.test/');
          return;
        }
        resolve(result.apiBaseUrl || 'http://ai-nots.test/');
      });
    });
  };

  const handleToggleBottomBar = () => {
    try {



    } catch (error) {
      console.error('❌ [ExtensionDashboard] Error toggling bottom bar:', error);
      debug.error('Failed to toggle bottom bar', 'ExtensionDashboard', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔵 [ExtensionDashboard] Logout initiated');
      debug.action('Logout initiated', 'ExtensionDashboard');

      const { authService } = await import('../services/authService');
      await authService.logout();

      console.log('🔵 [ExtensionDashboard] Logout successful, reloading...');
      debug.info('Logout successful', 'ExtensionDashboard');

      // Reload the extension popup
      window.location.reload();
    } catch (error) {
      console.error('❌ [ExtensionDashboard] Logout failed:', error);
      debug.error('Logout failed', 'ExtensionDashboard', error);
      // Still reload even if logout request fails
      window.location.reload();
    }
  };

  const handleOpenDashboard = async () => {
    const baseUrl = await getBaseUrl();
    chrome.tabs.create({ url: `${baseUrl.replace(/\/$/, '')}/dashboard` });
  };

  if (loading) {
    return (
      <div className="extension-dashboard">
        <div className="extension-dashboard-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="extension-dashboard">
      <div className="extension-dashboard-header">
        <h2>AI Notes Extension</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="extension-dashboard-logout"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      {userInfo && (
        <div className="extension-dashboard-user">
          <div className="extension-dashboard-avatar">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
          <div className="extension-dashboard-user-info">
            <div className="extension-dashboard-user-name">{userInfo.name}</div>
            <div className="extension-dashboard-user-email">{userInfo.email}</div>
          </div>
        </div>
      )}

      <div className="extension-dashboard-stats">
        <div className="extension-dashboard-stat">
          <div className="extension-dashboard-stat-value">{stats.categories}</div>
          <div className="extension-dashboard-stat-label">Categories</div>
        </div>
        <div className="extension-dashboard-stat">
          <div className="extension-dashboard-stat-value">{stats.totalPrompts}</div>
          <div className="extension-dashboard-stat-label">Prompts</div>
        </div>
        <div className="extension-dashboard-stat">
          <div className="extension-dashboard-stat-value">{stats.savedPrompts}</div>
          <div className="extension-dashboard-stat-label">Saved</div>
        </div>
      </div>

      <div className="extension-dashboard-actions">
        <button
          type="button"
          onClick={handleOpenDashboard}
          className="extension-dashboard-button primary"
        >
          Open Dashboard
        </button>

        {/* Bottom Bar Toggle Button */}
        <button
          type="button"
          onClick={handleToggleBottomBar}
          className="extension-dashboard-button bottom-bar-toggle"
          style={{ marginTop: '12px' }}
        >
          {bottomBarVisible ? '▼ Hide Bottom Bar' : '▲ Show Bottom Bar'}
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="extension-dashboard-button logout-button"
          style={{ marginTop: '12px' }}
        >
          🚪 Logout
        </button>
      </div>

      <div className="extension-dashboard-info">
        <h3>How to use:</h3>
        <ul>
          <li>Visit ChatGPT and start typing</li>
          <li>Click the "Save Prompt" button when it appears</li>
          <li>Fill in the form and save your prompt</li>
        </ul>
      </div>

      <div className="extension-dashboard-debug">
        <h3>Debug Mode:</h3>
        <div className="extension-dashboard-debug-controls">
          <button
            type="button"
            onClick={() => {
              if (debugEnabled) {
                disableDebug();
                setDebugEnabled(false);
              } else {
                enableDebug();
                setDebugEnabled(true);
              }
            }}
            className={`extension-dashboard-button ${debugEnabled ? 'debug-on' : 'debug-off'}`}
          >
            {debugEnabled ? '🔧 Debug: ON' : '🔧 Debug: OFF'}
          </button>
          <button
            onClick={handleToggleBottomBar}
            className={`extension-dashboard-button ${bottomBarVisible ? 'bottom-bar-visible' : 'bottom-bar-hidden'}`}
          >
            Show bottom bar
          </button>
          <p className="extension-dashboard-debug-hint">
            {debugEnabled
              ? 'Debug logs are visible in browser console. Open DevTools (F12) to view.'
              : 'Enable debug mode to see detailed logs in browser console.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExtensionDashboard;

