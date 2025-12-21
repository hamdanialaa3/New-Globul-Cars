// AI Price Suggestion Component
// مكون اقتراح السعر الذكي

import React, { useState } from 'react';
import styled from 'styled-components';
import { geminiChatService } from '../../services/ai/gemini-chat.service';
import { useAuth } from '../../contexts/AuthProvider';
import { useToast } from '../../components/Toast';
import { PriceSuggestion } from '../../types/ai.types';

interface Props {
  carDetails: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    condition: string;
    location: string;
  };
  onPriceSelect?: (price: number) => void;
}

export const AIPriceSuggestion: React.FC<Props> = ({ carDetails, onPriceSelect }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleGetSuggestion = async () => {
    if (!geminiChatService.isReady()) {
      toast.error('AI service not configured');
      return;
    }

    setLoading(true);
    try {
      const result = await geminiChatService.suggestPrice(carDetails, user?.uid);
      setSuggestion(result);
    } catch (error: unknown) {
      if (error.message.includes('quota') || error.message.includes('limit')) {
        setShowUpgrade(true);
        toast.warning('Daily AI limit reached. Upgrade for unlimited suggestions.');
      } else {
        toast.error('Failed to get price suggestion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <Icon>💰</Icon>
          AI Price Suggestion
        </Title>
        <Badge>Powered by AI</Badge>
      </Header>

      {!suggestion ? (
        <ActionSection>
          <Description>
            Get an intelligent price suggestion based on current market data, 
            vehicle condition, and location.
          </Description>
          <SuggestButton onClick={handleGetSuggestion} disabled={loading}>
            {loading ? 'Analyzing...' : 'Get AI Price Suggestion'}
          </SuggestButton>
        </ActionSection>
      ) : (
        <ResultSection>
          <PriceRange>
            <PriceItem>
              <PriceLabel>Min Price</PriceLabel>
              <PriceValue>€{suggestion.minPrice.toLocaleString()}</PriceValue>
            </PriceItem>
            <PriceItem highlight>
              <PriceLabel>Recommended</PriceLabel>
              <PriceValue>€{suggestion.avgPrice.toLocaleString()}</PriceValue>
              <TrendBadge trend={suggestion.marketTrend}>
                {suggestion.marketTrend}
              </TrendBadge>
            </PriceItem>
            <PriceItem>
              <PriceLabel>Max Price</PriceLabel>
              <PriceValue>€{suggestion.maxPrice.toLocaleString()}</PriceValue>
            </PriceItem>
          </PriceRange>

          <Reasoning>
            <ReasoningTitle>Why this price?</ReasoningTitle>
            <ReasoningText>{suggestion.reasoning}</ReasoningText>
          </Reasoning>

          {onPriceSelect && (
            <ActionButtons>
              <UseButton onClick={() => onPriceSelect(suggestion.avgPrice)}>
                Use Recommended Price
              </UseButton>
              <RetryButton onClick={handleGetSuggestion}>
                Get New Suggestion
              </RetryButton>
            </ActionButtons>
          )}
        </ResultSection>
      )}

      {showUpgrade && (
        <UpgradePrompt>
          <span>Want unlimited AI suggestions?</span>
          <UpgradeLink href="/pricing">Upgrade Now</UpgradeLink>
        </UpgradePrompt>
      )}
    </Container>
  );
};

const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid #e5e7eb;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
`;

const Icon = styled.span`
  font-size: 24px;
`;

const Badge = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const ActionSection = styled.div`
  text-align: center;
`;

const Description = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const SuggestButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PriceRange = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PriceItem = styled.div<{ highlight?: boolean }>`
  background: ${p => p.highlight ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f9fafb'};
  color: ${p => p.highlight ? 'white' : '#1a1a1a'};
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: ${p => p.highlight ? 'none' : '1px solid #e5e7eb'};
  transform: ${p => p.highlight ? 'scale(1.05)' : 'scale(1)'};
  box-shadow: ${p => p.highlight ? '0 8px 24px rgba(102, 126, 234, 0.3)' : 'none'};
`;

const PriceLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  opacity: 0.8;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const PriceValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const TrendBadge = styled.span<{ trend: string }>`
  background: ${p => p.trend === 'high' ? '#10b981' : p.trend === 'low' ? '#ef4444' : '#f59e0b'};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const Reasoning = styled.div`
  background: #f9fafb;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const ReasoningTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const ReasoningText = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const UseButton = styled.button`
  flex: 1;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const RetryButton = styled.button`
  flex: 1;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const UpgradePrompt = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
`;

const UpgradeLink = styled.a`
  background: #f59e0b;
  color: white;
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;
