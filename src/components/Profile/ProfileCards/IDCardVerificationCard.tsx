// ID Card Verification Card Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Bulgarian ID Card verification section

import React from 'react';
import styled from 'styled-components';
import { CreditCard, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface IDCardVerificationCardProps {
  isVerified: boolean;
  trustScore?: number;
  onEdit: () => void;
}

const IDCardVerificationCard: React.FC<IDCardVerificationCardProps> = ({
  isVerified,
  trustScore,
  onEdit
}) => {
  const { language } = useLanguage();

  return (
    <Card>
      <SectionHeader>
        <Title>
          <CreditCard size={20} />
          {language === 'bg' ? 'Лична карта' : 'ID Card'}
        </Title>
        <EditButton onClick={onEdit}>
          <Edit size={16} />
          {language === 'bg' ? 'Редактирай' : 'Edit'}
        </EditButton>
      </SectionHeader>

      <Description>
        {language === 'bg'
          ? 'Попълнете данните си директно върху изображение на личната ви карта. Системата автоматично ще извлече информация от ЕГН.'
          : 'Fill your data directly over your ID card image. System will automatically extract information from your personal number (EGN).'}
      </Description>

      {isVerified ? (
        <VerifiedSection>
          <VerifiedBadge>
            <CheckCircle size={20} />
            <VerifiedText>
              {language === 'bg' ? 'Потвърдено' : 'Verified'}
            </VerifiedText>
          </VerifiedBadge>
          {trustScore !== undefined && (
            <TrustScoreDisplay>
              <TrustScoreLabel>
                {language === 'bg' ? 'Trust Score:' : 'Trust Score:'}
              </TrustScoreLabel>
              <TrustScoreValue $score={trustScore}>
                {trustScore}/100
              </TrustScoreValue>
            </TrustScoreDisplay>
          )}
        </VerifiedSection>
      ) : (
        <NotVerifiedSection>
          <NotVerifiedBadge>
            <AlertCircle size={20} />
            <NotVerifiedText>
              {language === 'bg' ? 'Непотвърдено' : 'Not Verified'}
            </NotVerifiedText>
          </NotVerifiedBadge>
          <HelpText>
            {language === 'bg'
              ? 'Кликнете "Редактирай" за да добавите данните от личната си карта и да увеличите Trust Score.'
              : 'Click "Edit" to add your ID card data and increase your Trust Score.'}
          </HelpText>
        </NotVerifiedSection>
      )}

      <BenefitsList>
        <BenefitTitle>
          {language === 'bg' ? 'Предимства при потвърждение:' : 'Verification Benefits:'}
        </BenefitTitle>
        <BenefitItem>
          <CheckCircle size={16} />
          {language === 'bg' ? 'Увеличен Trust Score' : 'Increased Trust Score'}
        </BenefitItem>
        <BenefitItem>
          <CheckCircle size={16} />
          {language === 'bg' ? 'Достъп до премиум функции' : 'Access to premium features'}
        </BenefitItem>
        <BenefitItem>
          <CheckCircle size={16} />
          {language === 'bg' ? 'По-висока видимост на обявите' : 'Higher listing visibility'}
        </BenefitItem>
      </BenefitsList>
    </Card>
  );
};

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const EditButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8125rem;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.6;
  margin: 0 0 20px 0;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
    margin-bottom: 16px;
  }
`;

const VerifiedSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }
`;

const VerifiedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #155724;
  font-weight: 600;
  
  svg {
    flex-shrink: 0;
  }
`;

const VerifiedText = styled.span`
  font-size: 0.9375rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const TrustScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const TrustScoreLabel = styled.span`
  font-size: 0.875rem;
  color: #155724;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const TrustScoreValue = styled.span<{ $score: number }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => {
    if (props.$score >= 80) return '#28a745';
    if (props.$score >= 50) return '#ffc107';
    return '#dc3545';
  }};

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const NotVerifiedSection = styled.div`
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const NotVerifiedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #856404;
  font-weight: 600;
  margin-bottom: 8px;
`;

const NotVerifiedText = styled.span`
  font-size: 0.9375rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: #856404;
  line-height: 1.5;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const BenefitsList = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const BenefitTitle = styled.h4`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #495057;
  margin: 0 0 12px 0;

  @media (max-width: 768px) {
    font-size: 0.875rem;
    margin-bottom: 10px;
  }
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  color: #495057;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }

  svg {
    color: #28a745;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    font-size: 0.8125rem;
    gap: 8px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

export default IDCardVerificationCard;

