import { logger } from '../../../../services/logger-service';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { RealTimeAnalytics, UserActivity, ContentModeration } from '../../../../services/super-admin-types';
import { realDataInitializer } from '../../../../services/real-data-initializer';
import { advancedRealDataService } from '../../../../services/advanced-real-data-service';
import { firebaseRealDataService } from '../../../../services/firebase-real-data-service';
import { uniqueOwnerService } from '../../../../services/unique-owner-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/firebase-config';
import { getAuth } from 'firebase/auth';
import { usersReportService } from '../../../../services/reports/users-report-service';
import { carsReportService } from '../../../../services/reports/cars-report-service';
import { Download, FileSpreadsheet, FileJson, Users } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import GlobulCarLogo from '../../../../components/icons/GlobulCarLogo';

// Import components
import AdminHeader from '../../../../components/SuperAdmin/AdminHeader';
import AdminNavigation from '../../../../components/SuperAdmin/AdminNavigation';
import QuickLinksNavigation from '../../../../components/SuperAdmin/QuickLinksNavigation';
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
import AdvancedUserManagement from '../../../../components/AdvancedUserManagement';
import PermissionManagement from '../../../../components/PermissionManagement';
import AuditLogging from '../../../../components/AuditLogging';
import NotificationsManagement from '../../../../components/NotificationsManagement';
import UserDetailsModal from '../../../../components/UserDetailsModal';
import FacebookAdminPanel from '../../../../components/SuperAdmin/FacebookAdminPanel';
import ArchitecturePanel from '../../../../components/SuperAdmin/ArchitecturePanel';
import { AIDashboard } from '../../../../components/admin/AIDashboard';

// Styled Components - Professional Minimal Design
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding: 0 0 40px 0;
  margin: 0;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
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
  color: #333333;
  font-size: 16px;
  font-weight: 500;
  gap: 12px;
  background: #ffffff;
`;

const LoadingMessage = styled.div`
  font-size: 14px;
  color: #666666;
  max-width: 600px;
  text-align: center;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #d0d0d0;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
  margin-top: 8px;

  &:hover {
    background: #333333;
  }
`;

const LoginButton = styled.button`
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #d0d0d0;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
  margin-top: 8px;

  &:hover {
    background: #333333;
  }
