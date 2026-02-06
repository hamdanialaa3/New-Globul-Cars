# 📊 SLOs and Alerts Strategy

## Service Level Objectives (SLOs)
| Metric | Objective | Window | Consequences of Breach |
| :--- | :--- | :--- | :--- |
| **Publish Success Rate** | **99.0%** | Rolling 30 Days | Halt new features. Fix bugs. |
| **Publish Latency (P95)** | **< 60s** | 1 Hour | Optimize Media Processor. |
| **LLM Output Validity** | **> 95%** | 24 Hours | Retrain Prompt / Switch Foundation Model. |
| **Job Queue Delay** | **< 5 min** | 15 Mins | Scale up Worker Instances. |

## 🚨 Alerting Rules (Prometheus / Cloud Monitoring)

### 1. High Severity (PagerDuty)
- **Queue Stalled:** `queue_job_count > 0` AND `rate(jobs_completed) == 0` for 10m.
- **DLQ Spike:** `dlq_size > 10` in 1 hour.
- **Meta API outage:** `http_errors_5xx > 5%`.

### 2. Low Severity (Slack Channel)
- **Token Expiry Warning:** `token_ttl_days < 5`.
- **LLM Slow:** `llm_latency_seconds > 20`.

## 📈 Dashboard Layout (Grafana)
1.  **Top Row (Health):** Traffic Light status for Publisher, Worker, Meta API, LLM.
2.  **Row 2 (Throughput):** Posts Published/min, Jobs Queued.
3.  **Row 3 (Latency):** End-to-End Duration (P50, P95, P99).
4.  **Row 4 (Errors):** Error Count by Type (Validation, Network, RateLimit).

---

## 🛠️ Implementation Snippets

### Prometheus Alert Rule Example
```yaml
groups:
- name: social-media-alerts
  rules:
  - alert: QueueStalled
    expr: increase(bull_queue_completed_total[10m]) == 0 and bull_queue_waiting > 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Social Media Publish Queue Stalled"
```
