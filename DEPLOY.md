# نشر كيلو على Railway + Hostinger

| الدومين | الغرض |
|---------|--------|
| **https://www.kilo-sa.com** | اللاندينغ (الموقع التعريفي) |
| **https://app.kilo-sa.com** | لوحة التحكم + API |

## نظرة عامة

المشروع يُنشر على **خدمتين** منفصلتين على Railway:

| الخدمة | Dockerfile | الدومين |
|--------|------------|---------|
| **kilo-app** | `Dockerfile` | `app.kilo-sa.com` |
| **kilo-landing** | `Dockerfile.landing` | `www.kilo-sa.com` |

- خدمة التطبيق: API + لوحة التحكم + PostgreSQL
- خدمة اللاندينغ: صفحة ثابتة خفيفة فقط (بدون قاعدة بيانات)

---

## 1) إنشاء المشروع على Railway

1. ادخل [railway.app](https://railway.app) وأنشئ مشروعاً جديداً.
2. اربط مستودع GitHub للمشروع (أو ارفع الكود).
3. أضف خدمة **PostgreSQL** من Marketplace.

### خدمة التطبيق (app)

4. أضف خدمة **Web** باسم `kilo-app` من نفس المستودع.
5. في Settings → Build: عيّن **Dockerfile** = `Dockerfile` (أو اترك `railway.toml` الافتراضي).

### خدمة اللاندينغ (www)

6. أضف خدمة **Web** ثانية باسم `kilo-landing` من نفس المستودع.
7. في Settings → Build:
   - **Dockerfile Path** = `Dockerfile.landing`
   - أو انسخ محتوى `railway.landing.toml` لإعدادات الخدمة
8. لا تحتاج PostgreSQL لهذه الخدمة.

---

## 2) ربط قاعدة البيانات

في خدمة **kilo-app** فقط:

1. Variables → **Add Reference** → اختر `DATABASE_URL` من خدمة PostgreSQL.
2. Railway يحقن الرابط تلقائياً — لا تنسخه في أي ملف.

---

## 3) متغيرات البيئة

### خدمة kilo-app

| المتغير | مطلوب | الوصف |
|---------|--------|--------|
| `NODE_ENV` | نعم | `production` |
| `DATABASE_URL` | نعم | مرجع من PostgreSQL |
| `SESSION_SECRET` | نعم | 32+ حرف عشوائي (`openssl rand -hex 32`) |
| `API_PUBLIC_URL` | نعم | `https://app.kilo-sa.com` |
| `CORS_ORIGIN` | نعم | `https://app.kilo-sa.com` |
| `KILO_ADMIN_EMAIL` | نعم | بريد المدير الأول |
| `KILO_ADMIN_PASSWORD` | نعم | كلمة مرور قوية للمدير الأول (مرة واحدة عند الإنشاء) |
| `UPLOADS_DIR` | موصى به | `/data/uploads` مع Volume |

**مهم:** لا تضع هذه القيم في `.env` داخل المستودع أبداً.

### خدمة kilo-landing

| المتغير | مطلوب | الوصف |
|---------|--------|--------|
| `NODE_ENV` | نعم | `production` |

لا متغيرات أخرى مطلوبة — الصفحة ثابتة.

---

## 4) Volume للملفات المرفوعة

صور الشعار والملفات تُحفظ على القرص. بدون Volume تُفقد بعد إعادة التشغيل.

1. في خدمة الـ Web: **Volumes** → Mount path: `/data/uploads`
2. تأكد أن `UPLOADS_DIR=/data/uploads`

---

## 5) ربط الدومينات (Hostinger → Railway)

### في Railway

**خدمة kilo-app:**
1. Settings → Networking → Custom Domain → `app.kilo-sa.com`

**خدمة kilo-landing:**
2. Settings → Networking → Custom Domain → `www.kilo-sa.com`

Railway يعطيك هدف DNS لكل خدمة (CNAME).

### في Hostinger

1. **hPanel** → **Domains** → `kilo-sa.com` → **DNS**
2. أضف السجلات:

| النوع | الاسم | القيمة |
|-------|--------|--------|
| CNAME | `www` | الهدف من خدمة **kilo-landing** |
| CNAME | `app` | الهدف من خدمة **kilo-app** |

> كل خدمة على Railway لها CNAME خاص — لا تخلط بينهما.

3. انتظر انتشار DNS (5 دقائق – 48 ساعة).
4. Railway يفعّل SSL تلقائياً (Let's Encrypt).

---

## 6) أول نشر

بعد اكتمال البناء:

1. `https://www.kilo-sa.com` — اللاندينغ
2. `https://app.kilo-sa.com/api/healthz` — `{"ok":true}`
3. `https://app.kilo-sa.com` — تسجيل الدخول
4. من اللاندينغ: زر **دخول النظام** يوجّه إلى `app.kilo-sa.com`

---

## 7) أوامر محلية مفيدة

```bash
# بناء اللاندينغ
pnpm run build:landing
pnpm run start:landing   # http://localhost:3000

# بناء لوحة التحكم
pnpm run build

# تشغيل API محلياً (بعد إعداد .env من .env.example)
pnpm --filter @workspace/api-server run start

# اختبار Docker محلياً
docker build -t kilo-app .
docker run --rm -p 8080:8080 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://... \
  -e SESSION_SECRET=... \
  -e KILO_ADMIN_PASSWORD=... \
  kilo-app
```

---

## الأمان

- `.env` و `.env.local` في `.gitignore` — لا تُرفع للمستودع
- `.env.example` قالب فقط بدون أسرار حقيقية
- `SESSION_SECRET` إلزامي في الإنتاج (32+ حرف)
- كلمات المرور والاتصالات تُضبط في Railway Variables فقط
- الجلسات: `httpOnly` + `secure` + `sameSite=lax`
- رؤوس أمان: HSTS, X-Frame-Options, nosniff, وغيرها

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| فشل الاتصال بقاعدة البيانات | تحقق من Reference لـ `DATABASE_URL` |
| 502 بعد النشر | راجع Logs — غالباً `SESSION_SECRET` ناقص أو قصير |
| الدومين لا يعمل | تحقق من DNS في Hostinger وانتظر الانتشار |
| الصور تختفي | أضف Volume على `/data/uploads` |
| PDF لا يُنشأ | Playwright مثبت في Docker image — راجع Logs |
