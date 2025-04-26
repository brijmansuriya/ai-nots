import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react'; // Use router from @inertiajs/react

type Props = {
  search?: string;
  onSearchChange: (query: string) => void;
};

export default function Hero({ search = '', onSearchChange }: Props) {
  const [query, setQuery] = useState<string>(search);

  const handleSearch = () => {
    router.get(route('home'), { search: query }); // Use router.get for navigation
  };

  useEffect(() => {
    onSearchChange(query);
  }, [query, onSearchChange]);

  return (
    <section className="hero min-h-screen flex flex-col justify-center items-center text-center px-3 sm:px-4 md:px-6 lg:px-8">
      <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-5 bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text">
        Welcome to the Future of AI
      </h1>
      <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl max-w-[16rem] xs:max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl text-white/80 mb-4 sm:mb-6 md:mb-8">
        Explore cutting-edge AI solutions with seamless integration and powerful tools.
      </p>
      <div className="search-bar flex items-center w-full max-w-[16rem] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-white/10 rounded-full p-2 sm:p-2.5 hover:scale-105 transition-transform duration-300">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for AI tools or features..."
          className="flex-1 bg-transparent border-none outline-none text-white text-xs xs:text-sm sm:text-base px-3 sm:px-4 py-2"
        />
        <button
          onClick={handleSearch}
          className="bg-ai-cyan text-white font-semibold px-3 sm:px-4 md:px-5 py-2 rounded-full hover:bg-ai-coral transition-colors text-xs sm:text-sm"
        >
          Search
        </button>
      </div>
    </section>
  );
}
