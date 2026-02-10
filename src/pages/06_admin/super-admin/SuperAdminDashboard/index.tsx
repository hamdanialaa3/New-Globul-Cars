import { logger } from '../../../../services/logger-service';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { RealTimeAnalytics, UserActivity } from '../../../../services/super-admin-types';
import { firebaseRealDataService } from '../../../../services/firebase-real-data-service';
import { uniqueOwnerService } from '../../../../services/unique-owner-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/firebase-config';
import { getAuth } from 'firebase/auth';

// New Layout Imports
import AdminShell from '../../../../components/SuperAdmin/layout/AdminShell';
import FirebaseLinks from '../../../../components/SuperAdmin/sections/FirebaseLinks';
import AIManagementLinks from '../../../../components/SuperAdmin/sections/AIManagementLinks';
import IoTManagementLinks from '../../../../components/SuperAdmin/sections/IoTManagementLinks';
import ReportsLinks from '../../../../components/SuperAdmin/sections/ReportsLinks';

// Admin Lang Import
import { useAdminLang } from '../../../../contexts/AdminLanguageContext';

// Component Imports (Preserved)
import AdminOverview from '../../../../components/SuperAdmin/AdminOverview';
import LiveCounters from '../../../../components/SuperAdmin/LiveCounters';
import FirebaseConnectionTest from '../../../../components/SuperAdmin/FirebaseConnectionTest';
import ProjectInfoPanel from '../../../../components/SuperAdmin/ProjectInfoPanel';
import RealTimeAlertsPanel from '../../../../components/SuperAdmin/RealTimeAlertsPanel';
import VisitorAnalyticsPanel from '../../../../components/SuperAdmin/VisitorAnalyticsPanel';
import RealDataDisplay from '../../../../components/RealDataDisplay';
import AdvancedCharts from '../../../../components/AdvancedCharts';
import RealDataManager from '../../../../components/RealDataManager';
import AdvancedAnalytics from '../../../../components/AdvancedAnalytics';
import AdvancedContentManagement from '../../../../components/AdvancedContentManagement';
import PermissionManagement from '../../../../components/PermissionManagement';
import AuditLogging from '../../../../components/AuditLogging';
import NotificationsManagement from '../../../../components/NotificationsManagement';
import UserDetailsModal from '../../../../components/UserDetailsModal';
import FacebookAdminPanel from '../../../../components/SuperAdmin/FacebookAdminPanel';
import ArchitecturePanel from '../../../../components/SuperAdmin/ArchitecturePanel';
import { AIDashboard } from '../../../../components/admin/AIDashboard';
import { GodModeUserGrid } from '../../../../components/SuperAdmin/GodMode/GodModeUserGrid';
import { GodModeCarGrid } from '../../../../components/SuperAdmin/GodMode/GodModeCarGrid';
import { GodModeMessagesGrid } from '../../../../components/SuperAdmin/GodMode/GodModeMessagesGrid';
import { GodModeRevenueGrid } from '../../../../components/SuperAdmin/GodMode/GodModeRevenueGrid';
import { GodModeViewsGrid } from '../../../../components/SuperAdmin/GodMode/GodModeViewsGrid';
import { AdManagerDashboard } from '../../../../features/ads/admin/AdManagerDashboard';
import SectionControlPanel from '../../../../components/SuperAdmin/SectionControlPanel';
import SiteSettingsControl from '../../../../components/SuperAdmin/SiteSettingsControl';
import ThemeControl from '../../../../components/SuperAdmin/ThemeControl';
import FeaturedContentManager from '../../../../components/SuperAdmin/FeaturedContentManager';
import SEOControl from '../../../../components/SuperAdmin/SEOControl';
import AnnouncementManager from '../../../../components/SuperAdmin/AnnouncementManager';
import BackupRestoreManager from '../../../../components/SuperAdmin/BackupRestoreManager';
import QuickActionsPanel from '../../../../components/SuperAdmin/QuickActionsPanel';
import PlatformStatusDashboard from '../../../../components/SuperAdmin/PlatformStatusDashboard';
import { Users } from 'lucide-react';

// Loading State Styles
const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #f8fafc;
  font-size: 16px;
  font-weight: 500;
  gap: 12px;
  background: #030712; /* Deep Space from Theme */
`;

const LoadingMessage = styled.div`
  font-size: 14px;
  color: #94a3b8;
  max-width: 600px;
  text-align: center;
  line-height: 1.5;
`;

// Keep for compatibility inside tabs if needed, or replace with theme buttons later
const ActionButton = styled.button`
  background: #6366f1;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover {
    background: #4f46e5;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

const LoginButton = styled(ActionButton)``;

