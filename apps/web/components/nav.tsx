import Link from "next/link";
import { LocalTime } from "./local-time";

export function Nav() {
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
      {/* Left — brand name + nav links */}
      <div className="flex items-center gap-[var(--space-6)]">
        <span
          className="font-mono text-sm font-medium uppercase tracking-[0.03em]"
          style={{ color: "var(--color-text)" }}
        >
          driftless
        </span>
        <Link
          href="/pricing"
          className="font-mono text-sm tracking-[0.03em] transition-colors hover:text-[var(--color-text)]"
          style={{ color: "var(--color-gray-500)" }}
        >
          [ PRICING ]
        </Link>
      </div>

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
