"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Config ─────────────────────────────────────────────────────────────────

const AMBER = "#C4862A";
const CHAR_FONT = "14px monospace";
const CELL_W = 8;
const CELL_H = 16;
const FPS_CAP = 30;
const FRAME_BUDGET_MS = 1000 / FPS_CAP;

// Rotation: 0.4 RPM with gentle X wobble
const Y_ROT_SPEED = (0.4 * 2 * Math.PI) / 60;
const X_WOBBLE_AMP = (5 * Math.PI) / 180;
const X_WOBBLE_FREQ = 0.3;

const CAMERA_DIST = 3.5;
const LIGHT_DIR: Vec3 = norm([0.5, -0.7, 0.6]);

// Layer fill characters — from Hermes creative skill Unicode palette
// Bottom (lightest) → Top (densest), matching logo graduated opacity
const SLAB_FILL: string[] = ["░", "▒", "▓"];
const SLAB_ALPHA: number[] = [0.8, 0.85, 0.92];

// ── Types ──────────────────────────────────────────────────────────────────

type Vec3 = [number, number, number];
interface Vertex {
  pos: Vec3;
  normal: Vec3;
  slab: number; // 0 = bottom, 1 = middle, 2 = top
}

// ── Slab geometry derived from SVG logo mark ───────────────────────────────
// SVG coordinate space: x 0–160, y 8–110.
// Normalized to 3D: x = (svgX − 80) / 80, y = −(svgY − 59) / 51
// This centers the mesa at origin with y-up orientation.

interface SlabDef {
  topY: number;
  bottomY: number;
  topHW: number;    // half-width at top edge
  bottomHW: number; // half-width at bottom edge
}

const SLABS: SlabDef[] = [
  // Bottom slab (lightest, widest) — SVG: y 80–110, x 8.2–151.8 / 0–160
  { topY: -0.412, bottomY: -1.0, topHW: 0.897, bottomHW: 1.0 },
  // Middle slab — SVG: y 44–74, x 18.1–141.9 / 9.9–150.1
  { topY: 0.294, bottomY: -0.294, topHW: 0.774, bottomHW: 0.876 },
  // Top slab (darkest, narrowest) — SVG: y 8–38, x 28–132 / 19.8–140.2
  { topY: 1.0, bottomY: 0.412, topHW: 0.65, bottomHW: 0.753 },
];

const HALF_DEPTH = 0.35;

// ── Vector math ────────────────────────────────────────────────────────────

