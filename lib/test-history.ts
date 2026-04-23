import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { type VPNTestRun } from "@/types/vpn";

const HISTORY_PATH = path.join(process.cwd(), ".data", "vpn-test-history.json");

async function ensureHistoryFile() {
  await mkdir(path.dirname(HISTORY_PATH), { recursive: true });

  try {
    await readFile(HISTORY_PATH, "utf8");
  } catch {
    await writeFile(HISTORY_PATH, "[]", "utf8");
  }
}

async function readHistory(): Promise<VPNTestRun[]> {
  await ensureHistoryFile();
  const raw = await readFile(HISTORY_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw) as VPNTestRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveTestRun(run: VPNTestRun): Promise<void> {
  const history = await readHistory();
  history.unshift(run);
  const trimmed = history.slice(0, 120);
  await writeFile(HISTORY_PATH, JSON.stringify(trimmed, null, 2), "utf8");
}

export async function readRecentRuns(limit = 8): Promise<VPNTestRun[]> {
  const history = await readHistory();
  return history.slice(0, limit);
}
