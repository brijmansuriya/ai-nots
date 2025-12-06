import { Prompt } from '@/types';

class ApiService {
    private apiUrl: string = '';
    private authToken: string = '';

    setConfig(apiUrl: string, token: string) {
        this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
        this.authToken = token;
    }

    clearConfig() {
        this.apiUrl = '';
        this.authToken = '';
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        if (!this.apiUrl || !this.authToken) {
            throw new Error('API not configured. Please set up your credentials.');
        }

        const url = `${this.apiUrl}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers as Record<string, string>),
        };

        // Add auth token (could be Bearer token or cookie-based)
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: headers as HeadersInit,
                credentials: 'include', // Include cookies for Laravel Sanctum
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `HTTP error! status: ${response.status}`
                );
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error occurred');
        }
    }

    async getUser() {
        try {
            // Try to get user from API endpoint (recommended)
            // Create this endpoint in your Laravel backend: Route::get('/api/user', ...)
            return await this.request<any>('/api/user');
        } catch (error) {
            // If /api/user doesn't exist, you'll need to create it
            // See BACKEND_SETUP.md for instructions
            throw new Error(
                'API endpoint /api/user not available. Please create this endpoint in your Laravel backend. See BACKEND_SETUP.md for instructions.'
            );
        }
    }

    async getPrompts(search: string = '', page: number = 1) {
        const params = new URLSearchParams({
            page: page.toString(),
            ...(search && { search }),
        });

        const response = await this.request<{
            data: Prompt[];
            current_page: number;
            last_page: number;
        }>(`/dashboard/prompts?${params}`);

        return response.data || [];
    }

    async copyPrompt(promptId: number) {
        return this.request(`/prompt/${promptId}/copy`, {
            method: 'POST',
        });
    }

    async trackUsage(promptId: number) {
        return this.request(`/prompt/${promptId}/usage`, {
            method: 'POST',
        });
    }
}

export const apiService = new ApiService();

