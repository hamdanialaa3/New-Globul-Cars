// src/pages/AdminDashboard.tsx
// Admin Dashboard Page for Koli One

import React, { useState, useEffect } from 'react';
import { logger } from '../../../../services/logger-service';
import styled from 'styled-components';
import { useTranslation } from '../../../../hooks/useTranslation';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { advancedContentManagementService } from '../../../../services/advanced-content-management-service';
import { permissionManagementService } from '../../../../services/permission-management-service';
import { adminService } from '../../../../services/admin-service';
import { monitoring } from '../../../../services/monitoring-service';

const AdminContainer = styled.div`
  min-height: 100vh;
  background-image: url('/assets/backgrounds/metal-bg-6.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  filter: blur(0.5px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(245, 245, 245, 0.7);
    z-index: 0;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
`;

const Header = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary.main};
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing.md} 0 0 0;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border-left: 4px solid ${({ theme }) => theme.colors.primary.main};
`;

const StatTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatChange = styled.div<{ positive?: boolean }>`
  font-size: 0.9rem;
  color: ${({ positive, theme }) =>
    positive ? '#4caf50' : '#f44336'};
  font-weight: 500;
`;

const TabsContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const TabButton = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ active, theme }) =>
    active ? theme.colors.primary.main : 'transparent'};
  color: ${({ active, theme }) =>
    active ? '#ffffff' : theme.colors.text.primary};
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ active, theme }) =>
      active ? theme.colors.primary.main : '#f5f5f5'};
  }
`;

const TabContent = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const TableHeader = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.default};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.grey[300]};
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' | 'success' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  margin-right: ${({ theme }) => theme.spacing.sm};
  transition: all 0.2s ease;

  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'danger':
        return theme.colors.error.main;
      case 'success':
        return '#4caf50';
      default:
        return theme.colors.primary.main;
    }
  }};

  color: #ffffff;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span<{ status: 'active' | 'inactive' | 'pending' | 'suspended' | 'success' | 'sold' }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;

  background: ${({ status, theme }) => {
    switch (status) {
      case 'active':
        return theme.colors.success.light;
      case 'success':
      case 'sold':
        return '#4caf50';
      case 'inactive':
        return theme.colors.warning.light;
      case 'pending':
        return theme.colors.info.light;
      case 'suspended':
        return theme.colors.error.light;
      default:
        return theme.colors.grey[300];
    }
  }};

  color: ${({ status, theme }) => {
    switch (status) {
      case 'active':
        return theme.colors.success.dark;
      case 'success':
      case 'sold':
        return '#ffffff';
      case 'inactive':
        return theme.colors.warning.dark;
      case 'pending':
        return theme.colors.info.dark;
      case 'suspended':
        return theme.colors.error.dark;
      default:
        return theme.colors.grey[700];
    }
  }};
