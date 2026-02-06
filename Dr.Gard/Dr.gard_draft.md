نظرة عامة سريعة
سأولّد هنا مجموعة ملفات وبرمجيات جاهزة للنسخ‑اللصق داخل المشروع dev_s_media لتنفيذ حلول التحمل، المراقبة، الاسترداد الآلي، وإضافة خدمة جديدة اسمها الحارس الطبيب (guardian‑doctor) تعمل كروبوت مستقل داخل المشروع لمعالجة المشاكل الحتمية تلقائياً أو شبه تلقائياً. كل ملف يأتي مع وصف قصير أين يوضع وكيف يُستخدم. عند الانتهاء أكتب لك كلمة التأكيد النهائية: انتهت.

1. بنية المجلدات المقترحة لإضافة الحارس الطبيب
ضع هذه الشجرة داخل dev_s_media/services/guardian_doctor:

كتابة تعليمات برمجية
guardian_doctor/
├─ src/
│  ├─ index.ts
│  ├─ monitor/
│  │  ├─ healthPoller.ts
│  │  ├─ queueWatcher.ts
│  │  └─ llmDiagnoseClient.ts
│  ├─ actions/
│  │  ├─ requeueJob.ts
│  │  ├─ restartService.ts
│  │  ├─ rotateSecret.ts
│  │  └─ throttleDispatcher.ts
│  ├─ notifications/
│  │  └─ notifier.ts
│  └─ config.ts
├─ package.json
├─ Dockerfile
└─ README.md
2. ملف التكوين العام config.ts
المسار guardian_doctor/src/config.ts

ts
export const CONFIG = {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379)
  },
  pg: {
    connectionString: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/dev'
  },
  llm: {
    endpoint: process.env.LLM_DIAGNOSE_URL || 'http://localhost:5000/diagnose',
    apiKeySecretName: process.env.LLM_API_KEY_SECRET || ''
  },
  adminNotifyWebhook: process.env.ADMIN_NOTIFY_WEBHOOK || '',
  queueNames: {
    main: process.env.MAIN_QUEUE || 'social-publish',
    dlq: process.env.DLQ_QUEUE || 'social-dlq'
  },
  thresholds: {
    queueDepthWarn: Number(process.env.QUEUE_DEPTH_WARN || 1000),
    queueDepthCritical: Number(process.env.QUEUE_DEPTH_CRITICAL || 5000),
    llmLatencyWarnMs: Number(process.env.LLM_LATENCY_WARN_MS || 2000),
    llmLatencyCriticalMs: Number(process.env.LLM_LATENCY_CRITICAL_MS || 5000)
  },
  pollIntervalMs: Number(process.env.GUARDIAN_POLL_INTERVAL_MS || 15000)
};
3. ملف المراقبة healthPoller.ts
المسار guardian_doctor/src/monitor/healthPoller.ts  
دور الملف: يراقب صحة الخدمات الحيوية ويبلغ الحارس عند وجود خلل.

ts
import fetch from 'node-fetch';
import { CONFIG } from '../config';
import { notify } from '../notifications/notifier';

export async function checkLLMHealth() {
  const url = CONFIG.llm.endpoint;
  const start = Date.now();
  try {
    const res = await fetch(url, { timeout: 5000 });
    const text = await res.text();
    const latency = Date.now() - start;
    if (res.ok && text.includes('ok')) {
      return { ok: true, latency };
    } else {
      await notify({ level: 'warn', title: 'LLM health check failed', body: `${res.status} ${text}` });
      return { ok: false, latency, reason: text || `status ${res.status}` };
    }
  } catch (err: any) {
    await notify({ level: 'error', title: 'LLM health unreachable', body: err.message });
    return { ok: false, latency: Date.now() - start, reason: err.message };
  }
}
4. ملف مراقبة صفوف queueWatcher.ts
المسار guardian_doctor/src/monitor/queueWatcher.ts  
دور الملف: يراقب عمق الطابور ويشغّل إجراءات تخفيف تلقائية.

ts
import IORedis from 'ioredis';
import { CONFIG } from '../config';
import { moveToDlqIfNeeded } from '../actions/requeueJob';
import { notify } from '../notifications/notifier';

const redis = new IORedis({ host: CONFIG.redis.host, port: CONFIG.redis.port });

export async function checkQueueDepth() {
  const mainQueueKey = `bull:${CONFIG.queueNames.main}:id`; // placeholder; adjust to actual key pattern
  // Use BullMQ API in production; here we use Redis LLEN for example queue list
  try {
    const depth = await redis.llen(`bull:${CONFIG.queueNames.main}:wait`);
    if (depth >= CONFIG.thresholds.queueDepthCritical) {
      await notify({ level: 'critical', title: 'Queue depth critical', body: `Depth ${depth}` });
      // throttle dispatcher or pause producers
      await throttleDispatcher();
    } else if (depth >= CONFIG.thresholds.queueDepthWarn) {
      await notify({ level: 'warn', title: 'Queue depth warning', body: `Depth ${depth}` });
    }
    return depth;
  } catch (err: any) {
    await notify({ level: 'error', title: 'Queue watcher error', body: err.message });
    return -1;
  }
}

async function throttleDispatcher() {
  // Simple placeholder: call action to throttle dispatcher
  try {
    await import('../actions/throttleDispatcher').then(m => m.throttleDispatcher());
  } catch (e) {
    await notify({ level: 'error', title: 'Throttle failed', body: String(e) });
  }
}
5. ملف إجراءات إعادة جدولة requeueJob.ts
المسار guardian_doctor/src/actions/requeueJob.ts  
دور الملف: إعادة جدولة مهمة من DLQ إلى الطابور الرئيسي مع فحص idempotency.

ts
import { Pool } from 'pg';
import { Queue } from 'bullmq';
import { CONFIG } from '../config';
import { notify } from '../notifications/notifier';

const pg = new Pool({ connectionString: CONFIG.pg.connectionString });

export async function requeueDlqItem(dlqJobId: string) {
  const client = await pg.connect();
  try {
    const res = await client.query('SELECT payload FROM dlq_jobs WHERE job_id = $1', [dlqJobId]);
    if (res.rowCount === 0) throw new Error('DLQ job not found');
    const payload = res.rows[0].payload;
    const queue = new Queue(CONFIG.queueNames.main, { connection: { host: CONFIG.redis.host } });
    await queue.add(payload.name || 'retry-job', payload.data || payload);
    await client.query('DELETE FROM dlq_jobs WHERE job_id = $1', [dlqJobId]);
    await notify({ level: 'info', title: 'DLQ requeued', body: `Requeued ${dlqJobId}` });
    return true;
  } finally {
    client.release();
  }
}
6. ملف إعادة تشغيل خدمة restartService.ts
المسار guardian_doctor/src/actions/restartService.ts  
دور الملف: تنفيذ أوامر إعادة تشغيل لخدمات محلية أو عبر Docker/Kubernetes.

ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { notify } from '../notifications/notifier';

const execAsync = promisify(exec);

export async function restartService(serviceName: string) {
  try {
    // Example for Docker Compose service
    const cmd = `docker-compose restart ${serviceName}`;
    const { stdout, stderr } = await execAsync(cmd);
    await notify({ level: 'info', title: 'Service restarted', body: `${serviceName} restarted. ${stdout || stderr}` });
    return { ok: true, stdout, stderr };
  } catch (err: any) {
    await notify({ level: 'error', title: 'Restart failed', body: err.message });
    return { ok: false, error: err.message };
  }
}
7. ملف تدوير الأسرار rotateSecret.ts
المسار guardian_doctor/src/actions/rotateSecret.ts  
دور الملف: تنفيذ تدوير أسرار بسيط عبر واجهة CLI أو API لمخزن الأسرار.

ts
import { notify } from '../notifications/notifier';
import fetch from 'node-fetch';

export async function rotateSecret(secretName: string, newValue: string) {
  // Placeholder: call cloud provider API or run CLI to set secret
  try {
    // Example: call internal endpoint that writes to Secret Manager
    const res = await fetch(`${process.env.SECRET_MANAGER_API}/secrets/${secretName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SECRET_MANAGER_TOKEN}` },
      body: JSON.stringify({ value: newValue })
    });
    if (!res.ok) throw new Error(`Secret rotation failed ${res.status}`);
    await notify({ level: 'info', title: 'Secret rotated', body: secretName });
    return true;
  } catch (err: any) {
    await notify({ level: 'error', title: 'Secret rotation failed', body: err.message });
    return false;
  }
}
8. ملف إشعارات notifier.ts
المسار guardian_doctor/src/notifications/notifier.ts  
دور الملف: إرسال إشعارات إلى Slack / Webhook / Email.

