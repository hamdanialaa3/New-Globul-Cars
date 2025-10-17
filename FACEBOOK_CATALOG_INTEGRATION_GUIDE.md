// src/pages/FacebookCatalogPage.tsx
// Facebook Catalog Management Page
// صفحة إدارة كاتالوج Facebook

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FacebookCatalogService from '../services/facebook-catalog-service';
import { Download, RefreshCw, BarChart3, Settings, ExternalLink } from 'lucide-react';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  direction: rtl;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #1877f2;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' ? '#6c757d' : '#1877f2'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const InfoBox = styled.div<{ type?: 'info' | 'success' | 'warning' }>`
  background: ${props => 
    props.type === 'success' ? '#d4edda' :
    props.type === 'warning' ? '#fff3cd' :
    '#d1ecf1'
  };
  color: ${props => 
    props.type === 'success' ? '#155724' :
    props.type === 'warning' ? '#856404' :
    '#0c5460'
  };
  border: 1px solid ${props => 
    props.type === 'success' ? '#c3e6cb' :
    props.type === 'warning' ? '#ffeaa7' :
    '#bee5eb'
  };
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const CodeBlock = styled.pre`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  direction: ltr;
  text-align: left;
  font-size: 0.9rem;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #1877f2;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 2px solid #1877f2;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #1877f2;
    color: white;
  }
`;

const FacebookCatalogPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const catalogStats = await FacebookCatalogService.getCatalogStats();
      setStats(catalogStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      setMessage({ type: 'error', text: 'فشل تحميل الإحصائيات' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXML = async () => {
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'جاري إنشاء ملف XML...' });
      await FacebookCatalogService.generateAndDownloadFeed('xml');
      setMessage({ type: 'success', text: '✅ تم تنزيل ملف XML بنجاح!' });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'فشل إنشاء ملف XML' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'جاري إنشاء ملف CSV...' });
      await FacebookCatalogService.generateAndDownloadFeed('csv');
      setMessage({ type: 'success', text: '✅ تم تنزيل ملف CSV بنجاح!' });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'فشل إنشاء ملف CSV' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageTitle>
        🛒 كتالوج Facebook
      </PageTitle>

      {/* Message */}
      {message && (
        <InfoBox type={message.type === 'error' ? 'warning' : message.type}>
          {message.text}
        </InfoBox>
      )}

      {/* Stats Card */}
      <Card>
        <CardTitle>
          <BarChart3 size={24} />
          إحصائيات الكتالوج
        </CardTitle>
        
        {loading && !stats ? (
          <div>جاري التحميل...</div>
        ) : stats ? (
          <StatGrid>
            <StatCard>
              <StatValue>{stats.totalCars}</StatValue>
              <StatLabel>إجمالي السيارات</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{stats.averagePrice.toLocaleString()}</StatValue>
              <StatLabel>متوسط السعر (EUR)</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{Object.keys(stats.byMake || {}).length}</StatValue>
              <StatLabel>عدد الماركات</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{Object.keys(stats.byRegion || {}).length}</StatValue>
              <StatLabel>عدد المناطق</StatLabel>
            </StatCard>
          </StatGrid>
        ) : null}
        
        <ButtonGroup style={{ marginTop: '1.5rem' }}>
          <Button onClick={loadStats} disabled={loading}>
            <RefreshCw size={18} />
            تحديث الإحصائيات
          </Button>
        </ButtonGroup>
      </Card>

      {/* Download Feed Card */}
      <Card>
        <CardTitle>
          <Download size={24} />
          تنزيل Product Feed
        </CardTitle>
        
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          حمّل ملف Product Feed لرفعه يدوياً إلى Facebook Commerce Manager
        </p>
        
        <ButtonGroup>
          <Button onClick={handleDownloadXML} disabled={loading}>
            <Download size={18} />
            تنزيل XML Feed
          </Button>
          
          <Button onClick={handleDownloadCSV} disabled={loading} variant="secondary">
            <Download size={18} />
            تنزيل CSV Feed
          </Button>
        </ButtonGroup>
      </Card>

      {/* Automatic Feed URLs Card */}
      <Card>
        <CardTitle>
          <Settings size={24} />
          روابط الـ Feed التلقائية
        </CardTitle>
        
        <InfoBox type="info">
          <strong>✨ ميزة التحديث التلقائي</strong>
          <br />
          استخدم هذه الروابط في Facebook Commerce Manager للتحديث التلقائي للكتالوج
        </InfoBox>
        
        <div style={{ marginTop: '1rem' }}>
          <strong>XML Feed URL:</strong>
          <CodeBlock>
https://us-central1-fire-new-globul.cloudfunctions.net/facebookCatalogXML
          </CodeBlock>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <strong>CSV Feed URL:</strong>
          <CodeBlock>
https://us-central1-fire-new-globul.cloudfunctions.net/facebookCatalogCSV
          </CodeBlock>
        </div>
      </Card>

      {/* Setup Guide Card */}
      <Card>
        <CardTitle>
          📖 دليل الإعداد في Facebook
        </CardTitle>
        
        <ol style={{ lineHeight: '2', color: '#666' }}>
          <li>افتح <LinkButton href="https://business.facebook.com/commerce" target="_blank">Facebook Commerce Manager <ExternalLink size={14} /></LinkButton></li>
          <li>اذهب إلى <strong>Catalog</strong> → <strong>Data Sources</strong></li>
          <li>اضغط <strong>"Add Data Source"</strong></li>
          <li>اختر <strong>"Data Feed"</strong></li>
          <li>أدخل URL الـ Feed من الأعلى</li>
          <li>اختر جدولة التحديث (موصى به: كل ساعة)</li>
          <li>اضغط <strong>"Start Upload"</strong></li>
          <li>انتظر 10-30 دقيقة حتى تظهر المنتجات</li>
        </ol>
      </Card>

      {/* Benefits Card */}
      <Card>
        <CardTitle>
          🎯 الفوائد
        </CardTitle>
        
        <ul style={{ lineHeight: '2', color: '#666' }}>
          <li>🚗 <strong>عرض على Facebook Marketplace:</strong> وصول لملايين المستخدمين</li>
          <li>📱 <strong>Instagram Shopping:</strong> عرض السيارات على Instagram</li>
          <li>📢 <strong>Dynamic Ads:</strong> إعلانات ديناميكية تلقائية</li>
          <li>🔄 <strong>مزامنة تلقائية:</strong> تحديث الكتالوج تلقائياً كل ساعة</li>
          <li>📊 <strong>تحليلات متقدمة:</strong> تتبع الأداء والمبيعات</li>
          <li>🌍 <strong>وصول عالمي:</strong> بيع لأوروبا وخارجها</li>
        </ul>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardTitle>
          🔗 روابط سريعة
        </CardTitle>
        
        <ButtonGroup>
          <LinkButton href="https://business.facebook.com/commerce" target="_blank">
            <ExternalLink size={16} />
            Commerce Manager
          </LinkButton>
          
          <LinkButton href="https://developers.facebook.com/apps/1780064479295175" target="_blank">
            <ExternalLink size={16} />
            Facebook App Settings
          </LinkButton>
          
          <LinkButton href="https://console.firebase.google.com/project/fire-new-globul" target="_blank">
            <ExternalLink size={16} />
            Firebase Console
          </LinkButton>
        </ButtonGroup>
      </Card>
    </PageContainer>
  );
};

export default FacebookCatalogPage;

