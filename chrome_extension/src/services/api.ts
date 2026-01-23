// API service for communicating with AI Notes backend
import { ENV } from '../config/env';
import { debug } from '../utils/debug';

interface ApiConfig {
  baseUrl: string;
  token?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Platform {
  id: number;
  name: string;
}

interface SavePromptData {
  title: string;
  prompt: string;
  description?: string;
  category_id: number;
  tags: string[];
  platform: string[];
  dynamic_variables?: string[];
  status?: string;
}

class ApiService {
  private baseUrl: string = '';
  private token: string = '';

  async initialize(): Promise<void> {
    return new Promise((resolve) => {
      debug.info('Initializing API service', 'ApiService');
      chrome.storage.local.get(['apiBaseUrl', 'apiToken'], (result: { [key: string]: any }) => {
        this.baseUrl = result.apiBaseUrl || ENV.API_BASE_URL;
        this.token = result.apiToken || '';
        debug.info('API service initialized', 'ApiService', {
          baseUrl: this.baseUrl,
          hasToken: !!this.token,
        });
        resolve();
      });
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.initialize();

    if (!this.baseUrl) {
      throw new Error('API base URL not configured. Please set it in extension settings.');
    }

    const url = `${this.baseUrl.replace(/\/$/, '')}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authentication if token is available (API token auth)
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Use API token auth (no cookies needed)
    const fetchOptions: RequestInit = {
      ...options,
      headers: headers as HeadersInit,
    };

    debug.network(options.method || 'GET', url, undefined, {
      hasAuth: !!this.token,
      authType: 'Bearer',
    });

    try {
      const response = await fetch(url, fetchOptions);
      debug.network(options.method || 'GET', url, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        debug.error(`API request failed: ${errorMessage}`, 'ApiService', {
          url,
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      debug.error('Network request failed', 'ApiService', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.request<Category[]>('/api/extension/categories');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  }

  async getTags(): Promise<Tag[]> {
    try {
      const response = await this.request<Tag[]>('/api/extension/tags');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      return [];
    }
  }

  async getPlatforms(): Promise<Platform[]> {
    try {
      const response = await this.request<Platform[]>('/api/extension/platforms');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
      return [];
    }
  }

  async savePrompt(data: SavePromptData): Promise<any> {
    // Ensure platform array has at least one item (default to ChatGPT)
    const platform = data.platform.length > 0 ? data.platform : ['ChatGPT'];

    const payload = {
      title: data.title,
      prompt: data.prompt,
      description: data.description || '',
      category_id: data.category_id,
      tags: data.tags,
      platform: platform,
      dynamic_variables: data.dynamic_variables || [],
      status: data.status || '1',
    };

    return this.request('/api/extension/prompts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getTemplates(): Promise<any[]> {
    try {
      const response = await this.request<any>('/api/extension/templates');
      console.log('Templates response:', response);

      // Handle Laravel Resource response { data: [...], ... }
      if (response && Array.isArray(response.data)) {
        console.log('......................');
        console.log('Templates data:', response.data);
        return response.data;
      }

      console.log('Templates response:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn('Failed to fetch templates:', error);
      return [];
    }
  }

  setConfig(config: ApiConfig): void {
    this.baseUrl = config.baseUrl;
    this.token = config.token || '';
  }
}

export const apiService = new ApiService();
export type { Category, Tag, Platform, SavePromptData };

