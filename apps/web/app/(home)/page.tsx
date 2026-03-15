import Link from "next/link";
import { MesaCanvas } from "@/components/mesa-canvas";
import { LocalTime } from "@/components/local-time";

/* -------------------------------------------------------------------------- */
/*  Nav                                                                       */
/* -------------------------------------------------------------------------- */

function Nav() {
  return (
    <nav
      className="fixed top-0 z-50 flex w-full items-center justify-between border-b px-[var(--space-8)]"
      style={{
        height: "var(--nav-height)",
        backgroundColor: "color-mix(in srgb, var(--color-bg) 90%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Left — brand name */}
      <span
        className="font-mono text-sm font-medium uppercase tracking-[0.03em]"
        style={{ color: "var(--color-text)" }}
      >
        driftless
      </span>

      {/* Center — CTA pill */}
      <a
        href="https://github.com/driftless-ai/driftless"
        className="cta-pill hidden items-center font-sans text-sm font-medium transition-colors md:inline-flex"
        style={{
          backgroundColor: "var(--color-amber)",
          color: "var(--color-bg)",
          padding: "var(--space-2) var(--space-5)",
          borderRadius: "var(--border-radius-pill)",
        }}
      >
        View on GitHub
      </a>

      {/* Right — local time */}
      <div className="hidden flex-col items-end lg:flex">
        <LocalTime />
        <span
          className="font-mono text-xs uppercase tracking-[0.05em]"
          style={{ color: "var(--color-gray-300)" }}
        >
          DRIFTLESS REGION, WI
        </span>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

function AnnotationCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`hidden items-start gap-2 lg:flex ${className ?? ""}`}
      style={{ padding: "var(--space-3)" }}
    >
      <div>
        <span
          className="block font-mono text-xs font-medium uppercase tracking-[0.05em]"
          style={{ color: "var(--color-muted)" }}
        >
          {label}
        </span>
        <span
          className="block font-mono text-sm tracking-[0.02em]"
          style={{ color: "var(--color-text)" }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        minHeight: "calc(100vh - var(--nav-height))",
        paddingTop: "var(--nav-height)",
      }}
    >
      {/* Mesa — behind text */}
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
        style={{ top: "10%" }}
        aria-hidden="true"
      >
        <div className="h-[50vh] w-[60vw] max-w-[720px] opacity-40">
          <MesaCanvas />
        </div>
      </div>

      {/* Text content — in front */}
      <div className="relative z-10 mx-auto w-full text-center" style={{ maxWidth: "var(--max-width)" }}>
        <h1
          className="font-display text-[4.5rem] font-black uppercase leading-[0.95] tracking-[-0.02em] md:text-[5.5rem] lg:text-[6.5rem]"
          style={{ color: "var(--color-text)" }}
        >
          Documentation
          <br />
          that writes itself
        </h1>
        <p
          className="mx-auto mt-[var(--space-4)] text-lg"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-gray-500)",
            maxWidth: "var(--max-width-narrow)",
          }}
        >
          Driftless reads your end-to-end tests and generates human-readable docs that stay in sync with your actual application behavior.
        </p>
      </div>

      {/* Annotation lines + data cards */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
        {/* Top-left card with line */}
        <div className="absolute left-[8%] top-[22%] hidden lg:block">
          <AnnotationCard label="STATUS" value="OPERATIONAL" />
          <svg className="absolute -bottom-8 left-1/2 h-8 w-px" aria-hidden="true">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="32"
              stroke="var(--color-border-strong)"
              strokeWidth="var(--annotation-width)"
            />
          </svg>
        </div>

        {/* Top-right card with line */}
        <div className="absolute right-[8%] top-[25%] hidden lg:block">
          <AnnotationCard label="TESTS" value="268 PASSING" />
          <svg className="absolute -bottom-8 left-1/2 h-8 w-px" aria-hidden="true">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="32"
              stroke="var(--color-border-strong)"
              strokeWidth="var(--annotation-width)"
            />
          </svg>
        </div>

        {/* Bottom-left card with line */}
        <div className="absolute bottom-[20%] left-[10%] hidden lg:block">
          <svg className="absolute -top-8 left-1/2 h-8 w-px" aria-hidden="true">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="32"
              stroke="var(--color-border-strong)"
              strokeWidth="var(--annotation-width)"
            />
          </svg>
          <AnnotationCard label="FRAMEWORK" value="AGNOSTIC" />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  How It Works                                                              */
/* -------------------------------------------------------------------------- */

function HowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="py-[var(--space-8)]">
      <span
        className="block font-mono text-xs font-medium uppercase tracking-[0.05em]"
        style={{ color: "var(--color-amber)" }}
      >
        {number}
      </span>
      <h3
        className="mt-[var(--space-2)] text-2xl font-semibold"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-text)",
        }}
      >
        {title}
      </h3>
      <p
        className="mt-[var(--space-3)] text-base leading-relaxed"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-gray-600)",
          maxWidth: "var(--max-width-narrow)",
        }}
      >
        {description}
      </p>
    </div>
  );
}

