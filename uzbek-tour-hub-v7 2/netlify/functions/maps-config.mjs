// GET /api/maps-config — brauzer uchun Google Maps kaliti.
// MUHIM: Google Cloud Console'da bu kalitni HTTP referrer (sizning domeningiz) bilan cheklang.
import { json } from "../lib/shared.mjs";

export default async (req) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || "";
  return json({ apiKey }, 200, { "cache-control": "public, max-age=300" });
};

export const config = { path: "/api/maps-config" };
