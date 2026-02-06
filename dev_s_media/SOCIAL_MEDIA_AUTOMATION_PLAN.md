# 🤖 Social Media Automation Implementation Plan (Strict & Smart)
## "Koli One" Automated Publishing System
**Status:** Planning Phase (Smart Execution)
**Target Directory:** `C:\Users\hamda\Desktop\Koli_One_Root\dev_s_media`

---

## 1️⃣ Core Philosophy: "Smart & Premium"
We are not just "posting links". We are creating a **Content Intelligence Engine** that treats every car listing as a premium story.
- **Strict Logic:** No broken links, no bad images, no repetitive text.
- **Smart Adaptation:** Facebook gets detailed stories; Instagram gets visual dominance.
- **Zero-Touch Potential:** Designed to run 100% autonomously after the "Trust Phase".

---

## 2️⃣ Architecture Blueprint (Production-Grade Hybrid)
We will build a resilient system inside `dev_s_media` with strict separation of concerns.

### 🏗️ Components Layer:
1.  **Publisher Service (The Brain & Gatekeeper):**
    - **Trigger:** Webhook `ad.published`.
    - **Idempotency:** Checks `idempotency_key` (hash of ad content) to prevent double-posting.
    - **Pre-flight Check:** Validates image resolution, pricing logic, and seller status.
    - **Queue Push:** Sends to `BullMQ` (Redis) only if checks pass.

2.  **Worker Engine (The Muscle):**
    - **Retry Policy:** 3 retries with exponential backoff (1s, 5s, 30s) for API glitches.
    - **Dead Letter Queue (DLQ):** Failed jobs move here for manual inspection (Zero-Data-Loss).
    - **Pipeline:**
        1. **Media Processor:** Smart-crop, strictly blurred license plates (Project requirement).
        2. **Neural Writer:** Connects with `LLM API Wrapper`.
        3. **Validator:** Checks LLM output against strict `schemas/llm_output.json`.
        4. **Dispatcher:** Calls Meta Graph API with **Rate Limiter** awareness.

3.  **LLM API Wrapper:**
    - Python/Flask service serving Local Llama/Mistral.
    - **Cache:** Caches identical prompts to save GPU cycles.
    - **Strict Mode:** If LLM output fails schema validation, falls back to "Safe Templates".

4.  **Admin Control Tower:**
    - Approvals, DLQ Management, and Analytics.
    - **Audit Log:** Who approved? Who rejected?

---

## 3️⃣ Critical Robustness Upgrades (The "Missing Pieces")
We are adding these strictly based on "Production Readiness" feedback:

### 🔐 Secrets & Security
- **Strict Rule:** No `.env` in Git. All keys loaded from secure store (or local `.env.production` not in repo).
- **Rotation:** Automated script `scripts/rotate_secrets.sh` handles Meta Token exchange every 60 days.
- **Audit:** All rotation events logged to `audit_logs` table (defined in `migrations/001_init.sql`).

### 🔄 Idempotency & Reliability
- **Unique Constraint:** `migrations/001_init.sql` enforces `UNIQUE(ad_id, platform)` preventing DB-level duplicates.
- **Atomic Operations:** DB status updates happen *after* confirmed API success.

### 📊 Observability & SLOs
- **Policy:** `monitoring/slo_and_alerts.md` defines strict 99% Success Rate targets.
- **Dashboards:** Queue Depth, LLM Latency (p95), Publish Success Rate.
- **Alerts:** "Queue Stalled > 10m", "LLM Error Rate > 5%".

### ⚖️ Compliance & Safety
- **PII Filter:** Text regex scanner (Phone numbers, emails) before LLM input.
- **Rate Limiting:** Local semaphore to respect Facebook's "200 calls/hour" limit per user.

---

## 4️⃣ Implementation Roadmap (Execution Steps)

### 🛠️ Operational Excellence (Safety Toolkit)
- **Preflight Script:** `scripts/preflight.sh` verifies:
    - Image URLs are reachable (HTTP 200).
    - Image Resolution > 1080x1080.
    - No PII patterns in description (Regex scan).
    - LLM Endpoint is healthy (`/health` check).
- **CI Testing Strategy:**
    - **Unit:** Test parsers and regex validators.
    - **Integration:** Mock Meta API to test full pipeline flow.
    - **E2E:** `ad.published` trigger -> Staging Queue -> Staging DB Record.

### 🗄️ Data Integrity (Strict Schemas)
- **DB Schemas:** `migrations/001_init.sql` defines:
    - `social_posts` (post_id, ad_id, status, platform_meta_id)
    - `audit_logs` (who, action, timestamp, payload_hash)
    - `media_assets` (original_url, processed_url, type)
- **JSON Schemas:** Strict validation for all external inputs/outputs (`schemas/ad_input.json`, `schemas/publish_result.json`).

---


### Phase 5: Enterprise Governance (The Final 5%)
- [ ] **RBAC System:**
    - Define roles: `Viewer`, `Publisher` (can approve), `Admin` (can retry/delete), `Auditor` (read logs).
    - Update `admin_ui` to enforce permissions.
- [ ] **Financial Reconciliation:**
    - `scripts/reconcile_payments.ts`: Matches DB `ad_promoted_events` vs iCard/Revolut CSV exports.
    - Alert on mismatch > 0.01 BGN.
- [ ] **Compliance & DR:**
    - **GDPR:** `scripts/delete_user_data.sh` (Purges Redis, DB, and Logs).
    - **Backup:** Daily encrypted dump of `social_posts` to S3/GCS.
    - **Canary:** Rollout logic (5% -> 100%) in `publisher_service`.

---

## 5️⃣ Technical Stack (Strict)
- **Backend:** Node.js (TypeScript) + Express
- **Queue:** BullMQ (Redis)
- **AI:** Python (Flask) wrapping Llama/Mistral
- **Processing:** Sharp (Images), FFmpeg (Video)
- **Database:** PostgreSQL (Metadata), Redis (Jobs)

---

## 6️⃣ Next Immediate Action (Execution)
I will now generate the **file structure** and the **startup scripts** exactly as requested in the draft, separating concerns and enforcing "Clean Code" principles.
