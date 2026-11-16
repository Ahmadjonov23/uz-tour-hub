// /api/auth/* — ro'yxatdan o'tish, kirish, chiqish, profil
import { json, rateLimited, clean } from "../lib/shared.mjs";
import {
  users, userKey, normEmail, hashPassword, verifyPassword, DUMMY_HASH, createToken,
  sessionCookie, clearCookie, currentUser, sameOrigin, publicUser,
} from "../lib/auth.mjs";
import { notifyTelegram } from "../lib/telegram.mjs";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
const err = (error, status = 400) => json({ ok: false, error }, status);

async function readBody(req) {
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  try { const b = await req.json(); return b && typeof b === "object" ? b : null; } catch { return null; }
}

function profileFields(b) {
  return { name: clean(b.name, 80), country: clean(b.country, 80), contact: clean(b.contact, 60) };
}

export default async (req) => {
  const action = new URL(req.url).pathname.replace(/^\/api\/auth\/?/, "").replace(/\/$/, "");
  const m = req.method;

  try {
    if (m !== "GET" && !sameOrigin(req)) return err("Ruxsat etilmagan manba", 403);

    // ---- GET /api/auth/me
    if (action === "me" && m === "GET") {
      const u = await currentUser(req);
      return json({ ok: true, user: u ? publicUser(u) : null });
    }

    // ---- POST /api/auth/register
    if (action === "register" && m === "POST") {
      if (rateLimited(req, "register", 6, 60 * 60_000)) return err("Juda ko'p urinish. Keyinroq qayta urinib ko'ring.", 429);
      const b = await readBody(req); if (!b) return err("Noto'g'ri so'rov");
      if (b.website) return json({ ok: true, user: null }); // honeypot
      const email = normEmail(b.email);
      const password = typeof b.password === "string" ? b.password : "";
      const p = profileFields(b);
      if (p.name.length < 2) return err("Ismingizni kiriting.");
      if (!EMAIL_RE.test(email)) return err("Email manzili noto'g'ri.");
      if (password.length < 8 || password.length > 128) return err("Parol kamida 8 ta belgidan iborat bo'lsin.");
      if (!/[A-Za-zА-Яа-я]/.test(password) || !/\d/.test(password)) return err("Parolda kamida bitta harf va bitta raqam bo'lsin.");
      const key = userKey(email);
      const db = users();
      if (await db.get(key)) return err("Bu email bilan hisob allaqachon mavjud. Kirish bo'limidan foydalaning.", 409);
      const user = {
        key, email, ...p, passHash: await hashPassword(password), tokenVersion: 0,
        memberId: "UTH-" + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(), bookings: [],
      };
      await db.setJSON(key, user);
      notifyTelegram("🆕 Yangi a'zo", [["Ism", user.name], ["Email", email], ["Aloqa", user.contact], ["Mamlakat", user.country], ["ID", user.memberId]]).catch(() => {});
      return json({ ok: true, user: publicUser(user) }, 201, { "set-cookie": sessionCookie(req, await createToken(user)) });
    }

    // ---- POST /api/auth/login
    if (action === "login" && m === "POST") {
      if (rateLimited(req, "login", 10, 10 * 60_000)) return err("Juda ko'p urinish. 10 daqiqadan so'ng qayta urinib ko'ring.", 429);
      const b = await readBody(req); if (!b) return err("Noto'g'ri so'rov");
      const email = normEmail(b.email);
      const password = typeof b.password === "string" ? b.password.slice(0, 128) : "";
      const user = EMAIL_RE.test(email) ? await users().get(userKey(email)) : null;
      const ok = await verifyPassword(password, user?.passHash || DUMMY_HASH);
      if (!user || !ok) return err("Email yoki parol noto'g'ri.", 401);
      return json({ ok: true, user: publicUser(user) }, 200, { "set-cookie": sessionCookie(req, await createToken(user)) });
    }

    // ---- POST /api/auth/logout
    if (action === "logout" && m === "POST") {
      return json({ ok: true }, 200, { "set-cookie": clearCookie(req) });
    }

    // Quyidagilar uchun kirgan bo'lish shart
    const user = await currentUser(req);
    if (!user) return err("Avval hisobingizga kiring.", 401);
    const db = users();

    // ---- PATCH /api/auth/me — profilni yangilash
    if (action === "me" && m === "PATCH") {
      const b = await readBody(req); if (!b) return err("Noto'g'ri so'rov");
      const p = profileFields(b);
      if (p.name.length < 2) return err("Ismingizni kiriting.");
      Object.assign(user, p, { updatedAt: new Date().toISOString() });
      await db.setJSON(user.key, user);
      return json({ ok: true, user: publicUser(user) });
    }

    // ---- POST /api/auth/password — parolni almashtirish (boshqa qurilmalardagi sessiyalar yopiladi)
    if (action === "password" && m === "POST") {
      if (rateLimited(req, "password", 8, 10 * 60_000)) return err("Juda ko'p urinish.", 429);
      const b = await readBody(req); if (!b) return err("Noto'g'ri so'rov");
      const cur = typeof b.current === "string" ? b.current : "";
      const next = typeof b.next === "string" ? b.next : "";
      if (!(await verifyPassword(cur, user.passHash))) return err("Joriy parol noto'g'ri.", 401);
      if (next.length < 8 || next.length > 128 || !/[A-Za-zА-Яа-я]/.test(next) || !/\d/.test(next))
        return err("Yangi parol kamida 8 belgi, harf va raqamdan iborat bo'lsin.");
      user.passHash = await hashPassword(next);
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      await db.setJSON(user.key, user);
      return json({ ok: true }, 200, { "set-cookie": sessionCookie(req, await createToken(user)) });
    }

    // ---- DELETE /api/auth/me — hisobni o'chirish
    if (action === "me" && m === "DELETE") {
      const b = await readBody(req);
      if (!b || !(await verifyPassword(String(b.password || ""), user.passHash))) return err("Parol noto'g'ri.", 401);
      await db.delete(user.key);
      return json({ ok: true }, 200, { "set-cookie": clearCookie(req) });
    }

    return err("Topilmadi", 404);
  } catch (e) {
    console.error("account error", action, e);
    return err("Serverda xatolik. Birozdan so'ng qayta urinib ko'ring.", 500);
  }
};

export const config = { path: "/api/auth/*" };