function HowItWorks() {
  return (
    <section style={{ padding: "var(--space-20) var(--space-8)" }}>
      <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
        <h2
          className="font-display text-[3rem] font-black uppercase leading-none tracking-[-0.02em]"
          style={{ color: "var(--color-text)" }}
        >
          How It Works
        </h2>
        <div
          className="mt-[var(--space-4)]"
          style={{
            height: "1px",
            backgroundColor: "var(--color-border)",
          }}
        />
        <div className="mt-[var(--space-10)]">
          <HowStep
            number="01"
            title="Write Your Tests"
            description="Write Playwright, Cypress, or any e2e test as you normally would. No special syntax, no annotations, no extra configuration."
          />
          <div
            style={{
              height: "1px",
              backgroundColor: "var(--color-border)",
            }}
          />
          <HowStep
            number="02"
            title="Push to GitHub"
            description="Driftless hooks into your CI pipeline. On every push, it reads your test files and understands what your application does."
          />
          <div
            style={{
              height: "1px",
              backgroundColor: "var(--color-border)",
            }}
          />
          <HowStep
            number="03"
            title="Docs Update Automatically"
            description="Human-readable documentation is generated and committed. Staleness checks flag drift before it ships. Your docs never fall behind."
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  What It Generates                                                         */
/* -------------------------------------------------------------------------- */

function GeneratesCard({
  label,
  title,
  description,
  snippet,
}: {
  label: string;
  title: string;
  description: string;
  snippet: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        padding: "var(--space-6)",
      }}
    >
      <span
        className="block font-mono text-xs font-medium uppercase tracking-[0.05em]"
        style={{ color: "var(--color-amber)" }}
      >
        {label}
      </span>
      <h4
        className="mt-[var(--space-2)] text-xl font-semibold"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-text)",
        }}
      >
        {title}
      </h4>
      <p
        className="mt-[var(--space-3)] text-base leading-relaxed"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-gray-600)",
        }}
      >
        {description}
      </p>
      <pre
        className="mt-[var(--space-4)] overflow-x-auto font-mono text-sm leading-relaxed"
        style={{
          backgroundColor: "var(--color-bg)",
          padding: "var(--space-3)",
          color: "var(--color-gray-500)",
          letterSpacing: "0.02em",
        }}
      >
        <code>{snippet}</code>
      </pre>
    </div>
  );
}

