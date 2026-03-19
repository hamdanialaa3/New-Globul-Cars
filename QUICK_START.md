# 🚀 How to Start Development Server - Quick Guide

## ⚡ الطريقة الأسرع والأفضل

```bash
npm start
# أو
npm run start:dev
```

> **Build tool:** Vite 7 — Port 5173 (configurable via `.env`)

---

## ⏱️ الوقت المتوقع

### المرة الأولى
- **Vite cold start:** 3-8 ثوان
- **TypeScript + HMR:** فوري تقريباً
- **الإجمالي:** ~10 ثوان

### المرات التالية (Hot Module Replacement)
- **HMR:** <1 ثانية ⚡

---

## 🔍 معالجة المشاكل

### المشكلة: "Port 5173 already in use"

```bash
# يدويًا:
npx kill-port 5173
npm start
```

### المشكلة: "Out of memory" أو crashes

```bash
$env:NODE_OPTIONS='--max_old_space_size=8192'
npm start
```

### المشكلة: مشاكل في التثبيت

```bash
npm run clean:all
npm install --legacy-peer-deps
npm run start:dev
```

---

## 📚 الأوامر المتاحة

```bash
npm start                   # بدء خادم التطوير (Vite)
npm run start:dev          # بدء مُحسّن
npm run build              # بناء production
npm run type-check         # فحص TypeScript
npm run test               # تشغيل الاختبارات (Vitest)
npm run clean:all          # تنظيف شامل
npm run emulate            # Firebase emulators
```

---

## 📱 Mobile App

```bash
cd mobile_new
npm install
npm start                  # Expo dev server
```

---

## 💡 نصائح الأداء

- استخدم **SSD** — HDD بطيء جداً
- أغلق البرامج الثقيلة (Docker, VirtualBox)
- تأكد من **Node.js v20+**: `node --version`

---

**الخلاصة:** `npm start` فقط! Vite يوفر أسرع بيئة تطوير ممكنة 🚀
