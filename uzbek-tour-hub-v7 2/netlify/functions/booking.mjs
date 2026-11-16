// POST /api/booking — tur va gid bronlari (va eski ro'yxatdan o'tish formasi).
// Kirgan foydalanuvchining broni uning profiliga saqlanadi; Telegram sozlangan bo'lsa, sizga xabar keladi.
import crypto from "node:crypto";
import { json, rateLimited, clean } from "../lib/shared.mjs";
import { currentUser, sameOrigin, users } from "../lib/auth.mjs";
import { notifyTelegram, telegramConfigured } from "../lib/telegram.mjs";

const TYPES = {
  register: "🆕 Yangi ro'yxatdan o'tish",
  tour: "🧳 Yangi tur broni",
  guide: "🧭 Yangi gid broni",
};
const MAX_SAVED = 50;

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(req)) return json({ ok: false, error: "Ruxsat etilmagan manba" }, 403);
  if (rateLimited(req, "booking", 8, 10 * 60_000))
    return json({ ok: false, error: "Juda ko'p so'rov. Birozdan so'ng urinib ko'ring." }, 429);

  let b;
  try { b = await req.json(); } catch { return json({ ok: false, error: "Noto'g'ri JSON" }, 400); }
  if (b?.website) return json({ ok: true }); // honeypot: botlar uchun

  const type = clean(b?.type, 20);
  if (!TYPES[type]) return json({ ok: false, error: "Noma'lum so'rov turi" }, 400);

  let account = null;
  try { account = await currentUser(req); } catch (e) { console.error("session read failed", e); }

  if (!account && !telegramConfigured())
    return json({ ok: false, error: "Bron qilish uchun hisobingizga kiring (yoki Telegram xizmati sozlanmagan)." }, 503);

  const d = b?.data && typeof b.data === "object" ? b.data : {};
  const u = account || (b?.user && typeof b.user === "object" ? b.user : {});

  const name = clean(d.clientName || d.name || u.name, 100);
  const contact = clean(u.contact || d.contact, 100);
  const email = clean(u.email || d.email, 120);
  if (!name) return json({ ok: false, error: "Ism ko'rsatilmagan" }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({ ok: false, error: "Email noto'g'ri" }, 400);

  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
  const booking = {
    id: "BK-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
    type,
    title: clean(d.tourName || d.guideName, 120),
    topic: clean(d.sight || d.topic, 120),
    date: clean(d.date, 20),
    travelers: num(d.travelers),
    hours: num(d.hours),
    total: num(d.total),
    clientName: name,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  // 1) Profilga saqlash (kirgan bo'lsa)
  let saved = false;
  if (account && type !== "register") {
    try {
      account.bookings = [...(account.bookings || []), booking].slice(-MAX_SAVED);
      await users().setJSON(account.key, account);
      saved = true;
    } catch (e) { console.error("booking save failed", e); }
  }

  // 2) Telegram xabari
  const rows = [
    ["Bron ID", type === "register" ? "" : booking.id],
    ["Ism", name],
    ["Aloqa (WhatsApp/Telegram)", contact],
    ["Email", email],
    ["Mamlakat", clean(d.country || u.country, 80)],
    ["A'zo", account ? `${account.memberId} (profil)` : "mehmon"],
    ["Tur", clean(d.tourName, 120)],
    ["Gid", clean(d.guideName, 80)],
    ["Yo'nalish", booking.topic],
    ["Sana", booking.date],
    ["Sayohatchilar", booking.travelers],
    ["Soatlar", booking.hours],
    ["Jami (taxminiy)", booking.total != null ? `$${booking.total}` : ""],
    ["Til", clean(b?.lang, 5)],
  ];
  let notified = false;
  try { notified = await notifyTelegram(TYPES[type], rows); } catch (e) { console.error("Telegram failed", e); }

  if (!saved && !notified) return json({ ok: false, error: "Bronni yuborib bo'lmadi." }, 502);
  return json({ ok: true, booking: saved ? booking : null, saved, notified });
};

export const config = { path: "/api/booking" };
