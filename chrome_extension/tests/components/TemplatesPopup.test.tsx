import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TemplatesPopup from '../../src/components/TemplatesPopup';
import { apiService } from '../../src/services/api';

// Mock window.open
global.open = vi.fn();

describe('TemplatesPopup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Spy on apiService methods
        vi.spyOn(apiService, 'getTemplates').mockResolvedValue([]);
        vi.spyOn(apiService, 'getPrompts').mockResolvedValue([]);
        vi.spyOn(apiService, 'getCategories').mockResolvedValue([]);
        vi.spyOn(apiService, 'getLoginUrl').mockReturnValue('http://login-url.com');
        vi.spyOn(apiService, 'createTemplate').mockResolvedValue({});
        vi.spyOn(apiService, 'savePrompt').mockResolvedValue({});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('clicking "New Template" when unauthenticated should redirect to login', async () => {
        // data loading calls
        vi.spyOn(apiService, 'getCurrentUser').mockResolvedValue(null);

        render(<TemplatesPopup onSelect={() => { }} onClose={() => { }} />);

        // Wait for loading to finish
        await screen.findByText('New Template');

        const newBtn = screen.getByText('New Template');
        fireEvent.click(newBtn);

        expect(global.open).toHaveBeenCalledWith('http://login-url.com', '_blank');
        expect(screen.queryByText('Title')).toBeNull(); // Form should not show
    });

    it('clicking "New Template" when authenticated should show form', async () => {
        // data loading calls
        vi.spyOn(apiService, 'getCurrentUser').mockResolvedValue({ id: 1, name: 'User' });
        vi.spyOn(apiService, 'getCategories').mockResolvedValue([{ id: 1, name: 'Cat1' }]);

        render(<TemplatesPopup onSelect={() => { }} onClose={() => { }} />);

        // Wait for loading
        await screen.findByText('New Template');

        const newBtn = screen.getByText('New Template');
        fireEvent.click(newBtn);

        expect(global.open).not.toHaveBeenCalled();
        // Wait for form to appear
        await waitFor(() => {
            expect(screen.getByText('Title')).toBeDefined();
        });
    });
});
