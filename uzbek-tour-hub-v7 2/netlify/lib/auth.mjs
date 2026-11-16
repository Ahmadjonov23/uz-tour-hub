// Hisoblar va sessiyalar: scrypt parol xeshi + HMAC imzoli HttpOnly cookie
import crypto from "node:crypto";
import { promisify } from "node:util";
import { store } from "./store.mjs";

const scrypt = promisify(crypto.scrypt);
export const COOKIE = "utb_session";
const SESSION_DAYS = 30;

let cachedSecret = null;
async function secret() {
  if (cachedSecret) return cachedSecret;
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32) return (cachedSecret = process.env.AUTH_SECRET);
  // Muhit o'zgaruvchisi bo'lmasa — bir marta tasodifiy kalit yaratib, omborda saqlaymiz
  const cfg = store("utb-config");
  let rec = await cfg.get("auth-secret");
  if (!rec?.value) {
    rec = { value: crypto.randomBytes(48).toString("base64url"), createdAt: new Date().toISOString() };
    await cfg.setJSON("auth-secret", rec);
  }
  return (cachedSecret = rec.value);
}

export const users = () => store("utb-users");
export const normEmail = (e) => String(e || "").trim().toLowerCase();
export const userKey = (email) => "u_" + crypto.createHash("sha256").update(normEmail(email)).digest("hex");

export async function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const key = await scrypt(pw.normalize("NFKC"), salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt}$${key.toString("base64url")}`;
}
export async function verifyPassword(pw, stored) {
  const [alg, salt, hash] = String(stored || "").split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const key = await scrypt(pw.normalize("NFKC"), salt, 64, { N: 16384, r: 8, p: 1 });
  const a = Buffer.from(hash, "base64url");
  return a.length === key.length && crypto.timingSafeEqual(a, key);
}
// Mavjud bo'lmagan email uchun ham vaqt sarflaymiz (timing orqali email borligini bilib bo'lmasin)
export const DUMMY_HASH = "scrypt$AAAAAAAAAAAAAAAAAAAAAA$" + "A".repeat(86);

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
async function sign(data) {
  return crypto.createHmac("sha256", await secret()).update(data).digest("base64url");
}
export async function createToken(user) {
  const payload = b64({ k: user.key, v: user.tokenVersion || 0, exp: Date.now() + SESSION_DAYS * 864e5 });
  return `${payload}.${await sign(payload)}`;
}
async function readToken(tok) {
  const [payload, sig] = String(tok || "").split(".");
  if (!payload || !sig) return null;
  const good = await sign(payload);
  const a = Buffer.from(sig), b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString());
    return d.exp > Date.now() ? d : null;
  } catch { return null; }
}

export function getCookie(req, name) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}
const secureFlag = (req) => (new URL(req.url).protocol === "https:" ? "; Secure" : "");
export const sessionCookie = (req, token) =>
  `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secureFlag(req)}`;
export const clearCookie = (req) => `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag(req)}`;

// Joriy foydalanuvchi (cookie orqali) yoki null
export async function currentUser(req) {
  const t = await readToken(getCookie(req, COOKIE));
  if (!t) return null;
  const u = await users().get(t.k);
  if (!u || (u.tokenVersion || 0) !== t.v) return null;
  return u;
}

// Boshqa saytdan yuborilgan so'rovlarni rad etish (CSRF himoyasi, SameSite cookie bilan birga)
export function sameOrigin(req) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === (req.headers.get("x-forwarded-host") || req.headers.get("host") || new URL(req.url).host); }
  catch { return false; }
}

export const publicUser = (u) => ({
  name: u.name, email: u.email, country: u.country || "", contact: u.contact || "",
  createdAt: u.createdAt, memberId: u.memberId,
  bookings: (u.bookings || []).slice().reverse(),
});