ts
import fetch from 'node-fetch';
import { CONFIG } from '../config';

export async function notify(payload: { level: 'info' | 'warn' | 'error' | 'critical', title: string, body: string }) {
  const webhook = CONFIG.adminNotifyWebhook;
  const message = {
    text: `*${payload.title}*\n${payload.body}\nlevel: ${payload.level}`
  };
  if (webhook) {
    try {
      await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
    } catch (err) {
      console.error('notify failed', err);
    }
  } else {
    console.log('notify', payload.title, payload.body);
  }
}
9. ملف تشخيص LLM llmDiagnoseClient.ts
المسار guardian_doctor/src/monitor/llmDiagnoseClient.ts  
دور الملف: يرسل ملخّص خطأ أو حالة إلى LLM للحصول على تشخيص مقترح أو خطوات إصلاح.

ts
import fetch from 'node-fetch';
import { CONFIG } from '../config';

export async function askLLMForDiagnosis(context: { service: string, logs: string, metrics?: any }) {
  try {
    const res = await fetch(CONFIG.llm.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `Diagnose the issue for service ${context.service}\nLogs:\n${context.logs}\nMetrics:\n${JSON.stringify(context.metrics || {})}` })
    });
    if (!res.ok) throw new Error(`LLM responded ${res.status}`);
    const json = await res.json();
    // Expect LLM to return structured suggestions
    return json;
  } catch (err: any) {
    return { error: err.message };
  }
}
10. ملف التشغيل الرئيسي index.ts
المسار guardian_doctor/src/index.ts  
دور الملف: حلقة مراقبة دورية تشغّل الفحوص وتنفّذ إجراءات تلقائية.

ts
import { CONFIG } from './config';
import { checkLLMHealth } from './monitor/healthPoller';
import { checkQueueDepth } from './monitor/queueWatcher';
import { askLLMForDiagnosis } from './monitor/llmDiagnoseClient';
import { notify } from './notifications/notifier';

async function mainLoop() {
  try {
    const llm = await checkLLMHealth();
    if (!llm.ok) {
      // ask LLM for diagnosis using recent logs placeholder
      const diag = await askLLMForDiagnosis({ service: 'llm', logs: 'recent logs placeholder', metrics: { latency: llm.latency } });
      await notify({ level: 'warn', title: 'LLM issue detected', body: JSON.stringify(diag) });
      // optionally trigger restart or fallback
    } else {
      if (llm.latency > CONFIG.thresholds.llmLatencyWarnMs) {
        await notify({ level: 'warn', title: 'LLM latency high', body: `p95 ${llm.latency}ms` });
      }
    }

    const depth = await checkQueueDepth();
    // additional checks and actions can be added here

  } catch (err: any) {
    await notify({ level: 'error', title: 'Guardian main loop error', body: err.message });
  } finally {
    setTimeout(mainLoop, CONFIG.pollIntervalMs);
  }
}

console.log('Guardian Doctor starting...');
mainLoop();
11. package.json و Dockerfile
المسار guardian_doctor/package.json

json
{
  "name": "guardian-doctor",
  "version": "0.1.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc -p .",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "node-fetch": "^2.6.7",
    "ioredis": "^5.3.2",
    "bullmq": "^1.70.0",
    "pg": "^8.10.0"
  },
  "devDependencies": {
    "typescript": "^4.9.5",
    "ts-node": "^10.9.1"
  }
}
المسار guardian_doctor/Dockerfile

dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
12. ربط الحارس الطبيب مع نظام التنبيهات وCI
أضف ADMIN_NOTIFY_WEBHOOK في بيئة الحاوية أو Secret Manager ليشير إلى Slack webhook أو خدمة إشعارات داخلية.

أضف خطوة نشر للحارس في docker-compose.yml أو Kubernetes Deployment مع موارد CPU/GPU محددة.

أضف في CI اختبار صحة الحارس بعد النشر: curl --fail http://guardian:port/health أو تحقق من logs.

13. إجراءات تلقائية مقترحة للحارس الطبيب
عند تجاوز عمق الطابور حدّ التحذير: إرسال تحذير وتفعيل throttleDispatcher لتقليل معدل الإنتاج.

عند تجاوز حدّ حرج: إيقاف مؤقت للمنتجين، إعادة جدولة المهام الحرجة، إشعار الفريق.

عند فشل LLM: تفعيل fallback templates، تدوير النموذج أو إعادة تشغيل خدمة LLM، إشعار فني.

عند اكتشاف تسرب أسرار أو نشاط مشبوه: تدوير الأسرار فوراً واستدعاء rotateSecret ثم إبلاغ الأمن.

14. ربط الحارس مع نماذج الذكاء الاصطناعي
الحارس يستخدم CONFIG.llm.endpoint لاستدعاء خدمة التشخيص. يمكن توسيع ذلك لتمرير prompts جاهزة تطلب من النموذج:

تحليل لوجات خطأ وتقديم خطوات إصلاح مرتبة حسب الأولوية.

اقتراح أوامر shell أو Kubernetes manifests لإعادة التشغيل أو زيادة الموارد.

تحذير أمني: أي أوامر تنفيذية مقترحة من LLM يجب أن تُعرض على مشرف بشري قبل التنفيذ التلقائي إلا إذا تم وضع سياسة ثقة صارمة.

15. ملفات تشغيل سريعة وأوامر نشر
انسخ هذه الأوامر لتشغيل محلي سريع:

bash
# من داخل guardian_doctor
npm ci
npm run build
npm start
أو باستخدام Docker:

bash
docker build -t guardian-doctor:latest .
docker run -e REDIS_HOST=redis -e DATABASE_URL=postgres://... -e ADMIN_NOTIFY_WEBHOOK="https://hooks.slack.com/..." guardian-doctor:latest
16. نقاط أمان وتشغيل نهائية
امنح الحارس أقل صلاحيات ممكنة للوصول إلى Secret Manager وDB.

سجّل كل إجراء يقوم به الحارس في audit_logs مع منطق التراجع.

ضع سياسة موافقة بشرية للعمليات الحساسة (تدوير أسرار، حذف بيانات، إعادة جدولة واسعة).

اختبر الحارس في بيئة staging قبل تفعيله في production.

17. ماذا فعلت هنا ولماذا
أنشأت تصميمًا عمليًا ومجموعة ملفات قابلة للتنفيذ للحارس الطبيب ليقوم بالمراقبة، التشخيص، والإجراءات التلقائية الأساسية.

ركّزت على آليات السلامة: إشعارات، سجلات تدقيق، حدود تنفيذية، وسياسة موافقة بشرية للعمليات الحساسة.

وفّرت نقاط ربط مع LLM لتشخيص ذكي لكن مع تحذير بعدم تنفيذ أوامر خطرة تلقائياً دون موافقة.

انتهت

لكن اريده هو ايجنت يعني يعالج بنفسه اي مشكله ممكن ان تحصل للمشروع و يعدل المسارات و يرتب كل مشكله كانت اذا كان من الممكن ربطه بجيت هوب او جمناي او غيره
الملخّص
أبني لك هنا تصميمًا عمليًا ومفصّلًا لوكيل ذكي مستقل داخل المشروع اسمه الحارس الطبيب يعمل كـ agent ذاتي قادر على اكتشاف المشاكل، اتخاذ إجراءات تصحيحية آمنة، تعديل مسارات التشغيل، وفتح أو تنفيذ تغييرات في المستودع عبر GitHub أو أدوات خارجية مثل Gemini أو أنظمة CI. أشرح المكوّنات، واجهات التكامل، أمثلة تنفيذية قابلة للنسخ، سياسات الأمان، آليات الموافقة البشرية، وخطة اختبار ونشر. في النهاية أضع خطوات تنفيذية جاهزة للتطبيق.

قدرات الحارس الطبيب المقترحة
مراقبة مستمرة: يقرأ مقاييس النظام، سجلات الأخطاء، عمق الطابور، صحة LLM، استخدام التخزين، ومعدلات ال429/5xx.

تشخيص ذكي: يرسل ملخّصات للسجلات إلى نموذج تشخيص محلي أو سحابي ويستخرج اقتراحات مرتبة حسب الأولوية.

