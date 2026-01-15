import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts';

const Container = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Message = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#ffffff'};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    transform: translateY(-1px);
  }
`;

const Hint = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
  border: 1px solid ${({ theme }) => theme.colors.border.muted};
  border-radius: 12px;
  padding: 14px 16px;
  width: 100%;
  max-width: 640px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const CarNotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { sellerNumericId, carNumericId } = useParams();
  const { language } = useLanguage();

  const title = language === 'bg' ? 'Обявата не е налична' : 'Listing not available';
  const message = language === 'bg'
    ? `Обявата ${carNumericId || ''} на продавач ${sellerNumericId || ''} липсва или е архивирана.`
    : `Listing ${carNumericId || ''} for seller ${sellerNumericId || ''} is missing or archived.`;

  return (
    <Container>
      <Title>{title}</Title>
      <Message>{message}</Message>
      <Hint>
        {language === 'bg'
          ? 'Възможни причини: обявата е продадена, изтрита или линкът е неправилен. Можете да продължите към търсене или профила на продавача.'
          : 'Possible reasons: the listing was sold, deleted, or the link is incorrect. You can continue to search or open the seller profile.'}
      </Hint>
      <ActionRow>
        <Button onClick={() => navigate('/search')}>
          {language === 'bg' ? 'Търсене на други коли' : 'Browse cars'}
        </Button>
        {sellerNumericId && (
          <Button onClick={() => navigate(`/profile/view/${sellerNumericId}`)}>
            {language === 'bg' ? 'Профил на продавача' : 'Seller profile'}
          </Button>
        )}
      </ActionRow>
    </Container>
  );
};

export default CarNotFoundPage;
