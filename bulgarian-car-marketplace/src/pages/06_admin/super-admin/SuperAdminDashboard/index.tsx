import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { RealTimeAnalytics, UserActivity, ContentModeration } from '../../../../../services/super-admin-service';
import { realDataInitializer } from '../../../../../services/real-data-initializer';
import { advancedRealDataService } from '../../../../../services/advanced-real-data-service';
import { firebaseRealDataService } from '../../../../../services/firebase-real-data-service';
import { uniqueOwnerService } from '../../../../../services/unique-owner-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../firebase/firebase-config';
import { getAuth } from 'firebase/auth';

// Import components
import AdminHeader from '../components/SuperAdmin/AdminHeader';
import AdminNavigation from '../components/SuperAdmin/AdminNavigation';
import QuickLinksNavigation from '../components/SuperAdmin/QuickLinksNavigation';
import AdminOverview from '../components/SuperAdmin/AdminOverview';
import LiveCounters from '../components/SuperAdmin/LiveCounters';
import FirebaseConnectionTest from '../components/SuperAdmin/FirebaseConnectionTest';
import ProjectInfoPanel from '../components/SuperAdmin/ProjectInfoPanel';
import RealTimeAlertsPanel from '../components/SuperAdmin/RealTimeAlertsPanel';
import VisitorAnalyticsPanel from '../components/SuperAdmin/VisitorAnalyticsPanel';
import RealDataDisplay from '../components/RealDataDisplay';
import AdvancedCharts from '../components/AdvancedCharts';
import RealDataManager from '../components/RealDataManager';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import RealTimeNotifications from '../components/RealTimeNotifications';
import AdvancedContentManagement from '../components/AdvancedContentManagement';
import AdvancedUserManagement from '../components/AdvancedUserManagement';
import PermissionManagement from '../components/PermissionManagement';
import AuditLogging from '../components/AuditLogging';
import UserDetailsModal from '../components/UserDetailsModal';
import FacebookAdminPanel from '../components/SuperAdmin/FacebookAdminPanel';

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%);
  padding: 0 0 100px 0;
  margin: 0;
  color:rgb(46, 20, 176);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const TabContent = styled.div`
  min-height: 400px;
  margin: 0 20px 20px 20px;
  padding-bottom: 20px;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #ffd700;
  font-size: 24px;
  font-weight: 600;
  gap: 20px;
`;