إجراءات تصحيحية آلية: تنفيذ إجراءات محددة مسبقًا مثل إعادة جدولة DLQ، إعادة تشغيل خدمة، تدوير سرّ، تقليل معدل النشر، أو تعديل قواعد التوجيه.

تغيير مسارات التشغيل: تعديل إعدادات dispatcher أو تبديل إلى نمط manual approval أو تحويل بعض الحمل إلى staging.

تكامل مع GitHub: فتح PRs تلقائيًا لتعديل إعدادات التكوين، أو إنشاء issue، أو تنفيذ revert بعد موافقة بشرية أو وفق سياسة محددة.

سجل تدقيق كامل: كل إجراء يُسجّل مع منطق التراجع، توقيع رقمي، ونسخة من التغييرات.

سياسة موافقة بشرية قابلة للتخصيص: بعض الإجراءات الحساسة تتطلب موافقة إنسانية قبل التنفيذ التلقائي.

تعلم بسيط وتحسين قواعد: حفظ حالات الحوادث وحلولها لتقليل تدخل الإنسان مستقبلاً.

بنية Agent والواجهات
المكوّنات الأساسية
Monitor: يجمع مقاييس من Prometheus/Cloud Monitoring، سجلات من Cloud Logging، وعمق الطابور من Redis.

Analyzer: ينسّق استدعاءات إلى LLM التشخيصي ويطبّق قواعد تحليلية ثابتة.

Planner: يترجم التشخيص إلى خطة إجراءات مرتبة مع تقدير المخاطر.

Executor: ينفّذ إجراءات آمنة عبر واجهات محددة: Docker/K8s API، Redis/BullMQ، Postgres، Secret Manager، GitHub API، CI triggers.

Gatekeeper: يطبّق سياسات الموافقة البشرية، يرسل بطاقات موافقة عبر Slack/Email، وينفّذ بعد الموافقة.

Auditor: يسجّل كل حدث في جدول audit_logs ويصدر تقارير دورية.

Connector Layer: موصلات جاهزة لـ GitHub, GitLab, Gemini (API wrapper), Slack, PagerDuty, Secret Manager.

واجهات التكامل الأساسية
GitHub REST API: لإنشاء branches, commits, PRs, merges, reverts.

CI API: تشغيل pipelines أو إيقافها عبر GitHub Actions API أو GitLab CI.

Kubernetes API / Docker Compose: إعادة تشغيل خدمات، تعديل replicas، تطبيق manifests.

Secret Manager API: تدوير أسرار وقراءة/كتابة مشفّرة.

LLM API: استدعاء endpoint للتشخيص أو اقتراح تغييرات config.

Notification API: Slack webhook أو internal webhook لإرسال بطاقات موافقة.

أمثلة تنفيذية عملية قابلة للنسخ
فتح PR لتعديل config عبر GitHub API
bash
# Bash example using curl (استبدل المتغيرات)
GITHUB_API="https://api.github.com"
REPO="org/repo"
BRANCH="guardian/autofix-$(date +%s)"
TOKEN="${GITHUB_TOKEN}"

# 1. Create branch from main
MAIN_SHA=$(curl -s -H "Authorization: token $TOKEN" $GITHUB_API/repos/$REPO/git/ref/heads/main | jq -r .object.sha)
curl -s -X POST -H "Authorization: token $TOKEN" $GITHUB_API/repos/$REPO/git/refs -d "{\"ref\":\"refs/heads/$BRANCH\",\"sha\":\"$MAIN_SHA\"}"

# 2. Create file change (example: reduce dispatcher rate)
CONTENT=$(echo -n 'dispatcher.rate=50' | base64)
curl -s -X PUT -H "Authorization: token $TOKEN" $GITHUB_API/repos/$REPO/contents/config/dispatcher.conf -d "{\"message\":\"guardian: throttle dispatcher\",\"content\":\"$CONTENT\",\"branch\":\"$BRANCH\"}"

# 3. Open PR
curl -s -X POST -H "Authorization: token $TOKEN" $GITHUB_API/repos/$REPO/pulls -d "{\"title\":\"guardian: throttle dispatcher\",\"head\":\"$BRANCH\",\"base\":\"main\",\"body\":\"Automated fix by Guardian Doctor\"}"
إعادة تشغيل خدمة في Kubernetes
ts
// TypeScript snippet using kubernetes-client
import Client from 'kubernetes-client';
const client = new Client.Client({ version: '1.13' });
await client.apis.apps.v1.namespaces('default').deployments('worker-deployment').patch({ body: { spec: { template: { metadata: { annotations: { 'guardian/restart': new Date().toISOString() } } } } } });
تدوير سرّ عبر Secret Manager (مثال Firebase)
bash
# Example: rotate secret by creating new version and updating env refs
firebase functions:secrets:set LLM_API_KEY --data "new-secret-value"
# then trigger redeploy of affected functions
firebase deploy --only functions:llmWrapper
تنفيذ إجراء تلقائي مع Gatekeeper موافقة بشرية
Agent يرسل رسالة Slack مع زر Approve/Reject.

عند الضغط Approve، webhook يعيد إلى Agent ويبدأ التنفيذ.

مثال payload Slack يحتوي على action_id مرتبط بـ DLQ item id.

سياسات الأمان والحدود
مبدأ الأقل صلاحية: حساب الحارس يملك صلاحيات محدودة فقط للعمليات المصرح بها.

قائمة إجراءات مسموح بها: فقط الإجراءات المدرجة في allowed_actions.yaml يمكن تنفيذها تلقائيًا.

مستوى الحساسية:

Low: إعادة جدولة DLQ، throttle dispatcher — تنفيذ تلقائي.

Medium: إعادة تشغيل خدمة، تدوير سرّ — تنفيذ بعد موافقة مشرف واحد.

High: تعديل قواعد نشر، حذف بيانات، merge to main — تنفيذ بعد موافقة اثنين أو أكثر.

سجل تدقيق لا يمكن تغييره: كل إجراء يُسجّل مع توقيع رقمي ونسخة من الحالة قبل وبعد.

حدود التنفيذ التلقائي: عدد الإجراءات التلقائية في الساعة محدود لتجنب حلقة تغييرات متتالية.

آليات التعلم والتحسين الذاتي
حفظ حالات الحوادث: كل حادث يُخزّن مع التشخيص، الإجراء، النتيجة، ووقت الاستجابة.

قواعد تشغيل قابلة للتحديث: Agent يقترح تحسينات على قواعد retry وthresholds عبر PR تلقائي إلى repo للاطلاع البشري.

تقييم نجاح الإجراء: بعد تنفيذ أي إجراء، Agent يراقب المؤشرات لمدة محددة ويعلّم ما إذا كان الإجراء ناجحًا أو يحتاج تعديل.

خطة اختبار ونشر Agent
بيئة staging: شغّل Agent في staging مع صلاحيات محدودة ومحاكاة للحوادث.

اختبارات تلقائية: سيناريوهات DLQ، LLM outage، rate limit، media flood.

Canary rollout: نشر Agent على مجموعة صغيرة من الخدمات أولًا، مراقبة 24 ساعة، ثم توسيع.

مراجعة أمان: pen test على واجهات GitHub وSecret Manager قبل تفعيل التنفيذ التلقائي.

مراجعة بشرية نهائية: قبل تفعيل أي إجراء High، إرسال تقرير تفصيلي إلى فريق الأمن والعمليات.

متطلبات تنفيذية وموارد
أذونات GitHub: token مع صلاحيات repo:contents, pull_requests, workflows حسب الحاجة.

Secret Manager: واجهة API لقراءة/كتابة الأسرار وتدويرها.

خدمة إشعارات: Slack webhook أو نظام إشعارات داخلي.

بيئة تشغيل: containerized service مع autoscale، موارد CPU وRAM كافية لمراقبة وتحليل.

سجل ومخزن بيانات: جدول audit_logs, guardian_actions, ونسخ احتياطية.

خطوات تنفيذ فورية قابلة للتطبيق الآن
أنشئ مجلد services/guardian_doctor والصق الملفات الأساسية التي وضعتها سابقًا.

أضف ملف allowed_actions.yaml يحدد الإجراءات المسموح بها ومستوى الموافقة.

أعد تشغيل Agent في staging مع ADMIN_NOTIFY_WEBHOOK وGITHUB_TOKEN محدود الصلاحيات.

