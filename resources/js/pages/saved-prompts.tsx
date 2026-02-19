import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import Header from '@/components/Header';
import NoteCard from '@/components/note-card';
import WebLayout from '@/layouts/web-layout';
import LoadMoreTrigger from '@/components/LoadMoreTrigger';
import { Prompt } from '@/types';
import axios from 'axios';
import NProgress from 'nprogress';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });

export default function SavedPrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const isFetching = useRef(false);
  const { auth } = usePage().props;

  const fetchPrompts = useCallback(async (page = 1) => {
    if (isFetching.current || page > lastPage || page < currentPage) return;
    isFetching.current = true;
    setLoading(true);
    NProgress.start();

    try {
      const response = await axios.get(route('saved.prompts'), {
        params: { page },
      });
      const newPrompts = Array.isArray(response.data.data) ? response.data.data : [];
      setPrompts(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        if (page === 1) {
          return newPrompts;
        }
        return [...prevArray, ...newPrompts.filter((p: Prompt) => !prevArray.some(existing => existing.id === p.id))];
      });
      setCurrentPage(response.data.current_page || 1);
      setLastPage(response.data.last_page || 1);
    } catch (error) {
      console.error('Failed to fetch saved prompts:', error);
      // Ensure prompts is always an array even on error
      setPrompts([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
      NProgress.done();
    }
  }, [lastPage, currentPage]);

  useEffect(() => {
    fetchPrompts(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && currentPage < lastPage) {
      fetchPrompts(currentPage + 1);
    }
  }, [loading, currentPage, lastPage, fetchPrompts]);

  const handleDeleted = useCallback((id: number) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <WebLayout title="Saved Prompts">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black transition-colors">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={route('home')}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <Bookmark className="w-8 h-8 text-gray-900 dark:text-white" />
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Saved Prompts
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Your favorite prompts saved for easy access
            </p>
          </div>

          {/* Prompts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.length > 0 ? (
              prompts.map((prompt, i) => (
                <NoteCard
                  key={prompt.id}
                  prompt={prompt}
                  index={i}
                  onDeleted={handleDeleted}
                />
              ))
            ) : (
              !loading && (
                <div className="col-span-full text-center py-12">
                  <Bookmark className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                    No saved prompts yet.
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
                    Start saving prompts you like to see them here.
                  </p>
                  <Link
                    href={route('home')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Browse Prompts
                  </Link>
                </div>
              )
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading saved prompts...</p>
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

