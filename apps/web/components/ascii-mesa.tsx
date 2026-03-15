"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────────────────

const AMBER = "#C4862A";
const CHAR_FONT = "14px monospace"; // JetBrains Mono if available, fallback monospace
const CELL_W = 8;
const CELL_H = 16;
const FPS_CAP = 30;
const FRAME_BUDGET_MS = 1000 / FPS_CAP; // ~33.33ms

// Rotation: 0.4 RPM = 0.4 * 2π / 60 rad/s
const Y_ROT_SPEED = (0.4 * 2 * Math.PI) / 60; // ≈ 0.04189 rad/s
// X wobble: 5° amplitude, period from sin(t * 0.3)
const X_WOBBLE_AMP = (5 * Math.PI) / 180; // 5° in radians
const X_WOBBLE_FREQ = 0.3;

// Character density palette indexed by luminance bucket
// Ordered by visual density: sparse → dense
const DENSITY_CHARS = [" ", "·", "○", "░", "▒", "▓", "─", "│", "╰", "╭", "▓"];
// Luminance thresholds for each character
const LUMINANCE_THRESHOLDS = [0.0, 0.09, 0.18, 0.27, 0.36, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];

// Light direction (normalized) — top-right-front
const LIGHT_DIR: Vec3 = normalize([0.5, -0.7, 0.6]);

// ── Types ──────────────────────────────────────────────────────────────────

type Vec3 = [number, number, number];

interface MesaVertex {
  pos: Vec3;
  normal: Vec3;
  stratum: number; // 0 = top, 1-3 = strata layers
}

// ── Vector math ────────────────────────────────────────────────────────────

function normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (len === 0) return [0, 0, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

// ── Rotation matrices ──────────────────────────────────────────────────────

function rotateY(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}

function rotateX(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}

// ── Mesa geometry ──────────────────────────────────────────────────────────

// Mesa is a truncated pyramid. Dimensions in unit space:
// Base: 2.0 × 2.0 (from -1 to 1 on X and Z)
// Top:  1.2 × 1.2 (from -0.6 to 0.6)
// Height: 1.0 (from -0.5 to 0.5 on Y)
// 4 strata layers at y = -0.5, -0.25, 0.0, 0.25 (base to top)

const TOP_HALF = 0.6; // half-width of top face
const BASE_HALF = 1.0; // half-width of base
const MESA_H = 1.0;
const MESA_Y_MIN = -0.5;
const MESA_Y_MAX = 0.5;
const STRATA_Y = [-0.5, -0.25, 0.0, 0.25]; // y-values of each stratum

// Interpolate width at a given y level
function mesaHalfWidthAtY(y: number): number {
  const t = (y - MESA_Y_MIN) / MESA_H; // 0 at base, 1 at top
  return BASE_HALF + t * (TOP_HALF - BASE_HALF);
}

/**
 * Generate surface sample points for the mesa.
 * Returns an array of vertices with position, normal, and stratum index.
 */
function generateMesaVertices(density: number): MesaVertex[] {
  const vertices: MesaVertex[] = [];
  const step = 1 / density;

  // ── Top face (y = MESA_Y_MAX) ──
  const topNormal: Vec3 = [0, 1, 0];
  for (let u = -TOP_HALF; u <= TOP_HALF; u += step * 0.8) {
    for (let v = -TOP_HALF; v <= TOP_HALF; v += step * 0.8) {
      vertices.push({
        pos: [u, MESA_Y_MAX, v],
        normal: topNormal,
        stratum: 0,
      });
    }
  }

  // ── Four sloped sides ──
  // Each side is parameterized by (u along edge, v from base to top)
  const sides: { axis: "x" | "z"; sign: number }[] = [
    { axis: "z", sign: 1 },  // front face (z > 0)
    { axis: "z", sign: -1 }, // back face (z < 0)
    { axis: "x", sign: 1 },  // right face (x > 0)
    { axis: "x", sign: -1 }, // left face (x < 0)
  ];

  for (const side of sides) {
    for (let yi = 0; yi <= density; yi++) {
      const t = yi / density;
      const y = MESA_Y_MIN + t * MESA_H;
      const hw = mesaHalfWidthAtY(y);

      // Determine which stratum this y belongs to
      let stratum = 3;
      for (let s = STRATA_Y.length - 1; s >= 0; s--) {
        if (y >= STRATA_Y[s]) {
          stratum = s;
          break;
        }
      }

      // Compute surface normal for this side
      // The slope angle depends on the inward lean
      const slopeAngle = Math.atan2(BASE_HALF - TOP_HALF, MESA_H);
      let normal: Vec3;

      if (side.axis === "z") {
        normal = normalize([0, Math.sin(slopeAngle), side.sign * Math.cos(slopeAngle)]);
      } else {
        normal = normalize([side.sign * Math.cos(slopeAngle), Math.sin(slopeAngle), 0]);
      }

      for (let ui = 0; ui <= density; ui++) {
        const u = -hw + (2 * hw * ui) / density;
        let pos: Vec3;

        if (side.axis === "z") {
          pos = [u, y, side.sign * hw];
        } else {
          pos = [side.sign * hw, y, u];
        }

        vertices.push({ pos, normal, stratum });
      }
    }
  }

  // ── Strata bands (horizontal ridges) ──
  // Add extra detail at strata lines — horizontal ledges that protrude slightly
  for (let si = 0; si < STRATA_Y.length; si++) {
    const y = STRATA_Y[si];
    const hw = mesaHalfWidthAtY(y);
    const ledge = 0.04; // slight outward protrusion
    const ledgeNormal: Vec3 = [0, 1, 0]; // upward-facing ledge

    for (const side of sides) {
      for (let ui = 0; ui <= density * 1.5; ui++) {
        const u = -hw + (2 * hw * ui) / (density * 1.5);
        let pos: Vec3;

        if (side.axis === "z") {
          pos = [u, y + ledge, side.sign * (hw + ledge)];
        } else {
          pos = [side.sign * (hw + ledge), y + ledge, u];
        }

        vertices.push({ pos, normal: ledgeNormal, stratum: si });
      }
    }
  }

  return vertices;
}

// ── Character selection ────────────────────────────────────────────────────

function luminanceToChar(lum: number, normal: Vec3): string {
  // Context-sensitive: prefer edge characters based on normal direction
  const absNx = Math.abs(normal[0]);
  const absNz = Math.abs(normal[2]);
  const absNy = Math.abs(normal[1]);

  // If normal is mostly horizontal, consider edge characters
  if (lum > 0.55 && absNy < 0.3) {
    // Vertical edge for X-facing normals
    if (absNx > absNz && absNx > 0.5) return "│";
    // Horizontal edge for Z-facing normals
    if (absNz > absNx && absNz > 0.5) return "─";
  }

  // Corner characters at high luminance with mixed normals
  if (lum > 0.75) {
    if (normal[1] > 0.3 && (absNx > 0.3 || absNz > 0.3)) {
      // Top corners
      if (normal[0] > 0.2 && normal[2] > 0.2) return "╭";
      if (normal[0] < -0.2 && normal[2] > 0.2) return "╮";
      // Bottom corners
      if (normal[0] > 0.2 && normal[2] < -0.2) return "╰";
      if (normal[0] < -0.2 && normal[2] < -0.2) return "╯";
    }
  }

  // Fallback: density ramp based on luminance
  for (let i = LUMINANCE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (lum >= LUMINANCE_THRESHOLDS[i]) return DENSITY_CHARS[i];
  }
  return " ";
}

// ── Projection ─────────────────────────────────────────────────────────────

const CAMERA_DIST = 3.5; // Distance from origin to camera

function project(
  p: Vec3,
  cols: number,
  rows: number
): { col: number; row: number; z: number } | null {
  // Perspective projection
  const z = p[2] + CAMERA_DIST;
  if (z <= 0.1) return null; // Behind camera

  const scale = CAMERA_DIST / z;
  const screenX = p[0] * scale;
  const screenY = -p[1] * scale; // Flip Y for screen coords

  const col = Math.round(screenX * (cols / 3) + cols / 2);
  const row = Math.round(screenY * (rows / 2.2) + rows / 2);

  // Validate projection coordinates
  if (!isFinite(col) || !isFinite(row) || !isFinite(z)) {
    console.error("Degenerate projection:", { vertex: p, col, row, z });
    return null;
  }

  return { col, row, z };
}

// ── Component ──────────────────────────────────────────────────────────────

export function AsciiMesa() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const angleRef = useRef(0);
  const lastFrameRef = useRef(0);
  const startTimeRef = useRef(0);
  const pausedRef = useRef({
    reducedMotion: false,
    hidden: false,
    offScreen: false,
  });
  const staticFrameDrawn = useRef(false);

  const renderFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cols: number,
      rows: number,
      vertices: MesaVertex[],
      time: number
    ) => {
      // Clear
      ctx.clearRect(0, 0, cols * CELL_W, rows * CELL_H);

      // Compute rotation angles
      const yAngle = angleRef.current;
      const xAngle = X_WOBBLE_AMP * Math.sin(time * X_WOBBLE_FREQ);

      // Z-buffer (one entry per grid cell): stores depth, character, alpha
      const zbuf: (
        | { z: number; char: string; alpha: number }
        | undefined
      )[] = new Array(cols * rows);

      // Project each vertex
      for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        // Rotate
        let p = rotateY(v.pos, yAngle);
        p = rotateX(p, xAngle);

        // Also rotate normal for lighting
        let n = rotateY(v.normal, yAngle);
        n = rotateX(n, xAngle);

        // Project
        const proj = project(p, cols, rows);
        if (!proj) continue;

        const { col, row, z } = proj;
        if (col < 0 || col >= cols || row < 0 || row >= rows) continue;

        const idx = row * cols + col;

        // Z-buffer test
        if (zbuf[idx] && zbuf[idx].z <= z) continue;

        // Compute luminance from surface normal and light direction
        let lum = dot(n, LIGHT_DIR);
        lum = Math.max(0, Math.min(1, lum * 0.7 + 0.3)); // Ambient + diffuse

        const char = luminanceToChar(lum, n);
        if (char === " ") continue;

        // Stratum-based opacity: top (0) = 0.9, each layer decreases by 0.08
        const alpha = Math.max(0.3, 0.9 - v.stratum * 0.08);

        zbuf[idx] = { z, char, alpha: alpha * (0.5 + lum * 0.5) };
      }

      // Render from z-buffer
      ctx.font = CHAR_FONT;
      ctx.textBaseline = "top";

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cell = zbuf[row * cols + col];
          if (!cell) continue;

          ctx.globalAlpha = cell.alpha;
          ctx.fillStyle = AMBER;
          ctx.fillText(cell.char, col * CELL_W, row * CELL_H);
        }
      }

      ctx.globalAlpha = 1;
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Size canvas to container ──
    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    let logicalW = container.clientWidth;
    let logicalH = container.clientHeight;
    let cols = Math.floor(logicalW / CELL_W);
    let rows = Math.floor(logicalH / CELL_H);

    function sizeCanvas() {
      if (!canvas || !ctx || !container) return;
      logicalW = container.clientWidth;
      logicalH = container.clientHeight;
      cols = Math.floor(logicalW / CELL_W);
      rows = Math.floor(logicalH / CELL_H);

      canvas.width = logicalW * dpr;
      canvas.height = logicalH * dpr;
      canvas.style.width = `${logicalW}px`;
      canvas.style.height = `${logicalH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    sizeCanvas();

    // Generate mesa geometry — density controls point count
    // Use fewer points for small canvases
    const densityScale = Math.max(12, Math.min(30, Math.floor(cols / 5)));
    const vertices = generateMesaVertices(densityScale);

    // ── Pause state helpers ──
    function isPaused(): boolean {
      return (
        pausedRef.current.reducedMotion ||
        pausedRef.current.hidden ||
        pausedRef.current.offScreen
      );
    }

    // ── Animation loop ──
    startTimeRef.current = performance.now() / 1000;

    function drawStaticFrame() {
      if (!ctx || staticFrameDrawn.current) return;
      renderFrame(ctx, cols, rows, vertices, 0);
      staticFrameDrawn.current = true;
    }

    function loop(timestamp: number) {
      if (isPaused()) return;

      const elapsed = timestamp - lastFrameRef.current;
      if (elapsed < FRAME_BUDGET_MS) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Frame budget observability
      if (lastFrameRef.current > 0 && elapsed > FRAME_BUDGET_MS * 1.5) {
        console.warn(`Mesa frame budget exceeded: ${elapsed.toFixed(1)}ms`);
      }

      lastFrameRef.current = timestamp;

      const dt = elapsed / 1000;
      angleRef.current += Y_ROT_SPEED * dt;
      const time = (timestamp / 1000) - startTimeRef.current;

      renderFrame(ctx!, cols, rows, vertices, time);
      rafRef.current = requestAnimationFrame(loop);
    }

    function startAnimation() {
      if (isPaused()) return;
      staticFrameDrawn.current = false;
      lastFrameRef.current = performance.now();
      rafRef.current = requestAnimationFrame(loop);
    }

    function stopAnimation() {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    }

    // ── 1. prefers-reduced-motion ──
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    function handleMotionChange(e: MediaQueryListEvent | MediaQueryList) {
      pausedRef.current.reducedMotion = e.matches;
      if (e.matches) {
        stopAnimation();
        drawStaticFrame();
      } else {
        startAnimation();
      }
    }
    handleMotionChange(motionQuery);
    motionQuery.addEventListener("change", handleMotionChange as (e: MediaQueryListEvent) => void);

    // ── 2. Page Visibility ──
    function handleVisibility() {
      const hidden = document.hidden;
      pausedRef.current.hidden = hidden;
      if (hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    // ── 3. IntersectionObserver ──
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const offScreen = !entry.isIntersecting;
        pausedRef.current.offScreen = offScreen;
        if (offScreen) {
          stopAnimation();
        } else {
          startAnimation();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    // ── Resize handler ──
    const resizeObserver = new ResizeObserver(() => {
      sizeCanvas();
      // Re-render immediately if paused on static frame
      if (pausedRef.current.reducedMotion) {
        staticFrameDrawn.current = false;
        drawStaticFrame();
      }
    });
    resizeObserver.observe(container);

    // Start if not paused
    if (!isPaused()) {
      startAnimation();
    }

    // ── Cleanup ──
    return () => {
      stopAnimation();
      motionQuery.removeEventListener("change", handleMotionChange as (e: MediaQueryListEvent) => void);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [renderFrame]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
      }}
    />
  );
}

export default AsciiMesa;
