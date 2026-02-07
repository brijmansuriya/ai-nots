import { describe, it, expect, vi } from 'vitest';
import { debug } from '../../src/utils/debug';

describe('Debug Utility', () => {
    it('debug.info should call console.log', () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => { });
        debug.info('test message', 'TestContext');
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    it('debug.error should call console.error', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { });
        debug.error('test error', 'TestContext');
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});
