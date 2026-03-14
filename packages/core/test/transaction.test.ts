import { mkdtemp, readFile, rm, stat, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FileTransaction } from "../src/transaction.js";

describe("FileTransaction", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(resolve(tmpdir(), "driftless-tx-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  async function exists(p: string): Promise<boolean> {
    try {
      await stat(p);
      return true;
    } catch {
      return false;
    }
  }

  it("writeFile creates file and tracks it; rollback removes it", async () => {
    const tx = new FileTransaction();
    const filePath = join(tmpDir, "new-file.txt");

    await tx.writeFile(filePath, "hello");
    expect(await readFile(filePath, "utf-8")).toBe("hello");

    await tx.rollback();
    expect(await exists(filePath)).toBe(false);
  });

  it("writeFile on pre-existing file tracks it; rollback leaves it in place", async () => {
    const tx = new FileTransaction();
    const filePath = join(tmpDir, "existing.txt");

    // Create file before transaction
    await writeFile(filePath, "original", "utf-8");

    await tx.writeFile(filePath, "overwritten");
    expect(await readFile(filePath, "utf-8")).toBe("overwritten");

    await tx.rollback();
    // File should still exist (it pre-existed)
    expect(await exists(filePath)).toBe(true);
  });

  it("mkdir creates directory and tracks it; rollback removes it", async () => {
    const tx = new FileTransaction();
    const dirPath = join(tmpDir, "new-dir");

    await tx.mkdir(dirPath);
    expect(await exists(dirPath)).toBe(true);

    await tx.rollback();
    expect(await exists(dirPath)).toBe(false);
  });

  it("mkdir on pre-existing directory leaves it on rollback", async () => {
    const tx = new FileTransaction();
    const dirPath = join(tmpDir, "existing-dir");

    // Create directory before transaction
    await mkdir(dirPath, { recursive: true });

    await tx.mkdir(dirPath);
    await tx.rollback();
    // Directory should still exist
    expect(await exists(dirPath)).toBe(true);
  });

  it("rollback processes in reverse creation order", async () => {
    const tx = new FileTransaction();
    const dirPath = join(tmpDir, "parent");
    const filePath = join(dirPath, "child.txt");

    // Create dir first, then file inside it
    await tx.mkdir(dirPath);
    await tx.writeFile(filePath, "child");

    // Rollback should remove file first (reverse order), then empty dir
    await tx.rollback();
    expect(await exists(filePath)).toBe(false);
    expect(await exists(dirPath)).toBe(false);
  });

  it("rollback skips paths in excludePaths", async () => {
    const tx = new FileTransaction();
    const keepFile = join(tmpDir, "keep.txt");
    const removeFile = join(tmpDir, "remove.txt");

    await tx.writeFile(keepFile, "keep me");
    await tx.writeFile(removeFile, "remove me");

    await tx.rollback([keepFile]);
    expect(await exists(keepFile)).toBe(true);
    expect(await exists(removeFile)).toBe(false);
  });

  it("commit() clears tracking — subsequent rollback is no-op", async () => {
    const tx = new FileTransaction();
    const filePath = join(tmpDir, "committed.txt");

    await tx.writeFile(filePath, "committed");
    tx.commit();

    await tx.rollback();
    // File should still exist because commit cleared tracking
    expect(await exists(filePath)).toBe(true);
    expect(await readFile(filePath, "utf-8")).toBe("committed");
  });

  it("rollback doesn't throw on already-deleted files", async () => {
    const tx = new FileTransaction();
    const filePath = join(tmpDir, "will-vanish.txt");

    await tx.writeFile(filePath, "temporary");
    // Manually delete the file before rollback
    await rm(filePath, { force: true });

    // Should not throw
    await expect(tx.rollback()).resolves.toEqual([]);
  });

  it("track() registers externally-written files for rollback", async () => {
    const tx = new FileTransaction();
    const filePath = join(tmpDir, "external.txt");

    // Write file outside the transaction
    await writeFile(filePath, "external content", "utf-8");
    tx.track(filePath, "file");

    // Rollback should remove it since it's tracked as non-pre-existing
    const cleaned = await tx.rollback();
    expect(await exists(filePath)).toBe(false);
    expect(cleaned).toContain(filePath);
  });

  it("rollback returns list of cleaned paths", async () => {
    const tx = new FileTransaction();
    const dirPath = join(tmpDir, "parent");
    const filePath = join(dirPath, "child.txt");

    await tx.mkdir(dirPath);
    await tx.writeFile(filePath, "child");

    const cleaned = await tx.rollback();
    expect(cleaned).toContain(filePath);
    expect(cleaned).toContain(dirPath);
  });
});
