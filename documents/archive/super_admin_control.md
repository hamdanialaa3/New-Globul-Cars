# Super Admin — Homepage Sections Control (Full Implementation Plan)

> **Stack:** React 18 (CRA/CRACO) + Firebase Firestore + styled-components + React Router v6
> **Target URL:** `/super-admin` → "Sections" tab
> **Status:** Ready for 100% implementation
> **Date:** February 7, 2026
## TL;DR

- Add a **"Sections"** tab to the existing Super Admin dashboard at `/super-admin`.
- Store visibility + order of all homepage sections in **one Firestore document**: `app_settings/homepage_sections`.
- Homepage reads state via `useSectionVisibility()` hook with **real-time onSnapshot**.
- Super Admin toggles sections on/off with instant UI feedback.
- Changes reflect **immediately** on the homepage (no refresh needed).

---

## Architecture Diagram

```
┌──────────────────────┐         ┌─────────────────────────┐
│  Super Admin Panel    │         │  Firestore              │
│  /super-admin         │  write  │  app_settings/          │
│  Tab: "Sections"      │ ──────► │    homepage_sections    │
│  SectionControlPanel  │         │    { sections: [...] }  │
└──────────────────────┘         └──────────┬──────────────┘
                                            │ onSnapshot
                                            ▼
                                 ┌────────────────────────┐
                                 │  HomePageComposer.tsx   │
                                 │  useSectionVisibility() │
                                 │  {isVisible('key') &&   │
                                 │    <SectionSlot />}     │
                                 └────────────────────────┘
```

---

##  Files to Create & Modify

| Action | File Path | What |
|--------|-----------|------|

Migration: migrations/002_ui_sections.sql

Seed script: scripts/seed_ui_sections.ts

Server API:

pages/api/admin/ui-sections/index.ts (GET list)

pages/api/admin/ui-sections/toggle.ts (POST toggle visibility)

Client lib:

lib/adminUi.ts

Admin page (Super Admin):

pages/admin/super.tsx

Homepage integration:

lib/uiSectionsServer.ts (server helper to fetch visible sections)

Example usage in pages/index.tsx (how to hide/show sections based on DB)

Types:

types/ui.ts

1 — Migration SQL (إنشاؤه في DB)
ملف: migrations/002_ui_sections.sql

sql
-- migrations/002_ui_sections.sql
BEGIN;

CREATE TABLE IF NOT EXISTS ui_sections (
  id SERIAL PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ui_sections_section_key ON ui_sections (section_key);

CREATE OR REPLACE FUNCTION trigger_set_updated_at_ui_sections()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_ui_sections ON ui_sections;
CREATE TRIGGER set_updated_at_ui_sections
BEFORE UPDATE ON ui_sections
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at_ui_sections();

COMMIT;
تشغيل الهجرة:

bash
psql $DATABASE_URL -f migrations/002_ui_sections.sql
2 — Seed script لملء 15 قسمًا افتراضيًا
ملف: scripts/seed_ui_sections.ts  
(يستخدم pg؛ شغّله من VS Code أو CLI)

ts
// scripts/seed_ui_sections.ts
import { Client } from 'pg';

const SECTIONS = [
  { key: 'hero_1', title: 'Hero 1', description: 'Main hero banner 1' },
  { key: 'hero_2', title: 'Hero 2', description: 'Promotional hero 2' },
  { key: 'hero_3', title: 'Hero 3', description: 'Feature hero 3' },
  { key: 'section_4', title: 'Section 4', description: 'Category strip 4' },
  { key: 'section_5', title: 'Section 5', description: 'Category strip 5' },
  { key: 'section_6', title: 'Section 6', description: 'Category strip 6' },
  { key: 'section_7', title: 'Section 7', description: 'Category strip 7' },
  { key: 'section_8', title: 'Section 8', description: 'Category strip 8' },
  { key: 'section_9', title: 'Section 9', description: 'Category strip 9' },
  { key: 'section_10', title: 'Section 10', description: 'Category strip 10' },
  { key: 'section_11', title: 'Section 11', description: 'Category strip 11' },
  { key: 'section_12', title: 'Section 12', description: 'Category strip 12' },
  { key: 'section_13', title: 'Section 13', description: 'Category strip 13' },
  { key: 'section_14', title: 'Section 14', description: 'Category strip 14' },
  { key: 'section_15', title: 'Section 15', description: 'Section for promotions 15' },
];

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    for (const s of SECTIONS) {
      await client.query(
        `INSERT INTO ui_sections (section_key, title, description, visible)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (section_key) DO NOTHING`,
        [s.key, s.title, s.description]
      );
    }
    console.log('Seed completed');
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
تشغيل:

bash
# تثبيت pg إن لم يكن مثبتًا
npm install pg
# ثم
ts-node scripts/seed_ui_sections.ts
3 — Types (واجهة TypeScript)
ملف: types/ui.ts

ts
// types/ui.ts
export interface UiSection {
  id: number;
  section_key: string;
  title: string;
  description: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
}
4 — API: جلب الأقسام (GET) وتبديل الحالة (POST)
ملف: pages/api/admin/ui-sections/index.ts

ts
// pages/api/admin/ui-sections/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { UiSection } from '@/types/ui';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const { rows } = await pool.query<UiSection>('SELECT * FROM ui_sections ORDER BY id ASC');
    res.status(200).json(rows);
  } catch (err) {
    console.error('ui-sections GET error', err);
    res.status(500).json({ error: 'internal_error' });
  }
}
ملف: pages/api/admin/ui-sections/toggle.ts

