# 📊 Performance Monitoring & Audit Documentation
## مراقبة الأداء والتدقيق - نظام "الصندوق الأسود" لضمان الموثوقية

> **Last Updated:** January 23, 2026  
> **Version:** 0.4.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Audit Logging System (Internal Black Box)](#audit-logging)
3. [Security Event Monitoring](#security-monitoring)
4. [Performance & Health Monitoring](#performance-health)
5. [Analytics Integration](#analytics)
6. [System Metrics & Reporting](#metrics)

---

## 🎯 Overview

The Performance & Audit system is the platform's central nervous system, ensuring every action is traceable, every error is logged, and system health is monitored in real-time. It provides the "Black Box" capability required for institutional-grade reliability and security.

### Core Objectives
- **Accountability**: Every administrative and sensitive user action is recorded.
- **Proactive Defense**: Automated detection of suspicious behavior and security breaches.
- **Performance Excellence**: Continuous monitoring of "Core Web Vitals" and API response times.

---

## 🖤 Audit Logging System {#audit-logging}

The `AuditLoggingService` captures a high-resolution stream of user activity for compliance and debugging.

### Data Model
Every log entry (`AuditLog`) contains:
- **Identity**: User ID, Email, Name, and Session ID.
- **Action Context**: The specific method called and the resource affected (e.g., `delete_car` on `resourceId: 42`).
- **Environment**: IP Address, User Agent, and approximate location (City/Region).
- **Result**: Success status and severity level (`low` to `critical`).

### Implementation
Logs are stored in the `audit_logs` Firestore collection, designed for high-speed write operations.

---

## 🛡️ Security Event Monitoring {#security-monitoring}

Specialized logic for detecting and responding to security-critical events.

### Monitored Events
- `login_failed`: Tracked for brute-force detection.
- `permission_denied`: Attempted access to unauthorized admin areas.
- `suspicious_activity`: Rapid API calls or unusual data modification patterns.
- `data_breach_attempt`: SQL injection or exploit patterns detected at the service layer.

### Escalation Workflow
1. Event is recorded in `security_events`.
2. **Critical Alerts**: If severity is `critical`, the system triggers an immediate webhook alert to the security team.
3. **Resolution**: Administrative tools allow for marking events as `resolved` with documented resolutions and timestamps.

---

## ⚡ Performance & Health Monitoring {#performance-health}

Real-time visibility into the user experience and service availability.

### 1. Performance Metrics (`PerformanceMetric`)
- **Core Web Vitals**: Automatic tracking of `dom_content_loaded`, `time_to_interactive`, and `first_byte`.
- **Execution Tracing**: The `measureExecution` wrapper tracks the latency of critical business logic (e.g., Algolia search or Stripe checkout).

### 2. Health Checks
The `MonitoringService` performs periodic (30s) health checks on core internal services:
- **Error Handling Health**: Verified via `errorHandler.isServiceHealthy()`.
- **Rate Limiting Health**: Monitors the number of blocked requests to scale defense dynamically.

---

## 📈 Analytics Integration {#analytics}

Beyond auditing, the system tracks business-critical events for growth analysis.

### Tracked Business Events
- **Search Analytics**: Queries, filters used, and results count (for improving search relevance).
- **Listing Interaction**: Views, sharing, and lead generation (contact clicks).
- **A/B Test Context**: Tracking user behavior based on experimental flags.

---

## 📊 System Metrics & Reporting {#metrics}

The platform aggregates raw logs into actionable intelligence via the `getSystemMetrics` and `getAuditStatistics` methods.

### Dashboard Capabilities
- **Active User Tracking**: Real-time count of unique sessions.
- **Error Rate Analysis**: Percentage of failed actions over time.
- **Top Resources**: Most modified or accessed car listing categories.
- **Export**: Audit logs can be exported in **JSON** or **CSV** formats for external legal compliance or insurance audits.

---

## 🔗 Related Documentation

- [08_Admin_Panel_and_Moderation.md](./08_Admin_Panel_and_Moderation.md) - Where these logs are visualized.
- [11_Legal_Compliance_and_Safety.md](./11_Legal_Compliance_and_Safety.md) - How these logs support GDPR and legal safety.

---

**Last Updated:** January 23, 2026  
**Maintained By:** DevOps & Security Team  
**Status:** ✅ Active Documentation
