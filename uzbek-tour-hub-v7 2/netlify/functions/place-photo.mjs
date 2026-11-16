// GET /api/place-photo?id=<Google place_id>&i=0&w=900      → 302: obyektning haqiqiy fotosurati (Google Maps)
// GET /api/place-photo?id=<place_id>&i=0&meta=1             → JSON: foto muallifi (atributsiya uchun)
// Kalit: GOOGLE_PLACES_API_KEY (server kaliti, "Places API (New)" yoqilgan). Bo'lmasa GOOGLE_MAPS_API_KEY ishlatiladi.
// Kalit yo'q yoki xato bo'lsa — neytral "rasm yuklanmadi" belgisi qaytadi (boshqa joy rasmi ko'rsatilmaydi).
import { json, rateLimited } from "../lib/shared.mjs";

const FALLBACK = "/images/monument-placeholder.svg";
const cache = new Map(); // id:i:w -> { t, uri, authors }
const TTL = 6 * 3600_000;

const fallback = () =>
  new Response(null, { status: 302, headers: { location: FALLBACK, "cache-control": "public, max-age=300" } });

async function resolve(id, i, w, key) {
  const k = `${id}:${i}:${w}`;
  const hit = cache.get(k);
  if (hit && Date.now() - hit.t < TTL) return hit;
  const d = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "photos" },
  });
  if (!d.ok) throw new Error(`details ${d.status}: ${(await d.text()).slice(0, 200)}`);
  const photos = (await d.json()).photos || [];
  const ph = photos[Math.min(i, photos.length - 1)];
  if (!ph) throw new Error("no photos");
  const m = await fetch(
    `https://places.googleapis.com/v1/${ph.name}/media?maxWidthPx=${w}&skipHttpRedirect=true`,
    { headers: { "X-Goog-Api-Key": key } }
  );
  if (!m.ok) throw new Error(`media ${m.status}`);
  const { photoUri } = await m.json();
  const v = {
    t: Date.now(),
    uri: photoUri,
    authors: (ph.authorAttributions || []).map((a) => ({ name: a.displayName || "", uri: a.uri || "" })),
  };
  cache.set(k, v);
  if (cache.size > 500) cache.clear();
  return v;
}

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const id = q.get("id") || "";
  const meta = q.get("meta") === "1";
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(id)) return meta ? json({ ok: false }, 400) : fallback();
  if (rateLimited(req, "photo", 120, 60_000)) return meta ? json({ ok: false }, 429) : fallback();
  const i = Math.min(Math.max(parseInt(q.get("i") || "0", 10) || 0, 0), 9);
  const w = Math.min(Math.max(parseInt(q.get("w") || "900", 10) || 900, 200), 1600);
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return meta ? json({ ok: false, error: "no key" }) : fallback();
  try {
    const v = await resolve(id, i, w, key);
    if (meta) return json({ ok: true, authors: v.authors, source: "Google Maps" }, 200, { "cache-control": "public, max-age=3600" });
    return new Response(null, {
      status: 302,
      headers: { location: v.uri, "cache-control": "public, max-age=3600", "netlify-cdn-cache-control": "public, max-age=21600" },
    });
  } catch (e) {
    console.error("place-photo", id, e.message);
    return meta ? json({ ok: false }) : fallback();
  }
};

export const config = { path: "/api/place-photo" };
