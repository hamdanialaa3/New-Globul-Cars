import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../services/logger-service';
import { VerificationQueue } from './components/VerificationQueue/VerificationQueue';
import { RevenueMonitor } from './components/RevenueMonitor/RevenueMonitor';
import { UserManager } from './components/UserManager/UserManager';
import { SearchAnalyticsDashboard } from './reports/SearchAnalyticsDashboard';
import { adminService } from '../../services/admin/admin-verification.service';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Shield, Users, CreditCard, LayoutDashboard, LogOut, CheckCircle, BarChart3 } from 'lucide-react';
import { toast } from 'react-toastify';

// --- STYLES ---
const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-primary);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-main);
  
  span {
    color: var(--text-primary);
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavItem = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(59, 130, 246, 0.1)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-main)' : 'var(--text-secondary)'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(59, 130, 246, 0.05);
    color: var(--primary-main);
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const StatsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatBadge = styled.div<{ active?: boolean }>`
  background: ${props => props.active ? 'var(--error-main)' : 'var(--bg-secondary)'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AccessDeniedContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  color: #ef4444;
  text-align: center;
  padding: 2rem;
`;

// --- SECURITY ---
// Hardcoded Super Admin Whitelist (MVP)
// In production, move this to specific detailed claims or Firestore permissions
const SUPER_ADMINS = [
  'hamdanialaa@gmile.com', // Active owner Admin (primary)
  'hamdanialaa@gmail.com', // Legacy owner email (migration support)
  'hamdanialaa3@gmail.com',
  'admin@koli.one',
  'admin@example.com' // Testing only
];

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'verifications' | 'revenue' | 'users' | 'analytics'>('verifications');
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Login form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      toast.success('Admin Authenticated');
    } catch (error: any) {
      setLoginError('Invalid credentials. Check your email and password.');
      toast.error('Authentication Failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    // Init Check
    if (!user) {
      // Wait for auth to settle or redirect
      // Assuming useAuth handles initial load state with a 'loading' flag separate from 'user'
      // For now, we'll just check if user exists. 
      // If the strict auth logic is elsewhere, this might flicker.
    }

    // Load counts
    const fetchCounts = async () => {
      try {
        const pendings = await adminService.getPendingVerifications();
        setPendingCount(pendings.length);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCounts();
  }, [user]);

  // --- SECURITY CHECK ---
  if (!user || (!SUPER_ADMINS.includes(user.email || ''))) {
    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Auth Checking...</div>;

    return (
      <AccessDeniedContainer>
        <Shield size={64} style={{ marginBottom: '1rem', color: '#3b82f6' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Command Center Login</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Please authenticate with higher privileges to access the Admin area.
        </p>

        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
          <input 
            type="email" 
            placeholder="Admin Email" 
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#1e293b' }}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#1e293b' }}
            required
          />
          {loginError && <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{loginError}</div>}
          
          <button
            type="submit"
            disabled={isLoggingIn}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              opacity: isLoggingIn ? 0.7 : 1
            }}
          >
            {isLoggingIn ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '2rem',
            background: 'transparent',
            color: '#64748b',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          Return to Hub
        </button>
      </AccessDeniedContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Logo>
          <Shield size={28} />
          Globul<span>Command</span>
        </Logo>

        <Nav>
          <NavItem
            active={activeTab === 'verifications'}
            onClick={() => setActiveTab('verifications')}
          >
            <CheckCircle size={18} /> Verifications
            {pendingCount > 0 && (
              <span style={{
                background: 'var(--error-main)',
                color: 'white',
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {pendingCount}
              </span>
            )}
          </NavItem>
          <NavItem
            active={activeTab === 'revenue'}
            onClick={() => setActiveTab('revenue')}
          >
            <CreditCard size={18} /> Revenue
          </NavItem>
          <NavItem
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Users (God Mode)
          </NavItem>
          <NavItem
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} /> Search Analytics
          </NavItem>
        </Nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{user.displayName || 'Super Admin'}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{user.email}</div>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-secondary)',
              padding: '0.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </Header>

      <Main>
        <StatsBar>
          <StatBadge active={pendingCount > 0}>
            {pendingCount} Pending Tasks
          </StatBadge>
          <StatBadge>
            System Status: Operational
          </StatBadge>
        </StatsBar>

        {activeTab === 'verifications' && <VerificationQueue />}
        {activeTab === 'revenue' && <RevenueMonitor />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'analytics' && <SearchAnalyticsDashboard />}
      </Main>
    </Container>
  );
};

export default AdminPage;
