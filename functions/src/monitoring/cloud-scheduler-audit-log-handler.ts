/**
 * Cloud Scheduler Audit Log Handler
 * ====================================
 *
 * Handles the new GFE format audit logs from Cloud Scheduler
 * Starting September 15, 2025
 *
 * Reference: https://cloud.google.com/scheduler/docs/audit-logs
 * Deadline: Update by September 30, 2026
 *
 * @author Team
 * @date March 25, 2026
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const logger = functions.logger;

// ==================== TYPES ====================

interface NewFormatAuditLog {
  // New GFE format (starting September 15, 2025)
  authorizationInfo: Array<{
    resource: string; // Full resource path: projects/fire-new-globul/locations/region/jobs/job-name
    permission: string;
    granted: boolean;
    resourceAttributes: {
      service: string; // cloudscheduler.googleapis.com
      name: string;
    };
    permissionType: 'ADMIN_READ' | 'ADMIN_WRITE' | 'DATA_READ' | 'DATA_WRITE';
  }>;
  requestMetadata?: {
    callerIp?: string; // Currently shows default value; will be fixed when old logs removed
    userAgent?: string;
  };
  request?: {
    job?: {
      retry_config?: {
        max_backoff_duration?: { seconds: number; nanos?: number };
        min_backoff_duration?: { seconds: number; nanos?: number };
        max_retry_duration?: { seconds: number; nanos?: number };
        max_doublings?: number;
      };
    };
  };
  timestamp?: string;
  serviceName: string;
  methodName: string;
}

interface OldFormatAuditLog {
  // Old format (until September 30, 2026)
  authorizationInfo: Array<{
    resource: string; // Short format: /0000006f02962335/us-east4
    permission: string;
    granted: boolean;
    permissionType: 'ADMIN_WRITE' | 'ADMIN_READ';
  }>;
  request?: {
    job?: {
      retryConfig?: {
        maxRetryDuration: string; // "0s", "3600s" format
        minBackoffDuration: string;
        maxBackoffDuration: string;
        maxDoublings: number;
      };
    };
  };
}

// ==================== PARSERS ====================

/**
 * Parse new GFE format audit logs
 * Used for logs generated after September 15, 2025
 */
function parseNewFormatLog(log: NewFormatAuditLog): ParsedSchedulerLog {
  const resourcePath = log.authorizationInfo?.[0]?.resource || '';

  // Extract project, location, and job name from full resource path
  // Format: projects/fire-new-globul/locations/us-east4/jobs/daily-auto-renewal
  const resourceMatch = resourcePath.match(
    /projects\/([^/]+)\/locations\/([^/]+)\/jobs\/(.+)/
  );

  return {
    format: 'NEW_GFE',
    projectId: resourceMatch?.[1] || '',
    location: resourceMatch?.[2] || '',
    jobName: resourceMatch?.[3] || '',
    permission: log.authorizationInfo?.[0]?.permission || '',
    granted: log.authorizationInfo?.[0]?.granted || false,
    service: log.authorizationInfo?.[0]?.resourceAttributes?.service || '',
    retry_config: log.request?.job?.retry_config
      ? {
          max_backoff_duration:
            log.request.job.retry_config.max_backoff_duration?.seconds,
          min_backoff_duration:
            log.request.job.retry_config.min_backoff_duration?.seconds,
          max_retry_duration:
            log.request.job.retry_config.max_retry_duration?.seconds,
          max_doublings: log.request.job.retry_config.max_doublings,
        }
      : undefined,
    timestamp: log.timestamp || new Date().toISOString(),
    methodName: log.methodName || '',
    callerIp: log.requestMetadata?.callerIp, // Currently default value
    userAgent: log.requestMetadata?.userAgent,
  };
}

/**
 * Parse old format audit logs
 * Used for logs until September 30, 2026
 *
 * DEPRECATED: Update to use new format before September 30, 2026
 */
function parseOldFormatLog(log: OldFormatAuditLog): ParsedSchedulerLog {
  return {
    format: 'OLD_DEPRECATED',
    projectId: '', // Not available in old format
    location: '', // Not available in old format
    jobName: '', // Not available in old format
    permission: log.authorizationInfo?.[0]?.permission || '',
    granted: log.authorizationInfo?.[0]?.granted || false,
    service: '', // Not available in old format
    retry_config: log.request?.job?.retryConfig
      ? {
          max_backoff_duration: parseDurationString(
            log.request.job.retryConfig.maxBackoffDuration
          ),
          min_backoff_duration: parseDurationString(
            log.request.job.retryConfig.minBackoffDuration
          ),
          max_retry_duration: parseDurationString(
            log.request.job.retryConfig.maxRetryDuration
          ),
          max_doublings: log.request.job.retryConfig.maxDoublings,
        }
      : undefined,
    timestamp: new Date().toISOString(),
    methodName: '',
    callerIp: undefined,
    userAgent: undefined,
    _deprecated: true,
  };
}

