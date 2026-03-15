import Link from "next/link";
import type { ReactNode } from "react";
import { CopyInstall } from "@/components/copy-install";

/* -------------------------------------------------------------------------- */
/*  Local presentational components                                           */
/* -------------------------------------------------------------------------- */

function CodeWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-fd-border/60 bg-[#0c0c0e] shadow-xl shadow-black/20">
      <div className="flex items-center gap-2 border-b border-fd-border/40 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="size-2.5 rounded-full bg-white/10" />
          <div className="size-2.5 rounded-full bg-white/10" />
          <div className="size-2.5 rounded-full bg-white/10" />
        </div>
        <span className="ml-2 font-mono text-[11px] tracking-wide text-fd-muted-foreground/60">
          {title}
        </span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.8]">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function FeatureRow({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex gap-6 border-b border-fd-border/40 py-8 transition-colors last:border-0 hover:bg-fd-card/30 md:items-start md:px-4">
      <span className="font-mono text-xs text-amber-500/60">{number}</span>
      <div className="flex-1">
        <h3 className="font-medium tracking-tight text-fd-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Syntax-highlighted code blocks                                            */
/* -------------------------------------------------------------------------- */

/** Playwright test – "before" panel */
function TestCode() {
  const kw = "text-violet-400";
  const str = "text-emerald-400";
  const fn = "text-sky-400";
  const dim = "text-zinc-600";
  return (
    <>
      <span className={kw}>test</span>
      <span className={dim}>(</span>
      <span className={str}>&apos;user creates a new workspace&apos;</span>
      <span className={dim}>{", "}</span>
      <span className={kw}>async</span>
      <span className={dim}>{" ({ "}</span>
      <span className="text-amber-400">page</span>
      <span className={dim}>{" }) => {"}</span>
      {"\n"}
      {"  "}
      <span className={kw}>await </span>
      <span className="text-amber-400">page</span>
      <span className={dim}>.</span>
      <span className={fn}>goto</span>
      <span className={dim}>(</span>
      <span className={str}>&apos;/dashboard&apos;</span>
      <span className={dim}>);</span>
      {"\n"}
      {"  "}
      <span className={kw}>await </span>
      <span className="text-amber-400">page</span>
      <span className={dim}>.</span>
      <span className={fn}>getByRole</span>
      <span className={dim}>(</span>
      <span className={str}>&apos;button&apos;</span>
      <span className={dim}>{", { "}</span>
      {"name: "}
      <span className={str}>&apos;New workspace&apos;</span>
      <span className={dim}>{" })"}</span>
      <span className={dim}>.</span>
      <span className={fn}>click</span>
      <span className={dim}>();</span>
      {"\n"}
      {"  "}
      <span className={kw}>await </span>
      <span className="text-amber-400">page</span>
      <span className={dim}>.</span>
      <span className={fn}>getByLabel</span>
      <span className={dim}>(</span>
      <span className={str}>&apos;Workspace name&apos;</span>
      <span className={dim}>)</span>
      <span className={dim}>.</span>
      <span className={fn}>fill</span>
      <span className={dim}>(</span>
      <span className={str}>&apos;Design System&apos;</span>
      <span className={dim}>);</span>
      {"\n"}
      {"  "}
      <span className={kw}>await </span>
      <span className="text-amber-400">page</span>
      <span className={dim}>.</span>
      <span className={fn}>getByRole</span>
      <span className={dim}>(</span>
      <span className={str}>&apos;button&apos;</span>
      <span className={dim}>{", { "}</span>
      {"name: "}
      <span className={str}>&apos;Create&apos;</span>
      <span className={dim}>{" })"}</span>
      <span className={dim}>.</span>
      <span className={fn}>click</span>
      <span className={dim}>();</span>
      {"\n"}
      {"  "}
      <span className={kw}>await </span>
      <span className={fn}>expect</span>
      <span className={dim}>(</span>
      <span className="text-amber-400">page</span>
      <span className={dim}>.</span>
      <span className={fn}>getByText</span>
      <span className={dim}>(</span>
      <span className={str}>&apos;Design System&apos;</span>
      <span className={dim}>))</span>
      <span className={dim}>.</span>
      <span className={fn}>toBeVisible</span>
      <span className={dim}>();</span>
      {"\n"}
      <span className={dim}>{"}"});</span>
    </>
  );
}

/** Generated markdown – "after" panel */
function DocCode() {
  return (
    <>
      <span className="font-medium text-amber-400">## Creating a New Workspace</span>
      {"\n\n"}
      <span className="text-zinc-600">1.</span>
      {" Navigate to the "}
      <span className="font-medium text-fd-foreground">Dashboard</span>
      {"\n"}
      <span className="text-zinc-600">2.</span>
      {" Click the "}
      <span className="font-medium text-fd-foreground">&quot;New workspace&quot;</span>
      {" button"}
      {"\n"}
      <span className="text-zinc-600">3.</span>
      {" Enter a name for your workspace"}
      {"\n"}
      <span className="text-zinc-600">4.</span>
      {" Click "}
      <span className="font-medium text-fd-foreground">&quot;Create&quot;</span>
      {" to confirm"}
      {"\n"}
      <span className="text-zinc-600">5.</span>
      {" Your new workspace appears in the list"}
      {"\n\n"}
      <span className="italic text-zinc-600">
        {"// Auto-generated by driftless from workspace.spec.ts"}
      </span>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="noise-overlay relative overflow-hidden px-6 pb-28 pt-20 md:pb-36 md:pt-28 lg:pb-44 lg:pt-36">
        {/* Ambient glow — offset for asymmetry */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-amber-500/[0.03] blur-[120px]" />
          <div className="absolute -right-20 bottom-0 h-[400px] w-[400px] rounded-full bg-amber-500/[0.02] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Badge */}
          <div className="animate-fade-in mb-12" style={{ animationDelay: "0.1s" }}>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber-500/80">
              <span
                className="inline-block size-1.5 rounded-full bg-amber-500"
                aria-hidden="true"
              />
              Open Source
            </span>
          </div>

          {/* Headline — large, editorial serif */}
          <h1
            className="animate-fade-up font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]"
            style={{ animationDelay: "0.15s" }}
          >
            Your e2e tests become
            <br />
            <span className="text-amber-500">training&nbsp;docs.</span>
          </h1>
          <p
            className="animate-fade-up mt-2 font-display text-5xl leading-[1.05] tracking-tight text-fd-muted-foreground/40 sm:text-6xl md:text-7xl lg:text-[5.5rem]"
            style={{ animationDelay: "0.22s" }}
          >
            Automatically.
          </p>

          {/* Description — narrower measure, larger leading */}
          <p
            className="animate-fade-up mt-10 max-w-lg text-lg leading-relaxed text-fd-muted-foreground md:text-xl"
            style={{ animationDelay: "0.3s" }}
          >
            Driftless reads your end-to-end tests and generates human-readable documentation that
            stays in sync with your actual application behavior.
          </p>

          {/* Install command */}
          <div className="animate-fade-up mt-10" style={{ animationDelay: "0.38s" }}>
            <CopyInstall />
          </div>

          {/* CTA links */}
          <div
            className="animate-fade-up mt-8 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "0.45s" }}
          >
            <Link
              href="/docs"
              className="inline-flex items-center gap-2.5 rounded-lg bg-amber-500 px-6 py-3 text-sm font-medium text-black transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20"
            >
              Read the Docs
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <a
              href="https://github.com/driftless-ai/driftless"
              className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-6 py-3 text-sm font-medium text-fd-foreground transition-all hover:border-fd-foreground/20 hover:bg-fd-accent"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className="hr-fade" />

      {/* ── Before / After ───────────────────────────────────────────────── */}
      <section className="px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="animate-fade-up mb-16 max-w-md">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-500/80">
              How it works
            </p>
            <h2 className="mt-4 font-display text-3xl tracking-tight md:text-4xl lg:text-[2.75rem]">
              From test to doc
              <br />
              in seconds
            </h2>
            <p className="mt-4 text-fd-muted-foreground">
              Write your tests as usual. Driftless reads them and produces clear, structured
              documentation — no extra effort required.
            </p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[1fr_auto_1fr]">
            {/* Before */}
            <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-fd-muted-foreground/60">
                Your test
              </p>
              <CodeWindow title="workspace.spec.ts">
                <TestCode />
              </CodeWindow>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center self-center py-4 lg:py-0">
              <div className="hidden text-2xl text-amber-500/40 lg:block" aria-hidden="true">
                →
              </div>
              <div className="text-2xl text-amber-500/40 lg:hidden" aria-hidden="true">
                ↓
              </div>
            </div>

            {/* After */}
            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-fd-muted-foreground/60">
                Generated doc
              </p>
              <CodeWindow title="creating-a-workspace.md">
                <DocCode />
              </CodeWindow>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className="hr-fade" />

      {/* ── Features — editorial numbered rows ───────────────────────────── */}
      <section className="px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="animate-fade-up mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-500/80">
              Features
            </p>
            <h2 className="mt-4 font-display text-3xl tracking-tight md:text-4xl">
              Built for the way you ship
            </h2>
          </div>

          <div>
            <FeatureRow
              number="01"
              title="Framework Agnostic"
              description="Playwright, Cypress, TestCafe, Detox, WebDriverIO, Nightwatch — driftless works with your existing test setup, no migration required."
            />
            <FeatureRow
              number="02"
              title="Always In Sync"
              description="GitHub Actions keep your docs fresh on every push. A staleness check flags drift before it ships."
            />
            <FeatureRow
              number="03"
              title="Composable Capabilities"
              description="Start with doc-generator. Add e2e-writer. Capabilities are modular — pick what fits your workflow."
            />
            <FeatureRow
              number="04"
              title="Multiple Doc Targets"
              description="Generate plain Markdown, Fumadocs, or Docusaurus output. One config switch, same test suite."
            />
          </div>
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className="hr-fade" />

      {/* ── Supported Frameworks ─────────────────────────────────────────── */}
      <section className="px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fd-muted-foreground/50">
            Works with
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 font-mono text-sm text-fd-muted-foreground/70">
            {["Playwright", "Cypress", "TestCafe", "Detox", "WebDriverIO", "Nightwatch"].map(
              (fw) => (
                <span key={fw} className="transition-colors hover:text-fd-foreground">
                  {fw}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className="hr-fade" />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="px-6 py-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-sm text-fd-muted-foreground/60">
          <div className="flex items-center gap-8">
            <Link href="/docs" className="transition-colors hover:text-fd-foreground">
              Docs
            </Link>
            <a
              href="https://github.com/driftless-ai/driftless"
              className="transition-colors hover:text-fd-foreground"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@driftless-ai/cli"
              className="transition-colors hover:text-fd-foreground"
            >
              npm
            </a>
          </div>
          <p className="text-fd-muted-foreground/40">MIT © {new Date().getFullYear()} Dom Stepek</p>
        </div>
      </footer>
    </div>
  );
}
