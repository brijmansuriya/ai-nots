import React from 'react';
import WebLayout from '@/layouts/web-layout';
import Header from '@/components/header';
import { Sparkles, ShieldCheck, Globe, Filter, Clock, Share2, Lightbulb } from 'lucide-react';

export default function About() {
  return (
    <WebLayout title="About AI-Nots">
      <Header />
      <main className="py-6 sm:py-8 md:py-10 lg:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        {/* Hero Section */}
        <section className="bg-black/20 backdrop-blur-lg shadow-lg rounded-3xl py-12 sm:py-16 md:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text mb-6">
            About AI-Nots
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
            AI-Nots is your creative companion for discovering, creating, and sharing powerful AI prompts. Our platform empowers artists, developers, and thinkers to craft, organize, and collaborate on AI-driven ideas with ease.
          </p>
        </section>

        {/* Mission Section */}
        <section className="bg-black/20 backdrop-blur-lg shadow-lg rounded-3xl py-12 sm:py-16 md:py-20 mt-10">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text mb-6">
            Our Mission
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-4xl mx-auto text-center">
            At AI-Nots, we aim to democratize AI creativity by providing a platform where users can seamlessly create, organize, and share prompts. Whether you're building workflows, generating art, or exploring new ideas, we're here to spark your imagination.
          </p>
        </section>

        {/* Features Section */}
        <section className="bg-black/20 backdrop-blur-lg shadow-lg rounded-3xl py-12 sm:py-16 md:py-20 mt-10">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text mb-6">
            Why AI-Nots?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-6">
            <FeatureCard
              icon={<Sparkles className="text-ai-cyan w-10 h-10" />}
              title="Create & Save Prompts"
              description="Craft and store prompts tailored to your needs for quick access."
            />
            <FeatureCard
              icon={<Filter className="text-ai-coral w-10 h-10" />}
              title="Categorize & Filter"
              description="Organize prompts with tags and platforms for fast retrieval."
            />
            <FeatureCard
              icon={<Globe className="text-ai-cyan w-10 h-10" />}
              title="Public Sharing"
              description="Share your prompts globally or explore community ideas."
            />
            <FeatureCard
              icon={<ShieldCheck className="text-ai-coral w-10 h-10" />}
              title="Private Collections"
              description="Keep prompts secure for personal or internal projects."
            />
            <FeatureCard
              icon={<Clock className="text-ai-cyan w-10 h-10" />}
              title="Save Time"
              description="Reuse prompts for repetitive tasks and streamline workflows."
            />
            <FeatureCard
              icon={<Share2 className="text-ai-coral w-10 h-10" />}
              title="Collaborate & Share"
              description="Collaborate with others by sharing your prompts and exploring ideas."
            />
          </div>
        </section>

        {/* How to Use Section */}
        <section className="bg-black/20 backdrop-blur-lg shadow-lg rounded-3xl py-12 sm:py-16 md:py-20 mt-10">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text mb-6">
            How to Use AI-Nots
          </h2>
          <ul className="list-disc list-inside text-gray-300 max-w-3xl mx-auto space-y-4">
            <li>Sign up to access your personalized dashboard.</li>
            <li>Create prompts by entering details and saving them.</li>
            <li>Organize prompts with tags and categories.</li>
            <li>Choose to share prompts publicly or keep them private.</li>
            <li>Explore community prompts for inspiration.</li>
          </ul>
        </section>

        {/* Daily Applications Section */}
        <section className="bg-black/20 backdrop-blur-lg shadow-lg rounded-3xl py-12 sm:py-16 md:py-20 mt-10">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-ai-cyan to-ai-coral text-transparent bg-clip-text mb-6">
            Daily Life Applications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-6">
            <ApplicationCard
              icon={<Lightbulb className="text-ai-cyan w-8 h-8" />}
              description="Generate unique ideas for content, art, and design projects."
            />
            <ApplicationCard
              icon={<Clock className="text-ai-coral w-8 h-8" />}
              description="Streamline repetitive tasks with reusable AI prompts."
            />
            <ApplicationCard
              icon={<Share2 className="text-ai-cyan w-8 h-8" />}
              description="Collaborate with others by sharing and discovering prompts."
            />
          </div>
        </section>
      </main>
    </WebLayout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function ApplicationCard({ icon, description }: { icon: React.ReactNode; description: string }) {
  return (
    <div className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      {icon}
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );
}