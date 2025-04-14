import React from 'react';
import { Link } from '@inertiajs/react';

export default function Header() {
  return (
    <header className="fixed top-0 w-full flex flex-col sm:flex-row justify-between items-center px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 bg-black/30 backdrop-blur-lg z-50">
      <div className="logo text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wider text-ai-cyan">
        AI Future
      </div>
      <nav className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 mt-3 sm:mt-0 text-center">
        <a href="#home" className="text-white text-xs sm:text-sm md:text-base hover:text-ai-cyan transition-colors">
          Home
        </a>
        <a href="#features" className="text-white text-xs sm:text-sm md:text-base hover:text-ai-cyan transition-colors">
          Features
        </a>
        <a href="#about" className="text-white text-xs sm:text-sm md:text-base hover:text-ai-cyan transition-colors">
          About
        </a>
        <a href="#contact" className="text-white text-xs sm:text-sm md:text-base hover:text-ai-cyan transition-colors">
          Contact
        </a>
      </nav>
    </header>
  );
}
