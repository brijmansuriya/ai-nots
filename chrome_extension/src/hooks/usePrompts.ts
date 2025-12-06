import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { Prompt } from '@/types';

export function usePrompts(searchQuery: string = '') {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cacheKey = `prompts_${searchQuery}`;
      const cached = await chrome.storage.local.get([cacheKey, 'cacheTimestamp']);
      
      const now = Date.now();
      const cacheAge = cached.cacheTimestamp ? now - cached.cacheTimestamp : Infinity;
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      if (cached[cacheKey] && cacheAge < CACHE_DURATION) {
        setPrompts(cached[cacheKey]);
        setLoading(false);
        
        // Fetch fresh data in background
        fetchFreshPrompts();
        return;
      }

      await fetchFreshPrompts();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prompts');
      setLoading(false);
    }
  }, [searchQuery]);

  const fetchFreshPrompts = async () => {
    try {
      const data = await apiService.getPrompts(searchQuery);
      setPrompts(data);
      setLoading(false);

      // Cache the results
      const cacheKey = `prompts_${searchQuery}`;
      await chrome.storage.local.set({
        [cacheKey]: data,
        cacheTimestamp: Date.now()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prompts');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts,
    loading,
    error,
    refresh: fetchPrompts
  };
}

