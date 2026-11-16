# Uzbek Tour Hub

O'zbekiston bo'ylab sayohat sayti: React (build qilingan), Netlify Functions backend.

## Tuzilma

```
public/index.html          — kirish sahifasi
public/assets/index-*.js|css      — yig'ilgan React ilova (tuzatishlar kiritilgan)
public/assets/enhance.css         — yangi dizayn qatlami (spacing, tipografiya, animatsiyalar)
public/assets/bridge.js           — bron formalarini /api/booking ga ulaydi
public/assets/account.js|css      — profil ikonkasi, kirish/ro'yxatdan o'tish oynasi, profil paneli
public/assets/hotels.js|css       — Booking.com mehmonxonalar vidjeti
public/images/             — rasmlar
netlify/functions/
  account.mjs              — /api/auth/*         → hisoblar, sessiya, profil (Netlify Blobs)
  chat.mjs                 — POST /api/chat        → Anthropic Claude (AI agent, mehmonxona qidirish vositasi bilan)
  hotels.mjs               — GET  /api/hotels      → Booking.com (jonli narxlar yoki qidiruv havolasi)
  booking.mjs              — POST /api/booking     → Telegram (bronlar, ro'yxatdan o'tish)
  maps-config.mjs          — GET  /api/maps-config → Google Maps brauzer kaliti
netlify/lib/               — umumiy kod: auth, store (Blobs), telegram, booking (Demand API mijozi)
package.json               — funksiyalar uchun bog'liqlik (@netlify/blobs)
netlify.toml               — Netlify sozlamalari
.env.example               — kerakli muhit o'zgaruvchilari
```

## Joylash (deploy)

> ⚠️ Netlify'ning drag-and-drop ("Netlify Drop") usuli funksiyalarni joylamaydi —
> backend ishlashi uchun Git yoki Netlify CLI orqali joylang.

**Variant A — GitHub orqali (tavsiya etiladi)**
1. Shu papkani GitHub repozitoriyga yuklang.
2. Netlify → *Add new site → Import an existing project* → repozitoriyni tanlang.
   Build sozlamalari `netlify.toml` dan avtomatik olinadi.
3. *Site configuration → Environment variables* ga `.env.example` dagi qiymatlarni kiriting.
4. *Deploys → Trigger deploy*.

**Variant B — Netlify CLI**
```bash
npm i -g netlify-cli
netlify login
netlify init          # yoki: netlify link
netlify env:set ANTHROPIC_API_KEY "..."
netlify env:set BOOKING_AFFILIATE_ID "..."
netlify env:set BOOKING_API_TOKEN "..."
netlify env:set GOOGLE_MAPS_API_KEY "..."
netlify env:set TELEGRAM_BOT_TOKEN "..."
netlify env:set TELEGRAM_CHAT_ID "..."
netlify deploy --prod
```

Lokal ishga tushirish: `netlify dev` (muhit o'zgaruvchilarini `.env` fayliga yozing).

## Xavfsizlik eslatmalari
- Claude, Booking.com va Telegram kalitlari faqat serverda (funksiyalarda) saqlanadi, brauzerga chiqmaydi.
- Google Maps kaliti brauzerda ishlatiladi — Google Cloud Console'da **HTTP referrer** bilan cheklang.
- Funksiyalarda oddiy rate-limit va kiruvchi ma'lumotlarni tekshirish bor; jiddiy trafik uchun
  Netlify'ning Rate Limiting yoki Cloudflare kabi qo'shimcha himoya tavsiya etiladi.

## Hisoblar va profil
- Foydalanuvchilar email + parol bilan ro'yxatdan o'tadi. Parollar `scrypt` bilan xeshlanadi,
  sessiya 30 kunlik HttpOnly cookie'da saqlanadi (JavaScript uni o'qiy olmaydi).
- Ma'lumotlar **Netlify Blobs** omborida (`utb-users`) saqlanadi — qo'shimcha ma'lumotlar bazasi kerak emas.
  Netlify `package.json` dagi bog'liqlikni deploy paytida avtomatik o'rnatadi.
- Kirgan foydalanuvchining bronlari profilidagi "Bronlarim" bo'limida ko'rinadi; ism va aloqa
  ma'lumotlari bron formalarida avtomatik to'ldiriladi.
- Mehmon (kirmagan) foydalanuvchi bron qila oladi faqat Telegram sozlangan bo'lsa; aks holda unga
  kirish oynasi taklif qilinadi.
- Bron holatini ("Ko'rib chiqilmoqda" → "Tasdiqlangan") o'zgartiradigan admin panel hozircha yo'q.

### API
| Yo'l | Metod | Vazifa |
|---|---|---|
| `/api/auth/register` | POST | Ro'yxatdan o'tish |
| `/api/auth/login` | POST | Kirish |
| `/api/auth/logout` | POST | Chiqish |
| `/api/auth/me` | GET / PATCH / DELETE | Profilni olish / tahrirlash / hisobni o'chirish |
| `/api/auth/password` | POST | Parolni almashtirish (boshqa qurilmalardan chiqaradi) |

## AI agent (Claude)
- `/api/chat` Anthropic Messages API'dan foydalanadi (`ANTHROPIC_API_KEY`). Standart model `claude-haiku-5-5`
  — tez javob beradi va Netlify funksiyasining ~10 soniyalik chegarasiga sig'adi. `ANTHROPIC_MODEL` bilan almashtirish mumkin.
- Agentda `search_hotels` vositasi bor: mehmonxona so'ralganda Booking.com'dan narxlarni o'zi oladi.
  Jonli narxlar sozlanmagan bo'lsa, narx to'qib chiqarmaydi — Booking.com qidiruv havolasini beradi.

## Booking.com integratsiyasi
Ikki rejim avtomatik tanlanadi:
1. **Havola rejimi** (hech narsa sozlanmagan yoki faqat `BOOKING_AFFILIATE_ID`): har bir shahar uchun
   tanlangan sana va mehmonlar soni bilan Booking.com qidiruv sahifasiga yo'naltiradi — narxlar Booking.com'da real.
2. **Jonli rejim** (`BOOKING_AFFILIATE_ID` + `BOOKING_API_TOKEN`): Demand API orqali mehmonxona nomlari, rasmlari,
   reytingi, kechasi va jami narx, bepul bekor qilish/nonushta belgilari saytning o'zida ko'rsatiladi (10 daqiqa kesh).

Jonli rejim uchun Booking.com Affiliate Partner dasturiga qo'shilish va Demand API'ga ruxsat olish kerak.
Avval `BOOKING_API_BASE=https://demandapi-sandbox.booking.com/3.2` bilan sandbox'da sinab ko'ring.
Saytdagi oldingi namunaviy (to'qima) mehmonxonalar ro'yxati yashirilgan.

## Qo'qon xaritasi: koordinatalar va rasmlar
- Obidalar va boshlang'ich nuqtalarning koordinatalari Google Maps'dagi haqiqiy joylashuvga moslangan.
- Rasmlar `/api/place-photo?id=<place_id>` orqali Google Maps'dagi aynan shu obyektning fotosuratidan olinadi
  (`GOOGLE_PLACES_API_KEY`, "Places API (New)"). Muallif nomi rasm ustida/sarlavhasida ko'rsatiladi.
  Kalit bo'lmasa — boshqa joy rasmi emas, neytral "rasm yuklanmadi" belgisi chiqadi.
- Xudoyorxon o'rdasi uchun saytdagi o'z rasmi (`/images/kokand.jpg`) ishlatiladi.
