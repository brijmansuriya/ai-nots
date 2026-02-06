import { QueryClient } from '@tanstack/react-query';
import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { ENV } from '../config/env';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: ENV.QUERY_GC_TIME,
            staleTime: ENV.QUERY_STALE_TIME,
        },
    },
});

export const chromeStoragePersister: Persister = {
    persistClient: async (client: PersistedClient) => {
        await chrome.storage.local.set({ reactQueryCache: client });
    },
    restoreClient: async () => {
        const result = await chrome.storage.local.get('reactQueryCache');
        return result.reactQueryCache as PersistedClient | undefined;
    },
    removeClient: async () => {
        await chrome.storage.local.remove('reactQueryCache');
    },
};
