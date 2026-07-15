# Kilo — نظام تأجير السيارات

مشروع مستقل يتبع معمارية تارقا (DDD + OpenAPI + tenant cache).

## المتطلبات

- Node.js 20+
- pnpm 9+
- PostgreSQL

## الإعداد

```bash
cd d:\kilo_app
pnpm install
cp artifacts/api-server/.env.example artifacts/api-server/.env
# عدّل .env محلياً فقط — لا ترفع هذا الملف أبداً
pnpm run db:setup
pnpm run codegen
```

**مهم:** كيلو يجب أن يستخدم قاعدة `kilo_app` محلياً. ملف `.env` في `artifacts/api-server/` للتطوير فقط ومُستثنى من Git.

## التشغيل

```bash
# Terminal 1 — API
pnpm --filter @workspace/api-server run dev

# Terminal 2 — الواجهة
pnpm --filter @workspace/kilo-app run dev
```

- الواجهة: http://localhost:5174
- API: http://localhost:8081 (أو حسب `API_PORT` في `.env`)

## تسجيل الدخول (تطوير محلي)

- البريد: `admin@kilo-sa.com`
- كلمة المرور: القيمة في `KILO_DEV_ADMIN_PASSWORD` داخل `.env` المحلي

## النشر على Railway

راجع [DEPLOY.md](./DEPLOY.md) — `www.kilo-sa.com` للاندينغ و `app.kilo-sa.com` للوحة التحكم.

## البنية

```
lib/api-spec          → OpenAPI
lib/api-client-react  → Orval hooks
lib/api-zod           → Zod schemas
lib/tenant-cache      → withOrgKey
artifacts/api-server  → Backend (routes → controller → service)
artifacts/kilo-app    → Frontend React
```

## أوامر مفيدة

```bash
pnpm run codegen
pnpm run db:setup
pnpm run typecheck
pnpm run lint:tenant-keys
```
