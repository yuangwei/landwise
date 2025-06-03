import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "~/server/lib/auth";
import { api } from "~/trpc/server";
import { ChatInterface } from "~/app/components/chat/chat-interface";
import { PreviewPanel } from "~/app/components/chat/preview-panel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  // Get project data
  let project;
  try {
    project = await api.project.get({ id });
  } catch (error) {
    notFound();
  }

  return (
    <main className="flex h-screen bg-slate-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              ← Back to Projects
            </Link>
            <div className="h-4 w-px bg-slate-300" />
            <h1 className="text-lg font-semibold text-slate-900">{project.title}</h1>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${project.status === "published"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
                }`}
            >
              {project.status}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {project.status === "published" && project.slug && (
              <a
                href={`/p/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                View Live
              </a>
            )}

            <span className="text-sm text-slate-600">
              {session.user.name || session.user.email}
            </span>
            <a
              href="/api/auth/sign-out"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Sign Out
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex pt-16">
        {/* Chat Panel */}
        <div className="w-1/2 flex flex-col border-r border-slate-200 bg-white">
          <ChatInterface projectId={id} />
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 flex flex-col bg-slate-50">
          <PreviewPanel project={project} />
        </div>
      </div>
    </main>
  );
} 