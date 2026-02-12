import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Styled Components
const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #FF7900 0%, #FF8F10 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const LoginTitle = styled.h1`
  color: #1c1e21;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const LoginSubtitle = styled.p`
  color: #65676b;
  font-size: 16px;
  margin: 0 0 32px 0;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #FF7900;
    box-shadow: 0 0 0 3px rgba(255, 121, 0, 0.1);
  }
`;

const LoginButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  background: ${props => props.$disabled ? '#e4e6ea' : '#FF7900'};
  color: ${props => props.$disabled ? '#bcc0c4' : 'white'};
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  margin-top: 10px;

  &:hover:not(:disabled) {
    background: #e66d00;
    transform: translateY(-1px);
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Hardcoded credentials check
    if (username.toLowerCase() === 'hamdanialaa' && password === 'Alaa1983') {
      setTimeout(() => {
        // Store admin session in localStorage
        localStorage.setItem('adminUser', JSON.stringify({
          username: 'hamdanialaa',
          email: 'alaa.hamdani@yahoo.com',
          name: 'Alaa Hamid',
          role: 'super_admin',
          permissions: ['all'],
          loginTime: new Date().toISOString()
        }));

        navigate('/admin');
      }, 800);
    } else {
      setTimeout(() => {
        setError('Incorrect username or password');
        setLoading(false);
      }, 500);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginTitle>Admin Login</LoginTitle>
        <LoginSubtitle>Sign in to manage the platform</LoginSubtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <form onSubmit={handleLogin}>
          <InputGroup>
            <Label>Username</Label>
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          <LoginButton type="submit" $disabled={loading}>
            {loading ? 'Thinking...' : 'Sign In'}
          </LoginButton>
        </form>
      </LoginCard>
    </LoginContainer>
  );
};

export default AdminLoginPage;