`;

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
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
    let hasWarned = false;

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

          if (!currentUser || (currentUser.email !== 'alaa.hamdani@yahoo.com' && currentUser.email !== 'hamdanialaa@yahoo.com')) {
            if (!hasWarned) {
              // Valid local session exists, so we don't kick them out, just warn about real data
              logger.warn('⚠️ Firebase session inactive. Some real-time features may be limited.');
              hasWarned = true;
            }
            if (!cancelled) {
              // DO NOT REDIRECT - Break the loop
              // navigate('/super-admin-login', { replace: true });
              setIsOwnerAuthed(false);
            }
            // Continue loading dashboard but with limited features
          } else {
            if (cancelled) return;
            setIsOwnerAuthed(true);
            logger.info('🔄 Loading real Firebase data...');
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

            logger.info('✅ Real Firebase data loaded successfully');
          }
        } catch (error) {
          logger.warn('⚠️ Failed to load real Firebase data.');
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
          logger.warn('⚠️ Failed to load content moderation data');
          if (!cancelled) {
            setContentModeration(null);
          }
        }

      } catch (error) {
        logger.error('❌ Error initializing dashboard:', error);
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
        logger.info('Stats not available yet');
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
          <NotificationsManagement />
        )}

        {activeTab === 'users' && (
          <div style={{ textAlign: 'center', padding: '2rem', background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
            <h2 style={{ color: '#1a1a1a', marginBottom: '1rem', fontSize: '18px', fontWeight: '600' }}>User Management</h2>
            <p style={{ color: '#666666', marginBottom: '2rem', fontSize: '14px' }}>Complete control over all users, subscribers, and administrators</p>
            <ActionButton
              onClick={() => navigate('/super-admin/users')}
              style={{
                background: '#1a1a1a',
                color: '#ffffff',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #d0d0d0',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Users size={16} />
              Open User Management
            </ActionButton>
          </div>
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

        {activeTab === 'architecture' && (
          <ArchitecturePanel language={language} />
        )}

        {activeTab === 'facebook' && (
          <FacebookAdminPanel language="bg" />
        )}

        {activeTab === 'ai' && (
          <AIDashboard />
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
        {/* Firebase Quick Links Section */}
        <FirebaseLinksSection>
          <SectionTitle>🔥 روابط Firebase السريعة</SectionTitle>
          <LinksGrid>
            <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/firestore/databases/-default-/data', '_blank')}>
              <LinkIcon>📊</LinkIcon>
              <LinkName>Firestore Database</LinkName>
              <LinkDesc>عرض وإدارة البيانات</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/storage', '_blank')}>
              <LinkIcon>🖼️</LinkIcon>
              <LinkName>Storage</LinkName>
              <LinkDesc>الصور والملفات</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/authentication/users', '_blank')}>
              <LinkIcon>👥</LinkIcon>
              <LinkName>Authentication</LinkName>
              <LinkDesc>المستخدمين المسجلين</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/functions', '_blank')}>
              <LinkIcon>⚡</LinkIcon>
              <LinkName>Cloud Functions</LinkName>
              <LinkDesc>الوظائف السحابية</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/hosting', '_blank')}>
              <LinkIcon>🌐</LinkIcon>
              <LinkName>Hosting</LinkName>
              <LinkDesc>استضافة الموقع</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/analytics', '_blank')}>
              <LinkIcon>📈</LinkIcon>
              <LinkName>Analytics</LinkName>
              <LinkDesc>إحصائيات الاستخدام</LinkDesc>
            </LinkCard>
          </LinksGrid>
        </FirebaseLinksSection>

        {/* AI Management Section */}
        <AIManagementSection>
          <SectionTitle>🤖 إدارة الذكاء الاصطناعي</SectionTitle>
          <LinksGrid>
            <LinkCard onClick={() => navigate('/ai-dashboard')}>
              <LinkIcon>📊</LinkIcon>
              <LinkName>AI Dashboard</LinkName>
              <LinkDesc>لوحة تحكم الذكاء الاصطناعي</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => navigate('/admin/ai-quotas')}>
              <LinkIcon>⚙️</LinkIcon>
              <LinkName>AI Quotas Manager</LinkName>
              <LinkDesc>إدارة حصص المستخدمين</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/firestore/databases/-default-/data/~2Fai_quotas', '_blank')}>
              <LinkIcon>💳</LinkIcon>
              <LinkName>AI Quotas</LinkName>
              <LinkDesc>حصص المستخدمين</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/firestore/databases/-default-/data/~2Fai_usage_logs', '_blank')}>
              <LinkIcon>📝</LinkIcon>
              <LinkName>Usage Logs</LinkName>
              <LinkDesc>سجل الاستخدام</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}>
              <LinkIcon>🔑</LinkIcon>
              <LinkName>Gemini API Keys</LinkName>
              <LinkDesc>مفاتيح API</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com', '_blank')}>
              <LinkIcon>⚙️</LinkIcon>
              <LinkName>API Settings</LinkName>
              <LinkDesc>إعدادات API</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://console.cloud.google.com/billing', '_blank')}>
              <LinkIcon>💰</LinkIcon>
              <LinkName>Billing</LinkName>
              <LinkDesc>الفوترة والتكاليف</LinkDesc>
            </LinkCard>
          </LinksGrid>
        </AIManagementSection>

        {/* IoT Management Section */}
        <IoTManagementSection>
          <SectionTitle>🌐 إدارة إنترنت الأشياء (IoT)</SectionTitle>
          <LinksGrid>
            <LinkCard onClick={() => navigate('/iot-dashboard')}>
              <LinkIcon>📊</LinkIcon>
              <LinkName>IoT Dashboard</LinkName>
              <LinkDesc>لوحة تحكم أجهزة IoT</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => navigate('/car-tracking')}>
              <LinkIcon>🗺️</LinkIcon>
              <LinkName>Car Tracking</LinkName>
              <LinkDesc>تتبع السيارات المباشر</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => navigate('/iot-analytics')}>
              <LinkIcon>📈</LinkIcon>
              <LinkName>IoT Analytics</LinkName>
              <LinkDesc>تحليلات بيانات IoT</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://700633997329-ggu6enoq.us-east-1.console.aws.amazon.com/iot/home?region=us-east-1#/connectdevice', '_blank')}>
              <LinkIcon>🔗</LinkIcon>
              <LinkName>AWS IoT Console</LinkName>
              <LinkDesc>وحدة تحكم AWS IoT</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://700633997329-ggu6enoq.us-east-1.console.aws.amazon.com/dynamodb/home?region=us-east-1#tables:', '_blank')}>
              <LinkIcon>🗄️</LinkIcon>
              <LinkName>DynamoDB Tables</LinkName>
              <LinkDesc>جداول بيانات IoT</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => window.open('https://700633997329-ggu6enoq.us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1', '_blank')}>
              <LinkIcon>📊</LinkIcon>
              <LinkName>CloudWatch</LinkName>
              <LinkDesc>مراقبة الأداء</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => navigate('/admin/integration-status')}>
              <LinkIcon>🔗</LinkIcon>
              <LinkName>Integration Status</LinkName>
              <LinkDesc>حالة تكامل الخدمات السحابية</LinkDesc>
            </LinkCard>

            <LinkCard onClick={() => navigate('/admin/setup')}>
              <LinkIcon>⚙️</LinkIcon>
              <LinkName>Quick Setup</LinkName>
              <LinkDesc>إعداد سريع للخدمات</LinkDesc>
            </LinkCard>
          </LinksGrid>
        </IoTManagementSection>

        {/* Reports Export Section */}
        <ReportsSection>
          <ReportsTitle>📊 تصدير التقارير</ReportsTitle>
          <ReportsGrid>
            {/* تقرير جميع المستخدمين */}
            <ReportCard>
              <ReportIcon>👥</ReportIcon>
              <ReportName>جميع المستخدمين</ReportName>
              <ReportButtons>
                <ExportBtn onClick={async () => {
                  const users = await usersReportService.getAllUsers();
                  const csv = await usersReportService.exportToCSV(users);
                  usersReportService.downloadReport(csv, 'all-users', 'csv');
                }}>
                  <FileSpreadsheet size={16} />
                  CSV
                </ExportBtn>
                <ExportBtn onClick={async () => {
                  const users = await usersReportService.getAllUsers();
                  const excel = await usersReportService.exportToExcel(users);
                  usersReportService.downloadReport(excel, 'all-users', 'xls');
                }}>
                  <FileSpreadsheet size={16} />
                  Excel
                </ExportBtn>
                <ExportBtn onClick={async () => {
                  const users = await usersReportService.getAllUsers();
                  const json = await usersReportService.exportToJSON(users);
                  usersReportService.downloadReport(json, 'all-users', 'json');
                }}>
                  <FileJson size={16} />
                  JSON
                </ExportBtn>
              </ReportButtons>
            </ReportCard>

            {/* تقرير المعارض */}
            <ReportCard>
              <ReportIcon>🏢</ReportIcon>
              <ReportName>المعارض</ReportName>
              <ReportButtons>
                <ExportBtn onClick={async () => {
                  const dealers = await usersReportService.getAllUsers({ profileType: 'dealer' });
                  const csv = await usersReportService.exportToCSV(dealers);
                  usersReportService.downloadReport(csv, 'dealers', 'csv');
                }}>
                  <FileSpreadsheet size={16} />
                  CSV
                </ExportBtn>
                <ExportBtn onClick={async () => {
                  const dealers = await usersReportService.getAllUsers({ profileType: 'dealer' });
                  const excel = await usersReportService.exportToExcel(dealers);
                  usersReportService.downloadReport(excel, 'dealers', 'xls');
                }}>
                  <FileSpreadsheet size={16} />
                  Excel
                </ExportBtn>
              </ReportButtons>
            </ReportCard>

            {/* تقرير جميع السيارات */}
            <ReportCard>
              <ReportIcon>
                <GlobulCarLogo size={32} />
              </ReportIcon>
              <ReportName>جميع السيارات</ReportName>
              <ReportButtons>
                <ExportBtn onClick={async () => {
                  const cars = await carsReportService.getAllCars();
                  const csv = await carsReportService.exportToCSV(cars);
                  carsReportService.downloadReport(csv, 'all-cars', 'csv');
                }}>
                  <FileSpreadsheet size={16} />
                  CSV
                </ExportBtn>
                <ExportBtn onClick={async () => {
                  const cars = await carsReportService.getAllCars();
                  const excel = await carsReportService.exportToExcel(cars);
                  carsReportService.downloadReport(excel, 'all-cars', 'xls');
                }}>
                  <FileSpreadsheet size={16} />
                  Excel
                </ExportBtn>
                <ExportBtn onClick={async () => {
                  const cars = await carsReportService.getAllCars();
                  const json = await carsReportService.exportToJSON(cars);
                  carsReportService.downloadReport(json, 'all-cars', 'json');
                }}>
                  <FileJson size={16} />
                  JSON
                </ExportBtn>
              </ReportButtons>
            </ReportCard>

            {/* تقرير سيارات صوفيا */}
            <ReportCard>
              <ReportIcon>🏙️</ReportIcon>
              <ReportName>سيارات صوفيا</ReportName>
              <ReportButtons>
                <ExportBtn onClick={async () => {
                  const cars = await carsReportService.getAllCars({ city: 'София' });
                  const csv = await carsReportService.exportToCSV(cars);
                  carsReportService.downloadReport(csv, 'sofia-cars', 'csv');
                }}>
                  <FileSpreadsheet size={16} />
                  CSV
                </ExportBtn>
                <ExportBtn onClick={async () => {
                  const cars = await carsReportService.getAllCars({ city: 'София' });
                  const excel = await carsReportService.exportToExcel(cars);
                  carsReportService.downloadReport(excel, 'sofia-cars', 'xls');
                }}>
                  <FileSpreadsheet size={16} />
                  Excel
                </ExportBtn>
              </ReportButtons>
            </ReportCard>

            {/* تقرير السيارات النشطة */}
            <ReportCard>
              <ReportIcon>✅</ReportIcon>
              <ReportName>السيارات النشطة</ReportName>
              <ReportButtons>
                <ExportBtn onClick={async () => {
                  const cars = await carsReportService.getAllCars({ status: 'active' });
                  const csv = await carsReportService.exportToCSV(cars);
                  carsReportService.downloadReport(csv, 'active-cars', 'csv');
                }}>
                  <FileSpreadsheet size={16} />
                  CSV
                </ExportBtn>
                <ExportBtn onClick={async () => {
                  const cars = await carsReportService.getAllCars({ status: 'active' });
                  const excel = await carsReportService.exportToExcel(cars);
                  carsReportService.downloadReport(excel, 'active-cars', 'xls');
                }}>
                  <FileSpreadsheet size={16} />
                  Excel
                </ExportBtn>
              </ReportButtons>
            </ReportCard>

            {/* تقرير المستخدمين المتحققين */}
            <ReportCard>
              <ReportIcon>✓</ReportIcon>
              <ReportName>المستخدمين المتحققين</ReportName>
              <ReportButtons>
                <ExportBtn onClick={async () => {
                  const users = await usersReportService.getAllUsers({ verifiedOnly: true });
                  const csv = await usersReportService.exportToCSV(users);
                  usersReportService.downloadReport(csv, 'verified-users', 'csv');
                }}>
                  <FileSpreadsheet size={16} />
                  CSV
                </ExportBtn>
                <ExportBtn onClick={async () => {
                  const users = await usersReportService.getAllUsers({ verifiedOnly: true });
                  const excel = await usersReportService.exportToExcel(users);
                  usersReportService.downloadReport(excel, 'verified-users', 'xls');
                }}>
                  <FileSpreadsheet size={16} />
                  Excel
                </ExportBtn>
              </ReportButtons>
            </ReportCard>

            {/* تقرير حصص AI */}
            <ReportCard>
              <ReportIcon>🤖</ReportIcon>
              <ReportName>حصص الذكاء الاصطناعي</ReportName>
              <ReportButtons>
                <ExportBtn onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/firestore/databases/-default-/data/~2Fai_quotas', '_blank')}>
                  <FileSpreadsheet size={16} />
                  View
                </ExportBtn>
              </ReportButtons>
            </ReportCard>

            {/* تقرير استخدام AI */}
            <ReportCard>
              <ReportIcon>📊</ReportIcon>
              <ReportName>سجل استخدام AI</ReportName>
              <ReportButtons>
                <ExportBtn onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/firestore/databases/-default-/data/~2Fai_usage_logs', '_blank')}>
                  <FileSpreadsheet size={16} />
                  View
                </ExportBtn>
              </ReportButtons>
            </ReportCard>
          </ReportsGrid>
        </ReportsSection>

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

// Styled footer for Super Admin only - Professional Minimal
const SuperAdminFooter = styled.footer`
  background: #ffffff;
  color: #1a1a1a;
  padding: 24px 0 16px 0;
  margin-top: 40px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
