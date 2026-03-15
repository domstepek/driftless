"use client";

import dynamic from "next/dynamic";

const AsciiMesa = dynamic(() => import("@/components/ascii-mesa"), {
  ssr: false,
});

export function MesaCanvas() {
  return <AsciiMesa />;
}
