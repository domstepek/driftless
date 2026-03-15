"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Config ─────────────────────────────────────────────────────────────────

const AMBER = "#C4862A";
const CELL_W = 9;
const CELL_H = 17;
const FPS = 12; // low FPS — only the scan line moves
const FRAME_MS = 1000 / FPS;

// SVG logo-mark proportions (viewBox content: x 0–160, y 8–110)
const SVG_W = 160;
const SVG_Y_MIN = 8;
const SVG_Y_MAX = 110;
const SVG_H = SVG_Y_MAX - SVG_Y_MIN; // 102
const SVG_ASPECT = SVG_W / SVG_H; // ~1.57

// Scan-line animation: a bright horizontal band sweeps top→bottom
const SCAN_PERIOD = 5; // seconds per sweep
const SCAN_WIDTH = 0.07; // fraction of height
const SCAN_BOOST = 0.3; // alpha increase at peak

// ── Layer definitions from SVG ─────────────────────────────────────────────
// Each layer is a trapezoid: wider at bottom, narrower at top.
// Coordinates normalized to 0–1 range within the SVG content area.

interface Layer {
  topY: number;
  bottomY: number;
  topLX: number; // left x at top edge
  topRX: number; // right x at top edge
  botLX: number; // left x at bottom edge
  botRX: number; // right x at bottom edge
  char: string;
  alpha: number;
}

function n(svgX: number, svgY: number) {
  return { x: svgX / SVG_W, y: (svgY - SVG_Y_MIN) / SVG_H };
}

const LAYERS: Layer[] = [
  // Bottom (lightest, widest)
  {
    topY: n(0, 80).y, bottomY: n(0, 110).y,
    topLX: n(8.235, 0).x, topRX: n(151.765, 0).x,
    botLX: n(0, 0).x, botRX: n(160, 0).x,
    char: "░", alpha: 0.38,
  },
  // Middle
  {
    topY: n(0, 44).y, bottomY: n(0, 74).y,
    topLX: n(18.118, 0).x, topRX: n(141.882, 0).x,
    botLX: n(9.882, 0).x, botRX: n(150.118, 0).x,
    char: "▒", alpha: 0.56,
  },
  // Top (darkest, narrowest)
  {
    topY: n(0, 8).y, bottomY: n(0, 38).y,
    topLX: n(28, 0).x, topRX: n(132, 0).x,
    botLX: n(19.765, 0).x, botRX: n(140.235, 0).x,
    char: "▓", alpha: 0.74,
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

      // Scan line position (normalized 0→1, with overshoot for smooth entry/exit)
      const scanY = animated ? ((time / SCAN_PERIOD) % 1.3) - 0.15 : -10;

      const dx = 1 / mC;
      const dy = 1 / mR;

      for (let r = 0; r < mR; r++) {
        const ny = r / mR;
        for (let c = 0; c < mC; c++) {
          const nx = c / mC;

          // Find which layer this cell belongs to
          let hit: Layer | null = null;
          for (const L of LAYERS) {
            if (hitLayer(nx, ny, L)) {
              hit = L;
              break;
            }
          }
          if (!hit) continue;

          // Edge detection → use outline character
          const onTop = isEdge(nx, ny, hit, 0, -dy);
          const onBot = isEdge(nx, ny, hit, 0, dy);
          const onLeft = isEdge(nx, ny, hit, -dx, 0);
          const onRight = isEdge(nx, ny, hit, dx, 0);
          const isOutline = onTop || onBot || onLeft || onRight;

          let char: string;
          if (onTop || onBot) {
            char = "─";
          } else if (onLeft) {
            char = "╱";
          } else if (onRight) {
            char = "╲";
          } else {
            char = hit.char;
          }

          // Alpha: outline chars slightly brighter
          let alpha = isOutline ? Math.min(1, hit.alpha + 0.15) : hit.alpha;

          // Scan line boost
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

      // Maintain SVG aspect ratio, centered
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

    // ── Motion preference ──
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animated = !mq.matches;
    const onMotion = (e: MediaQueryListEvent) => {
      animated = !e.matches;
      if (!animated) render(ctx, cols, rows, offC, offR, mC, mR, 0, false);
    };
    mq.addEventListener("change", onMotion);

    // Static initial render
    render(ctx, cols, rows, offC, offR, mC, mR, 0, false);

    // ── Visibility ──
    let visible = true, onScreen = true;
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0.1 });
    io.observe(canvas);

    // ── Resize ──
    const ro = new ResizeObserver(() => {
      resize();
      render(ctx, cols, rows, offC, offR, mC, mR, 0, !animated ? false : animated);
    });
    ro.observe(container);

    // ── Animation loop ──
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
