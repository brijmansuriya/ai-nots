import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import Header from '@/components/header';
import Hero from '@/components/hero';
import NoteCard from '@/components/note-card';
import AddPromptModal from '@/components/add-prompt-modal';
import WebLayout from '@/layouts/web-layout';
import LoadMoreTrigger from '@/components/LoadMoreTrigger'; // Import LoadMoreTrigger
import { Prompt, Tag } from '@/types';
import axios from 'axios';

interface HomeProps {
  search?: string;
  tags?: Tag[];
}

export default function Home({ search = '' }: HomeProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<string>(search);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(search);
  const isFetching = useRef(false); // Ref to track ongoing fetch

  const fetchPrompts = useCallback(async (page = 1, searchQuery = '') => {
    if (isFetching.current || page > lastPage || page < currentPage) return;
    isFetching.current = true;
    setLoading(true);
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
      console.error('Failed to fetch prompts:', error); // Log errors for debugging
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [lastPage, currentPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      fetchPrompts(1, query); // Trigger fetch on query change
    }, 500); // Debounce delay

    

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    fetchPrompts(1, debouncedQuery); // Ensure initial data load
  }, [debouncedQuery, fetchPrompts]);

  const handleLoadMore = useCallback(() => {
    if (!loading && currentPage < lastPage) {
      fetchPrompts(currentPage + 1, debouncedQuery);
    }
  }, [loading, currentPage, lastPage, debouncedQuery, fetchPrompts]);

  return (
    <WebLayout title="Home">
      <Header />
      <Hero search={query} onSearchChange={setQuery} />

      <section className="notes-section mx-2 sm:mx-4 md:mx-8 lg:mx-12 xl:mx-16 py-6 sm:py-8 md:py-10 lg:py-12 rounded-3xl text-center bg-black/20 backdrop-blur-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text uppercase">
            AI Prompt Playground
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 sm:mt-0 bg-ai-cyan text-white px-6 py-2 rounded-full hover:bg-ai-coral text-sm font-semibold transition"
          >
            Add Prompt
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl mx-auto px-8">
          {prompts.length > 0 ? (
            prompts.map((prompt, i) => (
              <NoteCard key={prompt.id} prompt={prompt} index={i} />
            ))
          ) : (
            <p className="text-white col-span-full text-center">No prompts found.</p>
          )}
        </div>

        {loading && (
          <div className="text-center py-4 transition-opacity duration-300 opacity-100">
            <p className="animate-pulse">Loading...</p>
          </div>
        )}

        {!loading && currentPage < lastPage && (
          <LoadMoreTrigger onVisible={handleLoadMore} />
        )}
      </section>

      {isModalOpen && (
        <AddPromptModal onClose={() => setIsModalOpen(false)} />
      )}
    </WebLayout>
  );
}
