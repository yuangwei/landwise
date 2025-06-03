"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";

export function CreateProjectForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<"modern" | "minimal" | "corporate" | "creative">("modern");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const createProject = api.project.create.useMutation();

  // Check for prompt in URL params (from homepage generation)
  useEffect(() => {
    const urlPrompt = searchParams.get('prompt');
    if (urlPrompt) {
      setPrompt(decodeURIComponent(urlPrompt));
      // Auto-generate a title from the prompt
      const words = urlPrompt.split(' ').slice(0, 4).join(' ');
      setTitle(words + ' Landing Page');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) return;

    setIsLoading(true);
    try {
      const project = await createProject.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        prompt: prompt.trim(),
        style,
      });

      // Redirect to chat page for this project
      if (project?.id) {
        router.push(`/chat/${project.id}`);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Create New Landing Page</h2>
          <p className="text-sm text-slate-600">Describe your landing page and let AI generate it for you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., SaaS Startup Landing Page"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your project"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="style" className="block text-sm font-medium text-slate-700 mb-1">
              Design Style
            </label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value as typeof style)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="corporate">Corporate</option>
              <option value="creative">Creative</option>
            </select>
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-1">
              Describe Your Landing Page
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what kind of landing page you want. Be specific about your product, target audience, key features, and any specific sections you want to include..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !title.trim() || !prompt.trim()}
            className="w-full bg-slate-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create & Generate"}
          </button>
        </form>
      </div>
    </div>
  );
} 