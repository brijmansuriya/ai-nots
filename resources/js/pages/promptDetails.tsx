import React from 'react';
import { Prompt, Tags } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';
import {
    WhatsappShareButton,
    TwitterShareButton,
    FacebookShareButton,
    LinkedinShareButton,
    TelegramShareButton,
    WhatsappIcon,
    TwitterIcon,
    FacebookIcon,
    LinkedinIcon,
    TelegramIcon
} from 'react-share';
import { ArrowLeft, Calendar, User, Clock, Tag as TagIcon, Share2, ExternalLink, Maximize2, Image as ImageIcon, Download, ChevronDown, Code, Pencil, Trash2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { EmbedModal } from '@/components/embed-modal';
import { CopyLinkButton } from '@/components/ui/copy-link-button';
import { SaveButton } from '@/components/ui/save-button';
import { LikeButton } from '@/components/ui/like-button';
import { MetricsDisplay } from '@/components/ui/metrics-display';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PromptDetailsProps {
    prompt: Prompt;
    recentPrompts?: Prompt[];
    index?: number;
    shareUrl?: string;
    ogImageUrl?: string;
}

export default function PromptDetails({ prompt, recentPrompts = [], index = 0, shareUrl: propShareUrl, ogImageUrl }: PromptDetailsProps) {
    const [imageModalOpen, setImageModalOpen] = React.useState(false);
    const [embedModalOpen, setEmbedModalOpen] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    const isOwner = user && prompt.promptable_id === user.id;
    const shareUrl = propShareUrl || window.location.href;
    const shareTitle = `Check out this AI prompt: ${prompt.title}`;
    const canEmbed = (prompt.is_public == 1 && prompt.status == 1) || isOwner;
    const isDark = document.documentElement.classList.contains('dark');
    const iconColor = isDark ? '#ffffff' : '#000000';
    const imageUrl = (prompt as any).image_url;

    // View tracking is handled by the backend when the page loads
    // No need to track again on frontend to avoid duplicates

    // Export functions
    const exportToMarkdown = () => {
        const tags = prompt.tags?.map(tag => tag.name).join(', ') || 'None';
        const content = `# ${prompt.title}

${prompt.description ? `## Description\n\n${prompt.description}\n\n` : ''}## Prompt

\`\`\`
${prompt.prompt || 'No prompt content available.'}
\`\`\`

${prompt.tags && prompt.tags.length > 0 ? `## Tags\n\n${tags}\n\n` : ''}## Metadata

- **ID**: ${prompt.id}
- **Created**: ${new Date(prompt.created_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
${prompt.updated_at && prompt.updated_at !== prompt.created_at ? `- **Updated**: ${new Date(prompt.updated_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}
- **Status**: ${prompt.status === 1 ? 'Active' : 'Inactive'}
`;

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportToJSON = () => {
        const data = {
            id: prompt.id,
            title: prompt.title,
            description: prompt.description || null,
            prompt: prompt.prompt || null,
            tags: prompt.tags?.map(tag => tag.name) || [],
            status: prompt.status,
            created_at: prompt.created_at,
            updated_at: prompt.updated_at || null,
            metadata: {
                save_count: prompt.save_count ?? 0,
                copy_count: prompt.copy_count ?? 0,
                likes_count: prompt.likes_count ?? 0,
                views_count: prompt.views_count ?? 0,
                popularity_score: prompt.popularity_score ?? 0,
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportToTXT = () => {
        const tags = prompt.tags?.map(tag => tag.name).join(', ') || 'None';
        const content = `${prompt.title}
${'='.repeat(prompt.title.length)}

${prompt.description ? `${prompt.description}\n\n` : ''}PROMPT:
${'-'.repeat(50)}
${prompt.prompt || 'No prompt content available.'}
${'-'.repeat(50)}

${prompt.tags && prompt.tags.length > 0 ? `TAGS: ${tags}\n\n` : ''}METADATA:
- ID: ${prompt.id}
- Created: ${new Date(prompt.created_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
${prompt.updated_at && prompt.updated_at !== prompt.created_at ? `- Updated: ${new Date(prompt.updated_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n` : ''}- Status: ${prompt.status === 1 ? 'Active' : 'Inactive'}
`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Build meta description
    const metaDescription = prompt.description
        ? `${prompt.description.substring(0, 160)}...`
        : `Check out this AI prompt: ${prompt.title}`;

    return (
        <WebLayout
            title={`${prompt.title} | AI Notes`}
            description={metaDescription}
            ogImage={ogImageUrl || (prompt as any).image_url}
            ogUrl={shareUrl}
        >
            <div className="min-h-screen bg-background transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Back Button */}
                    <Link
                        href={route('home')}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Prompts</span>
                    </Link>

                    {/* Main Layout: Two Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left Column: Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Header Card */}
                            <div className="bg-card rounded-xl border border-border shadow-lg p-6 sm:p-8 transition-colors">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-md">
                                                #{prompt.id}
                                            </span>
                                            <div className="flex-1 flex items-center justify-between gap-4 flex-wrap">
                                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                                                    {prompt.title}
                                                </h1>
                                                <div className="flex items-center gap-2">
                                                    {canEmbed && (
                                                        <Button
                                                            onClick={() => setEmbedModalOpen(true)}
                                                            variant="outline"
                                                            size="sm"
                                                            title="Embed this prompt"
                                                            className="gap-2"
                                                        >
                                                            <Code className="w-4 h-4" />
                                                            <span>Embed</span>
                                                        </Button>
                                                    )}
                                                    <CopyLinkButton url={shareUrl} variant="outline" size="sm" />
                                                </div>
                                            </div>
                                        </div>

                                        {prompt.description && (
                                            <p className="text-muted-foreground text-base sm:text-lg mb-4">
                                                {prompt.description}
                                            </p>
                                        )}

                                        {/* Meta Information */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>Created {new Date(prompt.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                            {prompt.updated_at && prompt.updated_at !== prompt.created_at && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Updated {new Date(prompt.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Share Buttons */}
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Share2 className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground">Share</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <WhatsappShareButton url={shareUrl} title={shareTitle}>
                                                <div className="p-2 rounded-lg bg-secondary hover:bg-muted transition-all duration-200 hover:scale-110 border border-border">
                                                    <WhatsappIcon size={18} round bgStyle={{ fill: 'transparent' }} iconFillColor={iconColor} />
                                                </div>
                                            </WhatsappShareButton>

                                            <TwitterShareButton url={shareUrl} title={shareTitle}>
                                                <div className="p-2 rounded-lg bg-secondary hover:bg-muted transition-all duration-200 hover:scale-110 border border-border">
                                                    <TwitterIcon size={18} round bgStyle={{ fill: 'transparent' }} iconFillColor={iconColor} />
                                                </div>
                                            </TwitterShareButton>

                                            <FacebookShareButton url={shareUrl} title={shareTitle}>
                                                <div className="p-2 rounded-lg bg-secondary hover:bg-muted transition-all duration-200 hover:scale-110 border border-border">
                                                    <FacebookIcon size={18} round bgStyle={{ fill: 'transparent' }} iconFillColor={iconColor} />
                                                </div>
                                            </FacebookShareButton>

                                            <LinkedinShareButton url={shareUrl} title={shareTitle}>
                                                <div className="p-2 rounded-lg bg-secondary hover:bg-muted transition-all duration-200 hover:scale-110 border border-border">
                                                    <LinkedinIcon size={18} round bgStyle={{ fill: 'transparent' }} iconFillColor={iconColor} />
                                                </div>
                                            </LinkedinShareButton>

                                            <TelegramShareButton url={shareUrl} title={shareTitle}>
                                                <div className="p-2 rounded-lg bg-secondary hover:bg-muted transition-all duration-200 hover:scale-110 border border-border">
                                                    <TelegramIcon size={18} round bgStyle={{ fill: 'transparent' }} iconFillColor={iconColor} />
                                                </div>
                                            </TelegramShareButton>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image Card - Show if image exists */}
                            {imageUrl && (
                                <div className="bg-card rounded-xl border border-border shadow-lg p-6 sm:p-8 transition-colors">
                                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 flex-shrink-0" />
                                        Output Image
                                    </h2>
                                    <div className="relative group">
                                        <img
                                            src={imageUrl}
                                            alt={prompt.title}
                                            className="w-full h-auto rounded-lg border border-border shadow-md"
                                        />
                                        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
                                            <DialogTrigger asChild>
                                                <button
                                                    className="absolute top-4 right-4 p-3 bg-black/70 dark:bg-white/70 text-white dark:text-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 dark:hover:bg-white/90 flex items-center gap-2"
                                                    title="View full image"
                                                >
                                                    <Maximize2 className="w-4 h-4" />
                                                    <span className="text-sm font-medium">View Full</span>
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 bg-black/95 border-none overflow-hidden">
                                                <div className="relative w-full h-full flex items-center justify-center p-4">
                                                    <img
                                                        src={imageUrl}
                                                        alt={prompt.title}
                                                        className="max-w-full max-h-full object-contain rounded-lg"
                                                    />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            )}

                            {/* Prompt Content Card */}
                            <div className="bg-card rounded-xl border border-border shadow-lg p-6 sm:p-8 transition-colors">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></span>
                                    Prompt Content
                                </h2>
                                <div className="bg-muted/30 rounded-xl p-6 border border-border transition-colors">
                                    <pre className="text-sm sm:text-base text-foreground whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                                        {prompt.prompt || 'No prompt content available.'}
                                    </pre>
                                </div>
                            </div>

                            {/* Additional Information Card */}
                            <div className="bg-card rounded-xl border border-border shadow-lg p-6 sm:p-8 transition-colors">
                                <h2 className="text-xl font-bold text-foreground mb-4">Additional Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Status</h3>
                                        {(() => {
                                            const s = (prompt as any).status;
                                            const v = s === 1 || s === '1' ? 'Active' : s === 0 || s === '0' ? 'Pending' : s === 2 || s === '2' ? 'Rejected' : 'Unknown';
                                            const cls =
                                                v === 'Active'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                    : v === 'Pending'
                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                                            return s !== undefined && s !== null ? (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${cls}`}>{v}</span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">N/A</span>
                                            );
                                        })()}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Visibility</h3>
                                        {(() => {
                                            const p = (prompt as any).is_public;
                                            const v = p === 1 || p === '1' ? 'Public' : p === 2 || p === '2' ? 'Unlisted' : 'Private';
                                            const cls =
                                                v === 'Public'
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                    : v === 'Unlisted'
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
                                            return p !== undefined && p !== null ? (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${cls}`}>{v}</span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">N/A</span>
                                            );
                                        })()}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Created By</h3>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-foreground text-sm">
                                                {prompt.promptable?.username || prompt.promptable?.name || `User ID: ${prompt.promptable_id}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics Display */}
                            {(prompt.save_count !== undefined || prompt.copy_count !== undefined ||
                                prompt.likes_count !== undefined || prompt.views_count !== undefined) && (
                                    <div className="bg-card rounded-xl border border-border shadow-lg p-6 sm:p-8 transition-colors">
                                        <h2 className="text-xl font-bold text-foreground mb-4">Metrics</h2>
                                        <MetricsDisplay
                                            saveCount={prompt.save_count ?? 0}
                                            copyCount={prompt.copy_count ?? 0}
                                            likesCount={prompt.likes_count ?? 0}
                                            viewsCount={prompt.views_count ?? 0}
                                            popularityScore={prompt.popularity_score ?? 0}
                                            showLabels={true}
                                        />
                                    </div>
                                )}

                            {/* Action Buttons Section */}
                            <div className="bg-card rounded-xl border border-border shadow-lg p-4 sm:p-6 transition-colors">
                                <div className="flex flex-wrap items-center justify-between gap-4">

                                    {/* Left Side: Primary Actions & Utilities */}
                                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                                        <CopyButton
                                            value={prompt.prompt}
                                            label="Copy Prompt"
                                            copiedLabel="Copied!"
                                            promptId={prompt.id}
                                            className="flex-1 sm:flex-initial"
                                            variant="primary"
                                        />

                                        {canEmbed && (
                                            <button
                                                onClick={() => setEmbedModalOpen(true)}
                                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white transition-all duration-200 shadow-md hover:shadow-lg border-none"
                                            >
                                                <Code className="w-4 h-4" />
                                                <span className="hidden sm:inline">Embed Widget</span>
                                                <span className="sm:hidden">Embed</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Middle Section: Interactions & Owner Tools */}
                                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-center flex-1">
                                        {isOwner && (
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('prompt.versions', prompt.id)}
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-card border border-amber-500/50 dark:border-amber-400/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200"
                                                >
                                                    <History className="w-4 h-4" />
                                                    <span className="hidden md:inline">Versions</span>
                                                </Link>
                                                <Link
                                                    href={route('prompt.edit', prompt.id)}
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:border dark:border-zinc-700"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    <span className="hidden md:inline">Edit</span>
                                                </Link>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 ml-auto lg:ml-0">
                                            {user && (
                                                <>
                                                    <SaveButton
                                                        promptId={prompt.id}
                                                        isSaved={prompt.is_saved ?? false}
                                                        saveCount={prompt.save_count ?? 0}
                                                        className="h-9 px-3"
                                                        size="sm"
                                                        variant="ghost"
                                                    />
                                                    <LikeButton
                                                        promptId={prompt.id}
                                                        isLiked={prompt.is_liked ?? false}
                                                        likesCount={prompt.likes_count ?? 0}
                                                        className="h-9 px-3"
                                                        size="sm"
                                                        variant="ghost"
                                                    />
                                                </>
                                            )}

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="h-9 inline-flex items-center justify-center gap-2 px-3 rounded-lg font-semibold text-sm bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                                                        <Download className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Export</span>
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-card border border-border min-w-[180px]">
                                                    <DropdownMenuItem onClick={exportToMarkdown} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                                        <span className="text-sm">Export as Markdown (.md)</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={exportToJSON} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                                        <span className="text-sm">Export as JSON (.json)</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-border" />
                                                    <DropdownMenuItem onClick={exportToTXT} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                                        <span className="text-sm">Export as Text (.txt)</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Right Side: Navigation & Delete */}
                                    <div className="flex items-center gap-2 w-full lg:w-auto lg:justify-end">
                                        <Link
                                            href={route('home')}
                                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            <span>Back to Home</span>
                                        </Link>

                                        {isOwner && (
                                            <button
                                                onClick={() => setDeleteDialogOpen(true)}
                                                className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 border border-red-200 dark:border-red-900/30 shadow-sm"
                                                title="Delete Prompt"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Tags Section */}
                            {prompt.tags && prompt.tags.length > 0 && (
                                <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6 sticky top-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TagIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tags</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {prompt.tags.map((tag: Tags, idx: number) => (
                                            <Link
                                                key={idx}
                                                href={route('home', { search: tag.name })}
                                                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                                            >
                                                {tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Prompts Section */}
                            {recentPrompts && recentPrompts.length > 0 && (
                                <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6 sticky top-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Prompts</h3>
                                    <div className="space-y-4">
                                        {recentPrompts.map((recentPrompt: Prompt) => (
                                            <Link
                                                key={recentPrompt.id}
                                                href={route('prompt.show', recentPrompt.id)}
                                                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-white hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 line-clamp-2 flex-1">
                                                        {recentPrompt.title}
                                                    </h4>
                                                    <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                                                </div>
                                                {recentPrompt.description && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                                        {recentPrompt.description}
                                                    </p>
                                                )}
                                                {recentPrompt.tags && recentPrompt.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {recentPrompt.tags.slice(0, 2).map((tag: Tags) => (
                                                            <span
                                                                key={tag.id}
                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                                                            >
                                                                {tag.name}
                                                            </span>
                                                        ))}
                                                        {recentPrompt.tags.length > 2 && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                                                                +{recentPrompt.tags.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <EmbedModal
                promptId={prompt.id}
                open={embedModalOpen}
                onOpenChange={setEmbedModalOpen}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900 dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                            This action cannot be undone. This will permanently delete your prompt
                            <span className="font-semibold px-1 text-gray-900 dark:text-white">"{prompt.title}"</span>
                            and remove all its data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                router.delete(route('prompt.destroy', prompt.id), {
                                    onSuccess: () => {
                                        setDeleteDialogOpen(false);
                                    }
                                });
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                        >
                            Delete Prompt
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </WebLayout>
    );
}
