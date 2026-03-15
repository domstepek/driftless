"use client";

import { useState, useEffect } from "react";

export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString("en-US", { hour12: false })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="font-mono text-sm tracking-[0.02em]"
      style={{ color: "var(--color-muted)" }}
    >
      {time ?? "--:--:--"}
    </span>
  );
}