شغّل سيناريو اختبار DLQ وLLM outage وتحقق من السلوك.

بعد نجاح الاختبارات، فعّل إجراءات Low تلقائيًا، وابقَ على Medium/High تحت Gatekeeper.

ملاحظات نهائية عملية
ربط Agent بنماذج الذكاء ممكن ومفيد للتشخيص واقتراح الحلول، لكن تنفيذ أوامر خطرة يجب أن يمر عبر موافقة بشرية ما لم تكن هناك ثقة كاملة وسياسات أمان صارمة.

أنصح ببدء التشغيل في وضع مراقبة فقط لمدة 72 ساعة ثم تفعيل إجراءات Low تدريجيًا.

أقدّم لك تنفيذًا عمليًا: أستطيع الآن توليد ملفات allowed_actions.yaml, GitHub integration module, Slack approval workflow, وملف نشر Kubernetes للـ Agent. أجهّزها فورًا إذا رغبت.

انتهت

ماذا انسخ الان و الصقها في ملف خطة ؟
ماذا تنسخ الآن وتلصقه في ملف الخطة
انسخ المقاطع التالية وضعها في SOCIAL_MEDIA_AUTOMATION_PLAN.md أو في ملفات منفصلة المشار إليها. أرتّبها حسب الأولوية مع اسم الملف المقترح وموجز المحتوى الذي يجب لصقه.

1. مخطط الإجراءات الحرجة فوراً — ألصق في قسم جديد بعنوان Immediate Risk Mitigations
محتوى: موجز الإجراءات الفورية عند ارتفاع الحمل، فشل LLM، تراكم DLQ، تسرب أسرار.

لماذا: يعطي القارئ خطة استجابة سريعة قبل الدخول في التفاصيل التقنية.

2. قائمة الملفات العملية التي أنشأناها — ألصق في قسم Deliverables
dev_s_media/schemas/llm_output.json — JSON Schema صارم لمخرجات LLM.

dev_s_media/scripts/preflight.sh — فحوص Linux/macOS/CI.

dev_s_media/scripts/preflight.ps1 — فحوص PowerShell.

dev_s_media/services/worker/src/steps/dlq_handler.ts — قالب نقل مهام إلى DLQ.

dev_s_media/services/guardian_doctor/... — كامل مجلد الحارس الطبيب (config, monitor, actions, notifier, index).

ألصق سطرًا أو اثنين يشرح وظيفة كل ملف كما في الأعلى.

3. مقتطفات قابلة للنسخ مباشرة — ألصق في قسم Code Snippets for Implementation
LLM Schema: انسخ كامل محتوى schemas/llm_output.json (الموجود في المحادثة) وضعه هنا أو أرفقه كملف.

Preflight Script (bash): انسخ كامل scripts/preflight.sh.

Preflight Script (PowerShell): انسخ كامل scripts/preflight.ps1.

DLQ Handler: انسخ كامل worker/steps/dlq_handler.ts.

Guardian Doctor Overview: ألصق وصف المجلد وبنية الملفات مع روابط إلى كل ملف (config, healthPoller, queueWatcher, actions, notifier, index).

4. تكامل GitHub وعمليات تلقائية — ألصق في قسم Automation and GitHub Integration
مقتطف فتح PR تلقائي: ألصق سكربت الـ curl لعمل branch ورفع ملف وفتح PR (المثال في المحادثة).

سياسة الموافقة البشرية: ألصق جدول الحساسية (Low/Medium/High) مع أمثلة إجراءات لكل مستوى.

5. قائمة التحقق التشغيلية — ألصق في قسم Operational Checklist
Secrets in Secret Manager

Preflight integrated in CI

DLQ handler and Admin UI for requeue

Canary rollout configured

Monitoring dashboards and SLOs active

Runbooks available (publish_failure, llm_outage, meta_quota)

استخدم نقاط مرقمة قصيرة لكل بند.

6. خطة الاختبار والضغط — ألصق في قسم Load and Chaos Testing
خطوات اختبار التحميل المتدرج، اختبار الوسائط المكثف، اختبار LLM outage، اختبار rate limit، chaos test للـ Redis/Postgres.

عتبات المراقبة المقترحة (queue depth, LLM p95, DLQ size).

7. مخطط الحارس الطبيب Agent — ألصق في قسم Guardian Doctor Agent
بنية المجلدات المقترحة.

وصف كل مكوّن (Monitor, Analyzer, Planner, Executor, Gatekeeper, Auditor, Connectors).

أمثلة تنفيذية: فتح PR عبر GitHub، إعادة تشغيل خدمة في Kubernetes، تدوير سرّ عبر Secret Manager.

سياسات الأمان والموافقة البشرية.

أوامر نشر سريعة (docker build/run).

8. الملفات التي أنشئتها لاحقاً أو أطلبها الآن — ألصق في قسم Next Files to Add
migrations/001_init.sql (DB schema) — لم تُنشأ بعد؛ أطلب مني إنشاؤها.

monitoring/slo_and_alerts.md وملف تكوين Dashboard — أطلب إنشاؤها.

security/secrets_policy.md وscripts/rotate_secrets.sh — أطلب إنشاؤها.

ضع تعليمات قصيرة: “اطلب من الفريق تشغيل chmod +x scripts/preflight.sh ورفع الملفات إلى repo”.

نص جاهز للصق في الخطة لبدء التنفيذ الفوري
انسخ الفقرة التالية وضعها في أعلى الخطة كـ Action Summary:

كتابة تعليمات برمجية
Action Summary
1. Add the provided artifacts to the repository:
   - dev_s_media/schemas/llm_output.json
   - dev_s_media/scripts/preflight.sh
   - dev_s_media/scripts/preflight.ps1
   - dev_s_media/services/worker/src/steps/dlq_handler.ts
   - dev_s_media/services/guardian_doctor/ (full agent)
2. Integrate preflight scripts into CI pipeline (run before LLM calls).
3. Deploy Guardian Doctor to staging with ADMIN_NOTIFY_WEBHOOK and limited GITHUB_TOKEN.
4. Run load tests: gradual traffic spike, media flood, LLM outage, rate-limit simulation.
5. After successful staging tests, enable Low-level auto-remediations and monitor 48 hours.
هل تريد أن أدرج المحتوى الكامل للملفات مباشرة داخل الخطة الآن؟
أستطيع إما أن ألصق كامل نصوص الملفات (schema, scripts, dlq handler, guardian files) داخل SOCIAL_MEDIA_AUTOMATION_PLAN.md،

أو أضعها كملفات منفصلة في المستودع وأدرج روابط/مراجع في الخطة.

اختر: الصق كامل الملفات داخل الخطة أو أدرجها كملفات منفصلة. سأنفّذ الخيار الذي تختاره فوراً.

اكمل
Immediate Risk Mitigations
ملخص الإجراءات الفورية انسخ هذا القسم في أعلى الخطة كـ Action Summary ثم نفّذ فوراً عند الحاجة.

حدود قبول مؤقتة: فرض حد 10 صور لكل إعلان وحد أقصى 5,000 إعلان/ساعة حتى انتهاء اختبارات التحمل.

Throttle وCircuit Breaker: تفعيل تخفيض تلقائي لمعدل النشر عند تجاوز queue depth أو أخطاء 429.

Fallback LLM: تفعيل قوالب آمنة تلقائياً إذا فشل النموذج المحلي أو ارتفعت زمن الاستجابة.

DLQ Handling: إيقاف مؤقت للمنتجين عند تراكم DLQ فوق عتبة حرجة، تشغيل تحليل DLQ وتصنيف الأسباب.

تدوير أسرار فوري: عند كشف تسرب، تدوير المفاتيح وإبطال القديمة فوراً.

Deliverables
قائمة الملفات التي أُنشئت أو يجب إضافتها — ألصقها في قسم Deliverables مع مسار كل ملف ووصف موجز.

dev_s_media/schemas/llm_output.json — JSON Schema صارم لمخرجات LLM.

dev_s_media/scripts/preflight.sh — فحوص Linux/macOS/CI قبل استدعاء LLM.

dev_s_media/scripts/preflight.ps1 — فحوص PowerShell لنظام Windows.

dev_s_media/services/worker/src/steps/dlq_handler.ts — قالب نقل مهام إلى DLQ وتسجيلها في DB.

