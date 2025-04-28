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

  const fetchPrompts = useCallback(async (page: number) => {
    if (isFetching.current || page > lastPage) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const response = await axios.get(route('dashboard.prompts'), {
        params: { page },
      });
      const newPrompts = response.data.data;
      setPrompts(prev => [...prev, ...newPrompts]);
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
    fetchPrompts(1); // Fetch initial prompts
  }, [fetchPrompts]);

  const handleLoadMore = useCallback(() => {
    if (!loading && currentPage < lastPage) {
      fetchPrompts(currentPage + 1);
    }
  }, [loading, currentPage, lastPage, fetchPrompts]);

  const handleEdit = (promptId: number) => {
    router.visit(route('prompt.edit', { id: promptId })); // Redirect to edit page
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route('profile.update')); // Update user profile
  };

  return (
    <WebLayout title="Dashboard">
      <Header />

      {/* Main Content */}
      <main className="py-6 sm:py-8 md:py-10 lg:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="container mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text">
                Welcome, {auth.user.name}
            </h1>
            <p className="mt-2 text-center text-gray-300">
                Here you can manage your prompts and profile settings.
            </p>
        </div>
        </main>
      {/* Top Section */}
      <section className="mx-auto max-w-7xl py-8 px-6 bg-black/20 backdrop-blur-lg shadow-lg rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
      
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center">
          <img
            src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=40c0df&color=ffffff&size=128&rounded=true`}
            alt="Avatar"
            className="h-24 w-24 rounded-full border-2 border-white/10 shadow mb-4"
          />
          <h2 className="text-xl font-semibold text-white">{auth.user.name}</h2>
          <p className="text-gray-300">{auth.user.email}</p>
        </div>

        {/* Update Name and Email Section */}
        <form onSubmit={submit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-white">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-ai-cyan focus:border-ai-cyan"
            />
            <InputError message={errors.name} className="mt-2 text-ai-coral" />
          </div>

          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-white">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-ai-cyan focus:border-ai-cyan"
            />
            <InputError message={errors.email} className="mt-2 text-ai-coral" />
          </div>

          <Button
            type="submit"
            disabled={processing}
            className="w-full bg-ai-cyan text-white py-2 px-4 rounded-md hover:bg-ai-coral transition"
          >
            {processing ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </section>

      {/* Prompts Section */}
      <section className="notes-section mx-auto max-w-7xl py-8 px-6 mt-10 bg-black/20 backdrop-blur-lg shadow-lg rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text uppercase">
            My Prompts
          </h2>
          <Input
            type="text"
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-ai-cyan focus:border-ai-cyan"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.length > 0 ? (
            prompts.map((prompt, i) => (
              <div key={prompt.id} className="relative">
                <NoteCard prompt={prompt} index={i} />
                <button
                  onClick={() => handleEdit(prompt.id)}
                  className="absolute top-2 right-2 bg-ai-cyan text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-ai-coral transition"
                >
                  Edit
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-300 col-span-full text-center">No prompts found.</p>
          )}
        </div>

        {loading && (
          <div className="text-center py-4">
            <p className="animate-pulse text-gray-300">Loading...</p>
          </div>
        )}

        {!loading && currentPage < lastPage && (
          <LoadMoreTrigger onVisible={handleLoadMore} />
        )}
      </section>
    </WebLayout>
  );
}
