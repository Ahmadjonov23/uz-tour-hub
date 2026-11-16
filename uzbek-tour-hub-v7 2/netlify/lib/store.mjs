// Ma'lumotlar ombori: Netlify Blobs (ishlab chiqarishda) yoki lokal fayl (faqat UTB_DEV_STORE bilan, test uchun)
import { getStore } from "@netlify/blobs";
import fs from "node:fs";
import path from "node:path";

function fileStore(name) {
  const dir = path.join(process.env.UTB_DEV_STORE, name);
  fs.mkdirSync(dir, { recursive: true });
  const f = (k) => path.join(dir, encodeURIComponent(k) + ".json");
  return {
    async get(k) { try { return JSON.parse(fs.readFileSync(f(k), "utf8")); } catch { return null; } },
    async setJSON(k, v) { fs.writeFileSync(f(k), JSON.stringify(v)); },
    async delete(k) { try { fs.unlinkSync(f(k)); } catch {} },
  };
}

export function store(name) {
  if (process.env.UTB_DEV_STORE) return fileStore(name);
  const s = getStore({ name, consistency: "strong" });
  return {
    get: (k) => s.get(k, { type: "json" }),
    setJSON: (k, v) => s.setJSON(k, v),
    delete: (k) => s.delete(k),
  };
}
