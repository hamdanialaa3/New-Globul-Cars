/**
 * Favorites Redirect Page
 * 
 * Automatically redirects to user's favorites page based on authentication status
 * - Authenticated: /profile/{userNumericId}/favorites
 * - Not authenticated: /login with redirect back
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import * as StyledComponents from 'styled-components';
import { Heart } from 'lucide-react';

import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { db } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';

const styled = StyledComponents.default;
const keyframes = StyledComponents.keyframes;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoadingCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s ease-in-out infinite;

  svg {
    width: 40px;
    height: 40px;
    color: #fff;
    fill: #fff;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 12px 0;
`;

const Message = styled.p`
  font-size: 1rem;
  color: #718096;
  margin: 0 0 32px 0;
  line-height: 1.6;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const ErrorCard = styled(LoadingCard)`
  background: rgba(255, 255, 255, 0.98);
`;

const ErrorIcon = styled(IconWrapper)`
  background: #fc8181;
`;

const ErrorButton = styled.button`
  padding: 12px 32px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
`;

export const FavoritesRedirectPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const redirectToFavorites = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Not authenticated - redirect to login
      if (!user) {
        logger.info('[FavoritesRedirect] User not authenticated, redirecting to login');
        navigate('/login?redirect=/favorites');
        return;
      }

      try {
        // Get user's numeric ID from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          throw new Error('User document not found');
        }

        const userData = userDoc.data();
        const numericId = userData?.numericId;

        if (!numericId) {
          throw new Error('User numeric ID not found');
        }

        logger.info('[FavoritesRedirect] Redirecting to user favorites', {
          userId: user.uid,
          numericId
        });

        // Redirect to user's favorites page
        navigate(`/profile/${numericId}/favorites`, { replace: true });
      } catch (err) {
        logger.error('[FavoritesRedirect] Failed to redirect', err as Error);
        setError(
          language === 'bg'
            ? 'Грешка при зареждане на профила. Моля, опитайте отново.'
            : 'Error loading profile. Please try again.'
        );
      }
    };

    redirectToFavorites();
  }, [user, authLoading, navigate, language]);

  if (error) {
    return (
      <Container>
        <ErrorCard>
          <ErrorIcon>
            <Heart />
          </ErrorIcon>
          <Title>
            {language === 'bg' ? 'Грешка' : 'Error'}
          </Title>
          <Message>{error}</Message>
          <ErrorButton onClick={() => navigate('/cars')}>
            {language === 'bg' ? 'Към обявите' : 'Browse Cars'}
          </ErrorButton>
        </ErrorCard>
      </Container>
    );
  }

  return (
    <Container>
      <LoadingCard>
        <IconWrapper>
          <Heart />
        </IconWrapper>
        <Title>
          {language === 'bg' ? 'Моите любими' : 'My Favorites'}
        </Title>
        <Message>
          {authLoading
            ? (language === 'bg' ? 'Проверка на автентикацията...' : 'Checking authentication...')
            : (language === 'bg' ? 'Пренасочване...' : 'Redirecting...')
          }
        </Message>
        <Spinner />
      </LoadingCard>
    </Container>
  );
};

export default FavoritesRedirectPage;
