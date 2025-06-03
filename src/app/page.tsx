import { redirect } from "next/navigation";
import { auth } from "~/server/lib/auth";
import { headers } from "next/headers";
import { CreateProjectForm } from "~/app/components/create-project-form";
import { ProjectList } from "~/app/components/project-list";
import { LandingPagePreview } from "~/app/components/landing-page-preview";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="flex justify-between items-center p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LW</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">LandWise</h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/auth/sign-in"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              Sign In
            </a>
            <a
              href="/api/auth/sign-up"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              Sign Up
            </a>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl w-full space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Generate Landing Pages with AI
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Describe your product or service, and watch AI create a high-converting landing page in seconds.
              </p>
            </div>

            {/* Interactive Demo */}
            <LandingPagePreview />

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900">AI-Powered</h3>
                <p className="text-sm text-slate-600">Advanced AI that understands your business and creates compelling copy.</p>
              </div>

              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.989L3 20l1.011-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900">Conversational</h3>
                <p className="text-sm text-slate-600">Refine your landing page through natural conversation.</p>
              </div>

              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 text-purple-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900">Export & Deploy</h3>
                <p className="text-sm text-slate-600">Download HTML or publish directly with built-in analytics.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">LandWise</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {session.user.name || session.user.email}</span>
            <a
              href="/api/auth/sign-out"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Sign Out
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create New Project */}
          <div className="lg:col-span-1">
            <CreateProjectForm />
          </div>

          {/* Project List */}
          <div className="lg:col-span-2">
            <ProjectList />
          </div>
        </div>
      </div>
    </main>
  );
}
