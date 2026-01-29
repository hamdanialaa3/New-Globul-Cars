/**
 * 🔴 CRITICAL: No Campaigns Empty State Component
 * مكون الحالة الفارغة للحملات
 * 
 * @constitution
 * - Follows PROJECT_CONSTITUTION.md rules
 * - Uses PascalCase for component name (CONSTITUTION Section 2.2)
 * 
 * @author CTO & Lead Architect
 * @date January 2026
 */

import React from 'react';
import styled from 'styled-components';
import { Megaphone, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NoCampaignsProps {
  onCreateCampaign?: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 300px;
`;

const IconWrapper = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  
  svg {
    color: #FB923C;
    opacity: 0.7;
  }
`;

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 12px 0;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #6B7280;
  margin: 0 0 24px 0;
  line-height: 1.6;
  max-width: 400px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
  color: white;
  border: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
  }
`;

const NoCampaigns: React.FC<NoCampaignsProps> = ({ onCreateCampaign }) => {
  const { language } = useLanguage();
  const isBg = language === 'bg';

  return (
    <Container>
      <IconWrapper>
        <Megaphone size={48} />
      </IconWrapper>
      
      <Title>
        {isBg ? 'Няма кампании' : 'No Campaigns'}
      </Title>
      
      <Description>
        {isBg
          ? 'Все още нямате маркетингови кампании. Създайте кампания, за да увеличите видимостта на вашите обяви.'
          : "You don't have any marketing campaigns yet. Create a campaign to increase the visibility of your listings."}
      </Description>

      {onCreateCampaign && (
        <Button onClick={onCreateCampaign}>
          <Plus size={18} />
          {isBg ? 'Създай кампания' : 'Create Campaign'}
        </Button>
      )}
    </Container>
  );
};

export default NoCampaigns;
