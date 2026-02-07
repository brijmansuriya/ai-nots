import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from '../../src/services/api';

// Mock chrome storage
const mockChrome = {
    storage: {
        local: {
            get: vi.fn(),
        },
    },
};
(global as any).chrome = mockChrome;

// Mock fetch
(global as any).fetch = vi.fn();

describe('ApiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('createTemplate should send POST request to /api/extension/templates', async () => {
        // Mock storage to return base URL
        (mockChrome.storage.local.get as any).mockImplementation((keys: any, callback: any) => {
            callback({ apiBaseUrl: 'http://test-api.com' });
        });

        // Mock successful fetch response
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        const templateData = {
            title: 'Test Template',
            prompt: 'Test Prompt',
            description: 'Test Desc',
            category_id: 1,
            tags: ['test'],
            platform: ['ChatGPT'],
        };

        await apiService.createTemplate(templateData);

        expect(global.fetch).toHaveBeenCalledWith(
            'http://test-api.com/api/extension/templates',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
                body: expect.stringContaining('"title":"Test Template"'),
            })
        );
    });
});
