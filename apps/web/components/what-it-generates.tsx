import { highlight } from "fumadocs-core/highlight";
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Panel chrome header                                                       */
/* -------------------------------------------------------------------------- */

function PanelHeader({ filename, lang }: { filename: string; lang: string }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        backgroundColor: "var(--color-gray-200)",
        borderBottom: "1px solid var(--color-border-strong)",
        padding: "6px var(--space-3)",
      }}
    >
      <div className="flex items-center gap-[5px]">
        <span className="block h-[7px] w-[7px] rounded-full" style={{ backgroundColor: "var(--color-gray-300)" }} />
        <span className="block h-[7px] w-[7px] rounded-full" style={{ backgroundColor: "var(--color-gray-300)" }} />
        <span className="block h-[7px] w-[7px] rounded-full" style={{ backgroundColor: "var(--color-gray-300)" }} />
        <span
          className="ml-[var(--space-2)] font-mono text-[0.6875rem] tracking-[0.02em]"
          style={{ color: "var(--color-gray-500)" }}
        >
          {filename}
        </span>
      </div>
      <span
        className="font-mono text-[0.625rem] uppercase tracking-[0.08em]"
        style={{ color: "var(--color-amber)" }}
      >
        {lang}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Flow arrow — points ↓ on mobile, → on desktop                           */
/* -------------------------------------------------------------------------- */

function FlowArrow() {
  return (
    <>
      {/* ── Mobile: vertical, between stacked cards ── */}
      <div className="flex lg:hidden flex-col items-center gap-1 py-3">
        <div className="h-5 w-px" style={{ backgroundColor: "var(--color-border-strong)" }} />
        <span
          className="font-mono text-[0.6rem] uppercase tracking-[0.12em] px-2 py-[3px]"
          style={{
            color: "var(--color-amber)",
            border: "1px solid var(--color-amber)",
            lineHeight: 1.3,
          }}
        >
          generates
        </span>
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
          <path
            d="M1 1L5 7L9 1"
            stroke="var(--color-amber)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="h-3 w-px" style={{ backgroundColor: "var(--color-border-strong)" }} />
      </div>

      {/* ── Desktop: vertical strip between side-by-side cards ── */}
      <div className="hidden lg:flex flex-col items-center justify-center self-stretch gap-2 px-5">
        <div className="flex-1 w-px" style={{ backgroundColor: "var(--color-border)" }} />
        <span
          className="font-mono text-[0.55rem] uppercase tracking-[0.12em] whitespace-nowrap"
          style={{
            color: "var(--color-amber)",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
          }}
        >
          generates
        </span>
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
          <path
            d="M1 1L7 6L1 11"
            stroke="var(--color-amber)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex-1 w-px" style={{ backgroundColor: "var(--color-border)" }} />
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Inline code span                                                          */
/* -------------------------------------------------------------------------- */

function IC({ children }: { children: ReactNode }) {
  return (
    <code
      className="font-mono text-[0.6875rem]"
      style={{
        backgroundColor: "var(--color-gray-200)",
        color: "var(--color-text)",
        border: "1px solid var(--color-border-strong)",
        padding: "1px 4px",
      }}
    >
      {children}
    </code>
  );
}

/* -------------------------------------------------------------------------- */
/*  Syntax-highlighted code block  (async — Shiki via fumadocs)             */
/* -------------------------------------------------------------------------- */

const TEST_CODE = `import { test, expect } from '@playwright/test';

test.describe('Workspace management', () => {
  test('creates a team workspace', async ({ page }) => {
    await page.goto('/dashboard');

    // Open creation dialog
    await page.getByRole('button', { name: 'New workspace' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill workspace details
    await page.getByLabel('Workspace name').fill('Design System');
    await page.getByLabel('Visibility').selectOption('team');

    // Submit and verify redirect
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page).toHaveURL(/\\/workspace\\/design-system/);
    await expect(page.getByRole('heading', { level: 1 }))
      .toContainText('Design System');
  });
});`;

async function CodeDoc() {
  const highlighted = await highlight(TEST_CODE, {
    lang: "typescript",
    theme: "github-light",
  });

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        marginTop: "var(--space-4)",
        overflow: "hidden",
      }}
    >
      <PanelHeader filename="workspace.spec.ts" lang="PLAYWRIGHT" />
      <div className="[&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:p-[var(--space-4)] [&_pre]:text-[0.7rem] [&_pre]:leading-relaxed [&_pre]:!bg-[var(--color-bg)]">
        {highlighted}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Rendered Markdown preview                                                 */
/* -------------------------------------------------------------------------- */

function MiniLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-[var(--space-3)] mb-1 font-mono text-[0.6rem] uppercase tracking-[0.1em]"
      style={{ color: "var(--color-gray-400)" }}
    >
      {children}
    </p>
  );
}

