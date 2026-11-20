import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createSeedUniverse } from '../src/data/seedUniverse.ts';
import type { UniverseData } from '../src/types/universe.ts';

const IS_VERCEL = process.env.VERCEL === '1';
const KV_URL =
  process.env.KV_REST_API_URL?.trim() ||
  process.env.UPSTASH_REDIS_REST_URL?.trim() ||
  '';
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN?.trim() ||
  process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
  '';
const USE_KV = Boolean(KV_URL && KV_TOKEN);
const KV_KEY = 'mehaks_little_universe:v1:data';

const DATA_DIR = IS_VERCEL
  ? path.join(os.tmpdir(), 'mehaks-universe-data')
  : path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'universe.json');

let cachedData: UniverseData | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function normalizeUniverseData(raw: Partial<UniverseData>): UniverseData {
  const seed = createSeedUniverse();
  return {
    ...seed,
    ...raw,
    settings: { ...seed.settings, ...(raw.settings ?? {}) },
    sessions:
      Array.isArray(raw.sessions) && raw.sessions.length > 0
        ? raw.sessions
        : seed.sessions,
    answerRecords: Array.isArray(raw.answerRecords) ? raw.answerRecords : [],
    quizAttempts: Array.isArray(raw.quizAttempts) ? raw.quizAttempts : [],
    gameRecords: Array.isArray(raw.gameRecords) ? raw.gameRecords : [],
    activityEvents: Array.isArray(raw.activityEvents) ? raw.activityEvents : [],
  };
}

async function readFromKv(): Promise<UniverseData | null> {
  if (!USE_KV) return null;
  try {
    const res = await fetch(`${KV_URL}/get/${encodeURIComponent(KV_KEY)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: string | null };
    if (!json.result) return null;
    const parsed =
      typeof json.result === 'string'
        ? (JSON.parse(json.result) as Partial<UniverseData>)
        : (json.result as Partial<UniverseData>);
    return normalizeUniverseData(parsed);
  } catch {
    return null;
  }
}

async function writeToKv(data: UniverseData): Promise<void> {
  if (!USE_KV) return;
  const serialized = JSON.stringify(data);
  const res = await fetch(`${KV_URL}/set/${encodeURIComponent(KV_KEY)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'text/plain; charset=utf-8',
    },
    body: serialized,
  });
  if (!res.ok) {
    throw new Error(`KV persistence failed (${res.status})`);
  }
}

async function ensureLoaded(): Promise<UniverseData> {
  // On Vercel KV, fetch fresh state so concurrent serverless instances stay in sync
  if (USE_KV) {
    const fromKv = await readFromKv();
    if (fromKv) {
      cachedData = fromKv;
      return fromKv;
    }
    const seed = createSeedUniverse();
    cachedData = seed;
    await persistStore(seed);
    return seed;
  }

  if (cachedData) return cachedData;
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    cachedData = normalizeUniverseData(JSON.parse(raw) as Partial<UniverseData>);
    return cachedData;
  } catch {
    const seed = createSeedUniverse();
    cachedData = seed;
    await persistStore(seed);
    return seed;
  }
}

async function persistStore(data: UniverseData): Promise<void> {
  if (USE_KV) {
    await writeToKv(data);
    return;
  }
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tempPath = `${DATA_FILE}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tempPath, DATA_FILE);
  });
  await writeQueue;
}

export interface SecurityOverrides {
  adminUsername?: string;
  adminPasswordHash?: string;
  accessCodeHash?: string;
  updatedAt: string;
}

const SECURITY_KV_KEY = 'mehaks_little_universe:v1:security';
const SECURITY_FILE = path.join(DATA_DIR, 'security.json');
let cachedSecurity: SecurityOverrides | null = null;
let securityWriteQueue: Promise<void> = Promise.resolve();

export function getStorageMode(): 'kv' | 'local-file' | 'vercel-tmp' {
  if (USE_KV) return 'kv';
  if (IS_VERCEL) return 'vercel-tmp';
  return 'local-file';
}

export async function getSecurityOverrides(): Promise<SecurityOverrides | null> {
  if (USE_KV) {
    try {
      const res = await fetch(`${KV_URL}/get/${encodeURIComponent(SECURITY_KV_KEY)}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { result?: string | null };
      if (!json.result) return null;
      const parsed =
        typeof json.result === 'string'
          ? (JSON.parse(json.result) as SecurityOverrides)
          : (json.result as SecurityOverrides);
      cachedSecurity = parsed;
      return parsed;
    } catch {
      return null;
    }
  }
  if (cachedSecurity) return cachedSecurity;
  try {
    const raw = await fs.readFile(SECURITY_FILE, 'utf8');
    cachedSecurity = JSON.parse(raw) as SecurityOverrides;
    return cachedSecurity;
  } catch {
    return null;
  }
}

export async function saveSecurityOverrides(
  updater: (current: SecurityOverrides) => SecurityOverrides
): Promise<SecurityOverrides> {
  const current = (await getSecurityOverrides()) ?? {
    updatedAt: new Date().toISOString(),
  };
  const next: SecurityOverrides = {
    ...updater({ ...current }),
    updatedAt: new Date().toISOString(),
  };
  cachedSecurity = next;

  if (USE_KV) {
    const res = await fetch(`${KV_URL}/set/${encodeURIComponent(SECURITY_KV_KEY)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'text/plain; charset=utf-8',
      },
      body: JSON.stringify(next),
    });
    if (!res.ok) {
      throw new Error(`Security persistence failed (${res.status})`);
    }
    return next;
  }

  securityWriteQueue = securityWriteQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tempPath = `${SECURITY_FILE}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(next, null, 2), 'utf8');
    await fs.rename(tempPath, SECURITY_FILE);
  });
  await securityWriteQueue;
  return next;
}

export async function getUniverseData(): Promise<UniverseData> {
  const data = await ensureLoaded();
  return structuredClone(data);
}

export async function updateUniverseData(
  updater: (draft: UniverseData) => UniverseData | void
): Promise<UniverseData> {
  const current = await ensureLoaded();
  const draft = structuredClone(current);
  const next = updater(draft) ?? draft;
  cachedData = next;
  await persistStore(next);
  return structuredClone(next);
}

export async function replaceUniverseData(next: UniverseData): Promise<UniverseData> {
  const clone = structuredClone(next);
  cachedData = clone;
  await persistStore(clone);
  return structuredClone(clone);
}
