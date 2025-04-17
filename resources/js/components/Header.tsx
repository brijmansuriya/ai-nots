import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="fixed top-0 w-full z-50 bg-ai-dark/60 backdrop-blur-lg shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-ai-cyan">
          AI Nots
        </div>

        {/* Hamburger */}
        <button
          onClick={toggleMenu}
          className="text-white sm:hidden transition-transform duration-300"
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation */}
        <nav
          className={`${
            menuOpen ? 'block' : 'hidden'
          } absolute sm:static top-full left-0 w-full sm:w-auto bg-ai-dark sm:bg-transparent text-center sm:flex sm:items-center gap-4 p-4 sm:p-0 transition-all duration-300 ease-in-out`}
        >
          {['Home', 'Features', 'About', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="block sm:inline text-white text-sm md:text-base py-2 sm:py-0 hover:text-ai-cyan transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
