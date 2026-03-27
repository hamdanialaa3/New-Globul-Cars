// Documents Card Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Displays user invoices and documents

import React from 'react';
import styled from 'styled-components';
import { FileText, Download } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Invoice {
  id: string;
  title: string;
  date: string;
  amount?: number;
  currency?: string;
  downloadUrl?: string;
}

interface DocumentsCardProps {
  invoices?: Invoice[];
}

const DocumentsCard: React.FC<DocumentsCardProps> = ({ invoices = [] }) => {
  const { language } = useLanguage();

  const handleDownload = (invoice: Invoice) => {
    if (invoice.downloadUrl) {
      window.open(invoice.downloadUrl, '_blank');
    }
  };

  return (
    <Card>
      <SectionHeader>
        <Title>
          <FileText size={20} />
          {language === 'bg' ? 'Документи' : 'Documents'}
        </Title>
      </SectionHeader>

      <SubSection>
        <SubTitle>
          {language === 'bg' ? 'Моите фактури' : 'My invoices'}
        </SubTitle>
        <Description>
          {language === 'bg'
            ? 'Тук ще намерите преглед на вашите резервирани пакети и опции'
            : 'Here you will find an overview of your booked packages and options'}
        </Description>

        {invoices.length > 0 ? (
          <InvoicesList>
            {invoices.map(invoice => (
              <InvoiceItem key={invoice.id}>
                <InvoiceIcon><FileText size={20} /></InvoiceIcon>
                <InvoiceInfo>
                  <InvoiceTitle>{invoice.title}</InvoiceTitle>
                  <InvoiceMeta>
                    <InvoiceDate>{invoice.date}</InvoiceDate>
                    {invoice.amount && (
                      <InvoiceAmount>
                        {invoice.amount} {invoice.currency || 'EUR'}
                      </InvoiceAmount>
                    )}
                  </InvoiceMeta>
                </InvoiceInfo>
                {invoice.downloadUrl && (
                  <DownloadButton 
                    onClick={() => handleDownload(invoice)}
                    title={language === 'bg' ? 'Изтегли' : 'Download'}
                  >
                    <Download size={18} />
                  </DownloadButton>
                )}
              </InvoiceItem>
            ))}
          </InvoicesList>
        ) : (
          <EmptyState>
            <FileText size={48} />
            <EmptyText>
              {language === 'bg'
                ? 'Няма налични фактури'
                : 'No invoices available'}
            </EmptyText>
          </EmptyState>
        )}
      </SubSection>
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
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;

  @media (max-width: 768px) {
    margin-bottom: 16px;
    padding-bottom: 12px;
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

const SubSection = styled.div`
  margin-top: 0;
`;

const SubTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.5;
  margin: 0 0 20px 0;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
    margin-bottom: 16px;
  }
`;

const InvoicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InvoiceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f3f5;
    border-color: #dee2e6;
  }

  @media (max-width: 768px) {
    gap: 12px;
    padding: 12px;
  }
`;

const InvoiceIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 8px;
  color: #495057;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const InvoiceInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const InvoiceTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const InvoiceMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8125rem;
  color: #6c757d;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const InvoiceDate = styled.span``;

const InvoiceAmount = styled.span`
  font-weight: 600;
  color: #495057;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #2563EB;
    border-color: #2563EB;
    color: white;
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 8px;
  color: #6c757d;

  svg {
    opacity: 0.3;
    margin-bottom: 16px;
  }

  @media (max-width: 768px) {
    padding: 32px 16px;
    
    svg {
      width: 40px;
      height: 40px;
      margin-bottom: 12px;
    }
  }
`;

const EmptyText = styled.p`
  font-size: 0.9375rem;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

export default DocumentsCard;


