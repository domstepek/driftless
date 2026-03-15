import Link from "next/link";

export function Footer() {
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
              href="/pricing"
              className="text-sm transition-colors hover:text-[var(--color-text)]"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-gray-500)",
              }}
            >
              Pricing
            </Link>
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