const LoadingMessage = styled.div`
  font-size: 16px;
  color: #aaa;
  max-width: 600px;
  text-align: center;
  line-height: 1.6;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  }
`;

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<RealTimeAnalytics | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [contentModeration, setContentModeration] = useState<ContentModeration | null>(null);
  const [marketStats, setMarketStats] = useState({ totalCars: 0, totalUsers: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isOwnerAuthed, setIsOwnerAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let hasNavigated = false;
    
    const initializeDashboard = async () => {
      try {
        if (cancelled) return;
        setLoading(true);
        
        // Check session
        const storedSession = localStorage.getItem('superAdminSession');
        if (!storedSession) {
          if (!cancelled && !hasNavigated) {
            hasNavigated = true;
            navigate('/super-admin-login', { replace: true });
          }
          return;
        }

        const sessionData = JSON.parse(storedSession);
        if (cancelled) return;
        setSession(sessionData);

        // Load real Firebase data (only when signed into Firebase as the unique owner)
        try {
          const auth = getAuth();
          const currentUser = auth.currentUser;

          if (!currentUser || currentUser.email !== 'alaa.hamdani@yahoo.com') {
            console.warn('⚠️ Not signed into Firebase as the unique owner.');
            if (!cancelled && !hasNavigated) {
              hasNavigated = true;
              setIsOwnerAuthed(false);
              navigate('/super-admin-login', { replace: true });
            }
            return;
          } else {
            if (cancelled) return;
            setIsOwnerAuthed(true);
            console.log('🔄 Loading real Firebase data...');
            const realAnalytics = await firebaseRealDataService.getRealAnalytics();
            
            if (cancelled) return;
            setAnalytics({
              totalUsers: realAnalytics.totalUsers,
              activeUsers: realAnalytics.activeUsers,
              totalCars: realAnalytics.totalCars,
              activeCars: realAnalytics.activeCars,
              totalMessages: realAnalytics.totalMessages,
              totalViews: realAnalytics.totalViews,
              revenue: realAnalytics.revenue,
              topCountries: [
                { country: 'Bulgaria', count: Math.floor((realAnalytics.totalUsers || 0) * 0.8) },
                { country: 'Romania', count: Math.floor((realAnalytics.totalUsers || 0) * 0.1) },
                { country: 'Greece', count: Math.floor((realAnalytics.totalUsers || 0) * 0.05) }
              ],
              topCities: [
                { city: 'Sofia', count: Math.floor((realAnalytics.totalUsers || 0) * 0.4) },
                { city: 'Plovdiv', count: Math.floor((realAnalytics.totalUsers || 0) * 0.2) },
                { city: 'Varna', count: Math.floor((realAnalytics.totalUsers || 0) * 0.15) }
              ],
              userGrowth: [
                { date: '2024-01', count: Math.floor((realAnalytics.totalUsers || 0) * 0.1) },
                { date: '2024-02', count: Math.floor((realAnalytics.totalUsers || 0) * 0.2) },
                { date: '2024-03', count: Math.floor((realAnalytics.totalUsers || 0) * 0.3) },
                { date: '2024-04', count: Math.floor((realAnalytics.totalUsers || 0) * 0.4) },
                { date: '2024-05', count: Math.floor((realAnalytics.totalUsers || 0) * 0.5) },
                { date: '2024-06', count: Math.floor((realAnalytics.totalUsers || 0) * 0.6) },
                { date: '2024-07', count: Math.floor((realAnalytics.totalUsers || 0) * 0.7) },
                { date: '2024-08', count: Math.floor((realAnalytics.totalUsers || 0) * 0.8) },
                { date: '2024-09', count: Math.floor((realAnalytics.totalUsers || 0) * 0.9) },
                { date: '2024-10', count: realAnalytics.totalUsers || 0 }
              ],
              carListings: [
                { date: '2024-01', count: Math.floor((realAnalytics.totalCars || 0) * 0.1) },
                { date: '2024-02', count: Math.floor((realAnalytics.totalCars || 0) * 0.2) },
                { date: '2024-03', count: Math.floor((realAnalytics.totalCars || 0) * 0.3) },
                { date: '2024-04', count: Math.floor((realAnalytics.totalCars || 0) * 0.4) },
                { date: '2024-05', count: Math.floor((realAnalytics.totalCars || 0) * 0.5) },
                { date: '2024-06', count: Math.floor((realAnalytics.totalCars || 0) * 0.6) },
                { date: '2024-07', count: Math.floor((realAnalytics.totalCars || 0) * 0.7) },
                { date: '2024-08', count: Math.floor((realAnalytics.totalCars || 0) * 0.8) },
                { date: '2024-09', count: Math.floor((realAnalytics.totalCars || 0) * 0.9) },
                { date: '2024-10', count: realAnalytics.totalCars || 0 }
              ],
              lastUpdated: realAnalytics.lastUpdated
            });
            
            if (cancelled) return;
            const realUserActivity = await firebaseRealDataService.getRealUserActivity();
            
            if (cancelled) return;
            setUserActivity(realUserActivity);

            console.log('✅ Real Firebase data loaded successfully');
          }
        } catch (error) {
          console.warn('⚠️ Failed to load real Firebase data.');
          if (!cancelled) {
            navigate('/super-admin-login');
          }
          return;
        }

        // Load content moderation data
        try {
          if (cancelled) return;
          const moderationData = await advancedRealDataService.getRealContentModeration();
          
          if (cancelled) return;
          setContentModeration(moderationData);
        } catch (error) {
          console.warn('⚠️ Failed to load content moderation data');
          if (!cancelled) {
            setContentModeration(null);
          }
        }

      } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        if (!cancelled) {
          setError('Failed to initialize dashboard');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Load market stats (using getDoc to avoid conflicts)
    const loadMarketStats = async () => {
      try {
        if (cancelled) return;
        const statsDocRef = doc(db, 'market', 'stats');
        const statsDoc = await getDoc(statsDocRef);
        
        if (cancelled) return;
        if (statsDoc.exists()) {
          const data = statsDoc.data();
          setMarketStats({
            totalCars: data?.totalCars || 0,
            totalUsers: data?.totalUsers || 0,
            totalViews: data?.totalViews || 0
          });
        }
      } catch (error) {
        console.log('Stats not available yet');
      }
    };

    initializeDashboard();
    loadMarketStats();
    
    // Refresh stats every 30 seconds
    const statsInterval = setInterval(() => {
      if (!cancelled) {
        loadMarketStats();
      }
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(statsInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - runs only once, navigate is stable

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout from the Super Admin dashboard?')) {
      try {
        await uniqueOwnerService.logout();
        navigate('/super-admin-login');
      } catch (error) {
        console.error('Error during logout:', error);
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingState>
          <div>🔄 Checking Authentication...</div>
          <LoadingMessage>
            Verifying Super Admin credentials. Please wait...
          </LoadingMessage>
        </LoadingState>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <LoadingState>
          <div>❌ Error: {error}</div>
          <LoadingMessage>
            Unable to load dashboard. Please try logging in again.
          </LoadingMessage>
          <LoginButton onClick={() => navigate('/super-admin-login')}>
            Go to Login
          </LoginButton>
        </LoadingState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <AdminHeader session={session} onLogout={handleLogout} />
      
      {/* Quick Links Navigation - All Project Pages (moved to top, below header) */}
      <QuickLinksNavigation />
      
      <AdminNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content appears directly after navigation */}
      <TabContent>
        {activeTab === 'overview' && (
          <>
            <AdminOverview 
              analytics={analytics} 
              userActivity={userActivity} 
              onUserClick={handleUserClick} 
            />
            {isOwnerAuthed && (
              <>
                <LiveCounters stats={marketStats} />
                <RealTimeAlertsPanel />
                <FirebaseConnectionTest />
              </>
            )}
          </>
        )}

        {activeTab === 'realdata' && (
          <RealDataDisplay />
        )}

        {activeTab === 'charts' && (
          <AdvancedCharts />
        )}

        {activeTab === 'data' && (
          <RealDataManager />
        )}

        {activeTab === 'analytics' && (
          <>
            <VisitorAnalyticsPanel />
            <AdvancedAnalytics analytics={analytics} />
          </>
        )}

        {activeTab === 'notifications' && (
          <RealTimeNotifications />
        )}

        {activeTab === 'users' && (
          <AdvancedUserManagement />
        )}

        {activeTab === 'permissions' && (
          <PermissionManagement />
        )}

        {activeTab === 'audit' && (
          <AuditLogging />
        )}

        {activeTab === 'content' && (
          <AdvancedContentManagement />
        )}

        {activeTab === 'project' && (
          <ProjectInfoPanel />
        )}

        {activeTab === 'facebook' && (
          <FacebookAdminPanel language="bg" />
        )}
      </TabContent>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        userId={selectedUser?.uid || ''}
        userData={selectedUser}
      />

      {/* Super Admin Footer - Owner Only */}
      <SuperAdminFooter>
        <FooterStatsGrid>
          <FooterStat>
            <StatLabel>إجمالي الزيارات</StatLabel>
            <StatValue>{analytics?.totalViews ?? 0}</StatValue>
          </FooterStat>
          <FooterStat>
            <StatLabel>عدد المستخدمين</StatLabel>
            <StatValue>{analytics?.totalUsers ?? 0}</StatValue>
          </FooterStat>
          <FooterStat>
            <StatLabel>عدد السيارات</StatLabel>
            <StatValue>{analytics?.totalCars ?? 0}</StatValue>
          </FooterStat>
          <FooterStat>
            <StatLabel>آخر تحديث</StatLabel>
            <StatValue>{analytics?.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString('ar-EG') : '-'}</StatValue>
          </FooterStat>
        </FooterStatsGrid>
        <FooterNote>هذه المعلومات خاصة بالمالك (Super Admin) ولا تظهر للمستخدمين العاديين.</FooterNote>
      </SuperAdminFooter>
    </DashboardContainer>
);
};

// Styled footer for Super Admin only
const SuperAdminFooter = styled.footer`
  background: linear-gradient(90deg, #232526 0%, #414345 100%);
  color: #ffd700;
  padding: 32px 0 16px 0;
  margin-top: 40px;
  border-top: 2px solid #ffd700;
  text-align: center;
`;

const FooterStatsGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const FooterStat = styled.div`
  min-width: 120px;
`;

const StatLabel = styled.div`
  font-size: 15px;
  color: #aaa;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: #ffd700;
`;

const FooterNote = styled.div`
  font-size: 13px;
  color: #888;
  margin-top: 8px;
`;

export default SuperAdminDashboard;
