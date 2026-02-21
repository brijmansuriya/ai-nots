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
  slug: string;
  variable_pattern: string | null;
  max_prompt_length: number | null;
  cost: number | string | null;
}

interface Folder {
  id: number;
  name: string;
  emoji?: string;
  color?: string;
  parent_id?: number;
  prompts_count: number;
  children?: Folder[];
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
  folder_id?: number | null;
}

class ApiService {
  private baseUrl: string = '';
  private token: string = '';

  async initialize(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['apiBaseUrl', 'api_token'], (result: Record<string, any>) => {
        this.baseUrl = result.apiBaseUrl || ENV.API_BASE_URL;
        this.token = result.api_token || ''; // Use api_token consistently
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
      throw new Error('API base URL not configured.');
    }

    const url = `${this.baseUrl.replace(/\/$/, '')}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers: headers as HeadersInit,
    };

    try {
      const response = await fetch(url, fetchOptions);

      if (response.status === 401) {
        debug.error('Unauthorized request (401), logging out...', 'ApiService');
        this.clearAuth();
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      return await response.json() as T;
    } catch (error) {
      debug.error('Network request failed', 'ApiService', error);
      throw error;
    }
  }

  private clearAuth(): void {
    this.token = '';
    chrome.storage.local.remove(['api_token', 'user', 'user_data', 'cachedPrompts']);
    try {
      chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' }).catch(() => { });
    } catch (e) {
      // Ignore errors if context is invalidated or no listener
    }
  }

  async getCategories(): Promise<Category[]> {
    const response = await this.request<any>('/api/extension/categories');
    return response?.data || response || [];
  }

  async getTags(): Promise<Tag[]> {
    const response = await this.request<any>('/api/extension/tags');
    return response?.data || response || [];
  }

  async getPlatforms(): Promise<Platform[]> {
    const response = await this.request<any>('/api/extension/platforms');
    return response?.data || response || [];
  }

  async savePrompt(data: SavePromptData): Promise<any> {
    return this.request('/api/extension/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePrompt(id: number, data: SavePromptData): Promise<any> {
    return this.request(`/api/extension/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePrompt(id: number): Promise<any> {
    return this.request(`/api/extension/prompts/${id}`, {
      method: 'DELETE',
    });
  }

  async createTemplate(data: SavePromptData): Promise<any> {
    return this.request('/api/extension/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTemplates(): Promise<any[]> {
    const response = await this.request<any>('/api/extension/templates');
    return response?.data || (Array.isArray(response) ? response : []);
  }

  async getPrompts(): Promise<any[]> {
    const response = await this.request<any>('/api/extension/prompts');
    return response?.data || (Array.isArray(response) ? response : []);
  }

  async getFolders(): Promise<Folder[]> {
    const response = await this.request<any>('/api/extension/folders');
    return response?.data || (Array.isArray(response) ? response : []);
  }

  async createFolder(data: { name: string; parent_id?: number | null; emoji?: string; color?: string }): Promise<Folder> {
    const response = await this.request<any>('/api/extension/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response?.data || response;
  }

  async updateFolder(id: number, data: { name?: string; parent_id?: number | null; emoji?: string; color?: string }): Promise<Folder> {
    const response = await this.request<any>(`/api/extension/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response?.data || response;
  }

  async deleteFolder(id: number): Promise<any> {
    return this.request(`/api/extension/folders/${id}`, {
      method: 'DELETE',
    });
  }

  async sendFeedback(data: { type: string; message: string; metadata?: any }): Promise<any> {
    return this.request('/api/extension/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<any> {
    await this.initialize();
    if (!this.token) {
      return null;
    }

    try {
      const response = await this.request<any>('/api/extension/auth/me');
      return response?.user || response;
    } catch (error) {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/extension/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Backend logout failed');
    } finally {
      this.clearAuth();
    }
  }

  async getLoginUrl(): Promise<string> {
    await this.initialize();
    const extId = chrome.runtime.id;
    return `${this.baseUrl.replace(/\/$/, '')}/extension-login?ext_id=${extId}`;
  }

  setConfig(config: ApiConfig): void {
    this.baseUrl = config.baseUrl;
    this.token = config.token || '';
  }
}

export const apiService = new ApiService();
export type { Category, Tag, Platform, SavePromptData, Folder };