function norm(v: Vec3): Vec3 {
  const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  return len ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function rotY(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}

function rotX(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}

// ── Geometry generation ────────────────────────────────────────────────────
// Each slab is a 3D extruded trapezoid with 6 faces:
// front, back (trapezoid fill), top, bottom (strata edges), left, right (side edges)

function generateVertices(density: number): Vertex[] {
  const verts: Vertex[] = [];
  const dz = Math.ceil(density * 0.5); // depth-axis sample count

  for (let si = 0; si < SLABS.length; si++) {
    const { topY, bottomY, topHW, bottomHW } = SLABS[si];
    const h = topY - bottomY;
    const hwAt = (y: number) => bottomHW + ((y - bottomY) / h) * (topHW - bottomHW);
    const slope = Math.atan2(bottomHW - topHW, h);

    // Front face (z = +HALF_DEPTH) and back face (z = −HALF_DEPTH)
    for (const zSign of [1, -1]) {
      const n: Vec3 = [0, 0, zSign];
      for (let yi = 0; yi <= density; yi++) {
        const y = bottomY + (yi / density) * h;
        const hw = hwAt(y);
        for (let xi = 0; xi <= density; xi++) {
          const x = -hw + (2 * hw * xi) / density;
          verts.push({ pos: [x, y, zSign * HALF_DEPTH], normal: n, slab: si });
        }
      }
    }

    // Top face (y = topY)
    {
      const n: Vec3 = [0, 1, 0];
      for (let zi = 0; zi <= dz; zi++) {
        const z = -HALF_DEPTH + (2 * HALF_DEPTH * zi) / dz;
        for (let xi = 0; xi <= density; xi++) {
          const x = -topHW + (2 * topHW * xi) / density;
          verts.push({ pos: [x, topY, z], normal: n, slab: si });
        }
      }
    }

    // Bottom face (y = bottomY)
    {
      const n: Vec3 = [0, -1, 0];
      for (let zi = 0; zi <= dz; zi++) {
        const z = -HALF_DEPTH + (2 * HALF_DEPTH * zi) / dz;
        for (let xi = 0; xi <= density; xi++) {
          const x = -bottomHW + (2 * bottomHW * xi) / density;
          verts.push({ pos: [x, bottomY, z], normal: n, slab: si });
        }
      }
    }

    // Left face (x = −hw) and right face (x = +hw)
    for (const xSign of [-1, 1]) {
      const n: Vec3 = norm([xSign * Math.cos(slope), Math.sin(slope), 0]);
      for (let yi = 0; yi <= density; yi++) {
        const y = bottomY + (yi / density) * h;
        const hw = hwAt(y);
        for (let zi = 0; zi <= dz; zi++) {
          const z = -HALF_DEPTH + (2 * HALF_DEPTH * zi) / dz;
          verts.push({ pos: [xSign * hw, y, z], normal: n, slab: si });
        }
      }
    }
  }

  return verts;
}

// ── Character selection ────────────────────────────────────────────────────
// Normal-driven: front/back → slab fill, top/bottom → strata edge, sides → vertical edge

function selectChar(lum: number, n: Vec3, slab: number): string {
  if (lum < 0.08) return " ";

  const ax = Math.abs(n[0]);
  const ay = Math.abs(n[1]);
  const az = Math.abs(n[2]);

  // Top/bottom faces → horizontal strata line (the key logo outline)
  if (ay > 0.7 && lum > 0.15) return "─";

  // Side faces → vertical edge
  if (ax > 0.6 && az < 0.3 && lum > 0.2) return "│";

  // Corner hints at bright transitions between faces
  if (lum > 0.55 && ay > 0.25 && (ax > 0.25 || az > 0.25)) {
    if (n[0] > 0.2 && n[2] > 0.2) return "╭";
    if (n[0] < -0.2 && n[2] > 0.2) return "╮";
    if (n[0] > 0.2 && n[2] < -0.2) return "╰";
    if (n[0] < -0.2 && n[2] < -0.2) return "╯";
  }

  // Front/back fill: layer-specific density character
  return SLAB_FILL[slab];
}

// ── Projection ─────────────────────────────────────────────────────────────

function project(p: Vec3, cols: number, rows: number) {
  const z = p[2] + CAMERA_DIST;
  if (z <= 0.1) return null;
  const s = CAMERA_DIST / z;
  const col = Math.round(p[0] * s * (cols / 3) + cols / 2);
  const row = Math.round(-p[1] * s * (rows / 2.2) + rows / 2);
  if (!isFinite(col) || !isFinite(row)) return null;
  return { col, row, z };
}

// ── Component ──────────────────────────────────────────────────────────────

export function AsciiMesa() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const angleRef = useRef(0);
  const lastFrameRef = useRef(0);
  const startTimeRef = useRef(0);
  const pauseRef = useRef({ reducedMotion: false, hidden: false, offScreen: false });
  const staticDrawn = useRef(false);

  const renderFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cols: number,
      rows: number,
      vertices: Vertex[],
      time: number,
    ) => {
      ctx.clearRect(0, 0, cols * CELL_W, rows * CELL_H);

      const yA = angleRef.current;
      const xA = X_WOBBLE_AMP * Math.sin(time * X_WOBBLE_FREQ);

      // Z-buffer: one entry per grid cell
      type Cell = { z: number; char: string; alpha: number };
      const zbuf: (Cell | undefined)[] = new Array(cols * rows);

      for (const v of vertices) {
        let p = rotY(v.pos, yA);
        p = rotX(p, xA);
        let n = rotY(v.normal, yA);
        n = rotX(n, xA);

        const proj = project(p, cols, rows);
        if (!proj) continue;
        const { col, row, z } = proj;
        if (col < 0 || col >= cols || row < 0 || row >= rows) continue;

        const idx = row * cols + col;
        if (zbuf[idx] && zbuf[idx]!.z <= z) continue;

        // Diffuse + ambient lighting
        let lum = dot(n, LIGHT_DIR);
        lum = Math.max(0, Math.min(1, lum * 0.7 + 0.3));

        const char = selectChar(lum, n, v.slab);
        if (char === " ") continue;

        const alpha = SLAB_ALPHA[v.slab] * (0.4 + lum * 0.6);
        zbuf[idx] = { z, char, alpha };
      }

      // Render from z-buffer
      ctx.font = CHAR_FONT;
      ctx.textBaseline = "top";
      ctx.fillStyle = AMBER;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = zbuf[r * cols + c];
          if (!cell) continue;
          ctx.globalAlpha = cell.alpha;
          ctx.fillText(cell.char, c * CELL_W, r * CELL_H);
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
    let cols = 0;
    let rows = 0;

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
    }

    resize();

    // Scale point density to canvas size
    const densityScale = Math.max(12, Math.min(28, Math.floor(cols / 5)));
    const vertices = generateVertices(densityScale);

    // ── Pause state ──
    function isPaused() {
      return pauseRef.current.reducedMotion || pauseRef.current.hidden || pauseRef.current.offScreen;
    }

    function drawStatic() {
      if (!ctx || staticDrawn.current) return;
      renderFrame(ctx, cols, rows, vertices, 0);
      staticDrawn.current = true;
    }

    // ── Animation loop ──
    startTimeRef.current = performance.now() / 1000;

    function loop(ts: number) {
      if (isPaused()) return;
      const elapsed = ts - lastFrameRef.current;
      if (elapsed < FRAME_BUDGET_MS) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      if (lastFrameRef.current > 0 && elapsed > FRAME_BUDGET_MS * 1.5) {
        console.warn(`Mesa frame budget exceeded: ${elapsed.toFixed(1)}ms`);
      }
      lastFrameRef.current = ts;
      angleRef.current += Y_ROT_SPEED * (elapsed / 1000);
      renderFrame(ctx!, cols, rows, vertices, ts / 1000 - startTimeRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }

    function start() {
      if (isPaused()) return;
      staticDrawn.current = false;
      lastFrameRef.current = performance.now();
      rafRef.current = requestAnimationFrame(loop);
    }

    function stop() {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    }

    // ── prefers-reduced-motion ──
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    function onMotion(e: MediaQueryListEvent | MediaQueryList) {
      pauseRef.current.reducedMotion = e.matches;
      if (e.matches) {
        stop();
        drawStatic();
      } else {
        start();
      }
    }
    onMotion(mq);
    mq.addEventListener("change", onMotion as (e: MediaQueryListEvent) => void);

    // ── Page visibility ──
    function onVis() {
      pauseRef.current.hidden = document.hidden;
      document.hidden ? stop() : start();
    }
    document.addEventListener("visibilitychange", onVis);

    // ── Intersection observer ──
    const io = new IntersectionObserver(
      ([entry]) => {
        pauseRef.current.offScreen = !entry.isIntersecting;
        entry.isIntersecting ? start() : stop();
      },
      { threshold: 0.1 },
    );
    io.observe(canvas);

    // ── Resize observer ──
    const ro = new ResizeObserver(() => {
      resize();
      if (pauseRef.current.reducedMotion) {
        staticDrawn.current = false;
        drawStatic();
      }
    });
    ro.observe(container);

    if (!isPaused()) start();

    return () => {
      stop();
      mq.removeEventListener("change", onMotion as (e: MediaQueryListEvent) => void);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      ro.disconnect();
    };
  }, [renderFrame]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}

export default AsciiMesa;
