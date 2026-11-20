import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { AdminSecurityStatus } from '../src/types/universe.ts';
import type { SecurityOverrides } from './store.ts';

const SESSION_COOKIE_UNIVERSE = 'mlu_universe_session';
const SESSION_COOKIE_ADMIN = 'mlu_admin_session';

const EXAMPLE_PLACEHOLDER_PASSWORDS = new Set([
  'MLU#Owner!9xK2$vP7qR4wZ8',
]);

function isUnconfiguredStub(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (
    /^MY_[A-Z0-9_]+$/.test(trimmed) ||
    /^change-me/i.test(trimmed) ||
    /^replace-with/i.test(trimmed)
  ) {
    return true;
  }
  // Preview hosts may inject an identical short stub for every unconfigured .env.example variable
  const u = process.env.UNIVERSE_ACCESS_CODE?.trim();
  const au = process.env.ADMIN_USERNAME?.trim();
  const ap = process.env.ADMIN_PASSWORD?.trim();
  const ss = process.env.SESSION_SECRET?.trim();
  if (u && au && ap && ss && u === au && au === ap && ap === ss) {
    return true;
  }
  return false;
}

const RAW_SESSION_SECRET =
  process.env.SESSION_SECRET && !isUnconfiguredStub(process.env.SESSION_SECRET)
    ? process.env.SESSION_SECRET.trim()
    : '';

const FALLBACK_SECRET = crypto
  .createHash('sha256')
  .update(RAW_SESSION_SECRET || 'mehak-little-universe-dev-signing-key')
  .digest('hex');

const SESSION_SECRET = RAW_SESSION_SECRET || FALLBACK_SECRET;

export function hasCustomEnvAccessCode(): boolean {
  const val = process.env.UNIVERSE_ACCESS_CODE;
  return Boolean(val && !isUnconfiguredStub(val));
}

export function hasCustomEnvAdminUsername(): boolean {
  const val = process.env.ADMIN_USERNAME;
  return Boolean(val && !isUnconfiguredStub(val));
}

export function hasCustomEnvAdminPassword(): boolean {
  const val = process.env.ADMIN_PASSWORD?.trim();
  return Boolean(
    val && !isUnconfiguredStub(val) && !EXAMPLE_PLACEHOLDER_PASSWORDS.has(val)
  );
}

const CONFIGURED_OWNER_USERNAME = 'AMC';
const CONFIGURED_OWNER_PASSWORD_HASH =
  'scrypt:40b318e80d7bc6abdf448107a01a4af4:dae3b41f9ddd02d3538fed7ff8d883fdf51b73c786f1437f00ee23b62d444323';

export function getConfiguredAccessCode(): string {
  const val = process.env.UNIVERSE_ACCESS_CODE;
  return !val || isUnconfiguredStub(val) ? 'mehak' : val.trim();
}

export function getConfiguredAdminUsername(): string {
  const val = process.env.ADMIN_USERNAME;
  return !val || isUnconfiguredStub(val) ? CONFIGURED_OWNER_USERNAME : val.trim();
}

export function getConfiguredAdminPassword(): string | null {
  const val = process.env.ADMIN_PASSWORD;
  if (!val || isUnconfiguredStub(val)) return null;
  return val.trim();
}