/**
 * Parse duration string from old format ("3600s") to seconds
 */
function parseDurationString(durationStr?: string): number | undefined {
  if (!durationStr) return undefined;
  const match = durationStr.match(/^(\d+)([smh])$/);
  if (!match) return undefined;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    default:
      return undefined;
  }
}

interface ParsedSchedulerLog {
  format: 'NEW_GFE' | 'OLD_DEPRECATED';
  projectId: string;
  location: string;
  jobName: string;
  permission: string;
  granted: boolean;
  service: string;
  retry_config?: {
    max_backoff_duration?: number;
    min_backoff_duration?: number;
    max_retry_duration?: number;
    max_doublings?: number;
  };
  timestamp: string;
  methodName: string;
  callerIp?: string;
  userAgent?: string;
  _deprecated?: boolean;
}

// ==================== STORAGE ====================

/**
 * Store audit log in Firestore
 * Collection: scheduler_audit_logs
 */
async function storeAuditLog(parsedLog: ParsedSchedulerLog): Promise<string> {
  const logDoc = {
    ...parsedLog,
    storedAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days TTL
  };

  const docRef = await db.collection('scheduler_audit_logs').add(logDoc);
  return docRef.id;
}

/**
 * Log warnings for deprecated format
 */
async function logDeprecationWarning(docId: string): Promise<void> {
  await db.collection('scheduler_deprecation_warnings').add({
    originalLogId: docId,
    message:
      'Old format audit log detected. Must update parsing logic before September 30, 2026.',
    detectedAt: admin.firestore.FieldValue.serverTimestamp(),
    projectId: 'fire-new-globul',
  });

  logger.warn('[SCHEDULER_AUDIT] Deprecated log format detected', {
    deadline: 'September 30, 2026',
    action: 'Update business logic to new GFE format',
  });
}

// ==================== CLOUD FUNCTION ====================

/**
 * Pub/Sub triggered function to process Cloud Scheduler audit logs
 *
 * To deploy:
 * gcloud functions deploy processSchedulerAuditLogs \
 *   --runtime nodejs18 \
 *   --trigger-topic=cloud-scheduler-audit-logs \
 *   --region=europe-west1
 */
export const processSchedulerAuditLogs = functions
  .region('europe-west1')
  .pubsub.topic('cloud-scheduler-audit-logs')
  .onPublish(async message => {
    try {
      const auditLog = message.json;

      // Detect log format
      const isNewFormat =
        auditLog.authorizationInfo?.[0]?.resourceAttributes?.service ===
        'cloudscheduler.googleapis.com';

      let parsedLog: ParsedSchedulerLog;

      if (isNewFormat) {
        logger.info('[SCHEDULER_AUDIT] Processing new GFE format audit log');
        parsedLog = parseNewFormatLog(auditLog);
      } else {
        logger.warn(
          '[SCHEDULER_AUDIT] Processing OLD deprecated format - update required!'
        );
        parsedLog = parseOldFormatLog(auditLog);
      }

      // Store in Firestore
      const docId = await storeAuditLog(parsedLog);
      logger.info(`[SCHEDULER_AUDIT] Stored log with ID: ${docId}`);

      // Log deprecation warning if old format
      if (parsedLog._deprecated) {
        await logDeprecationWarning(docId);
      }

      // Optional: Send alert if permission denied
      if (!parsedLog.granted) {
        logger.warn('[SCHEDULER_AUDIT] Permission denied detected', {
          job: parsedLog.jobName,
          permission: parsedLog.permission,
        });
        // Could trigger alert here
      }

      return null;
    } catch (error) {
      logger.error('[SCHEDULER_AUDIT] Failed to process audit log', error);
      throw error;
    }
  });

// ==================== MIGRATION HELPER ====================

/**
 * Helper function to check logs and identify which format is being used
 * Run this occasionally to monitor migration progress
 *
 * Usage:
 * const result = await checkLogFormatUsage();
 */
export async function checkLogFormatUsage() {
  const logsSnapshot = await db
    .collection('scheduler_audit_logs')
    .orderBy('timestamp', 'desc')
    .limit(100)
    .get();

  const formatStats = {
    new_gfe: 0,
    old_deprecated: 0,
  };

  logsSnapshot.forEach(doc => {
    if (doc.data().format === 'NEW_GFE') {
      formatStats.new_gfe++;
    } else if (doc.data()._deprecated) {
      formatStats.old_deprecated++;
    }
  });

  logger.info('[SCHEDULER_AUDIT] Format migration status', formatStats);
  return formatStats;
}
