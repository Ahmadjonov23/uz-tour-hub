// Umumiy yordamchi funksiyalar (Netlify Functions uchun)
export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

// Oddiy, instansiya darajasidagi rate-limit (to'liq himoya emas, lekin spamni kamaytiradi)
const buckets = new Map();
export function rateLimited(req, key, limit, windowMs) {
  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const b = buckets.get(id) || { n: 0, t: now };
  if (now - b.t > windowMs) { b.n = 0; b.t = now; }
  b.n += 1;
  buckets.set(id, b);
  if (buckets.size > 5000) buckets.clear();
  return b.n > limit;
}

export const clean = (v, max = 200) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";

export const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
