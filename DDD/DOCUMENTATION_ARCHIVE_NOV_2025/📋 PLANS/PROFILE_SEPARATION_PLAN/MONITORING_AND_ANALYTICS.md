# 📊 MONITORING_AND_ANALYTICS.md
## المراقبة والتحليلات خلال الترحيل وبعده

يغطي مقاييس التقنية/الأعمال/التجربة + لوحات ومؤشرات تنبيه.

---

## Types (Reference)
```ts
// monitoring-dashboard.types.ts (reference-only)
interface MigrationMetrics {
  realTime: {
    activeUsers: number;
    errorRate: number;        // errors per minute or % writes
    performance: number;      // e.g., P95 in ms
    dataSync: number;         // % docs migrated / consistent
  };
  business: {
    conversionRate: number;   // signup→verified, free→paid
    userSatisfaction: number; // survey/CSAT
    supportTickets: number;
  };
  technical: {
    apiResponseTime: number; // ms
    databaseLoad: number;    // reads/writes per sec
    cacheHitRate: number;    // %
  };
}

// kpi-measurement.types.ts
interface KPIMetrics {
  development: { velocity: number; quality: number; coverage: number; };
  business: { userGrowth: number; revenue: number; retention: number; };
  technical: { performance: number; reliability: number; security: number; };
}
```

---

## Dashboards (Cloud Monitoring)
- Functions: Error rate, P95 latency, cold starts
- Firestore: Aborted writes %, reads/sec, writes/sec
- Client (Sentry/Crashlytics): JS error rate, route boundary triggers
- Migration: movedCount, skippedCount, retryCount, totalCompleted%

---

## SLOs & Alerts
- Error budget: < 0.5% writes aborted
- P95 latency: < 900ms (steady), PAGE if > 1000ms for 15m
- Aborted writes: WARN > 0.2%, PAGE > 0.3%
- Client errors: WARN baseline + 1.0, PAGE baseline + 2.0

---

## Reports (Weekly)
- Migration progress: completion %, cohorts done
- Performance deltas: before/after P95
- Business transitions: free→paid, plan upgrades
- Reliability: uptime, error budgets consumed

---

## Notes
- اربط مؤشرات RC changes مع الأحداث كي تفهم أثر التفعيل التدريجي
- راقب consistency checker findings وأزمنتِها
- أضف بطاقات مخصصة لرسائل التوست في الواجهة (count by key)
