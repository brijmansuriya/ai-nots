import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { auth, csrf_token } = usePage().props as any;
  const user = auth?.user;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const commonLinks = [
    { name: 'Home', url: route('home') },
    { name: 'About', url: '#about' },
  ];

  const guestLinks = [
    { name: 'Login', url: route('login') },
    { name: 'Register', url: route('register') },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-ai-dark/60 backdrop-blur-lg shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-ai-cyan">
          AI Nots
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={toggleMenu}
          className="text-white sm:hidden"
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Nav Links */}
        <nav
          className={`${menuOpen ? 'block' : 'hidden'} sm:flex items-center gap-4 absolute sm:static top-full left-0 w-full sm:w-auto bg-ai-dark sm:bg-transparent text-center p-4 sm:p-0 transition-all duration-300`}
        >
          {commonLinks.map(link => (
            <Link
              key={link.name}
              href={link.url}
              className="block sm:inline text-white text-sm md:text-base py-2 sm:py-0 hover:text-ai-cyan transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {!user &&
            guestLinks.map(link => (
              <Link
                key={link.name}
                href={link.url}
                className="block sm:inline text-white text-sm md:text-base py-2 sm:py-0 hover:text-ai-cyan transition-colors"
              >
                {link.name}
              </Link>
            ))}

          {user && (
            <div className="relative inline-block text-left">
              <button
                onClick={toggleDropdown}
                className="text-white text-sm md:text-base hover:text-ai-cyan py-2 transition"
              >
                {user.name}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <Link
                      href={route('dashboard')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <form method="POST" action={route('logout')}>
                      <input type="hidden" name="_token" value={csrf_token} />
                      <button
                        type="submit"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
