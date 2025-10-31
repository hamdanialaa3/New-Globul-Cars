// Customer Number Badge Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Displays user's unique customer number

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { User } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import customerNumberService from '../../../services/customer-number.service';

interface CustomerNumberBadgeProps {
  userId: string;
}

const CustomerNumberBadge: React.FC<CustomerNumberBadgeProps> = ({ userId }) => {
  const { language } = useLanguage();
  const [customerNumber, setCustomerNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerNumber();
  }, [userId]);

  const loadCustomerNumber = async () => {
    try {
      setLoading(true);
      const number = await customerNumberService.getCustomerNumber(userId);
      setCustomerNumber(number);
    } catch (error) {
      console.error('Error loading customer number:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Badge>
        <Icon><User size={20} /></Icon>
        <Text>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </Text>
      </Badge>
    );
  }

  return (
    <Badge>
      <Icon><User size={20} /></Icon>
      <Content>
        <Text>
          {language === 'bg' 
            ? 'Вашият клиентски номер е:' 
            : 'Your customer number is:'}
        </Text>
        <Number>{customerNumber}</Number>
      </Content>
    </Badge>
  );
};

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 12px 16px;
    gap: 12px;
  }
`;

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #FF7900;
  border-radius: 50%;
  color: white;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const Text = styled.span`
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const Number = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #212529;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

export default CustomerNumberBadge;