// Internal Content Component to use Hooks
const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAdminLang();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<RealTimeAnalytics | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [marketStats, setMarketStats] = useState({ totalCars: 0, totalUsers: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isOwnerAuthed, setIsOwnerAuthed] = useState(false);

  // God Mode State
  const [godMode, setGodMode] = useState<{ active: boolean; type: 'users' | 'cars' | 'messages' | 'revenue' | 'views' | null }>({ active: false, type: null });

  const handleGodModeAction = (action: string) => {
    switch (action) {
      case 'users': setGodMode({ active: true, type: 'users' }); break;
      case 'cars': setGodMode({ active: true, type: 'cars' }); break;
      case 'messages': setGodMode({ active: true, type: 'messages' }); break;
      case 'revenue': setGodMode({ active: true, type: 'revenue' }); break;
      case 'views': setGodMode({ active: true, type: 'views' }); break;
    }
  };

  useEffect(() => {
    let cancelled = false;
    let hasNavigated = false;
    let hasWarned = false;

    const initializeDashboard = async () => {
      try {
        if (cancelled) return;
        setLoading(true);

        const isValid = await uniqueOwnerService.validateCurrentSession();
        if (!isValid) {
          if (!cancelled && !hasNavigated) {
            hasNavigated = true;
            navigate('/super-admin-login', { replace: true });
          }
          return;
        }

        const sessionData = uniqueOwnerService.getCurrentSession();
        if (cancelled) return;
        setSession(sessionData);

        // Load real Firebase data
        try {
          const auth = getAuth();
          const currentUser = auth.currentUser;

          if (!currentUser) {
            if (!hasWarned) {
              logger.warn('⚠️ Firebase session inactive. Some real-time features may be limited.');
              hasWarned = true;
            }
            if (!cancelled) setIsOwnerAuthed(false);
            return;
          }

          const isAdmin = await uniqueOwnerService.validateCurrentSession();
          if (!isAdmin) {
            if (!hasWarned) {
              logger.warn('⚠️ Admin role required for real-time features.');
              hasWarned = true;
            }
            if (!cancelled) setIsOwnerAuthed(false);
            return;
          }

          if (cancelled) return;
          setIsOwnerAuthed(true);
          const realAnalytics = await firebaseRealDataService.getRealAnalytics();
          if (cancelled) return;

            // Mocking topStats for analytics if missing in real data
            const enrichedAnalytics = {
              ...realAnalytics,
              topCountries: realAnalytics.topCountries || [],
              topCities: realAnalytics.topCities || [],
              userGrowth: realAnalytics.userGrowth || [],
              carListings: realAnalytics.carListings || [],
            };

            setAnalytics(enrichedAnalytics as any);

            const realUserActivity = await firebaseRealDataService.getRealUserActivity();
            const mappedUserActivity = realUserActivity.map((activity: any) => ({
              ...activity,
              email: activity.email || 'no-email@koli.one'
            }));
            if (cancelled) return;
            setUserActivity(mappedUserActivity as any);
        } catch (error) {
          logger.warn('⚠️ Failed to load real Firebase data.');
          if (!cancelled) navigate('/super-admin-login');
          return;
        }

      } catch (error) {
        logger.error('❌ Error initializing dashboard:', error);
        if (!cancelled) setError('Failed to initialize dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const loadMarketStats = async () => {
      try {
        if (cancelled) return;
        const statsDocRef = doc(db, 'market', 'stats');
        const statsDoc = await getDoc(statsDocRef);

        if (cancelled && !statsDoc.exists()) return;
        if (statsDoc.exists()) {
          const data = statsDoc.data();
          setMarketStats({
            totalCars: data?.totalCars || 0,
            totalUsers: data?.totalUsers || 0,
            totalViews: data?.totalViews || 0
          });
        }
      } catch (error) {
        logger.info('Stats not available yet');
      }
    };

    initializeDashboard();
    loadMarketStats();

    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) setActiveTab(tabParam);

    const statsInterval = setInterval(() => {
      if (!cancelled) loadMarketStats();
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(statsInterval);
    };
  }, [navigate]);

  const handleLogout = async () => {
    if (window.confirm(t.common.confirmLogout)) {
      try {
        await uniqueOwnerService.logout();
        navigate('/super-admin-login');
      } catch (error) {
        logger.error('Error during logout:', error);
      }
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <LoadingState>
        <div>🔄 {t.common.checkAuth}</div>
        <LoadingMessage>{t.common.verifying}</LoadingMessage>
      </LoadingState>
    );
  }

  if (error) {
    return (
      <LoadingState>
        <div>❌ {t.common.error}: {error}</div>
        <LoadingMessage>{t.common.unableToLoad}</LoadingMessage>
        <LoginButton onClick={() => navigate('/super-admin-login')}>{t.common.goLogin}</LoginButton>
      </LoadingState>
    );
  }

  return (
    <AdminShell activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          <PlatformStatusDashboard />
          <AdminOverview analytics={analytics} userActivity={userActivity} onUserClick={handleUserClick} />
          {isOwnerAuthed && (
            <>
              <LiveCounters stats={marketStats} onAction={handleGodModeAction} />
              <RealTimeAlertsPanel />
              <QuickActionsPanel />
              <FirebaseConnectionTest />
            </>
          )}
        </>
      )}

      {/* 2. MANAGEMENT: Users, Dealers, Cars, Content */}
      {activeTab === 'users' && (
        <>
          <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ color: '#f8fafc', marginBottom: '1rem', fontSize: '18px', fontWeight: '600' }}>{t.common.users} {t.navigation.management}</h2>
            <ActionButton onClick={() => navigate('/super-admin/users')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} /> {t.common.openUserMgmt}
            </ActionButton>
          </div>
          <PermissionManagement />
          <NotificationsManagement />
        </>
      )}

      {activeTab === 'dealers' && (
        <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>
          <h3>{t.common.dealerMgmt}</h3>
          <p>{t.common.dealerDesc}</p>
          <ActionButton onClick={() => navigate('/super-admin/users?filter=dealer')}>{t.common.goToDealers}</ActionButton>
        </div>
      )}

      {activeTab === 'cars' && (
        <>
          <RealDataDisplay />
          <RealDataManager />
          <AdvancedCharts />
        </>
      )}

      {activeTab === 'content' && (
        <>
          <AdvancedContentManagement />
          <FeaturedContentManager />
          <AnnouncementManager />
          <SectionControlPanel />
          <FacebookAdminPanel language="bg" />
          <AdManagerDashboard />
        </>
      )}

      {/* 3. SYSTEM: Finance, AI, IoT, Audit, Settings */}
      {activeTab === 'finance' && (
        <>
          <GodModeRevenueGrid onClose={() => setActiveTab('overview')} />
          {/* Add more finance components later */}
        </>
      )}

      {activeTab === 'ai' && (
        <>
          <AIManagementLinks />
          <AIDashboard />
        </>
      )}

      {activeTab === 'iot' && (
        <IoTManagementLinks />
      )}

      {activeTab === 'audit' && (
        <AuditLogging />
      )}

      {activeTab === 'analytics' && (
        <>
          <VisitorAnalyticsPanel />
          <AdvancedAnalytics analytics={analytics} />
          <ReportsLinks />
        </>
      )}

      {activeTab === 'settings' && (
        <>
          <FirebaseLinks />
          <SiteSettingsControl />
          <ThemeControl />
          <SEOControl />
          <BackupRestoreManager />
          <ProjectInfoPanel />
          <ArchitecturePanel language="en" />
        </>
      )}

      {/* GOD MODE OVERLAYS */}
      {godMode.active && godMode.type === 'users' && <GodModeUserGrid onClose={() => setGodMode({ active: false, type: null })} />}
      {godMode.active && godMode.type === 'cars' && <GodModeCarGrid onClose={() => setGodMode({ active: false, type: null })} />}
      {godMode.active && godMode.type === 'messages' && <GodModeMessagesGrid onClose={() => setGodMode({ active: false, type: null })} />}
      {godMode.active && godMode.type === 'revenue' && <GodModeRevenueGrid onClose={() => setGodMode({ active: false, type: null })} />}
      {godMode.active && godMode.type === 'views' && <GodModeViewsGrid onClose={() => setGodMode({ active: false, type: null })} />}

      <UserDetailsModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        userId={selectedUser?.uid || ''}
        userData={selectedUser}
      />
    </AdminShell>
  );
};

