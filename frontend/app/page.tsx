"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type PipelineResult = {
  report: string;
  code: string;
};

type PipelineStatusResponse = {
  run_id: number;
  status: string;
  report: string | null;
  code: string | null;
  error: string | null;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [goal, setGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [runId, setRunId] = useState<number | null>(null);

  const pollRunStatus = async (currentRunId: number) => {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch(`http://127.0.0.1:8000/api/status/${currentRunId}`);
      if (!response.ok) {
        throw new Error(`Status Error: ${response.status} ${response.statusText}`);
      }

      const data: PipelineStatusResponse = await response.json();

      if (data.status === "completed") {
        setResult({
          report: data.report ?? "",
          code: data.code ?? "",
        });
        return;
      }

      if (data.status === "failed") {
        throw new Error(data.error || "Pipeline run failed");
      }
    }
  };

  const handleCopyCode = async () => {
    if (result?.code) {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !goal) {
      alert("Please provide both a dataset and a business goal.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);
    setRunId(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("goal", goal);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/run-pipeline", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setRunId(data.run_id);

      await pollRunStatus(data.run_id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Pipeline Error:", err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 md:p-16 max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Pipeline.ai
        </h1>
        <p className="text-slate-400 mt-2">Upload your dataset and let the agents do the rest.</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-6 mb-12"
      >
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            1. Upload Raw Dataset (CSV)
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            2. What is your business goal?
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Predict customer churn based on age, spend, and support tickets..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Agents are working on run {runId ?? "..."}...</span>
            </>
          ) : (
            "Ignite Pipeline"
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg mb-8 text-red-300">
          <p className="font-semibold">Error:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {isLoading && !result && !error && (
        <div className="space-y-8 animate-fade-in opacity-60">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
            <div className="h-8 bg-slate-800 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-800 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-slate-800 rounded w-4/6 animate-pulse"></div>
            </div>
            <div className="h-6 bg-slate-800 rounded w-1/5 mt-8 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-800 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
            <div className="h-8 bg-slate-800 rounded w-1/3 mb-6 animate-pulse"></div>
            <div className="h-40 bg-slate-950 rounded-lg w-full animate-pulse border border-slate-800"></div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">
              Business Report
            </h2>
            <div className="text-slate-300">
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1 className="text-2xl font-bold mt-8 mb-4 text-emerald-400" {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 className="text-xl font-bold mt-6 mb-3 text-emerald-400" {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 className="text-lg font-bold mt-4 mb-2 text-emerald-300" {...props} />
                  ),
                  p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                  ul: ({ ...props }) => (
                    <ul
                      className="list-disc pl-6 mb-4 space-y-2 marker:text-emerald-500"
                      {...props}
                    />
                  ),
                  ol: ({ ...props }) => (
                    <ol
                      className="list-decimal pl-6 mb-4 space-y-2 marker:text-emerald-500"
                      {...props}
                    />
                  ),
                  li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                  strong: ({ ...props }) => (
                    <strong className="font-semibold text-white" {...props} />
                  ),
                }}
              >
                {result.report}
              </ReactMarkdown>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
              <h2 className="text-2xl font-bold text-slate-100">Generated ML Pipeline</h2>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm text-emerald-400 border border-slate-800">
              <code>{result.code}</code>
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}
