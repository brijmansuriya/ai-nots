import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  apiUrl?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const result = await chrome.storage.local.get(['authToken', 'apiUrl', 'user']);
      if (result.authToken && result.apiUrl) {
        apiService.setConfig(result.apiUrl, result.authToken);
        if (result.user) {
          setUser({ ...result.user, apiUrl: result.apiUrl });
          setIsAuthenticated(true);
        } else {
          // Try to fetch user info
          const userData = await apiService.getUser();
          if (userData) {
            setUser({ ...userData, apiUrl: result.apiUrl });
            setIsAuthenticated(true);
            await chrome.storage.local.set({ user: userData });
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (apiUrl: string, token: string) => {
    try {
      apiService.setConfig(apiUrl, token);
      const userData = await apiService.getUser();
      if (userData) {
        setUser({ ...userData, apiUrl });
        setIsAuthenticated(true);
        await chrome.storage.local.set({
          authToken: token,
          apiUrl,
          user: userData
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await chrome.storage.local.remove(['authToken', 'apiUrl', 'user']);
    setUser(null);
    setIsAuthenticated(false);
    apiService.clearConfig();
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  };
}

