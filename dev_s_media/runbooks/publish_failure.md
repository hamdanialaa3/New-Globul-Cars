# 📕 Runbook: Social Publish Failure (High Severity)

## 🚨 Trigger
Verified by **Sentry Alert** or **Grafana Dashboard**: `Post Failure Rate > 5%` or `DLQ Size > 10`.

## 🔍 Diagnosis Steps
1.  **Check Meta Status:**
    - Visit `status.fb.com`. Are Graph APIs operational?
    - If DOWN: Pause queues immediately (`npm run pause-queues`).
2.  **Check Token Validity:**
    - Run `scripts/verify_token.js`.
    - If Invalid/Expired: Rotate token in Secret Manager & Restart Worker.
3.  **Check LLM Health:**
    - Curl the local endpoint: `curl http://localhost:5000/health`.
    - If Timeout: Restart Python service (`systemctl restart llm-wrapper`).
4.  **Inspect DLQ:**
    - Open Admin Dashboard -> "Failed Jobs".
    - Check for pattern: Specific image format? Specific user ID?

## 🛠️ Remediation
### Case A: Token Expired
1.  Generate new Long-Lived Token from Meta Developer Portal.
2.  Update `SECRETS` store.
3.  Restart Worker Service.
4.  Replay DLQ jobs: `npm run replay-dlq`.

### Case B: Bad Content (Validation Error)
1.  Open failed job in Admin UI.
2.  Manually edit the text/image to fix the error.
3.  Click "Retry Publish".

### Case C: Rate Limit Hit
1.  Scale down workers to 1 concurrency.
2.  Increase `limiter.duration` in queue config.
3.  Wait 1 hour before resuming full speed.

## ✅ Verification
- Verify `queue.active` count is decreasing.
- Verify new posts appearing on [Test Page].
- Resolve Sentry incident.
