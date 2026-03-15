import { ImageResponse } from "next/og";

export const alt = "driftless — Your e2e tests become training docs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(145deg, #0a0a0b 0%, #18181b 50%, #0a0a0b 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 80px",
      }}
    >
      {/* Logo + wordmark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "#f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "700",
            color: "#0a0a0b",
          }}
        >
          d
        </div>
        <div
          style={{
            fontSize: "36px",
            fontWeight: "700",
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          driftless
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          fontSize: "52px",
          fontWeight: "700",
          textAlign: "center",
          lineHeight: 1.15,
          maxWidth: "800px",
          letterSpacing: "-0.025em",
          gap: "0 14px",
        }}
      >
        <span style={{ color: "#ffffff" }}>Your e2e tests become</span>
        <span style={{ color: "#f59e0b" }}>training docs.</span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: "52px",
          fontWeight: "700",
          color: "#52525b",
          marginTop: "4px",
          letterSpacing: "-0.025em",
        }}
      >
        Automatically.
      </div>

      {/* Framework list */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "48px",
          fontSize: "16px",
          color: "#71717a",
        }}
      >
        <span>Playwright</span>
        <span style={{ color: "#3f3f46" }}>·</span>
        <span>Cypress</span>
        <span style={{ color: "#3f3f46" }}>·</span>
        <span>TestCafe</span>
        <span style={{ color: "#3f3f46" }}>·</span>
        <span>Detox</span>
        <span style={{ color: "#3f3f46" }}>·</span>
        <span>WebDriverIO</span>
        <span style={{ color: "#3f3f46" }}>·</span>
        <span>Nightwatch</span>
      </div>
    </div>,
    { ...size },
  );
}
