import { promises as fs } from "node:fs";
import path from "node:path";

import type { VPNTestReport } from "@/lib/vpn-tester";

const DATA_DIR = path.join(process.cwd(), "data");
const TEST_RESULTS_DIR = path.join(DATA_DIR, "tests");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");

type PurchaseRecord = {
  email: string;
  status: "active" | "inactive";
  source: string;
  eventType: string;
  updatedAt: string;
};

async function ensureDataDirectories() {
  await fs.mkdir(TEST_RESULTS_DIR, { recursive: true });
}

async function readPurchases(): Promise<Record<string, PurchaseRecord>> {
  try {
    const raw = await fs.readFile(PURCHASES_FILE, "utf8");
    return JSON.parse(raw) as Record<string, PurchaseRecord>;
  } catch {
    return {};
  }
}

async function writePurchases(payload: Record<string, PurchaseRecord>) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PURCHASES_FILE, JSON.stringify(payload, null, 2), "utf8");
}

export async function saveTestReport(report: VPNTestReport) {
  await ensureDataDirectories();
  const targetFile = path.join(TEST_RESULTS_DIR, `${report.id}.json`);
  await fs.writeFile(targetFile, JSON.stringify(report, null, 2), "utf8");
}

export async function getTestReport(testId: string) {
  try {
    const targetFile = path.join(TEST_RESULTS_DIR, `${testId}.json`);
    const raw = await fs.readFile(targetFile, "utf8");
    return JSON.parse(raw) as VPNTestReport;
  } catch {
    return null;
  }
}

export async function listRecentReportsByOwner(ownerEmail: string, limit = 12) {
  await ensureDataDirectories();
  const entries = await fs.readdir(TEST_RESULTS_DIR);

  const reports = await Promise.all(
    entries
      .filter((entry) => entry.endsWith(".json"))
      .map(async (entry) => {
        const raw = await fs.readFile(path.join(TEST_RESULTS_DIR, entry), "utf8");
        return JSON.parse(raw) as VPNTestReport;
      })
  );

  return reports
    .filter((report) => report.ownerEmail.toLowerCase() === ownerEmail.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function upsertPurchase(params: {
  email: string;
  source: string;
  eventType: string;
  active: boolean;
}) {
  const key = params.email.trim().toLowerCase();
  const purchases = await readPurchases();

  purchases[key] = {
    email: key,
    status: params.active ? "active" : "inactive",
    source: params.source,
    eventType: params.eventType,
    updatedAt: new Date().toISOString()
  };

  await writePurchases(purchases);
  return purchases[key];
}

export async function hasActivePurchase(email: string) {
  const key = email.trim().toLowerCase();
  const purchases = await readPurchases();
  return purchases[key]?.status === "active";
}
