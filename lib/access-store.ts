import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { type AccessGrant } from "@/types/vpn";

const ACCESS_STORE_PATH = path.join(process.cwd(), ".data", "access-grants.json");

async function ensureStore() {
  await mkdir(path.dirname(ACCESS_STORE_PATH), { recursive: true });

  try {
    await readFile(ACCESS_STORE_PATH, "utf8");
  } catch {
    await writeFile(ACCESS_STORE_PATH, "[]", "utf8");
  }
}

async function readAllGrants(): Promise<AccessGrant[]> {
  await ensureStore();
  const raw = await readFile(ACCESS_STORE_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw) as AccessGrant[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAllGrants(grants: AccessGrant[]) {
  await ensureStore();
  await writeFile(ACCESS_STORE_PATH, JSON.stringify(grants, null, 2), "utf8");
}

export async function upsertAccessGrant(emailInput: string, paymentId?: string) {
  const email = emailInput.trim().toLowerCase();
  if (!email) {
    return;
  }

  const grants = await readAllGrants();
  const existing = grants.find((grant) => grant.email === email);

  if (existing) {
    existing.grantedAt = new Date().toISOString();
    existing.lastPaymentId = paymentId ?? existing.lastPaymentId;
  } else {
    grants.push({
      email,
      grantedAt: new Date().toISOString(),
      lastPaymentId: paymentId,
    });
  }

  await writeAllGrants(grants);
}

export async function hasAccessGrant(emailInput: string): Promise<boolean> {
  const email = emailInput.trim().toLowerCase();
  if (!email) {
    return false;
  }

  const grants = await readAllGrants();
  return grants.some((grant) => grant.email === email);
}