// Main Export Wraps Content but AdminShell wraps Context
// Actually AdminShell already wraps context, but we need context INSIDE this component to use hooks.
// So we must move AdminShell usage UP or wrap DashboardContent.
// However, AdminShell is designed as a Layout Component.
// Let's refactor: AdminShell provides the provider, but we need the provider BEFORE we use useAdminLang in DashboardContent.
// Wait, AdminShell component has <AdminLanguageProvider> inside it.
// Children of AdminShell can use the context.
// But DashboardContent is PARENT of AdminShell in the original code structure (it returns AdminShell).
// So DashboardContent CANNOT use useAdminLang because the provider is inside its child (AdminShell).
// FIX: We need to wrap SuperAdminDashboard with the Provider, or move logic inside AdminShell.

const SuperAdminDashboard: React.FC = () => {
  // We render AdminShell which HAS the provider.
  // To make this work, we should just let AdminShell handle the layout, 
  // but if we want to translate "Confirm Logout" here, we need access to context.
  // Solution: AdminShell should be the ROOTS of the return, but the Provider must be HIGHER.
  // We will change AdminShell.tsx to export the Provider, or just wrap it here.
  return (
    <AdminShell activeTab="overview" onTabChange={() => { }} onLogout={() => { }}>
      <DashboardContent />
    </AdminShell>
  );
};
// Correction: The original file has SuperAdminDashboard as the main page.
// We will modify AdminShell.tsx to export the provider separately or just use it here.
// Better: Wrap DashboardContent with AdminLanguageProvider here.

import { AdminLanguageProvider } from '../../../../contexts/AdminLanguageContext';

const SuperAdminDashboardWrapped: React.FC = () => {
  return (
    <AdminLanguageProvider>
      <DashboardContent />
    </AdminLanguageProvider>
  );
}

export default SuperAdminDashboardWrapped;
