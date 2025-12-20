// Auth service for extension API token authentication
import { ENV } from '../config/env';
import { debug } from '../utils/debug';

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

interface AuthResponse {
    user: {
        id: number;
        name: string;
        email: string;
    };
    token: string;
    message: string;
}

class AuthService {
    private baseUrl: string = '';

    async initialize(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.get(['apiBaseUrl'], (result: { [key: string]: any }) => {
                this.baseUrl = result.apiBaseUrl || ENV.API_BASE_URL;
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

        // Add token if available
        const token = await this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        debug.network(options.method || 'GET', url, undefined, {
            hasAuth: !!token,
            authType: 'Bearer',
        });

        try {
            const response = await fetch(url, {
                ...options,
                headers: headers as HeadersInit,
            });

            debug.network(options.method || 'GET', url, response.status);

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || errorMessage;

                    // Handle validation errors
                    if (errorJson.errors) {
                        const validationErrors = Object.values(errorJson.errors).flat();
                        errorMessage = validationErrors.join(', ');
                    }
                } catch {
                    errorMessage = errorText || errorMessage;
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            debug.error('Auth request failed', 'AuthService', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Auth request failed');
        }
    }

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/api/extension/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        // Save token
        if (response.token) {
            await this.saveToken(response.token);
            await this.saveUser(response.user);
        }

        return response;
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/api/extension/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        // Save token
        if (response.token) {
            await this.saveToken(response.token);
            await this.saveUser(response.user);
        }

        return response;
    }

    async logout(): Promise<void> {
        try {
            await this.request('/api/extension/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            // Always clear local storage
            await this.clearAuth();
        }
    }

    async getMe(): Promise<{ user: any }> {
        return this.request<{ user: any }>('/api/extension/auth/me');
    }

    async getToken(): Promise<string | null> {
        return new Promise((resolve) => {
            chrome.storage.local.get(['apiToken'], (result: { [key: string]: any }) => {
                resolve(result.apiToken || null);
            });
        });
    }

    async saveToken(token: string): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ apiToken: token }, () => {
                debug.info('Token saved', 'AuthService');
                resolve();
            });
        });
    }

    async saveUser(user: any): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ user }, () => {
                debug.info('User saved', 'AuthService');
                resolve();
            });
        });
    }

    async getUser(): Promise<any | null> {
        return new Promise((resolve) => {
            chrome.storage.local.get(['user'], (result: { [key: string]: any }) => {
                resolve(result.user || null);
            });
        });
    }

    async clearAuth(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.remove(['apiToken', 'user'], () => {
                debug.info('Auth cleared', 'AuthService');
                resolve();
            });
        });
    }

    async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        if (!token) return false;

        // Verify token is still valid by calling /me endpoint
        try {
            await this.getMe();
            return true;
        } catch {
            // Token is invalid, clear it
            await this.clearAuth();
            return false;
        }
    }
}

export const authService = new AuthService();
export type { LoginData, RegisterData, AuthResponse };

