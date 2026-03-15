"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Config ─────────────────────────────────────────────────────────────────

const AMBER = "#C4862A";
const CELL_W = 9;
const CELL_H = 17;
const FPS = 12;
const FRAME_MS = 1000 / FPS;

// Scan-line animation
const SCAN_PERIOD = 5;
const SCAN_WIDTH = 0.07;
const SCAN_BOOST = 0.3;

// ── Layer definitions ──────────────────────────────────────────────────────
// Derived from SVG logo-mark but with gaps tightened to ~2px visual spacing.
// Original SVG gaps (6 units / 102 total ≈ 6%) are too wide in ASCII.
// New layout compresses the 3 layers into tighter vertical space.
//
// Layout (normalized 0–1) — gaps kept to ~1.5% so edge chars don't stack:
//   Top layer:    y 0.00 – 0.325
//   Gap:          ~1.5%
//   Middle layer: y 0.34 – 0.655
//   Gap:          ~1.5%
//   Bottom layer: y 0.67 – 1.00
//
// X proportions preserved from SVG: each layer tapers inward going up.

const SVG_ASPECT = 160 / 102; // ~1.57 — preserved for centering

interface Layer {
  topY: number;
  bottomY: number;
  topLX: number;
  topRX: number;
  botLX: number;
  botRX: number;
  char: string;
  alpha: number;
}

const LAYERS: Layer[] = [
  // Bottom (lightest, widest)
  {
    topY: 0.67, bottomY: 1.0,
    topLX: 0.051, topRX: 0.949,
    botLX: 0.0, botRX: 1.0,
    char: "░", alpha: 0.50,
  },
  // Middle
  {
    topY: 0.34, bottomY: 0.655,
    topLX: 0.113, topRX: 0.887,
    botLX: 0.062, botRX: 0.938,
    char: "▒", alpha: 0.60,
  },
  // Top (darkest, narrowest)
  {
    topY: 0.0, bottomY: 0.325,
    topLX: 0.175, topRX: 0.825,
    botLX: 0.124, botRX: 0.876,
    char: "▓", alpha: 0.76,
  },
];

// ── Hit test ───────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hitLayer(nx: number, ny: number, L: Layer): boolean {
  if (ny < L.topY || ny > L.bottomY) return false;
  const t = (ny - L.topY) / (L.bottomY - L.topY);
  return nx >= lerp(L.topLX, L.botLX, t) && nx <= lerp(L.topRX, L.botRX, t);
}

function isEdge(nx: number, ny: number, L: Layer, dx: number, dy: number): boolean {
  return hitLayer(nx, ny, L) && !hitLayer(nx + dx, ny + dy, L);
}

// ── Component ──────────────────────────────────────────────────────────────

export function AsciiMesa() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef(0);
  const startRef = useRef(0);

  const render = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cols: number,
      rows: number,
      offC: number,
      offR: number,
      mC: number,
      mR: number,
      time: number,
      animated: boolean,
    ) => {
      const cw = ctx.canvas.width / (window.devicePixelRatio || 1);
      const ch = ctx.canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, cw, ch);
      ctx.font = `${CELL_H - 3}px monospace`;
      ctx.textBaseline = "top";
      ctx.fillStyle = AMBER;

      const scanY = animated ? ((time / SCAN_PERIOD) % 1.3) - 0.15 : -10;
      const dx = 1 / mC;
      const dy = 1 / mR;

      for (let r = 0; r < mR; r++) {
        const ny = r / mR;
        for (let c = 0; c < mC; c++) {
          const nx = c / mC;

          let hit: Layer | null = null;
          for (const L of LAYERS) {
            if (hitLayer(nx, ny, L)) {
              hit = L;
              break;
            }
          }
          if (!hit) continue;

          const onLeft = isEdge(nx, ny, hit, -dx, 0);
          const onRight = isEdge(nx, ny, hit, dx, 0);

          let char: string;
          if (onLeft) {
            char = "╱";
          } else if (onRight) {
            char = "╲";
          } else {
            char = hit.char;
          }

          let alpha = (onLeft || onRight) ? Math.min(1, hit.alpha + 0.15) : hit.alpha;

          if (animated) {
            const dist = Math.abs(ny - scanY);
            if (dist < SCAN_WIDTH) {
              alpha = Math.min(1, alpha + (1 - dist / SCAN_WIDTH) * SCAN_BOOST);
            }
          }

          ctx.globalAlpha = alpha;
          ctx.fillText(char, (c + offC) * CELL_W, (r + offR) * CELL_H);
        }
      }

      ctx.globalAlpha = 1;
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    let cols = 0, rows = 0;
    let offC = 0, offR = 0, mC = 0, mR = 0;

    function resize() {
      if (!canvas || !ctx || !container) return;
      const lw = container.clientWidth;
      const lh = container.clientHeight;
      cols = Math.floor(lw / CELL_W);
      rows = Math.floor(lh / CELL_H);
      canvas.width = lw * dpr;
      canvas.height = lh * dpr;
      canvas.style.width = `${lw}px`;
      canvas.style.height = `${lh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Maintain aspect ratio, centered
      const contAspect = (cols * CELL_W) / (rows * CELL_H);
      if (contAspect > SVG_ASPECT) {
        mR = rows;
        mC = Math.floor(rows * CELL_H * SVG_ASPECT / CELL_W);
        offC = Math.floor((cols - mC) / 2);
        offR = 0;
      } else {
        mC = cols;
        mR = Math.floor(cols * CELL_W / (SVG_ASPECT * CELL_H));
        offC = 0;
        offR = Math.floor((rows - mR) / 2);
      }
    }

    resize();

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animated = !mq.matches;
    const onMotion = (e: MediaQueryListEvent) => {
      animated = !e.matches;
      if (!animated) render(ctx, cols, rows, offC, offR, mC, mR, 0, false);
    };
    mq.addEventListener("change", onMotion);

    render(ctx, cols, rows, offC, offR, mC, mR, 0, false);

    let visible = true, onScreen = true;
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0.1 });
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      render(ctx, cols, rows, offC, offR, mC, mR, 0, animated);
    });
    ro.observe(container);

    startRef.current = performance.now() / 1000;

    function loop(ts: number) {
      rafRef.current = requestAnimationFrame(loop);
      if (!animated || !visible || !onScreen) return;
      if (ts - lastFrameRef.current < FRAME_MS) return;
      lastFrameRef.current = ts;
      render(ctx!, cols, rows, offC, offR, mC, mR, ts / 1000 - startRef.current, true);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      mq.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      ro.disconnect();
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}

export default AsciiMesa;