export function hashSecret(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 32).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function verifyHashedSecret(plain: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hexKey] = parts;
  if (!salt || !hexKey) return false;
  try {
    const derived = crypto.scryptSync(plain, salt, 32);
    const expected = Buffer.from(hexKey, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function timingSafeCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function verifyAccessCode(
  input: string,
  overrides?: SecurityOverrides | null
): boolean {
  const normalizedInput = input.trim().toLowerCase();
  if (!normalizedInput) return false;
  if (overrides?.accessCodeHash) {
    return verifyHashedSecret(normalizedInput, overrides.accessCodeHash);
  }
  const expected = getConfiguredAccessCode().toLowerCase();
  return timingSafeCompare(normalizedInput, expected);
}

export function requiresCustomAdminUsername(
  _overrides?: SecurityOverrides | null
): boolean {
  return true;
}

export function verifyAdminPasswordOnly(
  password: string,
  overrides?: SecurityOverrides | null
): boolean {
  const cleanPass = password.trim();
  if (!cleanPass) return false;
  if (overrides?.adminPasswordHash) {
    return verifyHashedSecret(cleanPass, overrides.adminPasswordHash);
  }
  const envPass = getConfiguredAdminPassword();
  if (envPass) {
    return timingSafeCompare(cleanPass, envPass);
  }
  return verifyHashedSecret(cleanPass, CONFIGURED_OWNER_PASSWORD_HASH);
}

export function verifyAdminCredentials(
  username: string,
  password: string,
  overrides?: SecurityOverrides | null
): boolean {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();
  if (!cleanUser || !cleanPass) return false;

  const passwordValid = verifyAdminPasswordOnly(cleanPass, overrides);
  if (!passwordValid) return false;

  const expectedUser = (
    overrides?.adminUsername?.trim() || getConfiguredAdminUsername()
  ).toLowerCase();

  return timingSafeCompare(cleanUser, expectedUser);
}

export function getAdminSecurityStatus(
  overrides: SecurityOverrides | null,
  storageMode: 'kv' | 'local-file' | 'vercel-tmp'
): AdminSecurityStatus {
  const adminPasswordSource = overrides?.adminPasswordHash
    ? 'panel'
    : hasCustomEnvAdminPassword()
      ? 'env'
      : 'configured';
  const accessCodeSource = overrides?.accessCodeHash
    ? 'panel'
    : hasCustomEnvAccessCode()
      ? 'env'
      : 'default';

  return {
    usingDefaultAdminPassword: false,
    usingDefaultAccessCode: accessCodeSource === 'default',
    requiresCustomUsername: requiresCustomAdminUsername(overrides),
    adminPasswordSource,
    accessCodeSource,
    storageMode,
    durableStorageActive: storageMode !== 'vercel-tmp',
  };
}

// --- Brute-force protection for /api/admin/login ---
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 8;
const failedLoginMap = new Map<string, { count: number; resetAt: number }>();

function getClientKey(req: Request): string {
  const fwd = req.header('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.ip || 'unknown';
}

export function checkAdminLoginRateLimit(req: Request): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const key = getClientKey(req);
  const entry = failedLoginMap.get(key);
  if (!entry) return { allowed: true, retryAfterSeconds: 0 };
  if (Date.now() > entry.resetAt) {
    failedLoginMap.delete(key);
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailedAdminLogin(req: Request): void {
  const key = getClientKey(req);
  const now = Date.now();
  const entry = failedLoginMap.get(key);
  if (!entry || now > entry.resetAt) {
    failedLoginMap.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearAdminLoginFailures(req: Request): void {
  failedLoginMap.delete(getClientKey(req));
}

// --- Signed HttpOnly Cookie Sessions ---

interface TokenPayload {
  role: 'universe' | 'admin';
  exp: number;
  nonce: string;
}

export function createSessionToken(role: 'universe' | 'admin', ttlHours = 72): string {
  const payload: TokenPayload = {
    role,
    exp: Date.now() + ttlHours * 60 * 60 * 1000,
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifySessionToken(
  token: string | undefined,
  expectedRole: 'universe' | 'admin'
): boolean {
  if (!token || !token.includes('.')) return false;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  if (!timingSafeCompare(signature, expectedSig)) return false;

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as TokenPayload;
    return (
      parsed.role === expectedRole &&
      typeof parsed.exp === 'number' &&
      parsed.exp > Date.now()
    );
  } catch {
    return false;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    result[key] = val;
  }
  return result;
}

function getCookieSecurityOptions(req: Request): {
  secure: boolean;
  sameSite: 'none' | 'lax';
  partitioned?: boolean;
} {
  const proto = req.header('x-forwarded-proto') || (req.secure ? 'https' : 'http');
  const isHttps =
    proto.includes('https') ||
    process.env.VERCEL === '1' ||
    process.env.NODE_ENV === 'production';

  if (isHttps) {
    // On HTTPS (AI Studio preview iframe + Vercel production), SameSite=None + Secure + Partitioned (CHIPS)
    // ensures HttpOnly cookies are stored and sent inside embedded cross-site iframes AND top-level domains.
    return {
      secure: true,
      sameSite: 'none',
      partitioned: true,
    };
  }

  return {
    secure: false,
    sameSite: 'lax',
  };
}

export function hasAdminSession(req: Request): boolean {
  const cookies = parseCookies(req.headers.cookie);
  if (verifySessionToken(cookies[SESSION_COOKIE_ADMIN], 'admin')) {
    return true;
  }
  const fallbackHeader = req.header('x-admin-session')?.trim();
  return verifySessionToken(fallbackHeader, 'admin');
}

export function hasUniverseSession(req: Request): boolean {
  const cookies = parseCookies(req.headers.cookie);
  if (verifySessionToken(cookies[SESSION_COOKIE_UNIVERSE], 'universe')) {
    return true;
  }
  const fallbackHeader = req.header('x-universe-session')?.trim();
  if (verifySessionToken(fallbackHeader, 'universe')) {
    return true;
  }
  return hasAdminSession(req);
}

export function setSessionCookie(
  req: Request,
  res: Response,
  role: 'universe' | 'admin',
  token: string
): void {
  const name = role === 'admin' ? SESSION_COOKIE_ADMIN : SESSION_COOKIE_UNIVERSE;
  const { secure, sameSite, partitioned } = getCookieSecurityOptions(req);
  res.cookie(name, token, {
    httpOnly: true,
    sameSite,
    secure,
    ...(partitioned ? { partitioned: true } : {}),
    maxAge: (role === 'admin' ? 24 : 168) * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(
  req: Request,
  res: Response,
  role: 'universe' | 'admin'
): void {
  const name = role === 'admin' ? SESSION_COOKIE_ADMIN : SESSION_COOKIE_UNIVERSE;
  const { secure, sameSite, partitioned } = getCookieSecurityOptions(req);
  res.clearCookie(name, {
    httpOnly: true,
    sameSite,
    secure,
    ...(partitioned ? { partitioned: true } : {}),
    path: '/',
  });
}

export function requireUniverseAccess(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!hasUniverseSession(req)) {
    res.status(401).json({ error: 'Private access required to enter this universe.' });
    return;
  }
  next();
}

export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!hasAdminSession(req)) {
    res.status(403).json({ error: 'Administrator authentication required.' });
    return;
  }
  next();
}
