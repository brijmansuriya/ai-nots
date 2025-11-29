import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { router, useForm } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';
import Header from '@/components/header';
import NoteCard from '@/components/note-card';
import LoadMoreTrigger from '@/components/LoadMoreTrigger';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Prompt } from '@/types';

export default function Dashboard({ auth }: any) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState<string>('');
  const isFetching = useRef(false);

  const { data, setData, patch, processing, errors } = useForm({
    name: auth.user.name,
    email: auth.user.email,
  });

  const fetchPrompts = useCallback(async (page: number, searchQuery = '') => {
    if (isFetching.current || page > lastPage) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const response = await axios.get(route('dashboard.prompts'), {
        params: { page, search: searchQuery }, // Pass search query to the backend
      });
      const newPrompts = response.data.data;
      setPrompts(prev => (page === 1 ? newPrompts : [...prev, ...newPrompts]));
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [lastPage]);

  useEffect(() => {
    fetchPrompts(1, search); // Fetch prompts whenever the search query changes
  }, [fetchPrompts, search]);

  const handleLoadMore = useCallback(() => {
    if (!loading && currentPage < lastPage) {
      fetchPrompts(currentPage + 1, search);
    }
  }, [loading, currentPage, lastPage, fetchPrompts, search]);

  const handleEdit = (promptId: number) => {
    router.visit(route('prompt.edit', { id: promptId })); // Redirect to edit page
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route('profile.update')); // Update user profile
  };

  return (
    <WebLayout title="Dashboard">
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors">
        {/* Main Content */}
        <main className="py-6 sm:py-8 md:py-10 lg:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
              Welcome, {auth.user.name}
            </h1>
            <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
              Here you can manage your prompts and profile settings.
            </p>
          </div>

          {/* Top Section */}
          <section className="mx-auto max-w-7xl py-8 px-6 mt-8 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6 transition-colors">

            {/* Profile Section */}
            <div className="flex flex-col items-center text-center">
              <img
                src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=111827&color=ffffff&size=128&rounded=true`}
                alt="Avatar"
                className="h-24 w-24 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{auth.user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{auth.user.email}</p>
            </div>

            {/* Update Name and Email Section */}
            <form onSubmit={submit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-800 rounded-md shadow-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white"
                />
                <InputError message={errors.name} className="mt-2 text-red-600 dark:text-red-400" />
              </div>

              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-800 rounded-md shadow-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white"
                />
                <InputError message={errors.email} className="mt-2 text-red-600 dark:text-red-400" />
              </div>

              <Button
                type="submit"
                disabled={processing}
                className="w-full bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-gray-900 py-2 px-4 rounded-md hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-300 transition"
              >
                {processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </section>

          {/* Prompts Section */}
          <section className="notes-section mx-auto max-w-7xl py-8 px-6 mt-10 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent uppercase">
                My Prompts
              </h2>
              <Input
                type="text"
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-1/3 border-gray-300 dark:border-gray-800 rounded-md shadow-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.length > 0 ? (
                prompts.map((prompt, i) => (
                  <NoteCard key={prompt.id} prompt={prompt} index={i} />
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 col-span-full text-center">
                  No prompts found.
                </p>
              )}
            </div>

            {loading && (
              <div className="text-center py-4">
                <p className="animate-pulse text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            )}

            {!loading && currentPage < lastPage && (
              <LoadMoreTrigger onVisible={handleLoadMore} />
            )}
          </section>
        </main>
      </div>
    </WebLayout>
  );
}
