import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "driftless — Your e2e tests become training docs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const fontData = await readFile(
    join(process.cwd(), "assets", "FamiljenGrotesk-Bold.ttf"),
  );

  return new ImageResponse(
    <div
      style={{
        background: "#FAFAF8",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "60px 72px",
        fontFamily: "Familjen Grotesk",
      }}
    >
      {/* Top: brand name in mono style */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "16px",
          fontWeight: 700,
          color: "#0A0A0A",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: "#C4862A",
            display: "flex",
          }}
        />
        DRIFTLESS
      </div>

      {/* Center: headline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          gap: "0",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#0A0A0A",
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
          }}
        >
          YOUR E2E TESTS
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "72px",
            fontWeight: 700,
            color: "#0A0A0A",
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            gap: "0",
          }}
        >
          <span>BECOME </span>
          <span style={{ color: "#C4862A" }}>TRAINING DOCS</span>
        </div>
      </div>

      {/* Bottom: framework list */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          fontSize: "14px",
          fontWeight: 700,
          color: "#71717A",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span>Playwright</span>
        <span style={{ color: "#C4862A" }}>·</span>
        <span>Cypress</span>
        <span style={{ color: "#C4862A" }}>·</span>
        <span>TestCafe</span>
        <span style={{ color: "#C4862A" }}>·</span>
        <span>Detox</span>
        <span style={{ color: "#C4862A" }}>·</span>
        <span>WebDriverIO</span>
        <span style={{ color: "#C4862A" }}>·</span>
        <span>Nightwatch</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Familjen Grotesk",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
