"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export function ProjectList() {
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data: projects, isLoading, error } = api.project.list.useQuery({
    limit,
    offset: page * limit,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Projects</h2>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="text-center py-8">
          <p className="text-slate-600">Failed to load projects. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Your Projects</h2>
          <p className="text-sm text-slate-600">Manage your landing page projects.</p>
        </div>

        {!projects || projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 text-slate-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-medium mb-1">No projects yet</h3>
            <p className="text-slate-600 text-sm">Create your first landing page project to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-slate-900 truncate">{project.title}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${project.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-slate-600 mt-1 truncate">{project.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Updated {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/chat/${project.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                  >
                    Edit
                  </Link>

                  {project.status === "published" && project.slug && (
                    <Link
                      href={`/p/${project.slug}`}
                      target="_blank"
                      className="inline-flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                    >
                      View Live
                    </Link>
                  )}

                  {project.status === "draft" && project.htmlContent && (
                    <button
                      onClick={() => {/* TODO: Implement publish function */ }}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {projects && projects.length >= limit && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 