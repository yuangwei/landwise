"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_PROMPTS = [
  "A SaaS landing page for a project management tool that helps remote teams collaborate better",
  "A landing page for a fitness app that uses AI to create personalized workout plans",
  "A waitlist page for a new social media platform focused on privacy and authenticity",
  "A landing page for an e-commerce store selling sustainable fashion and eco-friendly clothing",
];

export function LandingPagePreview() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);

    // Redirect to sign up with the prompt in URL params
    const encodedPrompt = encodeURIComponent(prompt.trim());
    router.push(`/api/auth/sign-up?prompt=${encodedPrompt}`);
  };

  const fillExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-2">
              Describe your landing page
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A landing page for my SaaS product that helps teams manage projects better. It should have a hero section, feature highlights, pricing, and a call-to-action..."
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 font-medium">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example, index) => (
                <button
                  key={index}
                  onClick={() => fillExample(example)}
                  className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
                >
                  {example.length > 60 ? `${example.slice(0, 60)}...` : example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="flex-1 bg-slate-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Generating..." : "Generate Landing Page"}
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 sm:w-auto justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Free to try • No credit card required</span>
          </div>
        </div>

        {/* Features Preview */}
        <div className="pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900">30s</div>
              <div className="text-xs text-slate-600">Generation time</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900">100+</div>
              <div className="text-xs text-slate-600">Templates</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900">∞</div>
              <div className="text-xs text-slate-600">Revisions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 