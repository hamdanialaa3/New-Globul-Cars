/**
 * QuickActionsPanel — FULLY REAL PRODUCTION VERSION
 * ===================================================
 * Every button triggers a real Firestore/Firebase operation.
 * No mocks. No fake timeouts. Zero pretend logic.
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Zap, Trash2, Database, Download, RefreshCw,
  Bell, FileText, HardDrive, AlertCircle, CheckCircle,
  Loader, Settings, BarChart3, ShieldAlert, ToggleLeft,
  ToggleRight, Heart, Activity, Globe, Lock, Unlock
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { adminOperationsService } from '@/services/admin-operations-service';
import { logger } from '@/services/logger-service';

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

const Container = styled.div`
  background: var(--admin-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--admin-border-subtle);
  padding: 24px;
  margin: 20px;
`;

const Header = styled.div`
  margin-bottom: 28px;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #8B5CF6;
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: var(--admin-text-secondary);
  margin: 0;
`;

const LiveBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.25);
  padding: 3px 10px;
  border-radius: 999px;
  margin-left: 8px;
`;

const StatusBar = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: var(--admin-bg-secondary);
  border: 1px solid #1e2d3d;
  border-radius: 10px;
  margin-bottom: 24px;
`;

const StatusItem = styled.div<{ $ok: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${p => p.$ok ? '#86efac' : '#fca5a5'};
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 16px;
`;

const ActionCard = styled.div<{ $variant?: 'danger' | 'warning' | 'success' | 'info' }>`
  background: #1a1f2e;
  border-radius: 10px;
  padding: 18px;
  border: 1px solid ${p =>
    p.$variant === 'danger' ? '#7f1d1d' :
    p.$variant === 'warning' ? '#78350f' :
    p.$variant === 'success' ? '#064e3b' :
    p.$variant === 'info' ? '#1e3a8a' : '#2d3748'
  };
  transition: all 0.2s;
  &:hover {
    border-color: ${p =>
      p.$variant === 'danger' ? '#ef4444' :
      p.$variant === 'warning' ? '#f59e0b' :
      p.$variant === 'success' ? '#10b981' :
      p.$variant === 'info' ? '#3b82f6' : '#6366f1'
    };
    background: var(--admin-bg-secondary);
  }
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`;

const ActionIcon = styled.div<{ $variant?: 'danger' | 'warning' | 'success' | 'info' }>`
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p =>
    p.$variant === 'danger' ? 'rgba(239,68,68,0.15)' :
    p.$variant === 'warning' ? 'rgba(245,158,11,0.15)' :
    p.$variant === 'success' ? 'rgba(16,185,129,0.15)' :
    p.$variant === 'info' ? 'rgba(59,130,246,0.15)' : 'rgba(139,92,246,0.15)'
  };
  color: ${p =>
    p.$variant === 'danger' ? '#f87171' :
    p.$variant === 'warning' ? '#fbbf24' :
    p.$variant === 'success' ? '#34d399' :
    p.$variant === 'info' ? '#60a5fa' : '#a78bfa'
  };
`;

const ActionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
  flex: 1;
`;

const ActionDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 14px;
`;

const ResultBadge = styled.div<{ $ok: boolean }>`
  font-size: 11px;
  color: ${p => p.$ok ? '#86efac' : '#fca5a5'};
  background: ${p => p.$ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'};
  border: 1px solid ${p => p.$ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'};
  padding: 4px 8px;
  border-radius: 6px;
  margin-bottom: 10px;
  word-break: break-word;
`;

const ActionButton = styled.button<{ $variant?: 'danger' | 'warning' | 'success' | 'primary' | 'info' }>`
  width: 100%;
  padding: 9px 14px;
  border: none;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 7px;
  justify-content: center;
  background: ${p =>
    p.$variant === 'danger' ? '#ef4444' :
    p.$variant === 'warning' ? '#f59e0b' :
    p.$variant === 'success' ? '#10b981' :
    p.$variant === 'info' ? '#3b82f6' : '#8B5CF6'
  };
  color: var(--admin-text-primary);
  &:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SpinIcon = styled(Loader)`
  animation: ${spin} 1s linear infinite;
`;

const SectionDivider = styled.div`
  grid-column: 1 / -1;
  padding: 8px 0 4px;
  font-size: 11px;
  font-weight: 700;
  color: #4b5563;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--admin-border-subtle);
  margin-bottom: 4px;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const ToggleLabel = styled.span`
  font-size: 13px;
  color: #e5e7eb;
  font-weight: 500;
`;

const ToggleStatus = styled.span<{ $active: boolean }>`
  font-size: 11px;
  color: ${p => p.$active ? '#f87171' : '#86efac'};
  font-weight: 700;
`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const QuickActionsPanel: React.FC = () => {
  const [processing, setProcessing] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [health, setHealth] = useState<Record<string, boolean>>({});
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [freeMode, setFreeMode] = useState(false);
  const [loadingState, setLoadingState] = useState(true);

  // Load initial platform state
  useEffect(() => {
    let isActive = true;
    const init = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, 'app_settings', 'site_settings'));
        if (isActive && settingsSnap.exists()) {
          const data = settingsSnap.data();
          setMaintenanceMode(data?.maintenanceMode ?? false);
          setFreeMode(data?.pricing?.subscriptionMode === 'free');
        }

        // Run quick health check
        const healthResult = await adminOperationsService.getPlatformHealth();
        if (isActive) setHealth(healthResult.details || {});
      } catch (e) {
        logger.warn('[QuickActions] Initial load error', { error: String(e) });
      } finally {
        if (isActive) setLoadingState(false);
      }
    };
    init();
    return () => { isActive = false; };
  }, []);

  const run = async (id: string, fn: () => Promise<{ success: boolean; message: string }>) => {
    setProcessing(id);
    try {
      const result = await fn();
      setResults(prev => ({ ...prev, [id]: { ok: result.success, msg: result.message } }));
    } catch (e: any) {
      setResults(prev => ({ ...prev, [id]: { ok: false, msg: `❌ ${e.message}` } }));
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleMaintenance = async () => {
    const next = !maintenanceMode;
    if (!window.confirm(next ? '⚠️ Enable MAINTENANCE MODE? This will block all users!' : '✅ Disable maintenance mode?')) return;
    await run('maintenance', async () => {
      const result = await adminOperationsService.toggleMaintenanceMode(next);
      if (result.success) setMaintenanceMode(next);
      return result;
    });
  };

  const handleToggleFreeMode = async () => {
    const next = !freeMode;
    if (!window.confirm(next ? '🎁 Make ALL subscriptions FREE for everyone?' : '💰 Restore PAID subscriptions?')) return;
    await run('freeMode', async () => {
      const { doc: d, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const { db: database } = await import('@/firebase/firebase-config');
      const ref = d(database, 'app_settings', 'site_settings');
      await updateDoc(ref, {
        'pricing.subscriptionMode': next ? 'free' : 'paid',
        updatedAt: serverTimestamp(),
      });
      setFreeMode(next);
      return { success: true, message: `✅ Subscription mode set to ${next ? 'FREE' : 'PAID'}.` };
    });
  };

  const btn = (id: string, label: string, icon: React.ReactNode, spinner: string) => (
    processing === id
      ? <><SpinIcon size={13} />{spinner}</>
      : <>{icon}{label}</>
  );

  return (
    <Container>
      <Header>
        <Title>
          <Zap size={22} />
          Quick Actions
          <LiveBadge>● LIVE PRODUCTION</LiveBadge>
        </Title>
        <Subtitle>All operations connect directly to Firebase — zero mocks, instant real-world effect.</Subtitle>
      </Header>

      {/* Platform Health */}
      {!loadingState && (
        <StatusBar>
          <StatusItem $ok={!!health.firestore}>
            <Database size={12} /> Firestore: {health.firestore ? 'OK' : 'ERROR'}
          </StatusItem>
          <StatusItem $ok={!!health.auth}>
            <Lock size={12} /> Auth: {health.auth ? 'OK' : 'ERROR'}
          </StatusItem>
          <StatusItem $ok={!!health.siteSettings}>
            <Settings size={12} /> Settings: {health.siteSettings ? 'Loaded' : 'Missing'}
          </StatusItem>
          <StatusItem $ok={!maintenanceMode}>
            <Globe size={12} /> Site: {maintenanceMode ? '🔴 Maintenance' : '🟢 Live'}
          </StatusItem>
          <StatusItem $ok={!freeMode}>
            {freeMode ? <Unlock size={12} /> : <Lock size={12} />}
            Subs: {freeMode ? 'FREE MODE ON' : 'Paid Mode'}
          </StatusItem>
        </StatusBar>
      )}

      <ActionsGrid>
        {/* ── CRITICAL TOGGLES ── */}
        <SectionDivider>🔴 Critical Platform Switches</SectionDivider>

        {/* Maintenance Mode */}
        <ActionCard $variant={maintenanceMode ? 'danger' : 'success'}>
          <ActionHeader>
            <ActionIcon $variant={maintenanceMode ? 'danger' : 'success'}>
              <ShieldAlert size={18} />
            </ActionIcon>
            <ActionTitle>Maintenance Mode</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Toggle site maintenance. When ON, all public routes show a maintenance page.
          </ActionDescription>
          <ToggleRow>
            <ToggleLabel>Status:</ToggleLabel>
            <ToggleStatus $active={maintenanceMode}>
              {maintenanceMode ? '🔴 ENABLED' : '🟢 DISABLED'}
            </ToggleStatus>
          </ToggleRow>
          {results.maintenance && <ResultBadge $ok={results.maintenance.ok}>{results.maintenance.msg}</ResultBadge>}
          <ActionButton
            $variant={maintenanceMode ? 'success' : 'danger'}
            onClick={handleToggleMaintenance}
            disabled={processing === 'maintenance'}
          >
            {processing === 'maintenance'
              ? <><SpinIcon size={13} />Processing...</>
              : <>{maintenanceMode ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}</>
            }
          </ActionButton>
        </ActionCard>

        {/* Free Mode Toggle */}
        <ActionCard $variant={freeMode ? 'warning' : 'info'}>
          <ActionHeader>
            <ActionIcon $variant={freeMode ? 'warning' : 'info'}>
              {freeMode ? <Unlock size={18} /> : <Lock size={18} />}
            </ActionIcon>
            <ActionTitle>Subscriptions Mode</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            In FREE MODE: users instantly upgrade to any plan with zero payment required.
          </ActionDescription>
          <ToggleRow>
            <ToggleLabel>Mode:</ToggleLabel>
            <ToggleStatus $active={freeMode}>
              {freeMode ? '🎁 FREE (Gift)' : '💰 PAID (Normal)'}
            </ToggleStatus>
          </ToggleRow>
          {results.freeMode && <ResultBadge $ok={results.freeMode.ok}>{results.freeMode.msg}</ResultBadge>}
          <ActionButton
            $variant={freeMode ? 'danger' : 'success'}
            onClick={handleToggleFreeMode}
            disabled={processing === 'freeMode'}
          >
            {processing === 'freeMode'
              ? <><SpinIcon size={13} />Updating...</>
              : <>{freeMode ? <Lock size={14} /> : <Unlock size={14} />}
                {freeMode ? 'Switch to PAID' : 'Activate FREE Mode'}</>
            }
          </ActionButton>
        </ActionCard>

        {/* ── MAINTENANCE OPERATIONS ── */}
        <SectionDivider>🛠️ Maintenance Operations</SectionDivider>

        {/* Clear Cache */}
        <ActionCard $variant="warning">
          <ActionHeader>
            <ActionIcon $variant="warning"><Trash2 size={18} /></ActionIcon>
            <ActionTitle>Clear Cache</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Clears browser storage and bumps Firestore cache version, forcing all clients to reload fresh data.
          </ActionDescription>
          {results.clearCache && <ResultBadge $ok={results.clearCache.ok}>{results.clearCache.msg}</ResultBadge>}
          <ActionButton $variant="warning"
            onClick={() => window.confirm('Clear all browser cache + bump Firestore cache version?') && run('clearCache', () => adminOperationsService.clearCache())}
            disabled={processing === 'clearCache'}
          >
            {btn('clearCache', 'Clear Cache', <Trash2 size={13} />, 'Clearing...')}
          </ActionButton>
        </ActionCard>

        {/* Refresh Statistics */}
        <ActionCard $variant="info">
          <ActionHeader>
            <ActionIcon $variant="info"><BarChart3 size={18} /></ActionIcon>
            <ActionTitle>Refresh Statistics</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Recounts all users, vehicles, and dealers using Firestore aggregate queries then saves to market/stats.
          </ActionDescription>
          {results.refreshStats && <ResultBadge $ok={results.refreshStats.ok}>{results.refreshStats.msg}</ResultBadge>}
          <ActionButton $variant="info"
            onClick={() => run('refreshStats', () => adminOperationsService.refreshStatistics())}
            disabled={processing === 'refreshStats'}
          >
            {btn('refreshStats', 'Recalculate Now', <RefreshCw size={13} />, 'Counting...')}
          </ActionButton>
        </ActionCard>

        {/* Database Cleanup */}
        <ActionCard $variant="danger">
          <ActionHeader>
            <ActionIcon $variant="danger"><Database size={18} /></ActionIcon>
            <ActionTitle>Database Cleanup</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Permanently deletes expired promotions, soft-deleted listings, and audit logs older than 90 days.
          </ActionDescription>
          {results.cleanup && <ResultBadge $ok={results.cleanup.ok}>{results.cleanup.msg}</ResultBadge>}
          <ActionButton $variant="danger"
            onClick={() => window.confirm('⚠️ PERMANENTLY delete expired/deleted records from Firestore?') && run('cleanup', () => adminOperationsService.cleanupDatabase())}
            disabled={processing === 'cleanup'}
          >
            {btn('cleanup', 'Run Cleanup', <Database size={13} />, 'Cleaning...')}
          </ActionButton>
        </ActionCard>

        {/* Clear Old Logs */}
        <ActionCard $variant="warning">
          <ActionHeader>
            <ActionIcon $variant="warning"><Trash2 size={18} /></ActionIcon>
            <ActionTitle>Clear Old Logs</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Deletes audit_logs and system_logs from Firestore that are older than 90 days.
          </ActionDescription>
          {results.clearLogs && <ResultBadge $ok={results.clearLogs.ok}>{results.clearLogs.msg}</ResultBadge>}
          <ActionButton $variant="warning"
            onClick={() => window.confirm('Delete all logs older than 90 days?') && run('clearLogs', () => adminOperationsService.clearOldLogs())}
            disabled={processing === 'clearLogs'}
          >
            {btn('clearLogs', 'Clear Logs', <Trash2 size={13} />, 'Clearing...')}
          </ActionButton>
        </ActionCard>

        {/* ── DATA & REPORTS ── */}
        <SectionDivider>📊 Data & Reports</SectionDivider>

        {/* Export All Data */}
        <ActionCard $variant="success">
          <ActionHeader>
            <ActionIcon $variant="success"><Download size={18} /></ActionIcon>
            <ActionTitle>Export All Data</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Reads top 200 docs from 7 key collections and downloads a real JSON file to your device.
          </ActionDescription>
          {results.export && <ResultBadge $ok={results.export.ok}>{results.export.msg}</ResultBadge>}
          <ActionButton $variant="success"
            onClick={() => run('export', () => adminOperationsService.exportAllData())}
            disabled={processing === 'export'}
          >
            {btn('export', 'Export JSON', <Download size={13} />, 'Exporting...')}
          </ActionButton>
        </ActionCard>

        {/* Generate CSV Report */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon><FileText size={18} /></ActionIcon>
            <ActionTitle>Generate CSV Report</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Generates a live collection-count CSV report from Firestore aggregate queries. Auto-downloads.
          </ActionDescription>
          {results.report && <ResultBadge $ok={results.report.ok}>{results.report.msg}</ResultBadge>}
          <ActionButton
            onClick={() => run('report', () => adminOperationsService.generateReport())}
            disabled={processing === 'report'}
          >
            {btn('report', 'Generate CSV', <FileText size={13} />, 'Generating...')}
          </ActionButton>
        </ActionCard>

        {/* Backup Database */}
        <ActionCard $variant="success">
          <ActionHeader>
            <ActionIcon $variant="success"><HardDrive size={18} /></ActionIcon>
            <ActionTitle>Backup Metadata</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Saves collection counts + site settings to admin_backups/ in Firestore. Downloads a local JSON copy.
          </ActionDescription>
          {results.backup && <ResultBadge $ok={results.backup.ok}>{results.backup.msg}</ResultBadge>}
          <ActionButton $variant="success"
            onClick={() => run('backup', () => adminOperationsService.backupDatabase())}
            disabled={processing === 'backup'}
          >
            {btn('backup', 'Backup Now', <HardDrive size={13} />, 'Backing up...')}
          </ActionButton>
        </ActionCard>

        {/* Platform Health Check */}
        <ActionCard $variant="info">
          <ActionHeader>
            <ActionIcon $variant="info"><Activity size={18} /></ActionIcon>
            <ActionTitle>Health Check</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Pings Firestore, validates Auth, and checks that site_settings exists. Shows live result instantly.
          </ActionDescription>
          {results.health && <ResultBadge $ok={results.health.ok}>{results.health.msg}</ResultBadge>}
          <ActionButton $variant="info"
            onClick={() => run('health', async () => {
              const r = await adminOperationsService.getPlatformHealth();
              setHealth(r.details || {});
              return r;
            })}
            disabled={processing === 'health'}
          >
            {btn('health', 'Run Health Check', <Heart size={13} />, 'Checking...')}
          </ActionButton>
        </ActionCard>

        {/* Send Announcement */}
        <ActionCard>
          <ActionHeader>
            <ActionIcon><Bell size={18} /></ActionIcon>
            <ActionTitle>Send Announcement</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Publish a platform-wide announcement document to Firestore visible to all users.
          </ActionDescription>
          {results.announce && <ResultBadge $ok={results.announce.ok}>{results.announce.msg}</ResultBadge>}
          <ActionButton
            onClick={() => {
              const title = window.prompt('Announcement title:');
              if (!title) return;
              const msg = window.prompt('Announcement message:');
              if (!msg) return;
              run('announce', () => adminOperationsService.sendPlatformAnnouncement(title, msg));
            }}
            disabled={processing === 'announce'}
          >
            {btn('announce', 'Publish Announcement', <Bell size={13} />, 'Publishing...')}
          </ActionButton>
        </ActionCard>

      </ActionsGrid>
    </Container>
  );
};

export default QuickActionsPanel;
