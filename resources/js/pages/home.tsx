import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import Header from '@/components/header';
import NoteCard from '@/components/note-card';
import WebLayout from '@/layouts/web-layout';
import LoadMoreTrigger from '@/components/LoadMoreTrigger';
import { Prompt, Tag } from '@/types';
import axios from 'axios';
import NProgress from 'nprogress';
import { Search, Plus, FileText, FolderTree, Tag as TagIcon, Monitor, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });

interface HomeProps {
  search?: string;
  tags?: Tag[];
  statistics?: {
    total_prompts: number;
    total_categories: number;
    total_tags: number;
    total_platforms: number;
  };
  popular_prompts?: Prompt[];
  recent_prompts?: Prompt[];
  popular_categories?: Array<{
    id: number;
    name: string;
    slug: string;
    prompt_notes_count?: number;
    prompt_count?: number; // Fallback for compatibility
  }>;
}

export default function Home({ search = '', statistics, popular_prompts, recent_prompts, popular_categories }: HomeProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<string>(search);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(search);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const isFetching = useRef(false);
  const isInitialMount = useRef(true);
  const lastPageRef = useRef(1);
  const { auth } = usePage().props;
  const page = usePage<HomeProps>();

  const fetchPrompts = useCallback(async (page = 1, searchQuery = '', categoryId: number | null = null) => {
    // Prevent fetching if already fetching
    if (isFetching.current) {
      console.log('Already fetching, skipping...');
      return;
    }
    
    // Check if page is valid using ref to avoid stale closure
    const currentLastPage = lastPageRef.current;
    if (page > currentLastPage && currentLastPage > 0 && page > 1) {
      console.log(`Page ${page} exceeds last page ${currentLastPage}, skipping...`);
      return;
    }

    isFetching.current = true;
    setLoading(true);
    NProgress.start();

    try {
      const response = await axios.get(route('homedata'), {
        params: { 
          page, 
          search: searchQuery,
          category_id: categoryId || undefined,
        },
      });
      
      console.log('Home API Response:', response.data);
      
      const newPrompts = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('Parsed prompts:', newPrompts.length, newPrompts);
      
      setPrompts(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        if (page === 1) {
          return newPrompts;
        }
        return [...prevArray, ...newPrompts.filter((p: Prompt) => !prevArray.some(existing => existing.id === p.id))];
      });
      
      const newCurrentPage = response.data.current_page || 1;
      const newLastPage = response.data.last_page || 1;
      setCurrentPage(newCurrentPage);
      setLastPage(newLastPage);
      lastPageRef.current = newLastPage; // Update ref
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      console.error('Error response:', (error as any).response?.data);
      // Only clear prompts on error if it's the first page
      if (page === 1) {
        setPrompts([]);
      }
    } finally {
      setLoading(false);
      isFetching.current = false;
      NProgress.done();
    }
  }, [selectedCategory]); // Include selectedCategory in dependencies

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  // Initial load - only run once on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchPrompts(1, debouncedQuery, selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch when debounced search or category changes - but not on initial mount
  useEffect(() => {
    if (!isInitialMount.current) {
      // Reset pagination when search or category changes
      setCurrentPage(1);
      setLastPage(1);
      lastPageRef.current = 1;
      // Don't clear prompts immediately - let the new data replace it
      fetchPrompts(1, debouncedQuery, selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, selectedCategory]);

  const handleLoadMore = useCallback(() => {
    if (!loading && currentPage < lastPageRef.current) {
      fetchPrompts(currentPage + 1, debouncedQuery, selectedCategory);
    }
  }, [loading, currentPage, debouncedQuery, selectedCategory, fetchPrompts]);

  const handleAddPromptClick = () => {
    if (!auth.user) {
      router.visit(route('login'));
      return;
    }
    router.visit(route('prompt.create'));
  };

  const stats = statistics || page.props.statistics;
  const popularPrompts = popular_prompts || page.props.popular_prompts || [];
  const recentPrompts = recent_prompts || page.props.recent_prompts || [];
  const categories = popular_categories || page.props.popular_categories || [];

  return (
    <WebLayout title="Home">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-background border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Discover & Share AI Prompts
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 dark:from-white via-gray-800 dark:via-gray-200 to-black dark:to-gray-400 bg-clip-text text-transparent mb-4">
                Discover AI Prompts
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Explore thousands of powerful AI prompts, organize them efficiently, and boost your productivity
              </p>
            </div>

            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stats.total_prompts || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Prompts</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FolderTree className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stats.total_categories || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Categories</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TagIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stats.total_tags || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Tags</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Monitor className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stats.total_platforms || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Platforms</div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search prompts, tags, or platforms..."
                  className="w-full pl-12 pr-4 py-4 text-base border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-all shadow-sm bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Popular Categories Filter */}
            {categories.length > 0 && !query && (
              <div className="max-w-4xl mx-auto mb-8">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setQuery(''); // Clear search when showing all
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === null
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setQuery(''); // Clear search when category is selected
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {category.name}
                    {(category.prompt_notes_count !== undefined || category.prompt_count !== undefined) && (
                      <span className="ml-1 text-xs opacity-75">({category.prompt_notes_count ?? category.prompt_count ?? 0})</span>
                    )}
                  </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Prompt Button */}
            <div className="flex justify-center">
              <button
                onClick={handleAddPromptClick}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-200 hover:from-black dark:hover:from-gray-100 hover:to-gray-900 dark:hover:to-gray-300 text-white dark:text-gray-900 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Add New Prompt
              </button>
            </div>
          </div>
        </div>

        {/* Popular Prompts Section */}
        {!query && !selectedCategory && popularPrompts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Popular Prompts</h2>
              </div>
              <Link
                href={route('home')}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {popularPrompts.slice(0, 6).map((prompt, i) => (
                <NoteCard
                  key={prompt.id}
                  prompt={prompt}
                  index={i}
                  onDeleted={(id) => {
                    // Handle deletion if needed
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Prompts Grid Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {query ? `Search Results` : selectedCategory ? `Category: ${categories.find(c => c.id === selectedCategory)?.name || 'Selected'}` : !query && !selectedCategory && popularPrompts.length > 0 ? 'All Prompts' : 'Latest Prompts'}
            </h2>
            {query && (
              <p className="text-muted-foreground">
                Found {prompts.length} {prompts.length === 1 ? 'result' : 'results'} for "{query}"
              </p>
            )}
            {!query && selectedCategory && (
              <p className="text-muted-foreground">
                Showing prompts from this category
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.length > 0 ? (
              prompts.map((prompt, i) => (
                <NoteCard
                  key={prompt.id}
                  prompt={prompt}
                  index={i}
                  onDeleted={(id) =>
                    setPrompts((prev) => prev.filter((p) => p.id !== id))
                  }
                />
              ))
            ) : (
              !loading && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">No prompts found.</p>
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="mt-4 text-foreground hover:text-foreground/80 font-medium underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Loading prompts...</p>
            </div>
          )}

          {!loading && currentPage < lastPage && (
            <LoadMoreTrigger onVisible={handleLoadMore} />
          )}
        </div>
      </div>
    </WebLayout>
  );
}
