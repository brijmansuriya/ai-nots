import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { auth } = usePage().props;
  const user = auth?.user;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const commonLinks = [
    { name: 'Home', url: route('home') },
    { name: 'About', url: route('about') },
  ];

  const guestLinks = [
    { name: 'Login', url: route('login') },
    { name: 'Register', url: route('register') },
  ];

  const { post, processing } = useForm();

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('logout'), {
      onFinish: () => {
        setDropdownOpen(false); // Close dropdown only after submission completes
        setMenuOpen(false); // Close mobile menu
      },
    });
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-ai-dark/20 backdrop-blur-lg shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          href={route('home')}
          className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-ai-cyan"
        >
          AI Nots
        </Link>

        {/* Mobile Hamburger */}
        <button
          onClick={toggleMenu}
          className="text-white sm:hidden focus:outline-none"
          aria-label="Toggle Menu"
          disabled={processing} // Disable during form submission
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Nav Links */}
        <nav
          className={`${
            menuOpen ? 'flex' : 'hidden'
          } sm:flex flex-col sm:flex-row sm:items-center gap-4 absolute sm:static top-full left-0 w-full sm:w-auto bg-ai-dark sm:bg-transparent text-center p-4 sm:p-0 transition-all duration-300 ease-in-out`}
        >
          {commonLinks.map((link) => (
            <Link
              key={link.name}
              href={link.url}
              className="block sm:inline text-white text-sm md:text-base py-2 sm:py-0 hover:text-ai-cyan transition-colors"
              onClick={() => setMenuOpen(false)} // Close mobile menu on link click
            >
              {link.name}
            </Link>
          ))}

          {!user &&
            guestLinks.map((link) => (
              <Link
                key={link.name}
                href={link.url}
                className="block sm:inline text-white text-sm md:text-base py-2 sm:py-0 hover:text-ai-cyan transition-colors"
                onClick={() => setMenuOpen(false)} // Close mobile menu on link click
              >
                {link.name}
              </Link>
            ))}

          {user && (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="text-white text-sm md:text-base hover:text-ai-cyan py-2 transition focus:outline-none"
                aria-label="User Menu"
                disabled={processing} // Disable during form submission
              >
                {user.name}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <Link
                      href={route('dashboard')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        setMenuOpen(false); // Close menus on link click
                      }}
                    >
                      Dashboard
                    </Link>
                    <form onSubmit={handleLogout}>
                      <button
                        type="submit"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={processing} // Disable button during submission
                      >
                        {processing ? 'Logging out...' : 'Logout'}
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