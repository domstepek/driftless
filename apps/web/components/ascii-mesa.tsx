"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Config ─────────────────────────────────────────────────────────────────

const AMBER = "#C4862A";
const CELL_W = 9;
const CELL_H = 17;
const FPS = 16; // smoother for rotation
const FRAME_MS = 1000 / FPS;

// 3D rotation
const ROTATION_SPEED = 0.2; // rad/s — full revolution every ~31s
const FOV = 5; // perspective strength (higher = flatter)
const LAYER_DEPTH = 0.05; // slab thickness in normalized Z

// Scan-line animation (overlays on top of rotation)
const SCAN_PERIOD = 5;
const SCAN_WIDTH = 0.07;
const SCAN_BOOST = 0.25;

const SVG_ASPECT = 160 / 102; // ~1.57

// ── Layer definitions ──────────────────────────────────────────────────────
// 3 trapezoid slabs: front face at z=0, back face at z=-LAYER_DEPTH.
// Gaps ~1.5% between layers. Y: top=0→0.325, mid=0.34→0.655, bot=0.67→1.0

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

// ── 3D projection helpers ──────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Project an X coordinate from 3D (after Y-rotation) to screen space. */
function projectEdge(rawX: number, cosA: number, sinA: number): number {
  const dx = rawX - 0.5;
  const rx = dx * cosA; // rotated x
  const rz = dx * sinA; // rotated z (depth)
  return 0.5 + rx * FOV / (FOV + rz);
}

/**
 * Compute the screen X range of a side face strip for one edge.
 * The side face connects the front edge (z=0) to the back edge (z=-LAYER_DEPTH).
 */
function getSideStrip(rawEdgeX: number, cosA: number, sinA: number): [number, number] {
  const dx = rawEdgeX - 0.5;

  // Front edge (z = 0)
  const fRx = dx * cosA;
  const fRz = dx * sinA;
  const frontX = 0.5 + fRx * FOV / (FOV + fRz);

  // Back edge (z = -LAYER_DEPTH): rotate (dx, -DEPTH)
  // x_rot = dx*cos - (-DEPTH)*sin = dx*cos + DEPTH*sin
  // z_rot = dx*sin + (-DEPTH)*cos = dx*sin - DEPTH*cos
  const bRx = dx * cosA + LAYER_DEPTH * sinA;
  const bRz = dx * sinA - LAYER_DEPTH * cosA;
  const backX = 0.5 + bRx * FOV / (FOV + bRz);

  return [Math.min(frontX, backX), Math.max(frontX, backX)];
}

/** Hit-test a screen point against a rotated layer's front face. */
function hitFrontFace(nx: number, ny: number, L: Layer, cosA: number, sinA: number): boolean {
  if (ny < L.topY || ny > L.bottomY) return false;
  const t = (ny - L.topY) / (L.bottomY - L.topY);
  const rawLeft = lerp(L.topLX, L.botLX, t);
  const rawRight = lerp(L.topRX, L.botRX, t);
  const projLeft = projectEdge(rawLeft, cosA, sinA);
  const projRight = projectEdge(rawRight, cosA, sinA);
  const lo = Math.min(projLeft, projRight);
  const hi = Math.max(projLeft, projRight);
  return nx >= lo && nx <= hi;
}

/** Hit-test a screen point against a rotated layer's side faces (left + right). */
function hitSideFace(nx: number, ny: number, L: Layer, cosA: number, sinA: number): boolean {
  if (ny < L.topY || ny > L.bottomY) return false;
  if (Math.abs(sinA) < 0.02) return false; // no visible side when facing straight

  const t = (ny - L.topY) / (L.bottomY - L.topY);

  // Check right side strip
  const rawRight = lerp(L.topRX, L.botRX, t);
  const [rLo, rHi] = getSideStrip(rawRight, cosA, sinA);
  if (rHi - rLo > 0.001 && nx >= rLo && nx <= rHi) return true;

  // Check left side strip
  const rawLeft = lerp(L.topLX, L.botLX, t);
  const [lLo, lHi] = getSideStrip(rawLeft, cosA, sinA);
  if (lHi - lLo > 0.001 && nx >= lLo && nx <= lHi) return true;

  return false;
}

/** Check if a cell is on the front face's left or right edge. */
function isEdge(
  nx: number, ny: number, L: Layer,
  dnx: number, cosA: number, sinA: number,
): boolean {
  return hitFrontFace(nx, ny, L, cosA, sinA) &&
    !hitFrontFace(nx + dnx, ny, L, cosA, sinA);
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

      const angle = animated ? time * ROTATION_SPEED : 0;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const scanY = animated ? ((time / SCAN_PERIOD) % 1.3) - 0.15 : -10;
      const dnx = 1 / mC;

      for (let r = 0; r < mR; r++) {
        const ny = r / mR;
        for (let c = 0; c < mC; c++) {
          const nx = c / mC;

          let hit: Layer | null = null;
          let side = false;

          // Check each layer — front face first (occludes side faces)
          for (const L of LAYERS) {
            if (ny < L.topY || ny > L.bottomY) continue;

            if (hitFrontFace(nx, ny, L, cosA, sinA)) {
              hit = L;
              break;
            }
            // Side face only for cells NOT on the front face
            if (hitSideFace(nx, ny, L, cosA, sinA)) {
              hit = L;
              side = true;
              break;
            }
          }

          if (!hit) continue;

          let char: string;
          let alpha: number;

          if (side) {
            // Side face: solid block, slightly brighter
            char = "█";
            alpha = Math.min(1, hit.alpha + 0.12);
          } else {
            // Front face: fill char with slope edges
            const onLeft = isEdge(nx, ny, hit, -dnx, cosA, sinA);
            const onRight = isEdge(nx, ny, hit, dnx, cosA, sinA);

            if (onLeft) {
              char = cosA >= 0 ? "╱" : "╲";
            } else if (onRight) {
              char = cosA >= 0 ? "╲" : "╱";
            } else {
              char = hit.char;
            }
            alpha = (onLeft || onRight) ? Math.min(1, hit.alpha + 0.15) : hit.alpha;
          }

          // Scan-line boost
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

    // Static first frame
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