`;

interface User {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastLogin?: Date;
}

interface Car {
  id: string;
  title: string;
  price: number;
  userId: string;
  userName: string;
  status: 'active' | 'sold' | 'pending';
  createdAt: Date;
  views: number;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'users' | 'cars' | 'analytics' | 'messages' | 'reports' | 'permissions' | 'settings' | 'audit' | 'data' | 'owner'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    activeListings: 0,
    totalRevenue: 0
  });
  
  // حالات إضافية لكل تبويب
  interface MessageItem {
    id: string;
    [key: string]: unknown;
  }
  
  interface ReportItem {
    id: string;
    [key: string]: unknown;
  }
  
  interface PermissionItem {
    id: string;
    [key: string]: unknown;
  }
  
  interface RoleItem {
    id: string;
    [key: string]: unknown;
  }
  
  interface AuditLogItem {
    id: string;
    [key: string]: unknown;
  }

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [exportedData, setExportedData] = useState<string>('');
  const [ownerStats, setOwnerStats] = useState<Record<string, unknown>>({});
  const [systemSettings, setSystemSettings] = useState<Record<string, unknown>>({});
  const [loadingTab, setLoadingTab] = useState<string>('');

  // تحميل بيانات التبويبات عند التغيير
  useEffect(() => {
    if (activeTab === 'messages') {
      setLoadingTab('messages');
      getDocs(collection(db, 'messages')).then(snapshot => {
        setMessages(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
        setLoadingTab('');
      });
    }
    if (activeTab === 'reports') {
      setLoadingTab('reports');
      advancedContentManagementService.getAllReports(100).then(setReports).finally(() => setLoadingTab(''));
    }
    if (activeTab === 'permissions') {
      setLoadingTab('permissions');
      Promise.all([
        permissionManagementService.getPermissionTemplates(),
        permissionManagementService.getRoleTemplates()
      ]).then(([perms, roles]) => {
        setPermissions(perms);
        setRoles(roles);
        setLoadingTab('');
      });
    }
    if (activeTab === 'audit') {
      setLoadingTab('audit');
      getDocs(collection(db, 'audit_logs')).then(snapshot => {
        setAuditLogs(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
        setLoadingTab('');
      });
    }
    if (activeTab === 'data') {
      setLoadingTab('data');
      advancedContentManagementService.exportContentData('cars', 'json').then(setExportedData).finally(() => setLoadingTab(''));
    }
    if (activeTab === 'owner') {
      setLoadingTab('owner');
      adminService.getSystemStats().then(setOwnerStats).finally(() => setLoadingTab(''));
    }
    if (activeTab === 'settings') {
      setLoadingTab('settings');
      // إعدادات النظام (محاكاة)
      setSystemSettings({ language: 'bg', notifications: true, theme: 'light', currency: 'EUR' });
      setLoadingTab('');
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLogin: doc.data().lastLogin?.toDate()
      })) as User[];
      setUsers(usersData);

      // Load cars
      const carsSnapshot = await getDocs(collection(db, 'cars'));
      const carsData = carsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Car[];
      setCars(carsData);

      // Calculate stats
      setStats({
        totalUsers: usersData.length,
        totalCars: carsData.length,
        activeListings: carsData.filter((car: any) => car.status === 'active').length,
        totalRevenue: carsData.filter((car: any) => car.status === 'sold').length * 100 // Mock revenue calculation
      });

    } catch (error) {
      logger.error('Error loading admin data', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      setUsers(users.map((user: any) =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      logger.error('Error updating user status', error as Error, { userId, newStatus });
    }
  };

  const handleCarStatusChange = async (carId: string, newStatus: Car['status']) => {
    try {
      await updateDoc(doc(db, 'cars', carId), { status: newStatus });
      setCars(cars.map((car: any) =>
        car.id === carId ? { ...car, status: newStatus } : car
      ));
    } catch (error) {
      logger.error('Error updating car status', error as Error, { carId, newStatus });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(t('admin.confirmDeleteUser'))) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter((user: any) => user.id !== userId));
      } catch (error) {
        logger.error('Error deleting user', error as Error, { userId });
      }
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (window.confirm(t('admin.confirmDeleteCar'))) {
      try {
        await deleteDoc(doc(db, 'cars', carId));
        setCars(cars.filter((car: any) => car.id !== carId));
      } catch (error) {
        logger.error('Error deleting car', error as Error, { carId });
      }
    }
  };

  const getCarStatusBadge = (status: Car['status']) => {
    switch (status) {
      case 'active':
        return 'active';
      case 'sold':
        return 'success';
      case 'pending':
        return 'pending';
      default:
        return 'pending';
    }
  };

  if (loading) {
    return (
      <AdminContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {t('common.loading')}
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Header>
        <Title>{t('admin.dashboard')}</Title>
        <Subtitle>{t('admin.welcomeMessage')}</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatTitle>{t('admin.totalUsers')}</StatTitle>
          <StatValue>{stats.totalUsers}</StatValue>
          <StatChange positive>+12%</StatChange>
        </StatCard>

        <StatCard>
          <StatTitle>{t('admin.totalCars')}</StatTitle>
          <StatValue>{stats.totalCars}</StatValue>
          <StatChange positive>+8%</StatChange>
        </StatCard>

        <StatCard>
          <StatTitle>{t('admin.activeListings')}</StatTitle>
          <StatValue>{stats.activeListings}</StatValue>
          <StatChange positive>+15%</StatChange>
        </StatCard>

        <StatCard>
          <StatTitle>{t('admin.totalRevenue')}</StatTitle>
          <StatValue>{stats.totalRevenue} €</StatValue>
          <StatChange positive>+22%</StatChange>
        </StatCard>
      </StatsGrid>

      <TabsContainer>
        <TabButtons>
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>{t('admin.users')}</TabButton>
          <TabButton active={activeTab === 'cars'} onClick={() => setActiveTab('cars')}>{t('admin.cars')}</TabButton>
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>{t('admin.analytics')}</TabButton>
          <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')}>{t('admin.messages')}</TabButton>
          <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>{t('admin.reports')}</TabButton>
          <TabButton active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')}>{t('admin.permissions')}</TabButton>
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>{t('admin.settings')}</TabButton>
          <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')}>{t('admin.audit')}</TabButton>
          <TabButton active={activeTab === 'data'} onClick={() => setActiveTab('data')}>{t('admin.data')}</TabButton>
          <TabButton active={activeTab === 'owner'} onClick={() => setActiveTab('owner')}>{t('admin.owner')}</TabButton>
        </TabButtons>

        <TabContent>
          {activeTab === 'users' && (
            <div>
              <h2>{t('admin.userManagement')}</h2>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>{t('admin.name')}</TableHeader>
                    <TableHeader>{t('admin.email')}</TableHeader>
                    <TableHeader>{t('admin.phone')}</TableHeader>
                    <TableHeader>{t('admin.status')}</TableHeader>
                    <TableHeader>{t('admin.role')}</TableHeader>
                    <TableHeader>{t('admin.createdAt')}</TableHeader>
                    <TableHeader>{t('admin.actions')}</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id}>
                      <TableCell>{user.displayName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge status={user.status}>
                          {t(`admin.status.${user.status}`)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{t(`admin.role.${user.role}`)}</TableCell>
                      <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <ActionButton variant="success" onClick={() => handleUserStatusChange(user.id, 'active')} disabled={user.status === 'active'}>{t('admin.activate')}</ActionButton>
                        <ActionButton variant="danger" onClick={() => handleUserStatusChange(user.id, 'suspended')} disabled={user.status === 'suspended'}>{t('admin.suspend')}</ActionButton>
                        <ActionButton variant="danger" onClick={() => handleDeleteUser(user.id)}>{t('admin.delete')}</ActionButton>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          {activeTab === 'cars' && (
            <div>
              <h2>{t('admin.carManagement')}</h2>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>{t('admin.title')}</TableHeader>
                    <TableHeader>{t('admin.price')}</TableHeader>
                    <TableHeader>{t('admin.seller')}</TableHeader>
                    <TableHeader>{t('admin.status')}</TableHeader>
                    <TableHeader>{t('admin.views')}</TableHeader>
                    <TableHeader>{t('admin.createdAt')}</TableHeader>
                    <TableHeader>{t('admin.actions')}</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car: any) => (
                    <tr key={car.id}>
                      <TableCell>{car.title}</TableCell>
                      <TableCell>{car.price} €</TableCell>
                      <TableCell>{car.userName}</TableCell>
                      <TableCell>
                        <StatusBadge status={getCarStatusBadge(car.status)}>{t(`admin.carStatus.${car.status}`)}</StatusBadge>
                      </TableCell>
                      <TableCell>{car.views}</TableCell>
                      <TableCell>{car.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <ActionButton variant="success" onClick={() => handleCarStatusChange(car.id, 'active')} disabled={car.status === 'active'}>{t('admin.approve')}</ActionButton>
                        <ActionButton variant="primary" onClick={() => handleCarStatusChange(car.id, 'sold')} disabled={car.status === 'sold'}>{t('admin.markSold')}</ActionButton>
                        <ActionButton variant="danger" onClick={() => handleDeleteCar(car.id)}>{t('admin.delete')}</ActionButton>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div>
              <h2>{t('admin.analytics')}</h2>
              <pre>{JSON.stringify(monitoring.getAnalyticsDashboard(), null, 2)}</pre>
            </div>
          )}
          {activeTab === 'messages' && (
            <div>
              <h2>{t('admin.messages')}</h2>
              {loadingTab === 'messages' ? <p>جاري التحميل...</p> : (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>المُرسل</TableHeader>
                      <TableHeader>المستلم</TableHeader>
                      <TableHeader>النص</TableHeader>
                      <TableHeader>تاريخ الإرسال</TableHeader>
                      <TableHeader>إجراءات</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(msg => (
                      <tr key={msg.id}>
                        <TableCell>{msg.senderName || msg.senderId}</TableCell>
                        <TableCell>{msg.receiverName || msg.receiverId}</TableCell>
                        <TableCell>{msg.text}</TableCell>
                        <TableCell>{msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <ActionButton variant="danger" onClick={async () => {
                            await deleteDoc(doc(db, 'messages', msg.id));
                            setMessages(messages.filter(m => m.id !== msg.id));
                          }}>حذف</ActionButton>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          )}
          {activeTab === 'reports' && (
            <div>
              <h2>{t('admin.reports')}</h2>
              {loadingTab === 'reports' ? <p>جاري التحميل...</p> : (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>المحتوى</TableHeader>
                      <TableHeader>النوع</TableHeader>
                      <TableHeader>المُبلغ</TableHeader>
                      <TableHeader>السبب</TableHeader>
                      <TableHeader>الوصف</TableHeader>
                      <TableHeader>الأولوية</TableHeader>
                      <TableHeader>الحالة</TableHeader>
                      <TableHeader>إجراءات</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id}>
                        <TableCell>{report.contentId}</TableCell>
                        <TableCell>{report.contentType}</TableCell>
                        <TableCell>{report.reporterEmail}</TableCell>
                        <TableCell>{report.reason}</TableCell>
                        <TableCell>{report.description}</TableCell>
                        <TableCell>{report.priority}</TableCell>
                        <TableCell>{report.status}</TableCell>
                        <TableCell>
                          <ActionButton variant="success" onClick={async () => {
                            await advancedContentManagementService.reviewReport(report.id, 'approve', 'super_admin');
                            setReports(reports.filter(r => r.id !== report.id));
                          }}>موافقة</ActionButton>
                          <ActionButton variant="danger" onClick={async () => {
                            await advancedContentManagementService.reviewReport(report.id, 'dismiss', 'super_admin');
                            setReports(reports.filter(r => r.id !== report.id));
                          }}>رفض</ActionButton>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          )}
          {activeTab === 'permissions' && (
            <div>
              <h2>{t('admin.permissions')}</h2>
              {loadingTab === 'permissions' ? <p>جاري التحميل...</p> : (
                <div>
                  <h3>الصلاحيات</h3>
                  <ul>
                    {permissions.map(p => <li key={p.id}>{p.name} ({p.level})</li>)}
                  </ul>
                  <h3>الأدوار</h3>
                  <ul>
                    {roles.map(r => <li key={r.id}>{r.name} ({r.level})</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
          {activeTab === 'settings' && (
            <div>
              <h2>{t('admin.settings')}</h2>
              <form>
                <label>اللغة:
                  <select value={systemSettings.language} onChange={e => setSystemSettings({ ...systemSettings, language: e.target.value })}>
                    <option value="bg">بلغارية</option>
                    <option value="en">إنجليزية</option>
                  </select>
                </label>
                <label>الإشعارات:
                  <input type="checkbox" checked={systemSettings.notifications} onChange={e => setSystemSettings({ ...systemSettings, notifications: e.target.checked })} />
                </label>
                <label>الثيم:
                  <select value={systemSettings.theme} onChange={e => setSystemSettings({ ...systemSettings, theme: e.target.value })}>
                    <option value="light">فاتح</option>
                    <option value="dark">داكن</option>
                  </select>
                </label>
                <label>العملة:
                  <select value={systemSettings.currency} onChange={e => setSystemSettings({ ...systemSettings, currency: e.target.value })}>
                    <option value="EUR">يورو</option>
                  </select>
                </label>
                <button type="button" onClick={() => alert('تم حفظ الإعدادات!')}>حفظ</button>
              </form>
            </div>
          )}
          {activeTab === 'audit' && (
            <div>
              <h2>{t('admin.audit')}</h2>
              {loadingTab === 'audit' ? <p>جاري التحميل...</p> : (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>الحدث</TableHeader>
                      <TableHeader>المستخدم</TableHeader>
                      <TableHeader>IP</TableHeader>
                      <TableHeader>النتيجة</TableHeader>
                      <TableHeader>التاريخ</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <TableCell>{log.event}</TableCell>
                        <TableCell>{log.userId}</TableCell>
                        <TableCell>{log.ip}</TableCell>
                        <TableCell>{log.result}</TableCell>
                        <TableCell>{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : '-'}</TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          )}
          {activeTab === 'data' && (
            <div>
              <h2>{t('admin.data')}</h2>
              {loadingTab === 'data' ? <p>جاري التحميل...</p> : (
                <div>
                  <button onClick={async () => {
                    const data = await advancedContentManagementService.exportContentData('cars', 'json');
                    setExportedData(data);
                  }}>تصدير سيارات (JSON)</button>
                  <button onClick={async () => {
                    const data = await advancedContentManagementService.exportContentData('cars', 'csv');
                    setExportedData(data);
                  }}>تصدير سيارات (CSV)</button>
                  <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f8f9fa', padding: 10 }}>{exportedData}</pre>
                </div>
              )}
            </div>
          )}
          {activeTab === 'owner' && (
            <div>
              <h2>{t('admin.owner')}</h2>
              {loadingTab === 'owner' ? <p>جاري التحميل...</p> : (
                <div>
                  <h3>إحصائيات النظام</h3>
                  <ul>
                    <li>عدد المستخدمين: {ownerStats.totalUsers}</li>
                    <li>عدد السيارات: {ownerStats.totalCars}</li>
                    <li>عدد الرسائل: {ownerStats.totalMessages}</li>
                    <li>عدد المدراء: {ownerStats.totalAdmins}</li>
                  </ul>
                  <button onClick={() => window.location.reload()}>تحديث شامل</button>
                  <button onClick={() => alert('تم تسجيل الخروج!')}>تسجيل الخروج</button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div>
              <h2>{t('admin.reports')}</h2>
              {loadingTab === 'reports' ? <p>جاري التحميل...</p> : (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>المحتوى</TableHeader>
                      <TableHeader>النوع</TableHeader>
                      <TableHeader>المُبلغ</TableHeader>
                      <TableHeader>السبب</TableHeader>
                      <TableHeader>الوصف</TableHeader>
                      <TableHeader>الأولوية</TableHeader>
                      <TableHeader>الحالة</TableHeader>
                      <TableHeader>إجراءات</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id}>
                        <TableCell>{report.contentId}</TableCell>
                        <TableCell>{report.contentType}</TableCell>
                        <TableCell>{report.reporterEmail}</TableCell>
                        <TableCell>{report.reason}</TableCell>
                        <TableCell>{report.description}</TableCell>
                        <TableCell>{report.priority}</TableCell>
                        <TableCell>{report.status}</TableCell>
                        <TableCell>
                          <ActionButton variant="success" onClick={async () => {
                            await advancedContentManagementService.reviewReport(report.id, 'approve', 'super_admin');
                            setReports(reports.filter(r => r.id !== report.id));
                          }}>موافقة</ActionButton>
                          <ActionButton variant="danger" onClick={async () => {
                            await advancedContentManagementService.reviewReport(report.id, 'dismiss', 'super_admin');
                            setReports(reports.filter(r => r.id !== report.id));
                          }}>رفض</ActionButton>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          )}
          
          {activeTab === 'permissions' && (
            <div>
              <h2>{t('admin.permissions')}</h2>
              {loadingTab === 'permissions' ? <p>جاري التحميل...</p> : (
                <div>
                  <h3>الصلاحيات</h3>
                  <ul>
                    {permissions.map(p => <li key={p.id}>{p.name} ({p.level})</li>)}
                  </ul>
                  <h3>الأدوار</h3>
                  <ul>
                    {roles.map(r => <li key={r.id}>{r.name} ({r.level})</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              <h2>{t('admin.settings')}</h2>
              <form>
                <label>اللغة:
                  <select value={systemSettings.language} onChange={e => setSystemSettings({ ...systemSettings, language: e.target.value })}>
                    <option value="bg">بلغارية</option>
                    <option value="en">إنجليزية</option>
                  </select>
                </label>
                <label>الإشعارات:
                  <input type="checkbox" checked={systemSettings.notifications} onChange={e => setSystemSettings({ ...systemSettings, notifications: e.target.checked })} />
                </label>
                <label>الثيم:
                  <select value={systemSettings.theme} onChange={e => setSystemSettings({ ...systemSettings, theme: e.target.value })}>
                    <option value="light">فاتح</option>
                    <option value="dark">داكن</option>
                  </select>
                </label>
                <label>العملة:
                  <select value={systemSettings.currency} onChange={e => setSystemSettings({ ...systemSettings, currency: e.target.value })}>
                    <option value="EUR">يورو</option>
                  </select>
                </label>
                <button type="button" onClick={() => alert('تم حفظ الإعدادات!')}>حفظ</button>
              </form>
            </div>
          )}
          
          {activeTab === 'audit' && (
            <div>
              <h2>{t('admin.audit')}</h2>
              {loadingTab === 'audit' ? <p>جاري التحميل...</p> : (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>الحدث</TableHeader>
                      <TableHeader>المستخدم</TableHeader>
                      <TableHeader>IP</TableHeader>
                      <TableHeader>النتيجة</TableHeader>
                      <TableHeader>التاريخ</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <TableCell>{log.event}</TableCell>
                        <TableCell>{log.userId}</TableCell>
                        <TableCell>{log.ip}</TableCell>
                        <TableCell>{log.result}</TableCell>
                        <TableCell>{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : '-'}</TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          )}
          
          {activeTab === 'data' && (
            <div>
              <h2>{t('admin.data')}</h2>
              {loadingTab === 'data' ? <p>جاري التحميل...</p> : (
                <div>
                  <button onClick={async () => {
                    const data = await advancedContentManagementService.exportContentData('cars', 'json');
                    setExportedData(data);
                  }}>تصدير سيارات (JSON)</button>
                  <button onClick={async () => {
                    const data = await advancedContentManagementService.exportContentData('cars', 'csv');
                    setExportedData(data);
                  }}>تصدير سيارات (CSV)</button>
                  <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f8f9fa', padding: 10 }}>{exportedData}</pre>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'owner' && (
            <div>
              <h2>{t('admin.owner')}</h2>
              {loadingTab === 'owner' ? <p>جاري التحميل...</p> : (
                <div>
                  <h3>إحصائيات النظام</h3>
                  <ul>
                    <li>عدد المستخدمين: {ownerStats.totalUsers}</li>
                    <li>عدد السيارات: {ownerStats.totalCars}</li>
                    <li>عدد الرسائل: {ownerStats.totalMessages}</li>
                    <li>عدد المدراء: {ownerStats.totalAdmins}</li>
                  </ul>
                  <button onClick={() => window.location.reload()}>تحديث شامل</button>
                  <button onClick={() => alert('تم تسجيل الخروج!')}>تسجيل الخروج</button>
                </div>
              )}
            </div>
          )}
                  </TabContent>
                </TabsContainer>
              </AdminContainer>
            );
          };

export default AdminDashboard;