`;

const FooterStatsGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const FooterStat = styled.div`
  min-width: 100px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666666;
  margin-bottom: 4px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
`;

const FooterNote = styled.div`
  font-size: 12px;
  color: #999999;
  margin-top: 8px;
`;

// Reports Section Styles - Professional Minimal
// Firebase Links Section Styles
const FirebaseLinksSection = styled.div`
  padding: 24px 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #ffffff;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 16px;
  font-weight: 600;
`;

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
`;

const LinkCard = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.15s;
  text-align: center;
  
  &:hover {
    border-color: #999999;
  }
`;

const LinkIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const LinkName = styled.div`
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
  margin-bottom: 4px;
`;

const LinkDesc = styled.div`
  font-size: 11px;
  color: #666666;
`;

const AIManagementSection = styled.div`
  padding: 24px 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #ffffff;
`;

const IoTManagementSection = styled.div`
  padding: 24px 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #ffffff;
`;

const ReportsSection = styled.div`
  padding: 24px 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #ffffff;
`;

const ReportsTitle = styled.h3`
  font-size: 16px;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 16px;
  font-weight: 600;
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ReportCard = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  transition: border-color 0.15s;
  
  &:hover {
    border-color: #999999;
  }
`;

const ReportIcon = styled.div`
  font-size: 24px;
  text-align: center;
  margin-bottom: 8px;
`;

const ReportName = styled.div`
  font-size: 13px;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 12px;
  font-weight: 500;
`;

const ReportButtons = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ExportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
  
  &:hover {
    background: #333333;
  }
`;

export default SuperAdminDashboard;
