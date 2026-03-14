import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Single structured log entry produced during a driftless operation.
 */
export interface DebugEntry {
  /** ISO 8601 timestamp of when the entry was recorded */
  timestamp: string;
  /** Operation phase (e.g. "detect", "config", "generate", "error", "rollback") */
  phase: string;
  /** Arbitrary diagnostic payload */
  data: unknown;
}

/**
 * Accumulates structured diagnostic entries during a driftless operation
 * and flushes them to disk as a JSON file.
 *
 * Design: flush() never throws — write failures are downgraded to console.warn
 * so that debug logging can never crash the primary operation.
 *
 * Inspection: `cat .driftless/debug.log | jq '.[] | select(.phase == "error")'`
 */
export class DebugLogger {
  private _entries: DebugEntry[] = [];

  /**
   * Record a diagnostic entry.
   */
  log(phase: string, data: unknown): void {
    this._entries.push({
      timestamp: new Date().toISOString(),
      phase,
      data,
    });
  }

  /**
   * Write all accumulated entries to disk as a JSON array.
   * Creates parent directories if needed. Never throws — catches
   * write errors and emits console.warn instead.
   */
  async flush(logPath: string): Promise<void> {
    try {
      await mkdir(dirname(logPath), { recursive: true });
      await writeFile(logPath, JSON.stringify(this._entries, null, 2), "utf-8");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`DebugLogger: failed to write ${logPath}: ${msg}`);
    }
  }

  /**
   * Access accumulated entries for test inspection.
   */
  get entries(): ReadonlyArray<DebugEntry> {
    return this._entries;
  }
}
