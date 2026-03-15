import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

/* -------------------------------------------------------------------------- */
/*  Tier Card                                                                 */
/* -------------------------------------------------------------------------- */

function TierCard({
  tier,
  audience,
  description,
  features,
}: {
  tier: string;
  audience: string;
  description: string;
  features: string[];
}) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        padding: "var(--space-8)",
      }}
    >
      {/* Tier label */}
      <span
        className="block font-mono text-xs font-medium uppercase tracking-[0.05em]"
        style={{ color: "var(--color-muted)" }}
      >
        {tier}
      </span>

      {/* Audience */}
      <h3
        className="mt-[var(--space-3)] text-xl font-semibold"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-text)",
        }}
      >
        {audience}
      </h3>

      {/* Description */}
      <p
        className="mt-[var(--space-3)] text-base leading-relaxed"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-gray-600)",
        }}
      >
        {description}
      </p>

      {/* Feature list */}
      <ul
        className="mt-[var(--space-6)] flex flex-col gap-[var(--space-2)]"
        style={{ color: "var(--color-gray-500)" }}
      >
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-[var(--space-2)] text-sm"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span
              className="mt-[2px] font-mono text-xs"
              style={{ color: "var(--color-amber)" }}
              aria-hidden="true"
            >
              →
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {/* Coming Soon badge — amber at ≥18px for WCAG AA */}
      <div
        className="mt-[var(--space-8)] inline-block font-mono font-medium uppercase tracking-[0.05em]"
        style={{
          color: "var(--color-amber)",
          fontSize: "18px",
          lineHeight: 1,
        }}
      >
        COMING SOON
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      <Nav />

      <main
        style={{
          paddingTop: "var(--nav-height)",
        }}
      >
        {/* Pricing section */}
        <section style={{ padding: "var(--space-20) var(--space-8)" }}>
          <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
            {/* Section label */}
            <span
              className="block font-mono text-sm font-medium uppercase tracking-[0.05em]"
              style={{ color: "var(--color-amber)" }}
            >
              [ PRICING ]
            </span>

            {/* Headline */}
            <h1
              className="mt-[var(--space-4)] font-display text-[3rem] font-black uppercase leading-none tracking-[-0.02em] md:text-[4rem]"
              style={{ color: "var(--color-text)" }}
            >
              Built for teams
              <br />
              that ship.
            </h1>

            <p
              className="mt-[var(--space-4)] text-lg leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-gray-500)",
                maxWidth: "var(--max-width-narrow)",
              }}
            >
              Driftless automates what every DAP charges you to do manually.
              We&apos;re building the Pro and Enterprise tiers now.
            </p>

            {/* Thin rule */}
            <div
              className="mt-[var(--space-8)]"
              style={{
                height: "1px",
                backgroundColor: "var(--color-border)",
              }}
            />

            {/* Tier cards */}
            <div className="mt-[var(--space-10)] grid gap-[var(--space-6)] lg:grid-cols-2">
              <TierCard
                tier="PRO"
                audience="For B2B SaaS teams with e2e tests"
                description="Your existing Playwright or Cypress tests become the source of truth for documentation, guided walkthroughs, and product demos — generated and maintained automatically."
                features={[
                  "Knowledge base from test suites",
                  "AI-generated guided walkthroughs",
                  "Automated product demo videos",
                  "Priority support",
                  "Team management",
                ]}
              />
              <TierCard
                tier="ENTERPRISE"
                audience="For organizations that need more"
                description="Everything in Pro, plus SSO, audit logs, compliance controls, and a signal-driven autonomous development pipeline — built for teams with 100+ engineers."
                features={[
                  "Everything in Pro",
                  "SSO & audit logs",
                  "Compliance & custom deployment",
                  "Signal-driven autonomous pipeline",
                  "Dedicated customer success",
                ]}
              />
            </div>

            {/* GitHub note */}
            <div
              className="mt-[var(--space-16)] text-center"
              style={{ padding: "var(--space-8) 0" }}
            >
              <p
                className="font-mono text-sm uppercase tracking-[0.03em]"
                style={{ color: "var(--color-muted)" }}
              >
                We&apos;re building in public.
              </p>
              <a
                href="https://github.com/driftless-ai/driftless"
                className="mt-[var(--space-2)] inline-block font-mono text-sm uppercase tracking-[0.03em] underline underline-offset-4 transition-colors"
                style={{ color: "var(--color-text)" }}
              >
                Follow along on GitHub →
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
