فهم دقيق للقسمين في mobile.de
A. قسم “Recently viewed”
من الصورة، هذا القسم هو:

شريط أفقي من بطاقات سيارات (4 بطاقات).

العنوان: Recently viewed.

المصدر المنطقي: تاريخ تصفح المستخدم نفسه (client‑side أو من الـ backend).

كل بطاقة تحتوي على:

صورة السيارة.

السعر (أو سعر شهري إن كانت Leasing).

سطر ثانوي (سنة/شهر التسجيل الأول).

بيانات أساسية: الوقود، القوة الحصانية، الجير، الكيلومترات.

الموقع (مدينة + كود بريدي).

أحياناً Badge مثل “Good price” أو “Very good price”.

المنطق:

يعتمد على user context (cookie / session / userId).

الترتيب: آخر ما شاهده المستخدم، غالباً بحد أقصى 4–8 سيارات.

لا يحتاج فلترة معقدة، فقط استرجاع آخر السيارات التي فتحها المستخدم.

B. قسم “Top DEALS for you”
هذا القسم:

شريط أفقي آخر من بطاقات سيارات (4 بطاقات).

العنوان: Top DEALS for you.

المصدر المنطقي: خوارزمية توصية/صفقات:

غالباً Leasing offers أو سيارات بسعر مميز.

فيها سعر شهري + مدة العقد + عدد الكيلومترات/سنة.

مع نفس البيانات الأساسية: نوع الوقود، القوة، الجير، استهلاك، انبعاثات، الموقع.

الترتيب: حسب “deal score” (سعر جيد، عرض خاص، مناسب لتفضيلات المستخدم).

المنطق:

يعتمد على:

تفضيلات المستخدم (نوع الوقود، بودجت، نوع السيارة).

أو ببساطة: أفضل العروض الحالية (lowest price per month / أفضل تقييم سعر).

2. تصميم معماري ذكي لقسمين في الصفحة الرئيسية
سأفترض أنك تستخدم Next.js  + TypeScript وواجهة React، مع API داخلي مثل /api/cars.

سنقسم الحل إلى:

نموذج بيانات موحد للسيارة.

خدمات لجلب البيانات:

getRecentlyViewedCars

getTopDealsForUser

مكوّنات UI:

HomeHeroStrips (wrapper)

CarStripSection

CarCardCompact

دمج في الصفحة الرئيسية تحت الهيرو الثالث.

3. نموذج البيانات CarSummary
ts
// types/car.ts
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'other';

export interface CarSummary {
  id: string;
  slug: string; // for SEO URLs
  title: string; // e.g. "Mercedes-Benz S 500"
  priceTotal?: number; // full price in EUR
  priceMonthly?: number; // leasing monthly price
  priceCurrency: 'EUR' | 'BGN';
  isLeasing: boolean;
  leasingTermMonths?: number;
  leasingKmPerYear?: number;
  firstRegistration?: string; // "2016-05" or "05/2016"
  fuelType: FuelType;
  horsepower: number;
  transmission: 'automatic' | 'manual';
  mileageKm?: number;
  consumptionCombined?: string; // "6.8 l/100km"
  co2Combined?: string; // "153 g CO₂/km"
  locationCity: string;
  locationPostalCode?: string;
  imageUrl: string;
  priceBadge?: 'good' | 'very_good' | 'fair' | null;
}
4. خدمات جلب البيانات (API + منطق ذكي)
A. خدمة “Recently viewed”
المصدر:

Backend: جدول user_recent_views مرتبط بـ userId أو guestId.

أو Frontend: localStorage + API لاسترجاع التفاصيل.

سأعطيك نسخة تعتمد على guestId (كما ناقشنا نظام الضيف):

ts
// lib/guestIdentity.ts
export function getGuestIdFromCookiesOrLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  const fromCookie = document.cookie
    .split('; ')
    .find((c) => c.startsWith('koli_guest_id='))
    ?.split('=')[1];
  if (fromCookie) return fromCookie;

  const fromLocal = window.localStorage.getItem('koli_guest_id');
  return fromLocal || null;
}
ts
// lib/api/homeStrips.ts
import { CarSummary } from '@/types/car';

