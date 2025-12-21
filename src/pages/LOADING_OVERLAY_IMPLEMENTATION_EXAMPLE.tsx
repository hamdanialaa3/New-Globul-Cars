// src/pages/LOADING_OVERLAY_IMPLEMENTATION_EXAMPLE.tsx
/**
 * مثال عملي كامل لاستخدام LoadingOverlay في صفحة حقيقية
 * 
 * هذا المثال يوضح كيفية دمج LoadingOverlay في:
 * 1. جلب البيانات من API
 * 2. معالجة النماذج
 * 3. عمليات متعددة الخطوات
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';
import { useLoadingWrapper } from '@/services/with-loading';

// ============================================
// Styled Components
// ============================================

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--bg-primary);
  min-height: 100vh;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
`;

const Title = styled.h2`
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-hover);
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Results = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 6px;
  border-left: 3px solid var(--accent-primary);
  color: var(--text-secondary);
  white-space: pre-wrap;
  font-family: monospace;
  max-height: 200px;
  overflow-y: auto;
`;

// ============================================
// Example Component
// ============================================

export const LoadingOverlayImplementationExample: React.FC = () => {
  const [fetchResults, setFetchResults] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [multiStepStatus, setMultiStepStatus] = useState('');

  const { showLoading, hideLoading } = useLoadingOverlay();
  const { withLoading } = useLoadingWrapper();

  // ============================================
  // مثال 1: جلب البيانات من API
  // ============================================

  const handleFetchData = async () => {
    showLoading('جاري جلب البيانات من الخادم...');
    try {
      // محاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockData = {
        cars: [
          { id: 1, name: 'تويوتا كامري', year: 2023 },
          { id: 2, name: 'هونداي أكورد', year: 2023 },
          { id: 3, name: 'بي ام دبليو 320', year: 2023 },
        ],
        timestamp: new Date().toISOString(),
      };

      setFetchResults(JSON.stringify(mockData, null, 2));
      logger.info('Data fetched successfully', { data: mockData });
    } catch (error) {
      logger.error('Failed to fetch data', error as Error);
      setFetchResults('خطأ: فشل جلب البيانات');
    } finally {
      hideLoading();
    }
  };

  // ============================================
  // مثال 2: معالجة النماذج مع withLoading
  // ============================================

  const handleFormSubmit = withLoading(
    async (formData: any) => {
      // محاكاة معالجة النموذج
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = {
        success: true,
        message: 'تم حفظ البيانات بنجاح',
        data: { id: Math.random(), timestamp: new Date().toISOString() },
      };

      setFormStatus(JSON.stringify(response, null, 2));
      return response;
    },
    'جاري حفظ بيانات النموذج...'
  );

  const onFormSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await handleFormSubmit(Object.fromEntries(formData));
  };

  // ============================================
  // مثال 3: عملية متعددة الخطوات
  // ============================================

  const handleMultiStepProcess = async () => {
    try {
      // الخطوة 1
      showLoading('الخطوة 1 من 4: التحقق من البيانات...');
      setMultiStepStatus('⏳ الخطوة 1: التحقق...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // الخطوة 2
      showLoading('الخطوة 2 من 4: معالجة البيانات...');
      setMultiStepStatus('⏳ الخطوة 1: التحقق... ✅\n⏳ الخطوة 2: المعالجة...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // الخطوة 3
      showLoading('الخطوة 3 من 4: حفظ في قاعدة البيانات...');
      setMultiStepStatus(
        '⏳ الخطوة 1: التحقق... ✅\n⏳ الخطوة 2: المعالجة... ✅\n⏳ الخطوة 3: الحفظ...'
      );
      await new Promise(resolve => setTimeout(resolve, 1000));

      // الخطوة 4
      showLoading('الخطوة 4 من 4: إرسال التأكيد...');
      setMultiStepStatus(
        '⏳ الخطوة 1: التحقق... ✅\n⏳ الخطوة 2: المعالجة... ✅\n⏳ الخطوة 3: الحفظ... ✅\n⏳ الخطوة 4: الإرسال...'
      );
      await new Promise(resolve => setTimeout(resolve, 1000));

      // اكتمال العملية
      setMultiStepStatus(
        '⏳ الخطوة 1: التحقق... ✅\n⏳ الخطوة 2: المعالجة... ✅\n⏳ الخطوة 3: الحفظ... ✅\n⏳ الخطوة 4: الإرسال... ✅\n\n✨ تمت العملية بنجاح!'
      );
    } catch (error) {
      logger.error('Multi-step operation failed', error as Error);
      setMultiStepStatus('❌ حدث خطأ في العملية');
    } finally {
      hideLoading();
    }
  };

  // ============================================
  // Render
  // ============================================

  return (
    <PageContainer>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>
        مثال عملي: LoadingOverlay
      </h1>

      {/* القسم الأول: جلب البيانات */}
      <Section>
        <Title>1. جلب البيانات من API</Title>
        <p>انقر الزر لجلب قائمة السيارات من الخادم</p>
        <Button onClick={handleFetchData}>
          🔄 جلب البيانات
        </Button>
        {fetchResults && <Results>{fetchResults}</Results>}
      </Section>

      {/* القسم الثاني: معالجة النماذج */}
      <Section>
        <Title>2. معالجة النموذج</Title>
        <form onSubmit={onFormSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              الاسم:
            </label>
            <input
              type="text"
              name="name"
              placeholder="أدخل الاسم"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
              required
            />
          </div>
          <Button type="submit">💾 حفظ النموذج</Button>
        </form>
        {formStatus && <Results>{formStatus}</Results>}
      </Section>

      {/* القسم الثالث: عملية متعددة الخطوات */}
      <Section>
        <Title>3. عملية متعددة الخطوات</Title>
        <p>هذه العملية تمر بـ 4 خطوات متسلسلة</p>
        <Button onClick={handleMultiStepProcess}>
          ⚙️ ابدأ العملية
        </Button>
        {multiStepStatus && <Results>{multiStepStatus}</Results>}
      </Section>

      {/* معلومات */}
      <Section style={{ backgroundColor: 'rgba(0, 204, 255, 0.1)', borderColor: '#00ccff' }}>
        <Title>💡 ملاحظات</Title>
        <ul>
          <li>يظهر LoadingOverlay تلقائياً عند كل عملية</li>
          <li>يعرض رسالة توضح العملية الجارية</li>
          <li>يغلق تلقائياً عند اكتمال العملية</li>
          <li>يعمل حتى عند حدوث أخطاء (مع معالجة صحيحة)</li>
        </ul>
      </Section>
    </PageContainer>
  );
};

export default LoadingOverlayImplementationExample;
