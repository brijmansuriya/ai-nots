import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { router, useForm } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';
import Header from '@/components/Header';
import NoteCard from '@/components/note-card';
import LoadMoreTrigger from '@/components/LoadMoreTrigger';
import FolderTree from '@/components/folder-tree';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { PasswordInput } from '@/components/password-input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Prompt, Folder } from '@/types';
import { Menu, X, Settings, FolderOpen, Move, User, FileText, BarChart3, Bell, Plus, Home, ChevronRight, Folder as FolderIcon, Search, Filter, Download, Copy, ArrowRight, AlertCircle, Upload, Download as DownloadIcon, Lock } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import FolderDialog from '@/components/folder-dialog';
import CommandBar from '@/components/command-bar';
import ImportExportTab from '@/components/import-export-tab';

type TabValue = 'prompts' | 'profile' | 'statistics' | 'import-export';

export default function Dashboard({ auth }: any) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [loading, setLoading] = useState(true); // Start with true to show loading initially
  const [search, setSearch] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<number | 'all' | 'unfoldered' | null>('all');

  // Load active tab from localStorage on mount
  const loadActiveTab = (): TabValue => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dashboardActiveTab');
        if (saved && ['prompts', 'profile', 'statistics', 'import-export'].includes(saved)) {
          return saved as TabValue;
        }
      } catch (error) {
        console.error('Failed to load active tab from localStorage:', error);
      }
    }
    return 'prompts';
  };

  const [activeTab, setActiveTab] = useState<TabValue>(loadActiveTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const isFetching = useRef(false);
  const isInitialMount = useRef(true);
  const lastPageRef = useRef(1);
  const [statistics, setStatistics] = useState<{
    total_prompts: number;
    total_folders: number;
    saved_prompts: number;
    prompts_this_week: number;
    prompts_this_month: number;
    recent_activity: Array<{ id: number; title: string; created_at: string; date: string }>;
  } | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  const { data, setData, patch, processing, errors } = useForm({
    name: auth.user.name || '',
    username: auth.user.username || '',
    email: auth.user.email || '',
  });

  const { data: passwordData, setData: setPasswordData, put: putPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPasswordForm } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const fetchPrompts = useCallback(async (page: number, searchQuery = '', folderId: number | 'all' | 'unfoldered' | null = 'all') => {
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

    try {
      const params: any = { page, search: searchQuery };
      if (folderId !== 'all' && folderId !== null) {
        params.folder_id = folderId;
      }

      console.log('Fetching prompts with params:', params);
      const response = await axios.get(route('dashboard.prompts'), { params });

      // Debug logging
      console.log('Dashboard API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data?.data);

      // Handle different response structures
      let newPrompts: Prompt[] = [];
      if (Array.isArray(response.data)) {
        // If response.data is directly an array
        newPrompts = response.data;
      } else if (Array.isArray(response.data?.data)) {
        // If response.data.data is an array (standard Laravel pagination)
        newPrompts = response.data.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        // Alternative structure
        newPrompts = response.data.items;
      }

      console.log('Parsed prompts:', newPrompts.length, newPrompts);

      setPrompts(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        const result = page === 1 ? newPrompts : [...prevArray, ...newPrompts];
        // Filter out soft-deleted prompts (they shouldn't be draggable)
        const activePrompts = result.filter(p => !(p as any).deleted_at);
        console.log('Setting prompts:', activePrompts.length, '(filtered from', result.length, ')');
        return activePrompts;
      });

      const newCurrentPage = response.data?.current_page || response.data?.currentPage || 1;
      const newLastPage = response.data?.last_page || response.data?.lastPage || 1;
      setCurrentPage(newCurrentPage);
      setLastPage(newLastPage);
      lastPageRef.current = newLastPage; // Update ref
    } catch (error: any) {
      console.error('Failed to fetch prompts:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      // Only clear prompts on error if it's the first page
      if (page === 1) {
        setPrompts([]);
      }
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []); // Empty dependencies to prevent infinite loops

  // Initial load - only run once on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      console.log('Initial mount - fetching prompts...');
      fetchPrompts(1, '', selectedFolderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch when search or folder changes - but not on initial mount
  useEffect(() => {
    if (!isInitialMount.current) {
      console.log('Search or folder changed - fetching prompts...', { search, selectedFolderId });
      // Reset pagination when search or folder changes
      setCurrentPage(1);
      setLastPage(1);
      lastPageRef.current = 1;
      // Don't clear prompts immediately - let the new data replace it
      fetchPrompts(1, search, selectedFolderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedFolderId]);

  const handleLoadMore = useCallback(() => {
    if (!loading && currentPage < lastPageRef.current) {
      fetchPrompts(currentPage + 1, search, selectedFolderId);
    }
  }, [loading, currentPage, fetchPrompts, search, selectedFolderId]);

  // Fetch folders for breadcrumbs
  useEffect(() => {
    const fetchFolderData = async () => {
      try {
        const response = await axios.get(route('folders.tree'));
        const allFolders = response.data.data || [];
        setFolders(allFolders);

        if (selectedFolderId && typeof selectedFolderId === 'number') {
          const findFolder = (folders: Folder[], id: number): Folder | null => {
            for (const folder of folders) {
              if (folder.id === id) return folder;
              if (folder.children) {
                const found = findFolder(folder.children, id);
                if (found) return found;
              }
            }
            return null;
          };
          const folder = findFolder(allFolders, selectedFolderId);
          setSelectedFolder(folder);
        } else {
          setSelectedFolder(null);
        }
      } catch (error) {
        console.error('Failed to fetch folders:', error);
      }
    };

    fetchFolderData();
  }, [selectedFolderId]);

  const handleFolderSelect = useCallback((folderId: number | 'all' | 'unfoldered' | null) => {
    setSelectedFolderId(folderId);
  }, []);

  const handlePromptMove = useCallback(async (promptId: number, folderId: number | null) => {
    // Validate promptId
    if (!promptId || isNaN(promptId)) {
      console.error('Invalid prompt ID:', promptId);
      setErrorMessage('Invalid prompt ID. Please try again.');
      setErrorDialogOpen(true);
      return;
    }

    console.log('handlePromptMove called:', { promptId, folderId, currentPromptsCount: prompts.length });

    // Find the current prompt to check if it's already in the target folder
    const currentPrompt = prompts.find(p => p.id === promptId);
    if (currentPrompt && currentPrompt.folder_id === folderId) {
      console.log('Prompt already in target folder, skipping move');
      return; // No need to move
    }

    // Optimistic update: Update UI immediately
    setPrompts(prev => {
      // If moving to a different folder and we're viewing a specific folder, remove it
      if (selectedFolderId !== 'all' && selectedFolderId !== folderId && selectedFolderId !== null) {
        return prev.filter(p => p.id !== promptId);
      }
      // Otherwise, update the folder_id
      return prev.map(p => {
        if (p.id === promptId) {
          return { ...p, folder_id: folderId };
        }
        return p;
      });
    });

    try {
      // Use direct URL - more reliable than route helper
      const moveUrl = `/api/prompts/${promptId}/move`;

      console.log('Moving prompt:', { promptId, folderId, moveUrl, selectedFolderId });

      const response = await axios.post(moveUrl, {
        folder_id: folderId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      console.log('Move response:', response.data);

      // Check if the move was successful
      if (response.data && response.data.data) {
        console.log('Move successful, refreshing data...');

        // Reset fetching flag first to allow subsequent moves
        isFetching.current = false;

        // Force refresh prompts list - reset to page 1 and clear current list
        setPrompts([]);
        setCurrentPage(1);
        lastPageRef.current = 1;

        // Refresh prompts to get updated data - use current folder filter
        // Use setTimeout to allow the current move operation to complete
        setTimeout(async () => {
          await fetchPrompts(1, search, selectedFolderId);
        }, 100);

        // Also refresh folders to update counts
        setTimeout(async () => {
          try {
            const folderResponse = await axios.get(route('folders.tree'));
            const allFolders = folderResponse.data.data || [];
            setFolders(allFolders);
            console.log('Folders refreshed:', allFolders.length);
          } catch (folderError) {
            console.error('Failed to refresh folders:', folderError);
          }
        }, 200);

        console.log('Data refresh initiated');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Failed to move prompt:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });

      // Revert optimistic update on error by refreshing
      setPrompts([]);
      setCurrentPage(1);
      await fetchPrompts(1, search, selectedFolderId);

      // Show user-friendly error message
      let errorMessage = 'Failed to move prompt. Please try again.';
      if (error.response?.status === 404) {
        // Check if prompt is soft-deleted
        const currentPrompt = prompts.find(p => p.id === promptId);
        if (currentPrompt && (currentPrompt as any).deleted_at) {
          errorMessage = 'This prompt has been deleted and cannot be moved.';
        } else {
          errorMessage = 'Prompt or folder not found. The prompt may have been deleted. Please refresh the page.';
        }
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to move this prompt.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrorMessage(errorMessage);
      setErrorDialogOpen(true);
    }
  }, [search, selectedFolderId, fetchPrompts, prompts]);

  const handleEdit = (promptId: number) => {
    router.visit(route('prompt.edit', { id: promptId })); // Redirect to edit page
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route('profile.update')); // Update user profile
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    putPassword(route('dashboard.password.update'), {
      onSuccess: () => {
        resetPasswordForm();
        setErrorMessage('Password updated successfully!');
        setIsSuccessMessage(true);
        setErrorDialogOpen(true);
      },
      onError: (errors) => {
        console.error('Password update errors:', errors);
        setIsSuccessMessage(false);
      },
    });
  };

  const fetchStatistics = useCallback(async () => {
    setStatisticsLoading(true);
    try {
      const response = await axios.get(route('dashboard.statistics'));
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setStatisticsLoading(false);
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('dashboardActiveTab', activeTab);
      } catch (error) {
        console.error('Failed to save active tab to localStorage:', error);
      }
    }
  }, [activeTab]);

  // Fetch statistics when Statistics tab is opened
  useEffect(() => {
    if (activeTab === 'statistics' && !statistics) {
      fetchStatistics();
    }
  }, [activeTab, statistics, fetchStatistics]);

  // Calculate statistics (fallback to local data if API data not available)
  const totalPrompts = statistics?.total_prompts ?? prompts.length;
  const totalFolders = statistics?.total_folders ?? 0;
  const savedPrompts = statistics?.saved_prompts ?? prompts.filter(p => p.is_saved).length;

  return (
    <WebLayout title="Dashboard">
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors min-h-screen">
        {/* Main Content */}
        <main className="py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-[1440px] mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 dark:from-white to-black dark:to-gray-300 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Welcome back, {auth.user.name}
                  </p>
                </div>

                {/* Mobile Folder Menu Button */}
                <div className="md:hidden">
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Menu className="w-4 h-4" />
                        <span>Folders</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0">
                      <div className="p-4">
                        <FolderTree
                          selectedFolderId={selectedFolderId}
                          onFolderSelect={(id) => {
                            handleFolderSelect(id);
                            setSidebarOpen(false);
                          }}
                          onPromptMove={handlePromptMove}
                          onFoldersRefresh={async () => {
                            // Refresh folders after prompt move
                            try {
                              const response = await axios.get(route('folders.tree'));
                              const allFolders = response.data.data || [];
                              setFolders(allFolders);
                            } catch (error) {
                              console.error('Failed to refresh folders:', error);
                            }
                          }}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>


              {/* Tab Navigation */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                  <TabsTrigger value="prompts" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">My Prompts</span>
                    <span className="sm:hidden">Prompts</span>
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="statistics" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Statistics</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger value="import-export" className="flex items-center gap-2">
                    <DownloadIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Import/Export</span>
                    <span className="sm:hidden">I/E</span>
                  </TabsTrigger>
                </TabsList>

                {/* Tab Content */}
                {/* Prompts Tab */}
                <TabsContent value="prompts" className="mt-6">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Folder Sidebar - Desktop */}
                    <aside className="hidden lg:block w-[320px] lg:w-[350px] flex-shrink-0">
                      <div className="bg-card border border-border rounded-xl p-4 sticky top-4 shadow-sm">
                        <FolderTree
                          selectedFolderId={selectedFolderId}
                          onFolderSelect={handleFolderSelect}
                          onPromptMove={handlePromptMove}
                          onFoldersRefresh={async () => {
                            // Refresh folders after prompt move
                            try {
                              const response = await axios.get(route('folders.tree'));
                              const allFolders = response.data.data || [];
                              setFolders(allFolders);
                            } catch (error) {
                              console.error('Failed to refresh folders:', error);
                            }
                          }}
                        />
                      </div>
                    </aside>

                    {/* Prompts Content */}
                    <div className="flex-1 min-w-0">
                      <section className="bg-card border border-border shadow-sm rounded-xl p-4 sm:p-6 lg:p-8 transition-colors">
                        {/* Breadcrumb Navigation - Shows folder path */}
                        <div className="mb-6 pb-4 border-b border-border">
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <Breadcrumb>
                              <BreadcrumbList className="flex-wrap items-center">
                                <BreadcrumbItem>
                                  <BreadcrumbLink
                                    onClick={() => handleFolderSelect('all')}
                                    className="cursor-pointer flex items-center gap-1.5 text-muted-foreground hover:text-primary font-medium transition-colors"
                                  >
                                    <Home className="w-4 h-4" />
                                    <span>All Prompts</span>
                                  </BreadcrumbLink>
                                </BreadcrumbItem>
                                {selectedFolderId !== 'all' && selectedFolderId !== 'unfoldered' && selectedFolder && (
                                  <>
                                    <BreadcrumbSeparator>
                                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </BreadcrumbSeparator>
                                    <BreadcrumbItem>
                                      <BreadcrumbPage className="flex items-center gap-1.5 text-foreground font-semibold">
                                        <FolderIcon className="w-4 h-4 text-primary" />
                                        <span>{selectedFolder.name}</span>
                                      </BreadcrumbPage>
                                    </BreadcrumbItem>
                                  </>
                                )}
                                {selectedFolderId === 'unfoldered' && (
                                  <>
                                    <BreadcrumbSeparator>
                                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </BreadcrumbSeparator>
                                    <BreadcrumbItem>
                                      <BreadcrumbPage className="flex items-center gap-1.5 text-foreground font-semibold">
                                        <FolderIcon className="w-4 h-4 text-muted-foreground" />
                                        <span>Unfoldered</span>
                                      </BreadcrumbPage>
                                    </BreadcrumbItem>
                                  </>
                                )}
                              </BreadcrumbList>
                            </Breadcrumb>
                            <Button
                              onClick={() => setShowCreateFolderDialog(true)}
                              size="sm"
                              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="hidden sm:inline">Create Folder</span>
                              <span className="sm:hidden">New</span>
                            </Button>
                          </div>
                        </div>

                        {/* Section Header - Premium Design */}
                        <div className="mb-8">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm">
                                <FolderOpen className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h2 className="text-[32px] sm:text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                                  {selectedFolderId === 'all' ? 'My Prompts' : selectedFolderId === 'unfoldered' ? 'Unfoldered Prompts' : selectedFolder ? (
                                    <span>{selectedFolder.name}</span>
                                  ) : 'My Prompts'}
                                </h2>
                                <div className="flex items-center gap-3">
                                  <p className="text-[15px] text-muted-foreground">
                                    <span className="font-bold text-foreground">{prompts.length}</span> {prompts.length === 1 ? 'prompt' : 'prompts'}
                                    {selectedFolderId !== 'all' && selectedFolderId !== 'unfoldered' && selectedFolder && ` in this folder`}
                                  </p>
                                  {prompts.length > 0 && (
                                    <span className="text-xs text-muted-foreground">•</span>
                                  )}
                                  {prompts.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono">⌘K</kbd> to search
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-1 lg:flex-initial lg:max-w-md">
                              <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <Input
                                  type="text"
                                  placeholder="Search prompts..."
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                  className="w-full pl-9 pr-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 h-10"
                                />
                                {search && (
                                  <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-md transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                                  </button>
                                )}
                              </div>
                              <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[160px] bg-background border-border h-10 text-foreground">
                                  <div className="flex items-center gap-2 flex-1">
                                    <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <SelectValue placeholder="Sort by" className="text-foreground" />
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                  <SelectItem value="latest" className="text-foreground focus:bg-accent focus:text-accent-foreground">Latest</SelectItem>
                                  <SelectItem value="a-z" className="text-foreground focus:bg-accent focus:text-accent-foreground">A-Z</SelectItem>
                                  <SelectItem value="z-a" className="text-foreground focus:bg-accent focus:text-accent-foreground">Z-A</SelectItem>
                                  <SelectItem value="popular" className="text-foreground focus:bg-accent focus:text-accent-foreground">Most Popular</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Help Banner - Premium Design */}
                        {prompts.length > 0 && selectedFolderId === 'all' && folders.length === 0 && (
                          <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl shadow-sm">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                  <Move className="w-5 h-5 text-primary" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground mb-1.5">
                                  Organize Your Prompts with Folders
                                </p>
                                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                  Create folders to organize your prompts. Drag any prompt card onto a folder to move it.
                                </p>
                                <Button
                                  onClick={() => setShowCreateFolderDialog(true)}
                                  size="sm"
                                  variant="outline"
                                  className="border-primary/30 text-primary hover:bg-primary/10"
                                >
                                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                                  Create Your First Folder
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                          <div className="text-center py-16">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-muted border-t-primary mb-4"></div>
                            <p className="text-muted-foreground font-medium">Loading prompts...</p>
                          </div>
                        )}

                        {/* Prompts Grid - Premium Layout */}
                        {!loading && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 auto-rows-fr">
                            {prompts.length > 0 ? (
                              prompts.map((prompt, i) => (
                                <NoteCard
                                  key={prompt.id}
                                  prompt={prompt}
                                  index={i}
                                  onDeleted={(id) =>
                                    setPrompts((prev) => prev.filter((p) => p.id !== id))
                                  }
                                  isDraggable={true}
                                />
                              ))
                            ) : (
                              <div className="col-span-full text-center py-24">
                                <div className="inline-flex items-center justify-center w-28 h-28 rounded-2xl bg-gradient-to-br from-muted to-muted/50 border border-border mb-6 shadow-sm">
                                  <FolderOpen className="w-14 h-14 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">
                                  No prompts found
                                </h3>
                                <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto leading-relaxed">
                                  {search
                                    ? 'Try a different search term or clear the search to see all prompts.'
                                    : selectedFolderId === 'unfoldered'
                                      ? 'All your prompts are organized in folders. Check other folders to find your prompts.'
                                      : 'Get started by creating your first prompt or organizing existing ones into folders.'
                                  }
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                  {search && (
                                    <Button
                                      variant="outline"
                                      onClick={() => setSearch('')}
                                      className="border-border hover:bg-accent"
                                    >
                                      Clear Search
                                    </Button>
                                  )}
                                  {!search && (
                                    <Button
                                      onClick={() => router.visit('/prompt/create')}
                                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Create Your First Prompt
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Load More */}
                        {!loading && currentPage < lastPage && (
                          <LoadMoreTrigger onVisible={handleLoadMore} />
                        )}
                      </section>
                    </div>
                  </div>
                </TabsContent>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-6">
                  <section className="bg-card border border-border shadow-sm rounded-xl p-6 lg:p-8 transition-colors">
                    <div className="max-w-3xl mx-auto">
                      <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Profile Settings</h2>
                        <p className="text-sm text-muted-foreground">
                          Manage your account information and preferences
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

                        {/* Profile Avatar Section */}
                        <div className="flex flex-col items-center text-center md:col-span-1">
                          <div className="relative mb-4">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name || auth.user.email || 'User')}&background=6366f1&color=ffffff&size=128&rounded=true`}
                              alt="Avatar"
                              className="h-32 w-32 rounded-full border-4 border-border shadow-lg"
                            />
                            <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full border-4 border-card flex items-center justify-center shadow-md">
                              <User className="w-5 h-5 text-primary-foreground" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-foreground mb-1">
                            {auth.user.name || 'No name set'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {auth.user.email || 'No email set'}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Member since</span>
                            <span>{auth.user.created_at ? new Date(auth.user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                          </div>
                        </div>

                        {/* Profile Form Section */}
                        <div className="md:col-span-2">
                          <form onSubmit={submit} className="space-y-5">
                            <div>
                              <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                                Full Name
                              </Label>
                              <Input
                                id="name"
                                type="text"
                                value={data.name || ''}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter your full name"
                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                              />
                              <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div>
                              <Label htmlFor="username" className="text-sm font-medium text-foreground mb-2 block">
                                Username
                              </Label>
                              <Input
                                id="username"
                                type="text"
                                value={data.username || ''}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="Enter your username"
                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                              />
                              <InputError message={errors.username} className="mt-1" />
                            </div>

                            <div>
                              <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                                Email Address
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                value={data.email || ''}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Enter your email address"
                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                              />
                              <InputError message={errors.email} className="mt-1" />
                              <p className="text-xs text-muted-foreground mt-1">
                                We'll never share your email with anyone else.
                              </p>
                            </div>

                            <div className="pt-4 border-t border-border">
                              <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                {processing ? (
                                  <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Saving...
                                  </>
                                ) : (
                                  'Save Changes'
                                )}
                              </Button>
                            </div>
                          </form>
                        </div>
                      </div>

                      {/* Password Change Section */}
                      <div className="mt-8 pt-8 border-t border-border">
                        <div className="mb-6 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                            <Lock className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-1">Change Password</h3>
                            <p className="text-sm text-muted-foreground">
                              Update your password to keep your account secure
                            </p>
                          </div>
                        </div>

                        <form onSubmit={submitPassword} className="space-y-5 max-w-2xl">
                          <div>
                            <Label htmlFor="current_password" className="text-sm font-medium text-foreground mb-2 block">
                              Current Password
                            </Label>
                            <PasswordInput
                              id="current_password"
                              value={passwordData.current_password}
                              onChange={(e) => setPasswordData('current_password', e.target.value)}
                              placeholder="Enter your current password"
                              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                            />
                            <InputError message={passwordErrors.current_password} className="mt-1" />
                          </div>

                          <div>
                            <Label htmlFor="password" className="text-sm font-medium text-foreground mb-2 block">
                              New Password
                            </Label>
                            <PasswordInput
                              id="password"
                              value={passwordData.password}
                              onChange={(e) => setPasswordData('password', e.target.value)}
                              placeholder="Enter your new password"
                              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                            />
                            <InputError message={passwordErrors.password} className="mt-1" />
                            <p className="text-xs text-muted-foreground mt-1">
                              Password must be at least 8 characters long
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="password_confirmation" className="text-sm font-medium text-foreground mb-2 block">
                              Confirm New Password
                            </Label>
                            <PasswordInput
                              id="password_confirmation"
                              value={passwordData.password_confirmation}
                              onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                              placeholder="Confirm your new password"
                              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                            />
                            <InputError message={passwordErrors.password_confirmation} className="mt-1" />
                          </div>

                          <div className="pt-2">
                            <Button
                              type="submit"
                              disabled={passwordProcessing}
                              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              {passwordProcessing ? (
                                <>
                                  <span className="animate-spin mr-2">⏳</span>
                                  Updating Password...
                                </>
                              ) : (
                                'Update Password'
                              )}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </section>
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="statistics" className="mt-6">
                  <section className="bg-card border border-border shadow-sm rounded-xl p-6 lg:p-8 transition-colors">
                    <div className="mb-6">
                      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Statistics</h2>
                      <p className="text-sm text-muted-foreground">
                        Overview of your prompts and activity
                      </p>
                    </div>

                    {statisticsLoading ? (
                      <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-muted border-t-primary mb-4"></div>
                        <p className="text-muted-foreground font-medium">Loading statistics...</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                          {/* Total Prompts Card */}
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-3xl font-bold text-primary mb-1">{totalPrompts}</div>
                            <div className="text-sm text-muted-foreground">Total Prompts</div>
                          </div>

                          {/* Saved Prompts Card */}
                          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <Bell className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-3xl font-bold text-green-900 dark:text-green-300 mb-1">{savedPrompts}</div>
                            <div className="text-sm text-green-700 dark:text-green-400">Saved Prompts</div>
                          </div>

                          {/* Folders Card */}
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <FolderOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-3xl font-bold text-purple-900 dark:text-purple-300 mb-1">{totalFolders}</div>
                            <div className="text-sm text-purple-700 dark:text-purple-400">Folders</div>
                          </div>

                          {/* This Month Card */}
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <BarChart3 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="text-3xl font-bold text-orange-900 dark:text-orange-300 mb-1">{statistics?.prompts_this_month ?? 0}</div>
                            <div className="text-sm text-orange-700 dark:text-orange-400">This Month</div>
                          </div>
                        </div>

                        {/* Additional Stats Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Weekly Stats */}
                          <div className="bg-muted/50 border border-border rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-primary" />
                              Weekly Activity
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                <span className="text-sm text-muted-foreground">Prompts created this week</span>
                                <span className="text-lg font-bold text-foreground">{statistics?.prompts_this_week ?? 0}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                <span className="text-sm text-muted-foreground">Prompts created this month</span>
                                <span className="text-lg font-bold text-foreground">{statistics?.prompts_this_month ?? 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* Recent Activity */}
                          <div className="bg-muted/50 border border-border rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                              <Bell className="w-5 h-5 text-primary" />
                              Recent Activity
                            </h3>
                            <div className="space-y-3">
                              {statistics?.recent_activity && statistics.recent_activity.length > 0 ? (
                                statistics.recent_activity.map((activity) => (
                                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-accent transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                                      <p className="text-xs text-muted-foreground">{activity.created_at}</p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                                  <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                                  <div className="flex-1">
                                    <p className="text-sm text-foreground">No recent activity</p>
                                    <p className="text-xs text-muted-foreground">Your activity will appear here</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </section>
                </TabsContent>

                {/* Import/Export Tab */}
                <TabsContent value="import-export" className="mt-6">
                  <ImportExportTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Create Folder Dialog */}
      {showCreateFolderDialog && (
        <FolderDialog
          folder={null}
          parentId={typeof selectedFolderId === 'number' ? selectedFolderId : null}
          onClose={() => setShowCreateFolderDialog(false)}
          onSuccess={() => {
            setShowCreateFolderDialog(false);
            // Refresh folders if needed
            window.location.reload();
          }}
        />
      )}

      {/* Command Bar */}
      <CommandBar
        folders={folders}
        onNewPrompt={() => router.visit('/prompt/create')}
        onNewFolder={() => setShowCreateFolderDialog(true)}
      />

      {/* Floating New Prompt Button */}
      <Button
        onClick={() => router.visit('/prompt/create')}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Error/Success Dialog */}
      <AlertDialog open={errorDialogOpen} onOpenChange={(open) => {
        setErrorDialogOpen(open);
        if (!open) setIsSuccessMessage(false);
      }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              {isSuccessMessage ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Success
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Error
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className={`${isSuccessMessage ? 'text-foreground' : 'text-muted-foreground'}`}>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setErrorDialogOpen(false);
                setIsSuccessMessage(false);
              }}
              className={isSuccessMessage ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </WebLayout>
  );
}
