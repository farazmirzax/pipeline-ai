import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pipeline.ai | Autonomous Data Science",
  description: "End-to-End Autonomous Data Science Firm Multi-Agent System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-950 text-slate-50">
          <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
              <Link
                href="/"
                className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"
              >
                Pipeline.ai
              </Link>
              <nav className="flex items-center gap-3 text-sm text-slate-300">
                <Link
                  href="/"
                  className="rounded-full border border-slate-700 px-4 py-2 transition hover:border-blue-500 hover:text-white"
                >
                  New Run
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-slate-700 px-4 py-2 transition hover:border-emerald-500 hover:text-white"
                >
                  Dashboard
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
