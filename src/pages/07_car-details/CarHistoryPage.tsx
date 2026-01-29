/**
 * Car History Report Page
 * صفحة تقرير تاريخ السيارة
 * 
 * COMPETITIVE ADVANTAGE: CARFAX-style reports (NOT in mobile.bg/cars.bg)
 * 
 * Features:
 * - Full ownership history
 * - Accident records
 * - Service history
 * - Mileage verification
 * - Bulgarian compliance checks
 * - Trust score (0-100)
 * 
 * Location: Bulgaria | Languages: BG/EN
 * Route: /car/:sellerId/:carId/history
 * Created: January 18, 2026
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FileText, Shield, AlertTriangle, CheckCircle,
  Calendar, Users, Wrench, Gauge, ClipboardCheck,
  TrendingDown, TrendingUp, Info, Download,
  Share2, ArrowLeft
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { carHistoryService, CarHistoryReport } from '@/services/history/car-history.service';
import { logger } from '@/services/logger-service';

// ==================== STYLED COMPONENTS ====================

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #667eea;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(-5px);
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.5rem;
  
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const ScoreCard = styled.div<{ $score: number }>`
  background: ${props => 
    props.$score >= 80 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
    props.$score >= 60 ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
    props.$score >= 40 ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' :
    'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
  };
  color: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
`;

const ScoreValue = styled.div`
  font-size: 4rem;
  font-weight: 700;
  margin: 1rem 0;
`;

const TrustLevel = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Recommendation = styled.div`
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 1.1rem;
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const SectionIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #666;
  font-size: 0.95rem;
`;

const InfoValue = styled.span<{ $highlight?: boolean }>`
  font-weight: 600;
  color: ${props => props.$highlight ? '#667eea' : '#1a1a2e'};
  font-size: 1rem;
`;

const StatusBadge = styled.span<{ $status: 'success' | 'warning' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  
  background: ${props => 
    props.$status === 'success' ? '#d4edda' :
    props.$status === 'warning' ? '#fff3cd' : '#f8d7da'
  };
  
  color: ${props => 
    props.$status === 'success' ? '#155724' :
    props.$status === 'warning' ? '#856404' : '#721c24'
  };
`;

const RecordCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  margin: 0.5rem 0;
`;

const RecordDate = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const RecordTitle = styled.div`
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
`;

const RecordDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  background: ${props => props.$primary ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    'white'
  };
  
  color: ${props => props.$primary ? 'white' : '#667eea'};
  border: ${props => props.$primary ? 'none' : '2px solid #667eea'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
`;

const Spinner = styled.div`
  border: 4px solid rgba(255,255,255,0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// ==================== COMPONENT ====================

const CarHistoryPage: React.FC = () => {
  const { sellerId, carId } = useParams<{ sellerId: string; carId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [report, setReport] = useState<CarHistoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadReport();
  }, [carId]);
  
  const loadReport = async () => {
    if (!carId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Try to get cached report first
      let historyReport = await carHistoryService.getCachedReport(carId);
      
      // If no cache or stale, generate new report
      if (!historyReport) {
        historyReport = await carHistoryService.generateReport(carId);
      }
      
      setReport(historyReport);
      
    } catch (err) {
      logger.error('Failed to load car history', err as Error, { carId });
      setError('Failed to load car history report');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    alert('PDF download feature coming soon!');
  };
  
  const handleShare = () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: `Car History Report - ${carId}`,
        url: window.location.href
      });
    }
  };
  
  const text = {
    bg: {
      title: 'История на автомобила',
      subtitle: 'Пълен отчет за миналото на този автомобил',
      backButton: 'Обратно към детайли',
      score: 'Доверителен рейтинг',
      excellent: 'Отличен',
      good: 'Добър',
      fair: 'Задоволителен',
      poor: 'Лош',
      ownership: 'История на собственост',
      owners: 'Собственици',
      accidents: 'История на инциденти',
      noAccidents: 'Няма регистрирани инциденти',
      hasAccidents: 'Регистрирани инциденти',
      service: 'История на поддръжка',
      totalServices: 'Общо обслужвания',
      lastService: 'Последно обслужване',
      registration: 'Регистрация и съответствие',
      registeredBulgaria: 'Регистриран в България',
      technicalInspection: 'Технически преглед',
      environmentalTax: 'Екологичен данък',
      mileage: 'Проверка на километража',
      currentMileage: 'Текущ километраж',
      verified: 'Потвърден',
      suspicious: 'Подозрителен',
      downloadPDF: 'Изтегли PDF',
      share: 'Сподели'
    },
    en: {
      title: 'Car History Report',
      subtitle: 'Complete history of this vehicle',
      backButton: 'Back to Details',
      score: 'Trust Score',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      ownership: 'Ownership History',
      owners: 'Owners',
      accidents: 'Accident History',
      noAccidents: 'No Accidents Reported',
      hasAccidents: 'Accidents Reported',
      service: 'Service History',
      totalServices: 'Total Services',
      lastService: 'Last Service',
      registration: 'Registration & Compliance',
      registeredBulgaria: 'Registered in Bulgaria',
      technicalInspection: 'Technical Inspection',
      environmentalTax: 'Environmental Tax',
      mileage: 'Mileage Verification',
      currentMileage: 'Current Mileage',
      verified: 'Verified',
      suspicious: 'Suspicious',
      downloadPDF: 'Download PDF',
      share: 'Share'
    }
  };
  
  const t = text[language] || text.en;
  
  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Spinner />
          <h2>Генериране на отчет...</h2>
        </LoadingContainer>
      </PageContainer>
    );
  }
  
  if (error || !report) {
    return (
      <PageContainer>
        <LoadingContainer>
          <AlertTriangle size={60} />
          <h2>{error || 'Report not available'}</h2>
        </LoadingContainer>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(`/car/${sellerId}/${carId}`)}>
          <ArrowLeft size={20} />
          {t.backButton}
        </BackButton>
        
        <Title>
          <FileText size={40} />
          {t.title}
        </Title>
        <Subtitle>{t.subtitle}</Subtitle>
      </Header>
      
      <ScoreCard $score={report.score.overall}>
        <Shield size={60} />
        <TrustLevel>
          {report.score.trustLevel === 'excellent' ? t.excellent :
           report.score.trustLevel === 'good' ? t.good :
           report.score.trustLevel === 'fair' ? t.fair : t.poor}
        </TrustLevel>
        <ScoreValue>{report.score.overall}/100</ScoreValue>
        <div>{t.score}</div>
        
        <Recommendation>
          {language === 'bg' ? report.score.recommendationBuyer : 
           report.score.recommendationBuyer}
        </Recommendation>
      </ScoreCard>
      
      <SectionsGrid>
        {/* Ownership History */}
        <Section>
          <SectionHeader>
            <SectionIcon $color="#667eea">
              <Users size={24} />
            </SectionIcon>
            <SectionTitle>{t.ownership}</SectionTitle>
          </SectionHeader>
          
          <InfoRow>
            <InfoLabel>{t.owners}</InfoLabel>
            <InfoValue $highlight>{report.ownershipHistory.count}</InfoValue>
          </InfoRow>
          
          {report.ownershipHistory.records.map((record, index) => (
            <RecordCard key={index}>
              <RecordTitle>Собственик #{record.ownerNumber}</RecordTitle>
              {record.periodStart && (
                <RecordDescription>
                  {record.periodStart.toLocaleDateString('bg-BG')} - 
                  {record.periodEnd ? record.periodEnd.toLocaleDateString('bg-BG') : 'сега'}
                </RecordDescription>
              )}
            </RecordCard>
          ))}
        </Section>
        
        {/* Accident History */}
        <Section>
          <SectionHeader>
            <SectionIcon $color={report.accidentHistory.hasAccidents ? '#ff6b6b' : '#51cf66'}>
              <Shield size={24} />
            </SectionIcon>
            <SectionTitle>{t.accidents}</SectionTitle>
          </SectionHeader>
          
          <InfoRow>
            <StatusBadge $status={report.accidentHistory.hasAccidents ? 'danger' : 'success'}>
              {report.accidentHistory.hasAccidents ? (
                <><AlertTriangle size={16} /> {t.hasAccidents}</>
              ) : (
                <><CheckCircle size={16} /> {t.noAccidents}</>
              )}
            </StatusBadge>
          </InfoRow>
          
          {report.accidentHistory.records.map((accident, index) => (
            <RecordCard key={index}>
              <RecordDate>{accident.date.toLocaleDateString('bg-BG')}</RecordDate>
              <RecordTitle>
                {accident.severity === 'severe' ? 'Тежък инцидент' :
                 accident.severity === 'moderate' ? 'Среден инцидент' : 'Лек инцидент'}
              </RecordTitle>
              {accident.description && (
                <RecordDescription>{accident.description}</RecordDescription>
              )}
              {accident.cost && (
                <RecordDescription>Разходи: {accident.cost.toLocaleString()}€</RecordDescription>
              )}
            </RecordCard>
          ))}
        </Section>
        
        {/* Service History */}
        <Section>
          <SectionHeader>
            <SectionIcon $color="#fa709a">
              <Wrench size={24} />
            </SectionIcon>
            <SectionTitle>{t.service}</SectionTitle>
          </SectionHeader>
          
          <InfoRow>
            <InfoLabel>{t.totalServices}</InfoLabel>
            <InfoValue>{report.serviceHistory.totalServices}</InfoValue>
          </InfoRow>
          
          {report.serviceHistory.lastServiceDate && (
            <InfoRow>
              <InfoLabel>{t.lastService}</InfoLabel>
              <InfoValue>
                {report.serviceHistory.lastServiceDate.toLocaleDateString('bg-BG')}
              </InfoValue>
            </InfoRow>
          )}
          
          {report.serviceHistory.records.map((service, index) => (
            <RecordCard key={index}>
              <RecordDate>{service.date.toLocaleDateString('bg-BG')}</RecordDate>
              <RecordTitle>{service.description}</RecordTitle>
              {service.mileage && (
                <RecordDescription>{service.mileage.toLocaleString()} км</RecordDescription>
              )}
            </RecordCard>
          ))}
        </Section>
        
        {/* Registration & Compliance */}
        <Section>
          <SectionHeader>
            <SectionIcon $color="#20c997">
              <ClipboardCheck size={24} />
            </SectionIcon>
            <SectionTitle>{t.registration}</SectionTitle>
          </SectionHeader>
          
          <InfoRow>
            <InfoLabel>{t.registeredBulgaria}</InfoLabel>
            <StatusBadge $status={report.registrationInfo.registeredInBulgaria ? 'success' : 'warning'}>
              {report.registrationInfo.registeredInBulgaria ? (
                <><CheckCircle size={16} /> Да</>
              ) : (
                <><AlertTriangle size={16} /> Не</>
              )}
            </StatusBadge>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>{t.technicalInspection}</InfoLabel>
            <StatusBadge $status={report.registrationInfo.technicalInspectionValid ? 'success' : 'danger'}>
              {report.registrationInfo.technicalInspectionValid ? (
                <><CheckCircle size={16} /> Валиден</>
              ) : (
                <><AlertTriangle size={16} /> Изтекъл</>
              )}
            </StatusBadge>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>{t.environmentalTax}</InfoLabel>
            <StatusBadge $status={report.registrationInfo.environmentalTaxPaid ? 'success' : 'danger'}>
              {report.registrationInfo.environmentalTaxPaid ? (
                <><CheckCircle size={16} /> Платен</>
              ) : (
                <><AlertTriangle size={16} /> Неплатен</>
              )}
            </StatusBadge>
          </InfoRow>
        </Section>
        
        {/* Mileage Verification */}
        <Section>
          <SectionHeader>
            <SectionIcon $color="#fd7e14">
              <Gauge size={24} />
            </SectionIcon>
            <SectionTitle>{t.mileage}</SectionTitle>
          </SectionHeader>
          
          <InfoRow>
            <InfoLabel>{t.currentMileage}</InfoLabel>
            <InfoValue $highlight>
              {report.mileageVerification.currentMileage.toLocaleString()} км
            </InfoValue>
          </InfoRow>
          
          <InfoRow>
            <StatusBadge $status={report.mileageVerification.verified ? 'success' : 'warning'}>
              {report.mileageVerification.verified ? (
                <><CheckCircle size={16} /> {t.verified}</>
              ) : (
                <><AlertTriangle size={16} /> {t.suspicious}</>
              )}
            </StatusBadge>
          </InfoRow>
          
          {report.mileageVerification.history.map((record, index) => (
            <RecordCard key={index}>
              <RecordDate>{record.date.toLocaleDateString('bg-BG')}</RecordDate>
              <RecordTitle>{record.mileage.toLocaleString()} км</RecordTitle>
              <RecordDescription>Източник: {record.source}</RecordDescription>
            </RecordCard>
          ))}
        </Section>
      </SectionsGrid>
      
      <ActionButtons>
        <ActionButton onClick={handleDownloadPDF}>
          <Download size={20} />
          {t.downloadPDF}
        </ActionButton>
        
        <ActionButton $primary onClick={handleShare}>
          <Share2 size={20} />
          {t.share}
        </ActionButton>
      </ActionButtons>
    </PageContainer>
  );
};

export default CarHistoryPage;
