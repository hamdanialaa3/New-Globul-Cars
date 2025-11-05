import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Styled Components
const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
`;

const LoginTitle = styled.h1`
  color: #1c1e21;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-align: center;
`;

const LoginSubtitle = styled.p`
  color: #65676b;
  font-size: 16px;
  margin: 0 0 32px 0;
  text-align: center;
`;

const DirectAccessButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  background: ${props => props.$disabled ? '#e4e6ea' : '#28a745'};
  color: ${props => props.$disabled ? '#bcc0c4' : 'white'};
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  margin-bottom: 20px;

  &:hover:not(:disabled) {
    background: #218838;
  }
`;

const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 16px;
  margin-top: 16px;
  text-align: center;
  font-weight: 600;
`;

const AdminInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const AdminInfoTitle = styled.h3`
  color: #1c1e21;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const AdminInfoText = styled.p`
  color: #65676b;
  font-size: 14px;
  margin: 0 0 6px 0;
`;

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDirectAccess = () => {
    setLoading(true);
    setSuccess(null);

    // Simulate admin login
    setTimeout(() => {
      setSuccess('Admin access granted! Redirecting to admin panel...');
      
      // Store admin session in localStorage
      localStorage.setItem('adminUser', JSON.stringify({
        email: 'alaa.hamdani@yahoo.com',
        name: 'Alaa Hamid',
        role: 'super_admin',
        permissions: ['all'],
        loginTime: new Date().toISOString()
      }));

      // Redirect to admin panel
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    }, 1000);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginTitle>🔐 Admin Access</LoginTitle>
        <LoginSubtitle>Direct access to admin panel</LoginSubtitle>

        <DirectAccessButton onClick={handleDirectAccess} $disabled={loading}>
          {loading ? 'Accessing...' : '🚀 Access Admin Panel'}
        </DirectAccessButton>

        {success && <SuccessMessage>{success}</SuccessMessage>}

        <AdminInfo>
          <AdminInfoTitle>👤 Admin User Details</AdminInfoTitle>
          <AdminInfoText><strong>Email:</strong> alaa.hamdani@yahoo.com</AdminInfoText>
          <AdminInfoText><strong>Name:</strong> Alaa Hamid</AdminInfoText>
          <AdminInfoText><strong>Phone:</strong> +359879839671</AdminInfoText>
          <AdminInfoText><strong>Location:</strong> Sofia, Bulgaria</AdminInfoText>
          <AdminInfoText><strong>Role:</strong> Super Administrator</AdminInfoText>
          <AdminInfoText><strong>Permissions:</strong> Full Access</AdminInfoText>
        </AdminInfo>
      </LoginCard>
    </LoginContainer>
  );
};

export default AdminLoginPage;