function MarkdownDoc() {
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        marginTop: "var(--space-4)",
        overflow: "hidden",
      }}
    >
      <PanelHeader filename="creating-workspace.md" lang="MARKDOWN" />
      <div
        className="px-[var(--space-4)] py-[var(--space-4)]"
        style={{
          backgroundColor: "var(--color-bg)",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* h2 */}
        <h2
          className="text-sm font-bold leading-snug"
          style={{
            color: "var(--color-text)",
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: "var(--space-2)",
            marginBottom: "var(--space-1)",
          }}
        >
          Creating a Team Workspace
        </h2>

        {/* Prerequisites */}
        <MiniLabel>Prerequisites</MiniLabel>
        <ul
          className="text-xs leading-[1.7]"
          style={{
            color: "var(--color-gray-600)",
            paddingLeft: "var(--space-4)",
            listStyleType: "disc",
          }}
        >
          <li>Must be signed in to your account</li>
          <li>Account must have workspace creation permissions</li>
        </ul>

        {/* Steps */}
        <MiniLabel>Steps</MiniLabel>
        <ol
          className="text-xs leading-[1.7]"
          style={{
            color: "var(--color-gray-600)",
            paddingLeft: "var(--space-4)",
            listStyleType: "decimal",
          }}
        >
          <li>Navigate to <IC>/dashboard</IC></li>
          <li>
            Click the <strong style={{ color: "var(--color-text)" }}>New workspace</strong> button
            <ul
              className="mt-0.5 leading-[1.6]"
              style={{ paddingLeft: "var(--space-4)", listStyleType: "disc" }}
            >
              <li>A creation dialog will appear</li>
            </ul>
          </li>
          <li>
            Enter a <strong style={{ color: "var(--color-text)" }}>Workspace name</strong>{" "}
            (e.g., <IC>Design System</IC>)
          </li>
          <li>
            Set <strong style={{ color: "var(--color-text)" }}>Visibility</strong> to{" "}
            <IC>team</IC>
          </li>
          <li>Click <strong style={{ color: "var(--color-text)" }}>Create</strong> to confirm</li>
        </ol>

        {/* Success callout */}
        <div
          className="mt-3 flex items-start gap-2 text-xs"
          style={{
            backgroundColor: "var(--color-gray-100)",
            borderLeft: "2px solid var(--color-amber)",
            padding: "var(--space-2) var(--space-3)",
          }}
        >
          <span className="font-mono shrink-0" style={{ color: "var(--color-amber)" }}>✓</span>
          <span style={{ color: "var(--color-gray-600)" }}>
            Redirects to <IC>/workspace/design-system</IC>. Page heading confirms{" "}
            <IC>Design System</IC>.
          </span>
        </div>

        {/* Footer */}
        <div
          className="mt-3 flex items-center"
          style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-3)" }}
        >
          <span
            className="font-mono text-[0.6rem] uppercase tracking-[0.08em]"
            style={{ color: "var(--color-muted)" }}
          >
            auto-generated · synced from tests
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card wrapper                                                              */
/* -------------------------------------------------------------------------- */

function GeneratesCard({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{
        backgroundColor: "var(--color-surface)",
        padding: "var(--space-4)",
      }}
    >
      <span
        className="block font-mono text-xs font-medium uppercase tracking-[0.05em]"
        style={{ color: "var(--color-amber)" }}
      >
        {label}
      </span>
      <h4
        className="mt-[var(--space-2)] text-lg font-semibold md:text-xl"
        style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}
      >
        {title}
      </h4>
      <p
        className="mt-[var(--space-3)] text-sm leading-relaxed md:text-base"
        style={{ fontFamily: "var(--font-body)", color: "var(--color-gray-600)" }}
      >
        {description}
      </p>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section export                                                            */
/* -------------------------------------------------------------------------- */

export async function WhatItGenerates() {
  return (
    <section className="px-[var(--space-4)] py-[var(--space-16)] md:px-[var(--space-8)] md:py-[var(--space-20)]">
      <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
        <h2
          className="font-display text-[2rem] font-black uppercase leading-none tracking-[-0.02em] md:text-[3rem]"
          style={{ color: "var(--color-text)" }}
        >
          What It Generates
        </h2>
        <div
          className="mt-[var(--space-4)]"
          style={{ height: "1px", backgroundColor: "var(--color-border)" }}
        />

        {/* E2E → (generates) → Docs  */}
        <div className="mt-[var(--space-10)] flex flex-col lg:flex-row lg:items-stretch">
          {/* 1. Source: E2E test */}
          <div className="flex-1 min-w-0">
            <GeneratesCard
              label="E2E TEST"
              title="End-to-End Test Coverage"
              description="Write tests as you normally would — Playwright, Cypress, or any e2e framework. Driftless reads the structure, assertions, and user flows without any modification to your test files."
            >
              <CodeDoc />
            </GeneratesCard>
          </div>

          {/* Flow arrow */}
          <FlowArrow />

          {/* 2. Output: documentation */}
          <div className="flex-1 min-w-0">
            <GeneratesCard
              label="TRAINING DOC"
              title="Human-Readable Documentation"
              description="Every describe block, assertion, label query, and user interaction is turned into a structured guide — complete with prerequisites, nested steps, inline code references, and a verification note."
            >
              <MarkdownDoc />
            </GeneratesCard>
          </div>
        </div>
      </div>
    </section>
  );
}