ts
// pages/api/admin/ui-sections/toggle.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sectionKey, visible } = req.body as { sectionKey?: string; visible?: boolean };

  if (!sectionKey || typeof visible !== 'boolean') {
    return res.status(400).json({ error: 'invalid_payload' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE ui_sections SET visible = $1 WHERE section_key = $2 RETURNING *`,
      [visible, sectionKey]
    );
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('ui-sections toggle error', err);
    res.status(500).json({ error: 'internal_error' });
  }
}
ملاحظة أمان: في بيئة production يجب حماية هذه الـ API بمصادقة قوية (JWT, session, role check) بحيث يملكها فقط سوبر أدمن. هنا الكود يركز على المنطق الوظيفي؛ أضف middleware تحقق قبل النشر.

5 — Client lib لاستدعاء الـ API
ملف: lib/adminUi.ts

ts
// lib/adminUi.ts
import { UiSection } from '@/types/ui';

export async function fetchUiSections(): Promise<UiSection[]> {
  const res = await fetch('/api/admin/ui-sections', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch UI sections');
  return res.json();
}

export async function toggleUiSection(sectionKey: string, visible: boolean): Promise<UiSection> {
  const res = await fetch('/api/admin/ui-sections/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionKey, visible }),
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }));
    throw new Error(err.error || 'Toggle failed');
  }
  return res.json();
}
6 — صفحة سوبر أدمن (زرّات إظهار/إخفاء)
ملف: pages/admin/super.tsx

tsx
// pages/admin/super.tsx
import React, { useEffect, useState } from 'react';
import { UiSection } from '@/types/ui';
import { fetchUiSections, toggleUiSection } from '@/lib/adminUi';

export default function SuperAdminPage() {
  const [sections, setSections] = useState<UiSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchUiSections()
      .then((s) => {
        if (mounted) setSections(s);
      })
      .catch((e) => setError(String(e)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  async function handleToggle(key: string, current: boolean) {
    setSavingKey(key);
    setError(null);
    try {
      const updated = await toggleUiSection(key, !current);
      setSections((prev) => prev.map((p) => (p.section_key === key ? updated : p)));
    } catch (e: any) {
      setError(e.message || 'Toggle failed');
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold mb-4">Super Admin — UI Sections Control</h1>
        <p className="text-sm text-gray-600 mb-6">
          Use these toggles to show or hide sections on the homepage. Changes take effect immediately.
        </p>

        {loading ? (
          <div className="text-sm text-gray-500">Loading sections…</div>
        ) : error ? (
          <div className="text-sm text-red-600">Error: {error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {sections.map((s) => (
              <div key={s.section_key} className="flex items-center justify-between gap-4 rounded border bg-white p-3">
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-gray-500">{s.description}</div>
                  <div className="text-xs text-gray-400 mt-1">Key: <code>{s.section_key}</code></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500">Visible</div>
                  <button
                    onClick={() => handleToggle(s.section_key, s.visible)}
                    disabled={savingKey === s.section_key}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      s.visible ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {savingKey === s.section_key ? 'Saving…' : s.visible ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
7 — Homepage: قراءة حالة الأقسام وإظهار/إخفاء الهيروات
ملف: lib/uiSectionsServer.ts (server helper)

ts
// lib/uiSectionsServer.ts
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function getVisibleSectionsKeys(): Promise<string[]> {
  const { rows } = await pool.query<{ section_key: string }>(
    `SELECT section_key FROM ui_sections WHERE visible = true ORDER BY id ASC`
  );
  return rows.map((r) => r.section_key);
}
مثال دمج في pages/index.tsx (Server Side Rendering)

tsx
// pages/index.tsx
import { GetServerSideProps } from 'next';
import { getVisibleSectionsKeys } from '@/lib/uiSectionsServer';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const visibleKeys = await getVisibleSectionsKeys();
  return { props: { visibleKeys } };
};

export default function Home({ visibleKeys }: { visibleKeys: string[] }) {
  return (
    <main>
      {/* Hero 1 */}
      {visibleKeys.includes('hero_1') && <section id="hero_1">{/* Hero1 component */}</section>}
      {/* Hero 2 */}
      {visibleKeys.includes('hero_2') && <section id="hero_2">{/* Hero2 component */}</section>}
      {/* Hero 3 */}
      {visibleKeys.includes('hero_3') && <section id="hero_3">{/* Hero3 component */}</section>}

      {/* Other sections */}
      {visibleKeys.includes('section_4') && <section id="section_4">{/* Section 4 component */}</section>}
      {visibleKeys.includes('section_5') && <section id="section_5">{/* Section 5 component */}</section>}
      {/* ... up to section_15 */}
    </main>
  );
}
ملاحظة: استخدمت SSR (getServerSideProps) لضمان أن الصفحة تُعرض دائمًا وفق الحالة الحالية في DB بدون وميض (flash) أو حاجة لعمليات client-side بعد التحميل. إذا تستخدم app/ (Next 13+ server components) يمكنك استدعاء getVisibleSectionsKeys مباشرة داخل الـ server component.

8 — حماية الـ API (توصية مهمة)
الـ API أعلاه لا يحتوي على تحقق. في بيئة production يجب إضافة middleware تحقق دور المستخدم (role check) بحيث يملك فقط سوبر أدمن صلاحية الوصول. مثال سريع (pseudo):

ts
// pages/api/_middleware.ts (مثال)
import { NextApiRequest, NextApiResponse } from 'next';
export function requireSuperAdmin(handler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = req.user; // حسب آلية المصادقة لديك
    if (!user || !user.roles?.includes('super_admin')) return res.status(403).json({ error: 'forbidden' });
    return handler(req, res);
  };
}
ثم لفّ الـ handlers بـ requireSuperAdmin.

9 — خطوات التشغيل في Visual Studio Code
ضع الملفات في المسارات المشار إليها.

تأكد من وجود DATABASE_URL في بيئة التطوير (مثلاً PostgreSQL محلي).

شغّل الهجرة:

bash
psql $DATABASE_URL -f migrations/002_ui_sections.sql
شغّل السكربت لملء الأقسام:

bash
ts-node scripts/seed_ui_sections.ts
شغّل المشروع:

bash
npm install
npm run dev
افتح /admin/super لتتحكم في إظهار/إخفاء الأقسام. افتح / لترى الصفحة الرئيسية تتغير فورًا (SSR يعكس الحالة).

10 — ملاحظات نهائية صارمة ودقيقة
هل ممكن؟ نعم، هذا ممكن تمامًا وبشكل صارم واحترافي كما طلبت.

أمان: لا تنشر الـ API بدون حماية.

قابلية التوسع: يمكنك إضافة حقول إضافية (order, audience, rollout_percentage) لاحقًا.

عدم المجاملة: كل كود هنا منطقي، قابل للتنفيذ، ولا يفعل شيئًا خارج سياق البرمجة أو غير ممكن تقنيًا.

إذا تريد، أجهّز لك الآن:

نسخة جاهزة للـ app router (Next 13 server components) بدلاً من pages/، أو

إضافة audit log لكل تغيير (تسجيل من فعل ماذا ومتى)، أو

حماية الـ API بمثال JWT/session middleware كامل.

أخبرني أي خيار تريده فأكمله فورًا.