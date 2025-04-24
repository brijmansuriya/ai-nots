import React, { useState ,useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/components/header';
import Hero from '@/components/hero';
import NoteCard from '@/components/note-card';
import AddPromptModal from '@/components/add-prompt-modal';
//WebLayout
import WebLayout from '@/layouts/web-layout';
import { Prompt } from '@/types';
import axios from 'axios';

interface HomeProps {
  prompts: Prompt[];
}

export default function Home({ prompts: initialPrompts }: HomeProps) {
  const [prompts] = useState<Prompt[]>(initialPrompts); // Static display for now
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility
  
  // const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility

  useEffect(() => {
    axios.get(route('platform')).then((res) =>
      setPlatforms(res.data.platforms.map((p: Platform) => ({ ...p, selected: false })))
    );
  }, []);


  return (
    <WebLayout title="Home" >

      {/* Header & Hero Section */}
      <Header />
      <Hero onChange={(e) => { console.log("chngr==>", e.target.value); }} />

      {/* Prompts Section */}
      <section className="notes-section mx-2 sm:mx-4 md:mx-8 lg:mx-12 xl:mx-16 py-6 sm:py-8 md:py-10 lg:py-12 rounded-3xl text-center bg-black/20 backdrop-blur-lg">

        {/* Section Heading & Button */}
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

        {/* Prompt Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-8">

          {prompts.map((prompt, index) => {
            return (
              <NoteCard key={prompt.id} prompt={prompt} index={index} />
            )
          })}
        </div>
      </section>

      {/* Add Prompt Modal */}
      {isModalOpen && (
        <AddPromptModal onClose={() => setIsModalOpen(false)} />
      )}
    </WebLayout>
  );
}