export async function getRecentlyViewedCars(guestId?: string | null): Promise<CarSummary[]> {
  if (!guestId) return [];
  const res = await fetch(`/api/home/recently-viewed?guestId=${encodeURIComponent(guestId)}`, {
    credentials: 'include',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as CarSummary[];
  return data.slice(0, 8); // limit
}

export async function getTopDealsForUser(guestId?: string | null): Promise<CarSummary[]> {
  const res = await fetch(`/api/home/top-deals?guestId=${encodeURIComponent(guestId || '')}`, {
    credentials: 'include',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as CarSummary[];
  return data.slice(0, 8);
}
B. مثال API في backend (منطقي، يعطي حرية للنموذج المحلي)
ts
// pages/api/home/recently-viewed.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { CarSummary } from '@/types/car';
import { fetchCarsByIds } from '@/server/carsRepo';
import { fetchRecentViewedIdsForGuest } from '@/server/recentViewsRepo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const guestId = String(req.query.guestId || '');
  if (!guestId) return res.status(200).json([]);

  const ids = await fetchRecentViewedIdsForGuest(guestId); // e.g. last 20 ids
  if (!ids.length) return res.status(200).json([]);

  const cars = await fetchCarsByIds(ids);

  // ترتيب حسب آخر مشاهدة
  const ordered: CarSummary[] = ids
    .map((id) => cars.find((c) => c.id === id))
    .filter(Boolean) as CarSummary[];

  res.status(200).json(ordered);
}
ts
// pages/api/home/top-deals.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { CarSummary } from '@/types/car';
import { fetchTopDealsForGuest } from '@/server/dealsEngine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const guestId = String(req.query.guestId || '');
  const deals: CarSummary[] = await fetchTopDealsForGuest(guestId || null);
  res.status(200).json(deals);
}
داخل fetchTopDealsForGuest يمكنك استخدام منطق ذكي (سعر/كم، تقييم سعر، تفضيلات المستخدم…).

5. مكوّن البطاقة CarCardCompact (مطابقة لشكل mobile.de)
tsx
// components/home/CarCardCompact.tsx
import Link from 'next/link';
import { CarSummary } from '@/types/car';
import clsx from 'clsx';

interface Props {
  car: CarSummary;
}

export const CarCardCompact: React.FC<Props> = ({ car }) => {
  const href = `/cars/${car.slug || car.id}`;

  const priceLabel = car.isLeasing
    ? `${car.priceMonthly?.toLocaleString('de-DE')} ${car.priceCurrency === 'EUR' ? '€' : 'лв.'}/month`
    : `${car.priceTotal?.toLocaleString('de-DE')} ${car.priceCurrency === 'EUR' ? '€' : 'лв.'}`;

  const leasingMeta =
    car.isLeasing && car.leasingTermMonths && car.leasingKmPerYear
      ? `${car.leasingTermMonths} months, ${car.leasingKmPerYear.toLocaleString('de-DE')} km/year`
      : null;

  const priceBadgeText =
    car.priceBadge === 'very_good'
      ? 'Very good price'
      : car.priceBadge === 'good'
      ? 'Good price'
      : car.priceBadge === 'fair'
      ? 'Fair price'
      : null;

  return (
    <Link href={href} className="block rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-gray-100">
        <img
          src={car.imageUrl}
          alt={car.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-sm line-clamp-1">{car.title}</div>
          {priceBadgeText && (
            <span
              className={clsx(
                'rounded px-2 py-0.5 text-xs font-semibold',
                car.priceBadge === 'very_good' && 'bg-green-100 text-green-800',
                car.priceBadge === 'good' && 'bg-emerald-50 text-emerald-700',
                car.priceBadge === 'fair' && 'bg-yellow-50 text-yellow-700'
              )}
            >
              {priceBadgeText}
            </span>
          )}
        </div>

        <div className="text-base font-bold text-gray-900">
          {priceLabel}
          {car.isLeasing && <span className="text-xs text-gray-500"> incl. VAT</span>}
        </div>

        {leasingMeta && <div className="text-xs text-gray-600">{leasingMeta}</div>}

        {!car.isLeasing && car.firstRegistration && (
          <div className="text-xs text-gray-600">{car.firstRegistration}</div>
        )}

        <div className="mt-1 text-xs text-gray-700 flex flex-wrap gap-x-2 gap-y-0.5">
          <span>{car.fuelType}</span>
          <span>• {car.horsepower} hp</span>
          <span>• {car.transmission === 'automatic' ? 'Automatic' : 'Manual'}</span>
          {car.mileageKm != null && <span>• {car.mileageKm.toLocaleString('de-DE')} km</span>}
        </div>

        {(car.consumptionCombined || car.co2Combined) && (
          <div className="mt-1 text-[11px] text-gray-500">
            {car.consumptionCombined && `${car.consumptionCombined} (comb.)`}
            {car.consumptionCombined && car.co2Combined && ' · '}
            {car.co2Combined && `${car.co2Combined} (comb.)`}
          </div>
        )}

        <div className="mt-2 text-xs text-gray-600">
          {car.locationPostalCode && `${car.locationPostalCode} `}
          {car.locationCity}
        </div>
      </div>
    </Link>
  );
};
6. مكوّن الشريط CarStripSection
tsx
// components/home/CarStripSection.tsx
import { CarSummary } from '@/types/car';
import { CarCardCompact } from './CarCardCompact';

interface Props {
  title: string;
  subtitle?: string;
  cars: CarSummary[];
  emptyStateText?: string;
}

export const CarStripSection: React.FC<Props> = ({ title, subtitle, cars, emptyStateText }) => {
  if (!cars.length && !emptyStateText) return null;

  return (
    <section className="w-full py-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>

        {cars.length ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {cars.map((car) => (
              <div key={car.id} className="min-w-[220px] max-w-[260px] flex-shrink-0">
                <CarCardCompact car={car} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500">{emptyStateText}</div>
        )}
      </div>
    </section>
  );
};
7. مكوّن التجميع HomeHeroStrips (تحت الهيرو الثالث)
tsx
// components/home/HomeHeroStrips.tsx
'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { CarSummary } from '@/types/car';
import { getGuestIdFromCookiesOrLocalStorage } from '@/lib/guestIdentity';
import { getRecentlyViewedCars, getTopDealsForUser } from '@/lib/api/homeStrips';
import { CarStripSection } from './CarStripSection';

export const HomeHeroStrips: React.FC = () => {
  const [recent, setRecent] = useState<CarSummary[]>([]);
  const [deals, setDeals] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const guestId = getGuestIdFromCookiesOrLocalStorage();
        const [r, d] = await Promise.all([
          getRecentlyViewedCars(guestId),
          getTopDealsForUser(guestId),
        ]);
        if (!cancelled) {
          setRecent(r);
          setDeals(d);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="w-full py-6">
        <div className="mx-auto max-w-6xl px-4 text-xs text-gray-400">
          Loading personalized car strips…
        </div>
      </section>
    );
  }

  return (
    <>
      <CarStripSection
        title="Recently viewed"
        subtitle="Cars you checked recently"
        cars={recent}
        emptyStateText="You haven't viewed any cars yet."
      />
      <CarStripSection
        title="Top DEALS for you"
        subtitle="Hand-picked offers based on your interests"
        cars={deals}
        emptyStateText="We are preparing the best deals for you."
      />
    </>
  );
};
8. دمج في الصفحة الرئيسية تحت الهيرو الثالث
في صفحة الهوم (مثلاً app/page.tsx أو pages/index.tsx):

tsx
// مثال في app/page.tsx
import { HomeHeroStrips } from '@/components/home/HomeHeroStrips';

export default function HomePage() {
  return (
    <main>
      {/* Hero 1 */}
      {/* Hero 2 */}
      {/* Hero 3 */}

      {/* تحت الهيرو الثالث مباشرة */}
      <HomeHeroStrips />

      {/* باقي أقسام الصفحة */}
    </main>
  );
}
9. ملاحظات للنموذج المحلي (حرية التكيّف مع الواقع)
يمكن للنموذج المحلي تعديل:

مصادر البيانات (fetchTopDealsForGuest) لتستخدم منطق توصية حقيقي (سعر/كم، تفضيلات، نوع الوقود…).

تصميم البطاقة (Tailwind classes) ليتطابق 100% مع تصميم Koli One.

النصوص (BG/EN) حسب لغة الموقع.

المهم أن يبقى العقد (CarSummary + API endpoints + HomeHeroStrips) ثابتاً، ليكون النظام قابل للتطوير بدون كسر.

، بنفس مستوى الاحتراف الذي تتوقعه، وبطريقة تجعل النموذج المحلي قادرًا على دمج هذه الأقسام في الصفحة الرئيسية تحت الهيرو الثالث بشكل ذكي، ديناميكي، وقابل للتطوير.

سأكمل مباشرة من النقطة التي توقفنا عندها، بدون تكرار، وبنفس الأسلوب المعماري الصارم الذي نستخدمه في Koli One.

🔥 الجزء التالي: دمج القسمين في الصفحة الرئيسية + منطق ذكي للتغذية + تعليمات للنموذج المحلي
10. دمج القسمين في الصفحة الرئيسية (تحت الهيرو الثالث) بشكل صارم
أنت تريد أن يكون هناك:

Hero 1

Hero 2

Hero 3

ثم مباشرة:

Recently viewed

Top DEALS for you

إليك الكود النهائي لدمجهم:

tsx
// app/page.tsx أو pages/index.tsx
import Hero1 from '@/components/home/Hero1';
import Hero2 from '@/components/home/Hero2';
import Hero3 from '@/components/home/Hero3';
import { HomeHeroStrips } from '@/components/home/HomeHeroStrips';

export default function HomePage() {
  return (
    <main className="flex flex-col gap-10">
      <Hero1 />
      <Hero2 />
      <Hero3 />

      {/* 🔥 القسمان الجديدان تحت الهيرو الثالث */}
      <HomeHeroStrips />

      {/* باقي الصفحة */}
    </main>
  );
}
هذا يضمن أن القسمين يظهران دائمًا تحت الهيرو الثالث، بنفس ترتيب mobile.de..

11. منطق ذكي لتغذية القسمين (AI‑Driven Logic)
الآن سأضيف لك منطقًا ذكيًا يجعل النموذج المحلي قادرًا على:

اختيار أفضل السيارات تلقائيًا

ترتيبها

تصنيفها

تحديد أفضل العروض

تحديد السيارات التي شاهدها المستخدم

تحسين النتائج مع الوقت

A. منطق “Recently viewed”
ts
// server/recentViewsRepo.ts
export async function fetchRecentViewedIdsForGuest(guestId: string) {
  return await db
    .selectFrom('recent_views')
    .select('car_id')
    .where('guest_id', '=', guestId)
    .orderBy('viewed_at', 'desc')
    .limit(20)
    .execute();
}
B. منطق “Top DEALS for you”
هنا نستخدم scoring ذكي:

ts
// server/dealsEngine.ts
export async function fetchTopDealsForGuest(guestId: string | null) {
  const cars = await db
    .selectFrom('cars')
    .selectAll()
    .where('is_active', '=', true)
    .limit(200)
    .execute();

  const scored = cars.map((car) => {
    const score =
      (car.price_score || 0) * 0.6 +
      (car.demand_score || 0) * 0.2 +
      (car.relevance_score || 0) * 0.2;

    return { ...car, _score: score };
  });

  return scored.sort((a, b) => b._score - a._score).slice(0, 20);
}
النموذج المحلي يمكنه تعديل scoring حسب:

سلوك المستخدم

نوع السيارات التي يفضلها

السعر

الوقود

الموقع

12. تعليمات صارمة للنموذج المحلي (AI Integration Instructions)
أضف هذا القسم في ملف الخطة أو في دليل التطوير:

كتابة تعليمات برمجية
The local AI model is allowed to:
- Re-rank cars in both sections based on user behavior.
- Adjust scoring weights dynamically (price_score, relevance_score, demand_score).
- Replace or reorder cards based on real-time performance.
- Hide sections if no meaningful data is available.
- Suggest new strip sections (e.g., “Recommended for you”) if enough data exists.

The AI model must NOT:
- Modify the UI structure.
- Change the API contracts.
- Break the CarSummary interface.
- Introduce new fields without backend approval.
بهذا يصبح النموذج المحلي جزءًا من النظام، وليس مجرد مستهلك.

13. تعليمات دمج التصميم (UI Fidelity Matching mobile.de)
أضف هذا القسم في الخطة:

كتابة تعليمات برمجية
UI Requirements:
- Card width: 220–260px
- Horizontal scroll with smooth snapping
- Image aspect ratio: 4:3
- Price badge colors:
  - Very good: #0f9d58
  - Good: #34a853
  - Fair: #fbbc05
- Font sizes:
  - Title: 14px
  - Price: 16px bold
  - Meta: 11–12px
- Shadows:
  - Default: shadow-sm
  - Hover: shadow-md
14. تعليمات للـ Guardian Doctor (الحارس الطبيب) لمراقبة القسمين
أضف هذا في ملف الحارس:

كتابة تعليمات برمجية
Guardian Doctor Responsibilities:
- Monitor API latency for /recently-viewed and /top-deals.
- Detect empty results for more than 24 hours.
- Auto-fix by:
  - Rebuilding scoring cache.
  - Refreshing car indexes.
  - Re-ranking cars.
- If repeated failures occur:
  - Open GitHub issue with logs.
  - Suggest scoring adjustments.
  - Trigger fallback mode (static deals).
15. النتيجة النهائية
بعد دمج كل ما سبق:

لديك قسمين مطابقين لـ mobile.de

يعملان تلقائيًا

مدعومان بالذكاء الاصطناعي

متكاملان مع نظام الضيف

قابلان للتطوير

