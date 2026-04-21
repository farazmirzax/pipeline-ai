"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

type HistoryRun = {
  run_id: number;
  goal: string;
  dataset_path: string;
  status: string;
  created_at: string;
  updated_at: string;
  has_report: boolean;
  has_code: boolean;
};

type RunDetails = {
  run_id: number;
  goal: string;
  dataset_path: string;
  status: string;
  report: string | null;
  code: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const statusClassName = (status: string) => {
  if (status === "completed") {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  }

  if (status === "failed") {
    return "bg-red-500/15 text-red-300 border border-red-500/30";
  }

  return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
};

export default function DashboardPage() {
  const [runs, setRuns] = useState<HistoryRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [selectedRun, setSelectedRun] = useState<RunDetails | null>(null);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadRuns = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/history");
        if (!response.ok) {
          throw new Error(`History Error: ${response.status} ${response.statusText}`);
        }

        const data: HistoryRun[] = await response.json();
        setRuns(data);

        if (data.length > 0) {
          setSelectedRunId(data[0].run_id);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unable to load history";
        setError(errorMessage);
      } finally {
        setIsLoadingRuns(false);
      }
    };

    void loadRuns();
  }, []);

  useEffect(() => {
    if (selectedRunId === null) {
      setSelectedRun(null);
      return;
    }

    const loadRunDetails = async () => {
      setIsLoadingDetails(true);
      setError(null);

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/history/${selectedRunId}`);
        if (!response.ok) {
          throw new Error(`Run Detail Error: ${response.status} ${response.statusText}`);
        }

        const data: RunDetails = await response.json();
        setSelectedRun(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unable to load run details";
        setError(errorMessage);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    void loadRunDetails();
  }, [selectedRunId]);

  const handleCopyCode = async () => {
    if (!selectedRun?.code) {
      return;
    }

    await navigator.clipboard.writeText(selectedRun.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      <section className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.22em] text-slate-500">Experiment History</p>
          <h1 className="text-4xl font-bold tracking-tight text-white">Past Pipeline Runs</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Browse every saved run, inspect the generated report, and revisit the pipeline code
            without spending more compute.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 text-sm text-slate-300">
          <span className="block text-slate-500">Stored Runs</span>
          <span className="text-3xl font-semibold text-white">{runs.length}</span>
        </div>
      </section>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-700 bg-red-900/20 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-lg font-semibold text-white">Run History</h2>
            <p className="mt-1 text-sm text-slate-400">Select a run to inspect its saved output.</p>
          </div>

          {isLoadingRuns ? (
            <div className="space-y-4 p-6">
              <div className="h-16 animate-pulse rounded-2xl bg-slate-800"></div>
              <div className="h-16 animate-pulse rounded-2xl bg-slate-800"></div>
              <div className="h-16 animate-pulse rounded-2xl bg-slate-800"></div>
            </div>
          ) : runs.length === 0 ? (
            <div className="p-6 text-slate-400">No runs yet. Create one from the main page first.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950/70 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Run</th>
                    <th className="px-6 py-4 font-medium">Goal</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => {
                    const isSelected = run.run_id === selectedRunId;

                    return (
                      <tr
                        key={run.run_id}
                        className={`cursor-pointer border-t border-slate-800 transition hover:bg-slate-800/40 ${
                          isSelected ? "bg-slate-800/60" : ""
                        }`}
                        onClick={() => setSelectedRunId(run.run_id)}
                      >
                        <td className="px-6 py-4 font-semibold text-white">#{run.run_id}</td>
                        <td className="max-w-sm px-6 py-4 text-slate-300">
                          <p className="max-w-sm">{run.goal}</p>
                          <p className="mt-1 text-xs text-slate-500">{run.dataset_path}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassName(run.status)}`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{formatDate(run.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-lg font-semibold text-white">Run Details</h2>
            <p className="mt-1 text-sm text-slate-400">Business summary, code, and any errors are saved here.</p>
          </div>

          {isLoadingDetails ? (
            <div className="space-y-4 p-6">
              <div className="h-6 w-1/3 animate-pulse rounded bg-slate-800"></div>
              <div className="h-24 animate-pulse rounded-2xl bg-slate-800"></div>
              <div className="h-40 animate-pulse rounded-2xl bg-slate-800"></div>
            </div>
          ) : !selectedRun ? (
            <div className="p-6 text-slate-400">Select a run from the table to inspect it.</div>
          ) : (
            <div className="space-y-6 p-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm uppercase tracking-[0.18em] text-slate-500">
                    Run #{selectedRun.run_id}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassName(selectedRun.status)}`}>
                    {selectedRun.status}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white">{selectedRun.goal}</h3>
                <p className="text-sm text-slate-500">{selectedRun.dataset_path}</p>
                <p className="text-sm text-slate-400">
                  Created {formatDate(selectedRun.created_at)}
                </p>
              </div>

              {selectedRun.error && (
                <div className="rounded-2xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
                  {selectedRun.error}
                </div>
              )}

              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Business Report
                </h4>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-slate-300">
                  {selectedRun.report ? (
                    <ReactMarkdown
                      components={{
                        h1: ({ ...props }) => (
                          <h1 className="mb-4 mt-8 text-2xl font-bold text-emerald-400" {...props} />
                        ),
                        h2: ({ ...props }) => (
                          <h2 className="mb-3 mt-6 text-xl font-bold text-emerald-400" {...props} />
                        ),
                        h3: ({ ...props }) => (
                          <h3 className="mb-2 mt-4 text-lg font-bold text-emerald-300" {...props} />
                        ),
                        p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                        ul: ({ ...props }) => (
                          <ul className="mb-4 list-disc space-y-2 pl-6 marker:text-emerald-500" {...props} />
                        ),
                        ol: ({ ...props }) => (
                          <ol className="mb-4 list-decimal space-y-2 pl-6 marker:text-emerald-500" {...props} />
                        ),
                        li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                        strong: ({ ...props }) => <strong className="font-semibold text-white" {...props} />,
                      }}
                    >
                      {selectedRun.report}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-slate-400">No report was saved for this run.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Generated Code
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500 hover:text-white"
                  >
                    {copied ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <pre className="max-h-[24rem] overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-emerald-400">
                  <code>{selectedRun.code || "No code was saved for this run."}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
