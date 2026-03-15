import { MesaCanvas } from "@/components/mesa-canvas";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { WhatItGenerates } from "@/components/what-it-generates";

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
      className="relative flex flex-col items-center overflow-hidden md:justify-center"
      style={{
        minHeight: "calc(100vh - var(--nav-height))",
        paddingTop: "var(--nav-height)",
      }}
    >
      {/* Mesa — above text on mobile, behind text on desktop */}
      {/* Mobile: in-flow, larger, with breathing room */}
      <div
        className="pointer-events-none mt-[var(--space-12)] w-[85vw] max-w-[340px] md:hidden"
        aria-hidden="true"
      >
        <div className="aspect-[1.57/1] w-full opacity-70">
          <MesaCanvas />
        </div>
      </div>
      {/* Desktop: absolutely positioned behind text */}
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden items-center justify-center md:flex"
        style={{ top: "10%" }}
        aria-hidden="true"
      >
        <div className="h-[50vh] w-[60vw] max-w-[720px] opacity-40">
          <MesaCanvas />
        </div>
      </div>

      {/* Text content — in front */}
      <div className="relative z-10 mx-auto w-full px-[var(--space-4)] text-center md:px-[var(--space-8)]" style={{ maxWidth: "var(--max-width)" }}>
        <h1
          className="font-display text-[2.5rem] font-black uppercase leading-[0.95] tracking-[-0.02em] sm:text-[3.5rem] md:text-[5.5rem] lg:text-[6.5rem]"
          style={{ color: "var(--color-text)" }}
        >
          Documentation
          <br />
          that writes itself
        </h1>
        <p
          className="mx-auto mt-[var(--space-4)] px-[var(--space-2)] text-base md:text-lg"
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
    <section className="px-[var(--space-4)] py-[var(--space-16)] md:px-[var(--space-8)] md:py-[var(--space-20)]">
      <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
        <h2
          className="font-display text-[2rem] font-black uppercase leading-none tracking-[-0.02em] md:text-[3rem]"
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
            width: "max-content",
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
