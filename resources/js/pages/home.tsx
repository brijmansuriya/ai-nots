import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Header from '@/components/header';
import Hero from '@/components/hero';
import NoteCard from '@/components/note-card';
import AddPromptModal from '@/components/add-prompt-modal';
import WebLayout from '@/layouts/web-layout';
import { Prompt, Tag } from '@/types';
import axios from 'axios';

interface HomeProps {
  prompts: {
    data: Prompt[];
    current_page: number;
    last_page: number;
  };
  search?: string;
  tags?: Tag[];
}

export default function Home({ prompts: initialPrompts, search = '' }: HomeProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts.data);
  const [currentPage, setCurrentPage] = useState<number>(initialPrompts.current_page);
  const [lastPage, setLastPage] = useState<number>(initialPrompts.last_page);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadMorePrompts = async () => {
    if (loading || currentPage >= lastPage) return;
    setLoading(true);
  
    try {
      const response = await axios.get(route('homedata'), {
        params: { page: currentPage + 1 },
      });
  
      setPrompts(prev => [...prev, ...response.data.data]);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
    if (nearBottom) loadMorePrompts();
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, loading]);

  return (
    <WebLayout title="Home">
      <Header />
      <Hero search={search} />

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-8">
          {prompts.length > 0 ? (
            prompts.map((prompt, i) => (
              <NoteCard key={prompt.id} prompt={prompt} index={i} />
            ))
          ) : (
            <p className="text-white col-span-full text-center">No prompts found.</p>
          )}
        </div>

        {loading && (
          <div className="text-center py-4 text-white">Loading more prompts...</div>
        )}
      </section>

      {isModalOpen && (
        <AddPromptModal onClose={() => setIsModalOpen(false)} />
      )}
    </WebLayout>
  );
}
