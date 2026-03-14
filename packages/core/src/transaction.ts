import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";

/**
 * Entry tracking a filesystem mutation during a transactional operation.
 */
interface TrackingEntry {
  /** Absolute path of the file or directory */
  path: string;
  /** Whether the entry is a file or directory */
  type: "file" | "dir";
  /** Whether the path already existed before the transaction wrote to it */
  preExisted: boolean;
}

/**
 * Tracks filesystem mutations (file writes, directory creates) and can undo
 * those that didn't pre-exist on rollback. Used by `init` to clean up on failure.
 *
 * Usage:
 *   const tx = new FileTransaction();
 *   await tx.mkdir("/project/.driftless");
 *   await tx.writeFile("/project/.driftless/config.json", content);
 *   // on error:
 *   await tx.rollback();
 *   // on success:
 *   tx.commit();
 */
export class FileTransaction {
  private tracked: TrackingEntry[] = [];

  /**
   * Write a file and track it. If the file already exists, it is overwritten
   * but marked as pre-existing so rollback won't remove it.
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    const preExisted = await pathExists(filePath);
    await writeFile(filePath, content, "utf-8");
    this.tracked.push({ path: filePath, type: "file", preExisted });
  }

  /**
   * Create a directory (recursive) and track it. Pre-existing directories
   * are tracked but left untouched on rollback.
   */
  async mkdir(dirPath: string): Promise<void> {
    const preExisted = await pathExists(dirPath);
    await mkdir(dirPath, { recursive: true });
    this.tracked.push({ path: dirPath, type: "dir", preExisted });
  }

  /**
   * Register a path that was already written to disk by external code.
   * Marks it as non-pre-existing so rollback will clean it up.
   * Use this for files written by subsystems (e.g. generateDocs, installSkills)
   * that the transaction didn't write directly.
   */
  track(filePath: string, type: "file" | "dir"): void {
    this.tracked.push({ path: filePath, type, preExisted: false });
  }

  /**
   * Commit the transaction — clears tracking so a subsequent rollback is a no-op.
   * Files are already on disk; this just signals success.
   */
  commit(): void {
    this.tracked = [];
  }

  /**
   * Roll back tracked mutations in reverse order.
   * - Files that didn't pre-exist are deleted (unless in excludePaths).
   * - Directories that didn't pre-exist are removed only if empty after cleanup.
   * - Already-deleted paths are silently skipped.
   */
  async rollback(excludePaths?: string[]): Promise<string[]> {
    const excludeSet = new Set(excludePaths ?? []);
    const cleaned: string[] = [];

    // Process in reverse creation order
    for (let i = this.tracked.length - 1; i >= 0; i--) {
      const entry = this.tracked[i];

      if (entry.preExisted || excludeSet.has(entry.path)) {
        continue;
      }

      try {
        if (entry.type === "file") {
          // Check existence first — rm({force:true}) silently succeeds on missing files
          const fileExists = await pathExists(entry.path);
          if (fileExists) {
            await rm(entry.path, { force: true });
            cleaned.push(entry.path);
          }
        } else {
          // Only remove directory if it's empty
          const contents = await readdir(entry.path);
          if (contents.length === 0) {
            await rm(entry.path, { force: true, recursive: true });
            cleaned.push(entry.path);
          }
        }
      } catch {
        // Silently skip already-deleted or inaccessible paths
      }
    }

    this.tracked = [];
    return cleaned;
  }
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}
