"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface Project {
  id: string;
  title: string;
  description?: string | null;
  htmlContent?: string | null;
  status: "draft" | "published";
  slug?: string | null;
}

interface PreviewPanelProps {
  project: Project;
}

export function PreviewPanel({ project }: PreviewPanelProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const publishMutation = api.project.publish.useMutation();
  const utils = api.useUtils();

  const handlePublish = async () => {
    if (!project.htmlContent) return;

    setIsPublishing(true);
    try {
      await publishMutation.mutateAsync({ id: project.id });
      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error("Failed to publish:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyCode = async () => {
    if (project.htmlContent) {
      try {
        await navigator.clipboard.writeText(project.htmlContent);
        // TODO: Show toast notification
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  const handleDownload = () => {
    if (project.htmlContent) {
      const blob = new Blob([project.htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Preview Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
            <p className="text-sm text-slate-600">Live preview of your landing page</p>
          </div>

          <div className="flex items-center gap-2">
            {project.htmlContent && (
              <>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  Copy HTML
                </button>

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  Download
                </button>

                {project.status === "draft" && (
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPublishing ? "Publishing..." : "Publish"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {project.htmlContent ? (
          <div className="h-full">
            <iframe
              srcDoc={project.htmlContent}
              className="w-full h-full border-0"
              title="Landing Page Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 text-slate-400 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-slate-900 font-medium mb-1">No preview available</h3>
              <p className="text-slate-600 text-sm">
                Start a conversation to generate your landing page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 