import React from 'react';
import { Head, usePage } from '@inertiajs/react';
// import Header from '@/Components/Header';
// import Hero from '@/Components/Hero';
// import NoteCard from '@/Components/NoteCard';
import { type SharedData } from '@/types';

interface Prompt {
  id: number;
  text: string;
  tags: string[];
}

interface PageProps extends SharedData {
  prompts: Prompt[];
}

export default function Home() {
  const { auth, prompts } = usePage<PageProps>().props;

  return (
    <>
      <Head title="AI Prompt Playground">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
      </Head>

      <div className="min-h-screen">
        <Header />
        <Hero />
        <section className="notes-section mx-2 sm:mx-4 md:mx-8 lg:mx-12 xl:mx-16 py-6 sm:py-8 md:py-10 lg:py-12 rounded-3xl text-center bg-black/20 backdrop-blur-lg">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text mb-4 sm:mb-6 md:mb-8">
            AI Prompt Playground
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
            {prompts.map((prompt, index) => (
              <NoteCard key={prompt.id} prompt={prompt} index={index} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
