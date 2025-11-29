import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import Header from '@/components/header';
import NoteCard from '@/components/note-card';
import WebLayout from '@/layouts/web-layout';
import LoadMoreTrigger from '@/components/LoadMoreTrigger';
import { Prompt, Tag } from '@/types';
import axios from 'axios';
import NProgress from 'nprogress';
import { Search, Plus } from 'lucide-react';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });

interface HomeProps {
  search?: string;
  tags?: Tag[];
}

export default function Home({ search = '' }: HomeProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<string>(search);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(search);
  const isFetching = useRef(false);
  const { auth } = usePage().props;

  const fetchPrompts = useCallback(async (page = 1, searchQuery = '') => {
    if (isFetching.current || page > lastPage || page < currentPage) return;
    isFetching.current = true;
    setLoading(true);
    NProgress.start();

    try {
      const response = await axios.get(route('homedata'), {
        params: { page, search: searchQuery },
      });
      const newPrompts = response.data.data;
      setPrompts(prev =>
        page === 1
          ? newPrompts
          : [...prev, ...newPrompts.filter((p: Prompt) => !prev.some(existing => existing.id === p.id))]
      );
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
      isFetching.current = false;
      NProgress.done();
    }
  }, [lastPage, currentPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      fetchPrompts(1, query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    fetchPrompts(1, debouncedQuery);
  }, [debouncedQuery, fetchPrompts]);

  const handleLoadMore = useCallback(() => {
    if (!loading && currentPage < lastPage) {
      fetchPrompts(currentPage + 1, debouncedQuery);
    }
  }, [loading, currentPage, lastPage, debouncedQuery, fetchPrompts]);

  const handleAddPromptClick = () => {
    if (!auth.user) {
      router.visit(route('login'));
      return;
    }
    router.visit(route('prompt.create'));
  };

  return (
    <WebLayout title="Home">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black transition-colors">
        {/* Hero Section - Product Hunt Style */}
        <div className="bg-gradient-to-b from-white dark:from-gray-950 to-gray-50 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 dark:from-white via-gray-800 dark:via-gray-200 to-black dark:to-gray-400 bg-clip-text text-transparent mb-4">
                Discover AI Prompts
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Explore and share powerful AI prompts to enhance your productivity
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search prompts, tags, or platforms..."
                  className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white outline-none transition-all shadow-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Add Prompt Button */}
            <div className="flex justify-center">
              <button
                onClick={handleAddPromptClick}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 hover:from-black dark:hover:from-gray-100 hover:to-gray-900 dark:hover:to-gray-300 text-white dark:text-gray-900 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Add New Prompt
              </button>
            </div>
          </div>
        </div>

        {/* Prompts Grid Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {query ? `Search Results` : 'Top Prompts'}
            </h2>
            {query && (
              <p className="text-gray-600 dark:text-gray-400">
                Found {prompts.length} {prompts.length === 1 ? 'result' : 'results'} for "{query}"
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.length > 0 ? (
              prompts.map((prompt, i) => (
                <NoteCard
                  key={prompt.id}
                  prompt={prompt}
                  index={i}
                  onDeleted={(id) =>
                    setPrompts((prev) => prev.filter((p) => p.id !== id))
                  }
                />
              ))
            ) : (
              !loading && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No prompts found.</p>
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="mt-4 text-gray-900 dark:text-white hover:text-black dark:hover:text-gray-200 font-medium underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading prompts...</p>
            </div>
          )}

          {!loading && currentPage < lastPage && (
            <LoadMoreTrigger onVisible={handleLoadMore} />
          )}
        </div>
      </div>
    </WebLayout>
  );
}
