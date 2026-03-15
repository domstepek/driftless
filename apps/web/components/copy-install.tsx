"use client";

import { useState, useCallback } from "react";

export function CopyInstall() {
  const [copied, setCopied] = useState(false);
  const command = "npx @driftless-ai/cli@latest init";

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (non-HTTPS or denied)
    }
  }, [command]);

  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-fd-border/60 bg-[#0c0c0e] px-5 py-3 font-mono text-sm shadow-lg shadow-black/10">
      <span className="select-none text-amber-500/60" aria-hidden="true">
        $
      </span>
      <code className="text-fd-foreground/90">{command}</code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-fd-muted-foreground/60 transition-colors hover:bg-fd-accent hover:text-fd-foreground"
        aria-label="Copy install command"
      >
        {copied ? (
          <span className="text-emerald-500">Copied!</span>
        ) : (
          <span className="flex items-center gap-1">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </span>
        )}
      </button>
    </div>
  );
}