function WhatItGenerates() {
  return (
    <section style={{ padding: "var(--space-20) var(--space-8)" }}>
      <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
        <h2
          className="font-display text-[3rem] font-black uppercase leading-none tracking-[-0.02em]"
          style={{ color: "var(--color-text)" }}
        >
          What It Generates
        </h2>
        <div
          className="mt-[var(--space-4)]"
          style={{
            height: "1px",
            backgroundColor: "var(--color-border)",
          }}
        />
        <div
          className="mt-[var(--space-10)] grid gap-[var(--space-6)] lg:grid-cols-2"
        >
          <GeneratesCard
            label="TRAINING DOC"
            title="Human-Readable Documentation"
            description="Step-by-step guides generated directly from your test interactions. Every click, fill, and assertion becomes a clear instruction."
            snippet={`## Creating a New Workspace\n\n1. Navigate to the Dashboard\n2. Click "New workspace"\n3. Enter a name\n4. Click "Create" to confirm`}
          />
          <GeneratesCard
            label="E2E TEST"
            title="End-to-End Test Coverage"
            description="Your existing tests are analyzed and documented. Driftless understands test structure, assertions, and user flows without modification."
            snippet={`test('user creates workspace', async ({ page }) => {\n  await page.goto('/dashboard');\n  await page.getByRole('button').click();\n  await expect(page).toHaveURL('/workspace');\n});`}
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ticker / Marquee                                                          */
/* -------------------------------------------------------------------------- */

function Ticker() {
  const items = [
    "268 TESTS PASSING",
    "12 SKILLS AVAILABLE",
    "FRAMEWORK AGNOSTIC",
    "OPERATIONAL",
    "OPEN SOURCE",
    "ZERO CONFIG",
  ];
  const content = items.join(" · ") + " · ";

  return (
    <section
      style={{
        margin: "var(--space-16) 0",
      }}
    >
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: "var(--color-text)",
          height: "var(--space-10)",
        }}
      >
        <div
          className="animate-marquee flex items-center whitespace-nowrap hover:[animation-play-state:paused]"
          style={{
            animation: "marquee 30s linear infinite",
            height: "var(--space-10)",
          }}
        >
          {/* Duplicate content for seamless loop */}
          <span
            className="font-mono text-[0.8125rem] uppercase tracking-[0.04em]"
            style={{ color: "var(--color-bg)" }}
          >
            {content}
          </span>
          <span
            className="font-mono text-[0.8125rem] uppercase tracking-[0.04em]"
            style={{ color: "var(--color-bg)" }}
          >
            {content}
          </span>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer style={{ padding: "var(--space-20) var(--space-8) var(--space-12)" }}>
      <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
        {/* Top row — three columns */}
        <div className="grid gap-[var(--space-8)] md:grid-cols-3">
          {/* Brand */}
          <div>
            <span
              className="block font-mono text-sm font-medium uppercase tracking-[0.03em]"
              style={{ color: "var(--color-text)" }}
            >
              driftless
            </span>
            <p
              className="mt-[var(--space-2)] text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-muted)",
              }}
            >
              Documentation that writes itself.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex items-start gap-[var(--space-6)]">
            <Link
              href="/docs"
              className="text-sm transition-colors hover:text-[var(--color-text)]"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-gray-500)",
              }}
            >
              Docs
            </Link>
            <a
              href="https://github.com/driftless-ai/driftless"
              className="text-sm transition-colors hover:text-[var(--color-text)]"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-gray-500)",
              }}
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@driftless-ai/cli"
              className="text-sm transition-colors hover:text-[var(--color-text)]"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-gray-500)",
              }}
            >
              npm
            </a>
          </div>

          {/* Version / copyright */}
          <div className="md:text-right">
            <span
              className="block font-mono text-sm tracking-[0.02em]"
              style={{ color: "var(--color-muted)" }}
            >
              v0.1.0
            </span>
            <p
              className="mt-[var(--space-1)] text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-gray-400)",
              }}
            >
              MIT © {new Date().getFullYear()} Dom Stepek
            </p>
          </div>
        </div>

        {/* Bottom rule + tagline */}
        <div
          className="mt-[var(--space-8)]"
          style={{
            height: "1px",
            backgroundColor: "var(--color-border)",
          }}
        />
        <p
          className="mt-[var(--space-4)] text-center font-mono text-xs uppercase tracking-[0.05em]"
          style={{ color: "var(--color-gray-300)" }}
        >
          BUILT IN THE DRIFTLESS REGION
        </p>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Nav />
      <Hero />
      <HowItWorks />
      <WhatItGenerates />
      <Ticker />
      <Footer />
    </div>
  );
}
