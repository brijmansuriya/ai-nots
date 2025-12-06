import React, { useState } from 'react';
import { Menu, X, Github, Twitter, Mail } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Footer() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Navigation links
  const navLinks = [
    { name: 'Home', href: route('home') },
    { name: 'Features', href: route('features') },
    { name: 'About', href: route('about') },
    { name: 'Blog', href: 'https://www.web-beast.com/2025/04/how-to-reset-your-password-step-by-step.html' },
    { name: 'Prompts', href: route('home') }, // Updated to 'prompt.index' for consistency
    { name: 'Contact', href: 'mailto:support@web-beast.com' },
  ];

  // Social media links
  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/web-beast' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/web_beast' },
    { name: 'Email', icon: Mail, href: 'mailto:support@web-beast.com' },
  ];

  return (
    <footer className="relative w-full bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-sm z-10 text-gray-700 dark:text-gray-300 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Mobile Menu Toggle */}
        <div className="flex justify-between items-center md:hidden mb-6">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            AI NOTS
          </div>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} className="text-gray-700 dark:text-gray-300" /> : <Menu size={24} className="text-gray-700 dark:text-gray-300" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${menuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <nav className="flex flex-col gap-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:translate-x-1 transition-all duration-300"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex gap-4 mt-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                  aria-label={link.name}
                >
                  <link.icon size={20} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {/* Brand & Description */}
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              AI NOTS
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Empowering developers with free tools and templates for secure web solutions, including forgot password email templates and more.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:translate-x-1 transition-all duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Media & Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect With Us</h3>
            <div className="flex gap-4 mb-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                  aria-label={link.name}
                >
                  <link.icon size={20} className="text-gray-600 hover:text-gray-900" />
                </a>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Email: <a href="mailto:support@web-beast.com" className="hover:text-gray-900 dark:hover:text-white text-gray-900 dark:text-white font-medium">support@web-beast.com</a>
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 sm:mt-12 border-t border-gray-200 dark:border-gray-800 pt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Web Beast. All rights reserved.
          </p>
          {/* <p className="text-xs sm:text-sm text-white/70 mt-2">
            Discover how to{' '}
            <a
              href="https://www.web-beast.com/2025/04/how-to-reset-your-password-step-by-step.html"
              className="underline hover:text-ai-cyan transition-colors"
            >
              reset your password step by step
            </a>{' '}
            with our free HTML & Bootstrap templates!
          </p> */}
        </div>
      </div>
    </footer>
  );
}