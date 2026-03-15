"use client";

import dynamic from "next/dynamic";

const AsciiMesa = dynamic(() => import("@/components/ascii-mesa"), {
  ssr: false,
});

export default function MesaPreviewPage() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "80vw", height: "70vh" }}>
        <AsciiMesa />
      </div>
    </div>
  );
}
