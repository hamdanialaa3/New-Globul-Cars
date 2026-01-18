/**
 * الصفحة الرئيسية لتسعير السيارات
 * Car Pricing Page
 */

import React from 'react';
import styled from 'styled-components';
import { PricingForm } from '../components/PricingForm';
import { PricingResult } from '../components/PricingResult';
import { usePricing } from '../hooks/usePricing';
import { CarSpecs } from '../types/pricing.types';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 40px;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoadingContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 16px;
  color: #991b1b;
  margin: 24px auto;
  max-width: 600px;
  text-align: center;
`;

export const CarPricingPage: React.FC = () => {
  const { calculatePrice, isLoading, error, result } = usePricing();

  const handleSubmit = async (specs: CarSpecs) => {
    await calculatePrice(specs);
  };

  return (
    <PageContainer>
      <Container>
        <PageTitle>تسعير السيارات بالذكاء الاصطناعي</PageTitle>
        <PageSubtitle>
          احصل على سعر دقيق لسيارتك بناءً على تحليل السوق البلغاري
        </PageSubtitle>

        <PricingForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <ErrorMessage>
            <strong>خطأ:</strong> {error}
          </ErrorMessage>
        )}

        {result && <PricingResult result={result} />}

        {isLoading && (
          <LoadingOverlay>
            <LoadingContent>
              <LoadingSpinner />
              <div>جاري تحليل السوق وحساب السعر...</div>
            </LoadingContent>
          </LoadingOverlay>
        )}
      </Container>
    </PageContainer>
  );
};
