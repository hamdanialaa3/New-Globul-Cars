// src/pages/InvoicesPage.tsx
// Invoices Management Page
// Connected to Backend P2.2 Billing System

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  getInvoices,
  updateInvoiceStatus,
  sendInvoiceEmail,
  Invoice,
  formatCurrency,
  formatDate,
  getInvoiceStatusColor,
  getInvoiceStatusText,
} from '../services/billing-service';

// ==================== STYLED COMPONENTS ====================

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
`;

const PageHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const PageSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const FiltersBar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4267b2;
  }
`;

const InvoicesGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const InvoiceCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const InvoiceNumber = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
`;

const InvoiceDate = styled.p`
  font-size: 13px;
  color: #999;
  margin: 0;
`;

const StatusBadge = styled.span<{ $color?: string }>`
  background: ${props => props.$color || '#e0e0e0'};
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const InvoiceBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const InfoSection = styled.div``;

const InfoLabel = styled.p`
  font-size: 12px;
  color: #999;
  margin: 0 0 4px 0;
`;

const InfoValue = styled.p`
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin: 0 0 12px 0;
`;

const InvoiceFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const TotalAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #4267b2;
`;

const InvoiceActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #4267b2;
          color: white;
          &:hover { background: #365899; }
        `;
      case 'success':
        return `
          background: #4caf50;
          color: white;
          &:hover { background: #388e3c; }
        `;
      case 'danger':
        return `
          background: #f44336;
          color: white;
          &:hover { background: #d32f2f; }
        `;
      default:
        return `
          background: #f0f0f0;
          color: #666;
          &:hover { background: #e0e0e0; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// ==================== COMPONENT ====================

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [language] = useState<'bg' | 'en'>('bg');

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(invoices.filter(inv => inv.status === statusFilter));
    }
  }, [invoices, statusFilter]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const result = await getInvoices();
      if (result.success && result.invoices) {
        setInvoices(result.invoices);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: 'draft' | 'sent' | 'paid' | 'cancelled') => {
    try {
      const result = await updateInvoiceStatus(invoiceId, newStatus);
      if (result.success) {
        await loadInvoices();
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleSendEmail = async (invoiceId: string) => {
    try {
      const result = await sendInvoiceEmail(invoiceId);
      if (result.success) {
        alert(language === 'bg' ? 'Фактурата е изпратена успешно!' : 'Invoice sent successfully!');
        await loadInvoices();
      }
    } catch (error) {
      console.error('Error sending invoice email:', error);
      alert(language === 'bg' ? 'Грешка при изпращане на фактура' : 'Error sending invoice');
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{language === 'bg' ? 'Фактури' : 'Invoices'}</PageTitle>
        <PageSubtitle>
          {language === 'bg' 
            ? 'Управление на фактури и плащания' 
            : 'Manage invoices and payments'}
        </PageSubtitle>
      </PageHeader>

      <FiltersBar>
        <FilterGroup>
          <FilterLabel>{language === 'bg' ? 'Статус' : 'Status'}</FilterLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">{language === 'bg' ? 'Всички' : 'All'}</option>
            <option value="draft">{language === 'bg' ? 'Чернова' : 'Draft'}</option>
            <option value="sent">{language === 'bg' ? 'Изпратена' : 'Sent'}</option>
            <option value="paid">{language === 'bg' ? 'Платена' : 'Paid'}</option>
            <option value="cancelled">{language === 'bg' ? 'Отказана' : 'Cancelled'}</option>
          </Select>
        </FilterGroup>
      </FiltersBar>

      {loading ? (
        <LoadingState>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingState>
      ) : filteredInvoices.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>📄</EmptyStateIcon>
          <EmptyStateText>
            {language === 'bg' ? 'Няма намерени фактури' : 'No invoices found'}
          </EmptyStateText>
        </EmptyState>
      ) : (
        <InvoicesGrid>
          {filteredInvoices.map(invoice => (
            <InvoiceCard key={invoice.id}>
              <InvoiceHeader>
                <div>
                  <InvoiceNumber>№ {invoice.invoiceNumber}</InvoiceNumber>
                  <InvoiceDate>{formatDate(invoice.issueDate)}</InvoiceDate>
                </div>
                <StatusBadge $color={getInvoiceStatusColor(invoice.status)}>
                  {getInvoiceStatusText(invoice.status, language)}
                </StatusBadge>
              </InvoiceHeader>

              <InvoiceBody>
                <InfoSection>
                  <InfoLabel>{language === 'bg' ? 'Получател' : 'Buyer'}</InfoLabel>
                  <InfoValue>{invoice.buyer.name}</InfoValue>
                  
                  <InfoLabel>{language === 'bg' ? 'ЕИК' : 'EIK'}</InfoLabel>
                  <InfoValue>{invoice.buyer.eik || 'N/A'}</InfoValue>
                </InfoSection>

                <InfoSection>
                  <InfoLabel>{language === 'bg' ? 'Падеж' : 'Due Date'}</InfoLabel>
                  <InfoValue>{formatDate(invoice.dueDate)}</InfoValue>
                  
                  <InfoLabel>{language === 'bg' ? 'Метод на плащане' : 'Payment Method'}</InfoLabel>
                  <InfoValue>
                    {invoice.paymentMethod === 'bank_transfer' 
                      ? (language === 'bg' ? 'Банков превод' : 'Bank Transfer')
                      : invoice.paymentMethod === 'cash'
                      ? (language === 'bg' ? 'В брой' : 'Cash')
                      : (language === 'bg' ? 'Карта' : 'Card')
                    }
                  </InfoValue>
                </InfoSection>
              </InvoiceBody>

              <InvoiceFooter>
                <TotalAmount>{formatCurrency(invoice.total, invoice.currency)}</TotalAmount>

                <InvoiceActions>
                  {invoice.status === 'draft' && (
                    <ActionButton 
                      $variant="primary" 
                      onClick={() => handleSendEmail(invoice.id)}
                    >
                      {language === 'bg' ? 'Изпрати' : 'Send'}
                    </ActionButton>
                  )}
                  
                  {invoice.status === 'sent' && (
                    <ActionButton 
                      $variant="success" 
                      onClick={() => handleStatusChange(invoice.id, 'paid')}
                    >
                      {language === 'bg' ? 'Маркирай платена' : 'Mark Paid'}
                    </ActionButton>
                  )}
                  
                  {(invoice.status === 'draft' || invoice.status === 'sent') && (
                    <ActionButton 
                      $variant="danger" 
                      onClick={() => handleStatusChange(invoice.id, 'cancelled')}
                    >
                      {language === 'bg' ? 'Отмени' : 'Cancel'}
                    </ActionButton>
                  )}
                </InvoiceActions>
              </InvoiceFooter>
            </InvoiceCard>
          ))}
        </InvoicesGrid>
      )}
    </PageContainer>
  );
};

export default InvoicesPage;