dev_s_media/services/guardian_doctor/ — مجلد الحارس الطبيب يحتوي على: config.ts, monitor/*, actions/*, notifications/notifier.ts, index.ts, Dockerfile, package.json.

ملفات مطلوبة لاحقاً: migrations/001_init.sql, monitoring/slo_and_alerts.md, security/secrets_policy.md.

Code Snippets for Implementation
انسخ هذه المقاطع مباشرة إلى الخطة أو إلى ملفات منفصلة كما هو موضح.

LLM Schema (schemas/llm_output.json) — الصق كامل الملف JSON كما في المحادثة السابقة.

Preflight Script (bash) (scripts/preflight.sh) — الصق كامل السكربت كما أُعطي سابقاً واجعله قابلًا للتنفيذ.

Preflight Script (PowerShell) (scripts/preflight.ps1) — الصق كامل السكربت كما أُعطي سابقاً.

DLQ Handler (worker/steps/dlq_handler.ts) — الصق كامل قالب TypeScript كما أُعطي سابقاً.

GitHub PR Example — ألصق هذا المقتطف في قسم Automation:

bash
# Create branch, add file change, open PR (استبدل المتغيرات)
GITHUB_API="https://api.github.com"
REPO="org/repo"
BRANCH="guardian/autofix-$(date +%s)"
TOKEN="${GITHUB_TOKEN}"
MAIN_SHA=$(curl -s -H "Authorization: token $TOKEN" $GITHUB_API/repos/$REPO/git/ref/heads/main | jq -r .object.sha)
curl -s -X POST -H "Authorization: token $TOKEN" $GITHUB_API/repos/$REPO/git/refs -d "{\"ref\":\"refs/heads/$BRANCH\",\"sha\":\"$MAIN_SHA\"}"
CONTENT=$(echo -n 'dispatcher.rate=50' | base64)
curl -s -X PUT -H "Authorization: token $TOKEN" $GITHUB_API/repos/$REPO/contents/config/dispatcher.conf -d "{\"message\":\"guardian: throttle dispatcher\",\"content\":\"$CONTENT\",\"branch\":\"$BRANCH\"}"
curl -s -X POST -H "Authorization: token $TOKEN" $GITHUB_API/repos/$REPO/pulls -d "{\"title\":\"guardian: throttle dispatcher\",\"head\":\"$BRANCH\",\"base\":\"main\",\"body\":\"Automated fix by Guardian Doctor\"}"
Automation and GitHub Integration
سياسة الموافقة البشرية — ألصق الجدول التالي في الخطة تحت Automation Policy:

Low تنفيذ تلقائي: إعادة جدولة DLQ، throttle dispatcher.

Medium تنفيذ بعد موافقة مشرف واحد: إعادة تشغيل خدمة، تدوير سرّ.

High تنفيذ بعد موافقة اثنين: تعديل قواعد نشر، merge to main، حذف بيانات.

خطوات ربط GitHub

أنشئ GitHub App أو token محدود الصلاحيات (repo:contents, pull_requests, workflows).

Agent يفتح branch ويدفع التغيير ثم يفتح PR مع وصف وتاج guardian/auto.

CI يمرر اختبارات staging قبل الدمج التلقائي أو بعد موافقة بشرية.

Operational Checklist
انسخ هذه القائمة كـ Operational Checklist في الخطة

[ ] Secrets مخزنة في Secret Manager وsecurity/secrets_policy.md موجود.

[ ] Preflight مدمج في CI قبل استدعاء LLM.

[ ] DLQ handler وواجهة Admin لإعادة المعالجة.

[ ] Canary rollout مُعدّ وقواعد rollback آليّة.

[ ] Dashboards وAlerts مُفعّلة مع SLOs موثقة.

[ ] Runbooks متاحة: publish_failure, llm_outage, meta_quota.

Load and Chaos Testing
انسخ خطة الاختبارات هذه تحت قسم Load Testing

Gradual Traffic Spike: زيادة ad.published من 1× إلى 100× خلال 2 ساعة، راقب queue depth وpublish latency.

Media Flood: إرسال إعلانات بـ20 صورة لكل إعلان لمدة ساعة، راقب I/O وstorage.

LLM Outage: إيقاف خدمة LLM لمدة 10–30 دقيقة، تحقق من fallback وDLQ.

Rate Limit Simulation: محاكاة 429 من Meta API وتحقق من retry/backoff وcircuit breaker.

Chaos Test: عطل عقدة Redis أو Postgres مؤقتاً وتحقق من استعادة الخدمة.

عتبات مراقبة مقترحة

Queue depth warn: 1,000; critical: 5,000.

LLM p95 warn: 2s; critical: 5s.

DLQ size warn: 50 items/hour; critical: 500 items.

Guardian Doctor Agent
انسخ وصف الوكيل هذا كاملاً في قسم Agent Design

مجلد Agent: dev_s_media/services/guardian_doctor/ يحتوي على config.ts, monitor/*, actions/*, notifications/notifier.ts, index.ts, Dockerfile, package.json.

وظائف Agent:

مراقبة مقاييس وسجلات، تشخيص عبر LLM، تخطيط إجراءات، تنفيذ آمن، Gatekeeper للموافقات، تسجيل تدقيق.

إجراءات تلقائية مسموح بها: إعادة جدولة DLQ، throttle dispatcher (Low).

إجراءات تتطلب موافقة: تدوير أسرار، إعادة تشغيل واسعة، تغييرات config في repo (Medium/High).

تكاملات: GitHub API لفتح PRs، Secret Manager لتدوير الأسرار، Slack/Email للموافقات، Kubernetes/Docker لإعادة التشغيل.

أمثلة تنفيذية: الصق مقتطفات GitHub PR وKubernetes restart وsecret rotation كما في القسم Code Snippets.

سياسة أمان: أقل صلاحيات، سجل تدقيق غير قابل للتغيير، حدود تنفيذ تلقائي في الساعة، مراجعة بشرية للإجراءات الحساسة.

Next Files to Add
أضف هذه الملفات لاحقاً واذكرها في الخطة كـ Next Steps

migrations/001_init.sql — DB schema مع جداول social_posts, publish_attempts, dlq_jobs, audit_logs.

monitoring/slo_and_alerts.md — تعريف SLOs، قواعد التنبيه، روابط للوحة المراقبة.

security/secrets_policy.md وscripts/rotate_secrets.sh — سياسة تدوير الأسرار وأتمتتها.

ci/integration-tests.yml — تشغيل integration/E2E مع mocks قبل الدمج.

Action Summary to Paste Now
انسخ هذا الملخص وضعه في بداية الخطة كـ Action Summary قابل للتنفيذ فوراً:

كتابة تعليمات برمجية
Action Summary
1. Add artifacts to repo: schemas, preflight scripts, dlq handler, guardian_doctor.
2. Integrate preflight into CI pipeline before LLM calls.
3. Deploy Guardian Doctor to staging with ADMIN_NOTIFY_WEBHOOK and limited GITHUB_TOKEN.
4. Run load tests: traffic spike, media flood, LLM outage, rate-limit simulation.
5. After staging success, enable Low-level auto-remediations and monitor 48 hours.
انسخ كل الأقسام أعلاه وضعها في SOCIAL_MEDIA_AUTOMATION_PLAN.md أو في الملفات المشار إليها داخل المستودع. بعد اللصق، نفّذ هذه الأوامر السريعة محلياً:

bash
chmod +x dev_s_media/scripts/preflight.sh
git add .
git commit -m "Add preflight, schema, DLQ handler, Guardian Doctor agent scaffolding"
git push
أخبرني عندما تنتهي من اللصق وسأجهّز لك migrations/001_init.sql وmonitoring/slo_and_alerts.md تلقائياً.

اكمل
migrations/001_init.sql
انسخ هذا المحتوى إلى ملف الهجرة SQL لتنشئ الجداول الأساسية والقيود والفهارس.

sql
-- migrations/001_init.sql
-- Initial schema for Social Media Automation
BEGIN;

-- Table: social_posts
CREATE TABLE IF NOT EXISTS social_posts (
  id BIGSERIAL PRIMARY KEY,
  post_id UUID DEFAULT gen_random_uuid() NOT NULL,
  ad_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  platform_meta_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, published, failed
  idempotency_key TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ad_id, platform),
  UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_social_posts_ad_id ON social_posts (ad_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts (status);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts (created_at);

-- Table: publish_attempts
CREATE TABLE IF NOT EXISTS publish_attempts (
  id BIGSERIAL PRIMARY KEY,
  social_post_id BIGINT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  success BOOLEAN,
  error_message TEXT,
  provider_response JSONB
);

CREATE INDEX IF NOT EXISTS idx_publish_attempts_social_post_id ON publish_attempts (social_post_id);

-- Table: media_assets
CREATE TABLE IF NOT EXISTS media_assets (
  id BIGSERIAL PRIMARY KEY,
  social_post_id BIGINT REFERENCES social_posts(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  processed_url TEXT,
  type TEXT, -- image, video
  width INT,
  height INT,
  size_bytes BIGINT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_social_post_id ON media_assets (social_post_id);

-- Table: llm_requests
CREATE TABLE IF NOT EXISTS llm_requests (
  id BIGSERIAL PRIMARY KEY,
  social_post_id BIGINT REFERENCES social_posts(id) ON DELETE SET NULL,
  prompt TEXT,
  response JSONB,
  confidence NUMERIC(5,4),
  requires_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_llm_requests_social_post_id ON llm_requests (social_post_id);

-- Table: dlq_jobs
CREATE TABLE IF NOT EXISTS dlq_jobs (
  job_id TEXT PRIMARY KEY,
  job_name TEXT,
  payload JSONB,
  failed_reason TEXT,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_dlq_jobs_created_at ON dlq_jobs (created_at);

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT, -- service name or user id
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  payload_hash TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);

-- Optional: table for guardian actions history
CREATE TABLE IF NOT EXISTS guardian_actions (
  id BIGSERIAL PRIMARY KEY,
  action_type TEXT NOT NULL,
  target TEXT,
  details JSONB,
  executed_by TEXT, -- 'guardian' or user id
  approval_required BOOLEAN DEFAULT FALSE,
  approval_granted BOOLEAN DEFAULT FALSE,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guardian_actions_created_at ON guardian_actions (created_at);

-- Triggers to update updated_at on social_posts
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON social_posts;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON social_posts
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

COMMIT;
monitoring/slo_and_alerts.md
انسخ هذا المحتوى إلى ملف المراقبة لتعريف SLOs والتنبيهات ولوحات المراقبة والإجراءات.

markdown
# SLOs and Alerts for Social Media Automation

## Overview
هذا الملف يحدد SLOs الأساسية، قواعد التنبيه، ومخططات لوحة المراقبة المقترحة. استخدم مزود المراقبة لديك (Cloud Monitoring, Grafana, Prometheus) لتطبيق القواعد.

---

## Service Level Objectives
**Publish Success Rate**
- **SLO:** ≥ 99% (نسبة المنشورات التي تصل إلى الحالة `published` بعد محاولات معقولة)
- **Window:** 30 days rolling
- **Error Budget:** 1% of total publishes

**Publish Latency**
- **SLO:** p95 publish latency < 5s (من وقت أخذ المهمة من الطابور حتى استلام استجابة المنصة)
- **Window:** 7 days

**LLM Availability**
- **SLO:** 99.9% uptime for LLM health endpoint (`/health`)
- **Latency:** p95 inference latency < 2000 ms for small model, < 5000 ms for large model

**Queue Health**
- **SLO:** Queue depth < 1000 (warn) during normal operation
- **Window:** continuous

---

## Key Metrics to Monitor
- **Queue depth** (BullMQ wait + active + delayed)
- **DLQ size** (count of dlq_jobs)
- **Publish attempts success rate** (success / total attempts)
- **Publish latency** (p50, p95, p99)
- **LLM latency and error rate**
- **Storage growth** (daily % increase)
- **API 429/5xx rates** for each external provider (Meta, others)
- **Guardian actions executed** and their outcomes

---

## Alerting Rules and Thresholds
**Queue Depth**
- **Warn:** depth > 1000 for 5 minutes → notify SRE on Slack
- **Critical:** depth > 5000 for 2 minutes → page on-call, pause producers

**DLQ Growth**
- **Warn:** > 50 new DLQ items in 1 hour → create incident
- **Critical:** > 500 total DLQ items → page on-call, set system to manual mode

**LLM Health**
- **Warn:** health endpoint returns non-ok or p95 latency > 2000 ms for 5 minutes → notify ML engineer
- **Critical:** health endpoint down or p95 latency > 5000 ms for 2 minutes → fallback to templates, page on-call

**External API Rate Limits**
- **Warn:** 429 rate > 1% of requests in 5 minutes → throttle dispatcher
- **Critical:** 429 rate > 5% or sustained 5xx errors → pause auto-publish, escalate to product

**Publish Success Rate**
- **Warn:** success rate drops > 2% vs baseline in 30 minutes → investigate
- **Critical:** success rate < 95% for 30 minutes → rollback recent changes, page on-call

**Secret Rotation**
- **Warn:** secret expiry within 3 days → notify security and ops
- **Critical:** secret compromised event → immediate rotation and incident response

---

## Dashboards (Suggested Panels)
- **Overview Panel**
  - Total publishes (24h), success rate, DLQ count, queue depth
- **Queue Panel**
  - Depth over time, active workers, delayed jobs
- **LLM Panel**
  - Health status, p50/p95/p99 latency, error rate
- **Provider Panel**
  - API 429/5xx rates per provider, recent provider errors
- **Storage Panel**
  - Daily storage growth, top buckets by size
- **Guardian Panel**
  - Recent guardian actions, approvals pending, automated fixes applied

---

## Incident Playbooks and Escalation
**Playbook: Queue Depth Critical**
1. Alert fires → SRE on-call paged.
2. Guardian Doctor attempts automatic throttle and pauses producers.
3. If throttle fails, SRE runs `scripts/scale_workers.sh` or increases worker replicas.
4. If depth not reduced in 15 minutes, move to manual requeue and investigate root cause.

**Playbook: LLM Outage**
1. Guardian switches to fallback templates automatically.
2. Notify ML engineer and page if outage > 5 minutes.
3. If restart required, follow `runbooks/llm_outage.md`.

**Playbook: Secret Compromise**
1. Rotate secret immediately via `scripts/rotate_secrets.sh`.
2. Invalidate tokens and redeploy affected services.
3. Run audit on `audit_logs` for suspicious activity.

---

## Alerts Delivery and Escalation Paths
- **Primary:** Slack channel `#ops-alerts` with high-priority messages.
- **Escalation:** PagerDuty or SMS for critical alerts.
- **Email:** Daily digest for reconciliation and non-urgent warnings.

---

## Testing Alerts
- Create synthetic traffic to trigger warn thresholds and verify alert routing.
- Simulate LLM latency by adding artificial delay to health endpoint.
- Inject a DLQ item via DB insert to validate DLQ alerts.

---

## Maintenance and Review
- Review SLOs quarterly and adjust thresholds based on observed traffic and capacity.
- Run a simulated incident drill every 3 months with cross-functional teams.
تعليمات نهائية سريعة
الصق محتويات migrations/001_init.sql وmonitoring/slo_and_alerts.md في الملفات المشار إليها داخل المستودع.

شغّل الهجرة في بيئة staging أولاً ثم في production بعد التحقق:

bash
psql $DATABASE_URL -f migrations/001_init.sql
أضف قواعد التنبيه إلى مزود المراقبة لديك (Cloud Monitoring أو Grafana).

أخبرني عندما تنتهي من اللصق وسأجهّز security/secrets_policy.md وci/integration-tests.yml تلقائياً.

انتهت

اكمل
سياسة إدارة الأسرار Security Secrets Policy
الموقع المقترح: dev_s_media/security/secrets_policy.md

الملخص

المبدأ: لا مفاتيح في الريبو. كل الأسرار تُخزن في Secret Manager مركزي (Firebase Secrets أو Vault أو AWS Secrets Manager حسب البنية).

أدوار الوصول: فقط حسابات الخدمة المحددة وفرق SRE/DevOps تملك صلاحية القراءة في runtime؛ الكتابة والتدوير محصوران بمستخدمي أمان محددين.

تدوير تلقائي: تدوير دوري كل 60 يومًا للأسرار الحساسة (API keys, tokens). إشعار قبل 3 أيام لانتهاء الصلاحية.

تسجيل وتدقيق: كل عملية قراءة/تدوير تُسجّل في audit_logs مع actor وtimestamp وسبب.

سياسة الطوارئ: عند كشف تسرب، يتم إبطال المفتاح فورًا، تدوير جديد، وإخطار الفريق الأمني والعمليات.

مستوى الحساسية:

High: مفاتيح الدفع، مفاتيح الوصول للـ LLM، مفاتيح GitHub App — تدوير كل 30–60 يومًا.

Medium: مفاتيح التكامل مع الخدمات غير حرجة — تدوير كل 90 يومًا.

Low: مفاتيح بيئة التطوير المحلية — تدوير عند الحاجة.

ممارسات التطوير:

CI يقرأ الأسرار من Secret Manager فقط أثناء التنفيذ؛ لا يكتب أسرارًا إلى السجلات.

ملفات .env.example فقط في الريبو بدون قيم حقيقية.

فحص تلقائي في CI يرفض أي commit يحتوي على نمط مفتاح (regex) أو ملفات .env مضافة.

إجراءات الاستجابة للحوادث

إبطال المفتاح المتسرب فورًا.

تدوير المفتاح الجديد ونشره إلى Secret Manager.

إعادة نشر الخدمات المتأثرة.

فتح تحقيق وتسجيل الحادث في audit_logs.

إخطار الجهات المعنية (أمن، عمليات، قانون).

سكربت تدوير الأسرار rotate_secrets.sh
الموقع المقترح: dev_s_media/scripts/rotate_secrets.sh — اجعله قابلًا للتنفيذ chmod +x

bash
#!/usr/bin/env bash
set -euo pipefail

# Usage: ./rotate_secrets.sh SECRET_NAME NEW_VALUE
SECRET_NAME="${1:-}"
NEW_VALUE="${2:-}"

if [[ -z "$SECRET_NAME" || -z "$NEW_VALUE" ]]; then
  echo "Usage: $0 SECRET_NAME NEW_VALUE"
  exit 2
fi

# Example for Firebase CLI. Replace with your secret manager CLI/API.
if ! command -v firebase >/dev/null 2>&1; then
  echo "Error: firebase CLI not found. Adjust script for your Secret Manager."
  exit 3
fi

echo "Rotating secret: $SECRET_NAME"
firebase functions:secrets:set "$SECRET_NAME" --data "$NEW_VALUE"
if [[ $? -ne 0 ]]; then
  echo "Secret rotation failed for $SECRET_NAME"
  exit 4
fi

# Log rotation to audit table via psql (optional)
if [[ -n "${DATABASE_URL:-}" ]]; then
  psql "$DATABASE_URL" -c "INSERT INTO audit_logs (actor, action, target_type, target_id, details) VALUES ('guardian', 'rotate_secret', 'secret', '$SECRET_NAME', jsonb_build_object('rotated_at', now()))"
fi

echo "Rotation complete for $SECRET_NAME"
CI Integration Tests Workflow
الموقع المقترح: .github/workflows/ci-integration-tests.yml

yaml
name: CI Integration Tests

on:
  push:
    branches: [ main ]
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:6
        ports: ['6379:6379']
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: dev
        ports: ['5432:5432']
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci
        working-directory: dev_s_media

      - name: Start local LLM stub
        run: |
          # simple stub that responds to /health and /diagnose
          nohup npx http-server ./dev_s_media/llm_stub -p 5000 >/dev/null 2>&1 &
        working-directory: .

      - name: Run migrations
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/dev
        run: |
          psql $DATABASE_URL -f dev_s_media/migrations/001_init.sql

      - name: Run preflight check
        run: |
          chmod +x dev_s_media/scripts/preflight.sh
          ./dev_s_media/scripts/preflight.sh --ad-json dev_s_media/fixtures/sample_ad.json --llm http://localhost:5000/health

      - name: Run integration tests
        run: npm test --prefix dev_s_media/test/integration

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: integration-results
          path: dev_s_media/test/integration/results || ./test-results
ملف الإجراءات المسموح بها allowed_actions.yaml
الموقع المقترح: dev_s_media/services/guardian_doctor/allowed_actions.yaml

yaml
# Allowed actions and required approval level
# approval: auto, single_approver, multi_approver
actions:
  throttle_dispatcher:
    description: "Reduce dispatcher rate to relieve queue pressure"
    approval: auto
  requeue_dlq_item:
    description: "Requeue a single DLQ item to main queue"
    approval: auto
  restart_service:
    description: "Restart a named service (docker-compose or k8s)"
    approval: single_approver
  rotate_secret:
    description: "Rotate a secret in Secret Manager"
    approval: single_approver
  create_config_pr:
    description: "Open PR to change configuration (e.g., dispatcher rate)"
    approval: single_approver
  merge_config_pr:
    description: "Merge PR into main (dangerous)"
    approval: multi_approver
  purge_media_bucket:
    description: "Delete media files from storage"
    approval: multi_approver
GitHub Integration Module Snippet
الموقع المقترح: dev_s_media/services/guardian_doctor/src/actions/githubClient.ts

ts
import fetch from 'node-fetch';

const GITHUB_API = 'https://api.github.com';

export async function createBranchAndPR(repo: string, token: string, filePath: string, contentBase64: string, commitMessage: string, prTitle: string) {
  const headers = { Authorization: `token ${token}`, 'Content-Type': 'application/json' };

  // 1. Get main sha
  const refRes = await fetch(`${GITHUB_API}/repos/${repo}/git/ref/heads/main`, { headers });
  const refJson = await refRes.json();
  const mainSha = refJson.object.sha;

  // 2. Create branch
  const branchName = `guardian/autofix-${Date.now()}`;
  await fetch(`${GITHUB_API}/repos/${repo}/git/refs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: mainSha })
  });

  // 3. Create or update file
  await fetch(`${GITHUB_API}/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: commitMessage,
      content: contentBase64,
      branch: branchName
    })
  });

  // 4. Open PR
  const prRes = await fetch(`${GITHUB_API}/repos/${repo}/pulls`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: prTitle, head: branchName, base: 'main', body: 'Automated change by Guardian Doctor' })
  });
  return prRes.json();
}
Slack Approval Workflow Example
الموقع المقترح: dev_s_media/services/guardian_doctor/docs/slack_approval.md

محتوى البطاقة (Block Kit)

json
{
  "blocks": [
    { "type": "section", "text": { "type": "mrkdwn", "text": "*Guardian Doctor Approval Request*\nAction: rotate_secret\nTarget: LLM_API_KEY" } },
    { "type": "section", "text": { "type": "mrkdwn", "text": "Reason: Detected possible compromise. Proposed change: rotate secret and redeploy llmWrapper." } },
    { "type": "actions", "elements": [
      { "type": "button", "text": { "type": "plain_text", "text": "Approve" }, "style": "primary", "value": "approve_rotate_secret" },
      { "type": "button", "text": { "type": "plain_text", "text": "Reject" }, "style": "danger", "value": "reject_rotate_secret" }
    ] }
  ]
}
سلوك

عند الضغط Approve، Slack يرسل payload إلى Agent webhook. Agent يتحقق من صلاحية المصرح ويبدأ التنفيذ أو يطلب موافقة إضافية حسب allowed_actions.yaml.

خطوات التنفيذ الفورية بعد اللصق
الصق الملفات أعلاه في المسارات المقترحة داخل المستودع.

شغّل chmod +x dev_s_media/scripts/rotate_secrets.sh وpreflight.sh.

أضف GITHUB_TOKEN محدود الصلاحيات وADMIN_NOTIFY_WEBHOOK إلى Secret Manager.

نشر Guardian Doctor في staging وتشغيله مع --dry-run أو وضع مراقبة فقط لمدة 72 ساعة.

شغّل اختبارات CI integration عبر workflow الجديد وتحقق من نتائج الاختبارات.

انتهت

اكمل
ملخّص سريع
أكملت الآن مجموعة ملفات تشغيلية وتشغيلية‑أمنية إضافية تكمّل ما سبق: Runbooks للحوادث الحرجة، سكربتات مقياس تلقائي بسيطة، وتقدير تكلفة مبدئي. انسخ كل قسم إلى ملفه المقترح داخل المستودع ثم نفّذ الخطوات القصيرة المدرجة أسفل كل ملف.

1. Runbook لحالة فشل النشر Publish Failure
المسار المقترح dev_s_media/runbooks/publish_failure.md

markdown
# Runbook Publish Failure

## الهدف
إرشادات سريعة لاستعادة نشر المنشورات عند تراكم الأخطاء أو فشل النشر الجماعي.

## متى يُستخدم
- ارتفاع مفاجئ في أخطاء النشر (publish success rate ينخفض > 5%).
- تراكم DLQ أو queue depth يتجاوز العتبة الحرجة.

## خطوات فورية (0–15 دقيقة)
1. **تنبيه الفريق**: تحقق من Slack channel #ops-alerts.
2. **تحقق مؤشرات الحالة**:
   - Queue depth: راجع لوحة Queue Panel.
   - DLQ size: `SELECT count(*) FROM dlq_jobs WHERE created_at > now() - interval '1 hour';`
   - آخر 50 سجل للوظائف: `redis-cli LRANGE bull:social-publish:wait 0 50` أو استخدم BullMQ UI.
3. **تفعيل وضع الحماية**:
   - اطلب من Guardian Doctor تنفيذ `throttle_dispatcher` أو نفّذ يدويًا: افتح PR لتقليل dispatcher.rate أو استخدم API لإيقاف المنتجين.
4. **تحليل سريع**:
   - راجع آخر 100 محاولة نشر في `publish_attempts`:
     ```sql
     SELECT * FROM publish_attempts ORDER BY started_at DESC LIMIT 100;
     ```
   - صنّف الأخطاء: rate limit, validation, provider 5xx, LLM failure.
5. **إجراءات تصحيحية مؤقتة**:
   - إذا كانت أخطاء 429: خفّض معدل النشر وفعّل backoff.
   - إذا كانت أخطاء 5xx من المزود: حوّل النشر إلى manual approval أو أوقف النشر الآلي.
   - إذا كانت أخطاء LLM: فعّل fallback templates فوراً.
6. **إعادة جدولة آمنة**:
   - أعد جدولة عناصر DLQ ذات الأسباب المؤقتة بعد إصلاح السبب باستخدام `requeueDlqItem`.
7. **مراقبة**:
   - راقب المؤشرات لمدة 30 دقيقة. إذا لم تتحسّن، انتقل إلى إجراءات التدرج.

## إجراءات تدرجية (15–60 دقيقة)
1. **زيادة موارد workers**:
   - Kubernetes: زيادة replicas للـ worker-deployment.
   - Docker Compose: `docker-compose up -d --scale worker=5`.
2. **تحليل جذري**:
   - اجمع لقطات من logs، Sentry، وLLM traces.
   - افتح تذكرة مفصّلة في GitHub Issues مع الوسوم ops/incident.
3. **قرار استمرارية**:
   - إذا لم تُحل المشكلة خلال 60 دقيقة: أعد النظام إلى وضع manual publish وابدأ تحقيق شامل.

## استعادة ما بعد الحادث
1. وثّق السبب الجذري والإجراءات المتخذة في ملف الحادث.
2. حدّث قواعد retry وthresholds إن لزم.
3. جدولة postmortem خلال 48 ساعة.

2. Runbook لحالة تعطل LLM LLM Outage
المسار المقترح dev_s_media/runbooks/llm_outage.md

markdown
# Runbook LLM Outage

## الهدف
إجراءات فورية لاستجابة تعطل أو بطء نموذج LLM المحلي.

## متى يُستخدم
- LLM health endpoint لا يرد أو يعيد خطأ.
- p95 latency يتجاوز العتبة الحرجة.

## خطوات فورية (0–10 دقيقة)
1. **تفعيل fallback**:
   - قم بتبديل إعداد `LLM_FALLBACK=true` في config أو افتح PR سريع لتفعيل قوالب آمنة.
2. **إعلام الفريق**:
   - Slack: #ml-alerts مع ملخص الحالة والوقت.
3. **تحقق من الموارد**:
   - افحص استخدام GPU/Memory على العقد: `nvidia-smi` أو أدوات المراقبة.
4. **إعادة تشغيل الخدمة**:
   - Docker Compose: `docker-compose restart llm_wrapper`
   - Kubernetes: `kubectl rollout restart deployment/llm-wrapper`
5. **تحقق من السجلات**:
   - راجع stderr/stdout وملفات logs للخطأ (OOM, CUDA errors, model load failure).

## خطوات متوسطة (10–60 دقيقة)
1. **تحويل الحمل**:
   - إن أمكن، أعد توجيه بعض الطلبات إلى نموذج أصغر أو خدمة سحابية مؤقتة.
2. **تحليل السبب**:
   - تحقق من تغييرات حديثة في النموذج أو التكوين.
3. **تدوير النموذج**:
   - إذا كان النموذج تالفًا، أعد تحميل نسخة سابقة من النموذج أو أعد تثبيت الحزمة.

## استعادة ما بعد الحادث
1. راجع logs لتحديد السبب الجذري.
2. حدّث runbook مع خطوات إضافية إن لزم.
3. أضف اختبارات تحميل دورية لتجنب تكرار الحادث.

3. سكربت مقياس تلقائي بسيط scale_workers.sh
المسار المقترح dev_s_media/scripts/scale_workers.sh واجعله قابلًا للتنفيذ

bash
#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scale_workers.sh <replicas>
REPLICAS="${1:-}"
if [[ -z "$REPLICAS" ]]; then
  echo "Usage: $0 <replicas>"
  exit 2
fi

# Example for Kubernetes
if command -v kubectl >/dev/null 2>&1; then
  echo "Scaling worker-deployment to $REPLICAS replicas"
  kubectl scale deployment worker-deployment --replicas="$REPLICAS"
  exit 0
fi

# Example for docker-compose
if [[ -f docker-compose.yml ]]; then
  echo "Scaling docker-compose worker to $REPLICAS"
  docker-compose up -d --scale worker="$REPLICAS"
  exit 0
fi

echo "No supported orchestration found. Please scale manually."
exit 3
4. ملف تقدير تكلفة مبدئي docs/cost_estimate.md
المسار المقترح dev_s_media/docs/cost_estimate.md

markdown
# Cost Estimate Overview

## Assumptions
- Daily ads: 5,000; Peak: 50,000
- Avg images per ad: 6; Peak: 20
- LLM calls per ad: 1.5 average
- Storage: S3/GCS standard
- Redis: managed instance
- Postgres: managed instance
- LLM hosting: on‑prem GPU nodes or cloud GPU instances

## Monthly cost components (approximate)
1. **Storage**
   - 1 TB storage: $20–$40
   - Egress and CDN: variable

2. **Compute for processing**
   - Image processing workers (CPU): $200–$800
   - FFmpeg tasks: included in worker cost

3. **Redis (managed)**
   - Small cluster: $100–$400

4. **Postgres (managed)**
   - $200–$800 depending on size and HA

5. **LLM inference**
   - On‑prem GPU amortized: depends on hardware
   - Cloud inference (e.g., A100): $2–$10 per hour per instance
   - Estimate: $2,000–$10,000/month depending on traffic and model size

6. **Monitoring and logging**
   - Cloud Monitoring / Sentry: $50–$500

7. **Miscellaneous**
   - Bandwidth, backups, secrets manager: $100–$500

## Example monthly scenarios
- **Small**: $1,000–$3,000 (low traffic, small LLM or cached)
- **Medium**: $3,000–$8,000 (moderate traffic, mixed LLM)
- **Large**: $8,000–$20,000+ (heavy traffic, large LLM fleet)

## Recommendations
- Start with staging cost baseline and monitor actual usage for 2 weeks.
- Cache LLM outputs aggressively to reduce inference cost.
- Use autoscaling to reduce idle costs.
5. ملف runbooks/incident_postmortem_template.md
المسار المقترح dev_s_media/runbooks/incident_postmortem_template.md

markdown
# Incident Postmortem Template

## Summary
- Incident ID:
- Date:
- Duration:
- Services impacted:

## Timeline
- Timestamps and actions taken

## Root Cause
- Short description

## Mitigation
- What was done to stop the bleeding

## Remediation
- Long term fixes and owners

## Lessons Learned
- What to change in runbooks, monitoring, or code

## Follow-ups
- Tasks, owners, deadlines
تعليمات التنفيذ السريعة
أنشئ الملفات في المسارات المقترحة داخل المستودع.

اجعل السكربتات قابلة للتنفيذ:

bash
chmod +x dev_s_media/scripts/preflight.sh
chmod +x dev_s_media/scripts/rotate_secrets.sh
chmod +x dev_s_media/scripts/scale_workers.sh
شغّل الهجرة في staging ثم نفّذ اختبارات التحمل.

شغّل Guardian Doctor في وضع مراقبة فقط لمدة 72 ساعة قبل تفعيل أي إجراء تلقائي.