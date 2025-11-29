import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import ThemeToggle from '@/components/theme-toggle';

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
    <header className="sticky top-0 left-0 w-full z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Link
          href={route('home')}
          className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent hover:from-black dark:hover:from-gray-100 hover:to-gray-900 dark:hover:to-gray-400 transition-all"
        >
          AI Nots
        </Link>

        {/* Right: User menu + theme toggle + mobile hamburger */}
        <div className="flex items-center gap-3 sm:order-2">
          {/* Desktop user menu pill */}
          {user && (
            <div className="relative hidden sm:block">
              <button
                onClick={toggleDropdown}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 px-4 py-1.5 text-sm md:text-base text-gray-700 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
                aria-label="User Menu"
                disabled={processing}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 dark:bg-white text-xs font-semibold text-white dark:text-gray-900">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
                <span className="max-w-[140px] truncate">{user.name}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 dark:ring-white/5 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-left">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.email || user.name}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href={route('dashboard')}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                      onClick={() => {
                        setDropdownOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      Dashboard
                    </Link>
                    <form onSubmit={handleLogout}>
                      <button
                        type="submit"
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                        disabled={processing}
                      >
                        {processing ? 'Logging out...' : 'Logout'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Mobile Hamburger */}
          <button
            onClick={toggleMenu}
            className="text-gray-700 dark:text-gray-300 sm:hidden focus:outline-none"
            aria-label="Toggle Menu"
            disabled={processing}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav
          className={`${menuOpen ? 'flex' : 'hidden'
            } sm:flex flex-col sm:flex-row sm:items-center gap-4 absolute sm:static top-full left-0 w-full sm:w-auto bg-white dark:bg-gray-900 sm:bg-transparent border-t sm:border-t-0 border-gray-200 dark:border-gray-800 sm:border-0 text-center p-4 sm:p-0 transition-all duration-300 ease-in-out shadow-lg sm:shadow-none sm:order-1 sm:ml-6`}
        >
          {commonLinks.map((link) => (
            <Link
              key={link.name}
              href={link.url}
              className="block sm:inline text-gray-700 dark:text-gray-300 text-sm md:text-base py-2 sm:py-0 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {!user &&
            guestLinks.map((link) => (
              <Link
                key={link.name}
                href={link.url}
                className={`block sm:inline text-sm md:text-base py-2 sm:py-0 transition-colors ${link.name === 'Login'
                  ? 'sm:ml-4 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-300 font-medium shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium'
                  }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

          {/* Mobile-only user actions inside the menu */}
          {user && (
            <div className="flex flex-col gap-1 sm:hidden border-t border-gray-200 dark:border-gray-800 pt-2 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Signed in as <span className="font-medium">{user.name}</span>
              </span>
              <Link
                href={route('dashboard')}
                className="block py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <form
                onSubmit={(e) => {
                  handleLogout(e);
                  setMenuOpen(false);
                }}
              >
                <button
                  type="submit"
                  className="w-full py-2 text-left text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                  disabled={processing}
                >
                  {processing ? 'Logging out...' : 'Logout'}
                </button>
              </form>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}