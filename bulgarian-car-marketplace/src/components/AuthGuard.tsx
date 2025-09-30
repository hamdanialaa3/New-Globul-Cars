import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import styled from 'styled-components';

const LoginRequiredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  text-align: center;
`;

const MessageCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 100%;
`;

const LockIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: #ff6b6b;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.8rem;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }
`;

const BackButton = styled(LoginButton)`
  background: #6c757d;
  
  &:hover {
    background: #5a6268;
  }
`;

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const LoginRequiredMessage: React.FC = () => {
  const location = useLocation();
  
  const handleLogin = () => {
    // توجيه إلى صفحة تسجيل الدخول
    window.location.href = '/login';
  };

  const handleBack = () => {
    // العودة للصفحة الرئيسية
    window.location.href = '/';
  };

  const getPageName = (pathname: string) => {
    const pageNames: { [key: string]: string } = {
      '/advanced-search': 'البحث المتقدم',
      '/sell': 'بيع السيارة',
      '/sell-car': 'بيع السيارة',
      '/brand-gallery': 'معرض العلامات التجارية',
      '/dealers': 'الوكلاء',
      '/finance': 'التمويل'
    };
    return pageNames[pathname] || 'هذه الصفحة';
  };

  return (
    <LoginRequiredContainer>
      <MessageCard>
        <LockIcon>🔒</LockIcon>
        <Title>تسجيل الدخول مطلوب</Title>
        <Message>
          للوصول إلى <strong>{getPageName(location.pathname)}</strong>، 
          يجب عليك تسجيل الدخول أولاً.
          <br /><br />
          سجل دخولك للاستمتاع بجميع المميزات والخدمات المتاحة.
        </Message>
        <div>
          <LoginButton onClick={handleLogin}>
            🔑 تسجيل الدخول
          </LoginButton>
          <BackButton onClick={handleBack}>
            🏠 العودة للرئيسية
          </BackButton>
        </div>
      </MessageCard>
    </LoginRequiredContainer>
  );
};

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = false }) => {
  const { user, loading } = useAuth();

  // إذا كان التحميل جارياً
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>جاري التحميل...</div>
      </div>
    );
  }

  // إذا كانت الصفحة تتطلب تسجيل دخول ولم يسجل المستخدم دخوله
  if (requireAuth && !user) {
    return <LoginRequiredMessage />;
  }

  // إذا كان كل شيء على ما يرام، عرض المحتوى
  return <>{children}</>;
};

export default AuthGuard;