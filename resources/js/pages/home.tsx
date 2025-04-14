import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Header from '@/components/header';
import Hero from '@/components/hero';
import NoteCard from '@/components/note-card';
import AddPromptModal from '@/components/add-prompt-modal';
import { useState } from 'react';
// import { type SharedData } from '@/types';
// import { useState } from 'react';
// import Header from '@/Components/Header';
// import Hero from '@/Components/Hero';
// import NoteCard from '@/Components/NoteCard';
// import AddPromptModal from '@/Components/add-prompt-modal';

interface Prompt {
  id: number;
  text: string;
  tags: string[];
  platform: string;
}

interface HomeProps {
  prompts: Prompt[];
}

export default function Home({ prompts: initialPrompts }: HomeProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPrompt = (newPrompt: Omit<Prompt, 'id'>) => {
    const newId = Math.max(...prompts.map((p) => p.id), 0) + 1;
    setPrompts([...prompts, { ...newPrompt, id: newId }]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />

      <section className="notes-section mx-2 sm:mx-4 md:mx-8 lg:mx-12 xl:mx-16 py-6 sm:py-8 md:py-10 lg:py-12 rounded-3xl text-center bg-black/20 backdrop-blur-lg">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 md:mb-8 px-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text">
            AI Prompt Playground
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 sm:mt-0 bg-ai-cyan text-white font-semibold px-4 sm:px-6 py-2 rounded-full hover:bg-ai-coral transition-colors text-xs sm:text-sm"
          >
            Add Prompt
          </button>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-8">
          {prompts.map((prompt, index) => (
            <NoteCard key={prompt.id} prompt={prompt} index={index} />
          ))}
        </div>
      </section>

      {/* Add Prompt Modal */}
      {isModalOpen && (
        <AddPromptModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddPrompt}
        />
      )}
    </div>
  );
}
