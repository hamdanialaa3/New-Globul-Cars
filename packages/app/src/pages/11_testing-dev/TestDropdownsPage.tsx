// Test Dropdowns Page - Comprehensive testing of all dropdowns
// صفحة اختبار القوائم المنسدلة - اختبار شامل لجميع القوائم

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import SelectWithOther from '@globul-cars/ui/componentsshared/SelectWithOther';
import { 
  VEHICLE_TYPES,
  SELLER_TYPES,
  CAR_BRANDS,
  CAR_YEARS,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  CAR_COLORS,
  DOOR_COUNTS,
  SEAT_COUNTS,
  CURRENCIES,
  PRICE_TYPES,
  ACCOUNT_TYPES,
  LEGAL_FORMS,
  GENDERS,
  NATIONALITIES,
  DOCUMENT_TYPES,
  CAR_CATEGORIES,
  VEHICLE_CONDITIONS,
  MILEAGE_RANGES,
  PRICE_RANGES,
  SORT_OPTIONS
} from '../../data/dropdown-options';

const TestPage: React.FC = () => {
  const { language } = useLanguage();
  const [testValues, setTestValues] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setTestValues(prev => ({ ...prev, [key]: value }));
  };

  const testSections = [
    {
      title: language === 'bg' ? '🚗 بيانات المركبة' : '🚗 Vehicle Data',
      fields: [
        { key: 'vehicleType', label: language === 'bg' ? 'نوع المركبة' : 'Vehicle Type', options: VEHICLE_TYPES },
        { key: 'make', label: language === 'bg' ? 'الماركة' : 'Make', options: CAR_BRANDS },
        { key: 'year', label: language === 'bg' ? 'السنة' : 'Year', options: CAR_YEARS },
        { key: 'fuelType', label: language === 'bg' ? 'نوع الوقود' : 'Fuel Type', options: FUEL_TYPES },
        { key: 'transmission', label: language === 'bg' ? 'ناقل الحركة' : 'Transmission', options: TRANSMISSION_TYPES },
        { key: 'color', label: language === 'bg' ? 'اللون' : 'Color', options: CAR_COLORS },
        { key: 'doors', label: language === 'bg' ? 'عدد الأبواب' : 'Doors', options: DOOR_COUNTS },
        { key: 'seats', label: language === 'bg' ? 'عدد المقاعد' : 'Seats', options: SEAT_COUNTS },
        { key: 'category', label: language === 'bg' ? 'فئة السيارة' : 'Car Category', options: CAR_CATEGORIES },
        { key: 'condition', label: language === 'bg' ? 'حالة المركبة' : 'Vehicle Condition', options: VEHICLE_CONDITIONS }
      ]
    },
    {
      title: language === 'bg' ? '💰 التسعير والدفع' : '💰 Pricing & Payment',
      fields: [
        { key: 'currency', label: language === 'bg' ? 'العملة' : 'Currency', options: CURRENCIES },
        { key: 'priceType', label: language === 'bg' ? 'نوع السعر' : 'Price Type', options: PRICE_TYPES },
        { key: 'priceRange', label: language === 'bg' ? 'نطاق السعر' : 'Price Range', options: PRICE_RANGES }
      ]
    },
    {
      title: language === 'bg' ? '👤 معلومات المستخدم' : '👤 User Information',
      fields: [
        { key: 'accountType', label: language === 'bg' ? 'نوع الحساب' : 'Account Type', options: ACCOUNT_TYPES },
        { key: 'sellerType', label: language === 'bg' ? 'نوع البائع' : 'Seller Type', options: SELLER_TYPES },
        { key: 'legalForm', label: language === 'bg' ? 'الشكل القانوني' : 'Legal Form', options: LEGAL_FORMS },
        { key: 'gender', label: language === 'bg' ? 'الجنس' : 'Gender', options: GENDERS },
        { key: 'nationality', label: language === 'bg' ? 'الجنسية' : 'Nationality', options: NATIONALITIES },
        { key: 'documentType', label: language === 'bg' ? 'نوع الوثيقة' : 'Document Type', options: DOCUMENT_TYPES }
      ]
    },
    {
      title: language === 'bg' ? '🔍 البحث والترتيب' : '🔍 Search & Sort',
      fields: [
        { key: 'mileageRange', label: language === 'bg' ? 'نطاق المسافة' : 'Mileage Range', options: MILEAGE_RANGES },
        { key: 'sortBy', label: language === 'bg' ? 'ترتيب حسب' : 'Sort By', options: SORT_OPTIONS }
      ]
    }
  ];

  return (
    <Container>
      <Header>
        <Title>
          {language === 'bg' ? '🧪 اختبار القوائم المنسدلة' : '🧪 Dropdowns Test Page'}
        </Title>
        <Subtitle>
          {language === 'bg' 
            ? 'اختبار شامل لجميع القوائم المنسدلة مع خيار "آخر"' 
            : 'Comprehensive testing of all dropdowns with "Other" option'
          }
        </Subtitle>
      </Header>

      <Content>
        {testSections.map((section, sectionIndex) => (
          <Section key={sectionIndex}>
            <SectionTitle>{section.title}</SectionTitle>
            <FieldsGrid>
              {section.fields.map((field) => (
                <FieldGroup key={field.key}>
                  <FieldLabel>{field.label}</FieldLabel>
                  <SelectWithOther
                    options={field.options}
                    value={testValues[field.key] || ''}
                    onChange={(value) => handleChange(field.key, value)}
                    placeholder={language === 'bg' ? 'اختر...' : 'Select...'}
                    showOther={true}
                    otherPlaceholder={language === 'bg' ? 'أدخل قيمة أخرى...' : 'Enter other value...'}
                  />
                  {testValues[field.key] && (
                    <ValueDisplay>
                      <strong>{language === 'bg' ? 'القيمة المختارة:' : 'Selected Value:'}</strong> {testValues[field.key]}
                    </ValueDisplay>
                  )}
                </FieldGroup>
              ))}
            </FieldsGrid>
          </Section>
        ))}

        <SummarySection>
          <SummaryTitle>
            {language === 'bg' ? '📊 ملخص الاختبار' : '📊 Test Summary'}
          </SummaryTitle>
          <SummaryContent>
            <SummaryItem>
              <strong>{language === 'bg' ? 'إجمالي القوائم المنسدلة:' : 'Total Dropdowns:'}</strong> 
              {testSections.reduce((total, section) => total + section.fields.length, 0)}
            </SummaryItem>
            <SummaryItem>
              <strong>{language === 'bg' ? 'القيم المختارة:' : 'Selected Values:'}</strong> 
              {Object.keys(testValues).length}
            </SummaryItem>
            <SummaryItem>
              <strong>{language === 'bg' ? 'اللغة الحالية:' : 'Current Language:'}</strong> 
              {language === 'bg' ? 'البلغارية' : 'English'}
            </SummaryItem>
          </SummaryContent>
        </SummarySection>
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #3498db;
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FieldLabel = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #34495e;
`;

const ValueDisplay = styled.div`
  font-size: 0.9rem;
  color: #27ae60;
  background: #d5f4e6;
  padding: 0.5rem;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
`;

const SummarySection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
`;

const SummaryTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
`;

const SummaryContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const SummaryItem = styled.div`
  font-size: 1.1rem;
  padding: 0.5rem 0;
`;

export default TestPage;
