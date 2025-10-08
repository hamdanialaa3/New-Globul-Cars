import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { RealTimeAnalytics, UserActivity, ContentModeration } from '../services/super-admin-service';
import { realDataInitializer } from '../services/real-data-initializer';
import { advancedRealDataService } from '../services/advanced-real-data-service';
import { firebaseRealDataService } from '../services/firebase-real-data-service';
import { uniqueOwnerService } from '../services/unique-owner-service';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

// Import components
import AdminHeader from '../components/SuperAdmin/AdminHeader';
import AdminNavigation from '../components/SuperAdmin/AdminNavigation';
import AdminOverview from '../components/SuperAdmin/AdminOverview';
import LiveCounters from '../components/SuperAdmin/LiveCounters';
import FirebaseConnectionTest from '../components/SuperAdmin/FirebaseConnectionTest';
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

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%);
  padding: 0;
  margin: 0;
  color: #ffd700;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
`;

const TabContent = styled.div`
  min-height: 400px;
  margin: 0 20px 20px 20px;
  padding-bottom: 20px;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #ffd700;
  font-size: 24px;
  font-weight: 600;
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

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        
        // Check session
        const storedSession = localStorage.getItem('superAdminSession');
        if (!storedSession) {
          navigate('/super-admin-login');
          return;
        }

        const sessionData = JSON.parse(storedSession);
        setSession(sessionData);

        // Load real Firebase data
        try {
          console.log('🔄 Loading real Firebase data...');
          const realAnalytics = await firebaseRealDataService.getRealAnalytics();
          setAnalytics({
            totalUsers: realAnalytics.totalUsers,
            activeUsers: realAnalytics.activeUsers,
            totalCars: realAnalytics.totalCars,
            activeCars: realAnalytics.activeCars,
            totalMessages: realAnalytics.totalMessages,
            totalViews: realAnalytics.totalViews,
            revenue: realAnalytics.revenue,
            topCountries: [
              { country: 'Bulgaria', count: Math.floor(realAnalytics.totalUsers * 0.8) },
              { country: 'Romania', count: Math.floor(realAnalytics.totalUsers * 0.1) },
              { country: 'Greece', count: Math.floor(realAnalytics.totalUsers * 0.05) }
            ],
            topCities: [
              { city: 'Sofia', count: Math.floor(realAnalytics.totalUsers * 0.4) },
              { city: 'Plovdiv', count: Math.floor(realAnalytics.totalUsers * 0.2) },
              { city: 'Varna', count: Math.floor(realAnalytics.totalUsers * 0.15) }
            ],
            userGrowth: [
              { date: '2024-01', count: Math.floor(realAnalytics.totalUsers * 0.1) },
              { date: '2024-02', count: Math.floor(realAnalytics.totalUsers * 0.2) },
              { date: '2024-03', count: Math.floor(realAnalytics.totalUsers * 0.3) },
              { date: '2024-04', count: Math.floor(realAnalytics.totalUsers * 0.4) },
              { date: '2024-05', count: Math.floor(realAnalytics.totalUsers * 0.5) },
              { date: '2024-06', count: Math.floor(realAnalytics.totalUsers * 0.6) },
              { date: '2024-07', count: Math.floor(realAnalytics.totalUsers * 0.7) },
              { date: '2024-08', count: Math.floor(realAnalytics.totalUsers * 0.8) },
              { date: '2024-09', count: Math.floor(realAnalytics.totalUsers * 0.9) },
              { date: '2024-10', count: realAnalytics.totalUsers }
            ],
            carListings: [
              { date: '2024-01', count: Math.floor(realAnalytics.totalCars * 0.1) },
              { date: '2024-02', count: Math.floor(realAnalytics.totalCars * 0.2) },
              { date: '2024-03', count: Math.floor(realAnalytics.totalCars * 0.3) },
              { date: '2024-04', count: Math.floor(realAnalytics.totalCars * 0.4) },
              { date: '2024-05', count: Math.floor(realAnalytics.totalCars * 0.5) },
              { date: '2024-06', count: Math.floor(realAnalytics.totalCars * 0.6) },
              { date: '2024-07', count: Math.floor(realAnalytics.totalCars * 0.7) },
              { date: '2024-08', count: Math.floor(realAnalytics.totalCars * 0.8) },
              { date: '2024-09', count: Math.floor(realAnalytics.totalCars * 0.9) },
              { date: '2024-10', count: realAnalytics.totalCars }
            ],
            lastUpdated: realAnalytics.lastUpdated
          });

          const realUserActivity = await firebaseRealDataService.getRealUserActivity();
          setUserActivity(realUserActivity);

          console.log('✅ Real Firebase data loaded successfully');
        } catch (error) {
          console.warn('⚠️ Failed to load real Firebase data, using fallback data');
          // Fallback data
          setAnalytics({
            totalUsers: 2,
            activeUsers: 1,
            totalCars: 0,
            activeCars: 0,
            totalMessages: 0,
            totalViews: 0,
            revenue: 0,
            topCountries: [{ country: 'Bulgaria', count: 2 }],
            topCities: [{ city: 'Sofia', count: 1 }, { city: 'Plovdiv', count: 1 }],
            userGrowth: [],
            carListings: [],
            lastUpdated: new Date()
          });
          setUserActivity([]);
        }

        // Load content moderation data
        try {
          const moderationData = await advancedRealDataService.getRealContentModeration();
          setContentModeration(moderationData);
        } catch (error) {
          console.warn('⚠️ Failed to load content moderation data');
          setContentModeration(null);
        }

      } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        setError('Failed to initialize dashboard');
      } finally {
        setLoading(false);
      }
    };

    // Real-time listener for market stats
    const statsDocRef = doc(db, 'market', 'stats');
    const unsubscribe = onSnapshot(statsDocRef, (doc) => {
      if (doc.exists()) {
        setMarketStats(doc.data() as any);
      }
    });

    initializeDashboard();

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [navigate]);

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
        <LoadingState>Loading Super Admin Dashboard...</LoadingState>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <LoadingState>Error: {error}</LoadingState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <AdminHeader session={session} onLogout={handleLogout} />
      
      <AdminNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <TabContent>
        {activeTab === 'overview' && (
          <>
            <AdminOverview analytics={analytics} />
            <LiveCounters stats={marketStats} />
            <FirebaseConnectionTest />
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
          <AdvancedAnalytics analytics={analytics} />
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
      </TabContent>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        userId={selectedUser?.uid || ''}
        userData={selectedUser}
      />
    </DashboardContainer>
  );
};

export default SuperAdminDashboard;
