import React, { useState } from 'react';
import { Prompt, Tags } from '@/types';
import { Link } from '@inertiajs/react';
import WebLayout from '@/layouts/web-layout';
import { usePage } from '@inertiajs/react'; // Import usePage from @inertiajs/react

interface PromptDetailsProps {
    prompt: Prompt;
    index: number;
}

export default function PromptDetails({ prompt, index }: PromptDetailsProps) {
    const [isCopied, setIsCopied] = useState(false);

    console.log('Prompt Details:', prompt); // Debugging line to check the prompt data


    // Copy prompt to clipboard (reused from NoteCard)
    const copyPrompt = async () => {
        const text = prompt?.prompt || '';
        if (!text) return;

        // Modern clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error('Clipboard write failed', err);
            }
        } else {
            // Fallback method
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            try {
                document.execCommand('copy');
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error('Fallback copy failed', err);
            }

            document.body.removeChild(textarea);
        }
    };

    return (
        <WebLayout title="Home">
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
                <div
                    className=" bg-gray-900 note-card  rounded-2xl p-4 sm:p-6 md:p-8 max-w-3xl w-full hover:shadow-lg hover:shadow-ai-cyan/30 transition-all duration-300"
                    style={{ '--index': index } as React.CSSProperties}
                >
                    {/* Header */}
                    <div className="mb-4 sm:mb-6">
                        <h1 className="text-white/90 text-lg sm:text-xl md:text-2xl font-bold">
                            #{prompt.id} | {prompt.title}
                        </h1>
                        <p className="text-white/70 text-xs sm:text-sm mt-1">
                            Created: {new Date(prompt.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="tags flex flex-wrap gap-2 mb-4 sm:mb-6 min-h-[1.75rem]">
                        {prompt.tags && prompt.tags.length > 0 ? (
                            prompt.tags.map((tag: Tags, idx: number) => (
                                <span
                                    key={idx}
                                    className="tag bg-ai-cyan/20 text-ai-cyan text-xs sm:text-sm font-medium px-3 py-1 rounded-full hover:bg-ai-cyan/40 transition-colors"
                                >
                                    {tag.name}
                                </span>
                            ))
                        ) : (
                            <span className="text-white/70 text-xs sm:text-sm">No tags available</span>
                        )}
                    </div>

                    {/* Prompt Content */}
                    <div className="mb-4 sm:mb-6">
                        <h2 className="text-white/90 text-sm sm:text-base font-semibold mb-2">Prompt Content</h2>
                        <p className="text-white/80 text-xs sm:text-sm bg-gray-800/50 p-4 rounded-lg whitespace-pre-wrap">
                            {prompt.prompt || 'No prompt content available.'}
                        </p>
                    </div>

                    {/* Additional Details */}
                    <div className="mb-4 sm:mb-6">
                        <h2 className="text-white/90 text-sm sm:text-base font-semibold mb-2">Additional Information</h2>
                        <ul className="text-white/80 text-xs sm:text-sm space-y-1">
                            <li className="flex items-center gap-2">
                                <strong className="text-white/90 text-xs sm:text-sm font-semibold">Status : </strong>
                                {prompt.status !== undefined && prompt.status !== null ? (
                                    <span
                                        className={`text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full ${prompt.status === 1
                                            ? 'bg-green-500/20 text-green-500'
                                            : 'bg-red-500/20 text-red-500'
                                            }`}
                                    >
                                        {prompt.status === 1 ? 'Active' : 'Inactive'}
                                    </span>
                                ) : (
                                    <span className="text-white/70 text-xs sm:text-sm">N/A</span>
                                )}
                            </li>
                            <li>
                                <strong>Created By : </strong>
                                {prompt.promptable_id ? (
                                    <>
                                        User ID: {prompt.promptable_id}
                                    </>
                                ) : (
                                    'Unknown'
                                )}
                            </li>
                            <li>
                                <strong>Updated : </strong>
                                {prompt.updated_at ? new Date(prompt.updated_at).toLocaleDateString() : 'N/A'}
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            className={`w-full sm:w-auto text-white font-semibold px-4 sm:px-5 py-2 rounded-full transition-colors text-xs sm:text-sm ${isCopied ? 'bg-green-500 hover:bg-green-500' : 'bg-ai-cyan hover:bg-ai-coral'
                                }`}
                            onClick={copyPrompt}
                        >
                            {isCopied ? 'Copied!' : 'Copy Prompt'}
                        </button>
                        <Link
                            href={route('home')}
                            className="w-full sm:w-auto text-white font-semibold px-4 sm:px-5 py-2 rounded-full transition-colors text-xs sm:text-sm bg-ai-cyan hover:bg-ai-coral text-center"
                        >
                            Back to Prompts
                        </Link>
                    </div>
                </div>
            </div>
        </WebLayout>
    );
}