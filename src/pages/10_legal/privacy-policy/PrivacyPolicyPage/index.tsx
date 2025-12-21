// src/pages/PrivacyPolicyPage.tsx
// Privacy Policy Page for Bulgarian Car Marketplace
// (Comment removed - was in Arabic)

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../../../hooks/useTranslation';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1rem;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  font-size: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid ${props => props.theme.colors.primary};
  padding-bottom: 0.5rem;
`;

const Paragraph = styled.p`
  line-height: 1.6;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.secondary};
`;

const List = styled.ul`
  margin: 1rem 0;
  padding-left: 2rem;
  
  li {
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.secondary};
  }
`;

const ContactInfo = styled.div`
  background: ${props => props.theme.colors.grey[100]};
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const LastUpdated = styled.div`
  text-align: center;
  margin: 2rem 0;
  padding: 1rem;
  background: ${props => props.theme.colors.grey[100]};
  border-radius: 8px;
  font-style: italic;
  color: ${props => props.theme.colors.secondary};
`;

const PrivacyPolicyPage: React.FC = () => {
  const { language } = useTranslation();

  const content = {
    bg: {
      title: "Политика за Поверителност",
      lastUpdated: "Последна актуализация: 26 септември 2025",
      intro: "Bulgarian Car Marketplace се ангажира да защити вашата лична информация и право на поверителност. Тази политика за поверителност описва как събираме, използваме и защитаваме вашата информация.",
      
      section1: {
        title: "1. Информация, която събираме",
        content: "Ние събираме следните видове информация:",
        items: [
          "Лична информация: име, имейл адрес, телефонен номер, адрес",
          "Информация за автомобила: марка, модел, година, цена, снимки, описание",
          "Техническа информация: IP адрес, тип браузър, операционна система",
          "Информация за използването: страници, които посещавате, време прекарано на сайта",
          "Facebook информация: профилна снимка, име, имейл (при влизане с Facebook)"
        ]
      },

      section2: {
        title: "2. Как използваме вашата информация",
        content: "Използваме събраната информация за:",
        items: [
          "Предоставяне на услугите на Bulgarian Car Marketplace",
          "Обработка на обяви за автомобили",
          "Свързване на купувачи и продавачи",
          "Подобряване на потребителското изживяване",
          "Изпращане на известия и актуализации",
          "Създаване на персонализирани реклами в Facebook",
          "Анализ и статистика чрез Facebook Analytics"
        ]
      },

      section3: {
        title: "3. Facebook интеграция",
        content: "Нашият сайт е интегриран с Facebook за:",
        items: [
          "Facebook Login за лесно влизане",
          "Facebook Pixel за проследяване на конверсиите",
          "Facebook Messenger за клиентска поддръжка",
          "Facebook реклами за промоция на обяви",
          "Споделяне на обяви в социалните мрежи",
          "Facebook Analytics за подобряване на услугите"
        ],
        fbNote: "Когато използвате Facebook функциите, вашата информация се обработва съгласно Facebook's Data Policy: https://www.facebook.com/policy/cookies/"
      },

      section4: {
        title: "4. Споделяне на информация",
        content: "Ние споделяме вашата информация само в следните случаи:",
        items: [
          "С други потребители (само информацията в обявите)",
          "С Facebook за реклами и анализ",
          "С доставчици на услуги (хостинг, имейл сървиси)",
          "При законови изисквания",
          "За защита на правата и сигурността ни"
        ]
      },

      section5: {
        title: "5. Вашите права (GDPR)",
        content: "Съгласно GDPR, имате следните права:",
        items: [
          "Право на достъп до вашите данни",
          "Право на корекция на неточни данни",
          "Право на изтриване ('право на забрава')",
          "Право на ограничаване на обработката",
          "Право на преносимост на данните",
          "Право на възражение срещу обработката",
          "Право да оттеглите съгласието си"
        ]
      },

      section6: {
        title: "6. Съхранение на данни",
        content: "Съхраняваме вашите данни докато:",
        items: [
          "Имате активен акаунт в нашата система",
          "Имате активни обяви",
          "Е необходимо за изпълнение на правни задължения",
          "За резолюция на спорове",
          "Максимален период: 7 години след затваряне на акаунта"
        ]
      },

      section7: {
        title: "7. Сигурност на данните",
        content: "Прилагаме технически и организационни мерки за защита:",
        items: [
          "SSL криптиране на всички данни",
          "Сигурни сървъри и бази данни",
          "Редовни security актуализации",
          "Ограничен достъп до лична информация",
          "Редовно резервно копиране"
        ]
      },

      section8: {
        title: "8. Cookies и проследяване",
        content: "Използваме следните cookies:",
        items: [
          "Функционални cookies за работата на сайта",
          "Facebook Pixel за реклами и анализ",
          "Google Analytics за статистика",
          "Сесийни cookies за удобство",
          "Можете да управлявате cookies от настройките на браузъра"
        ]
      },

      section8a: {
        title: "8.1. Заявка за изтриване на данни от Facebook",
        content: "В съответствие с GDPR и политиките на Facebook, можете да поискате изтриване на вашите лични данни:",
        items: [
          "Имате право да поискате изтриване на всички данни, свързани с вашия Facebook акаунт",
          "Заявката за изтриване се обработва в рамките на 30 дни",
          "Преди изтриване проверяваме самоличността ви за сигурност",
          "Изтриваме всички лични данни от нашите сървъри и бази данни",
          "Изтриваме данни за активността, съобщенията и предпочитанията ви",
          "Уведомяваме ви за завършване на процеса на изтриване"
        ],
        process: "За заявка за изтриване на данни, изпратете имейл на privacy@bulgariancarmarketplace.com с вашия Facebook ID и причината за заявката.",
        note: "След изтриване на данните, няма да можете да възстановите вашия акаунт или активността си.",
        deletionUrl: "Можете също да използвате автоматичната система за изтриване: https://bulgariancarmarketplace.com/data-deletion"
      },

      contact: {
        title: "9. Контакт",
        content: "За въпроси относно тази политика за поверителност:",
        company: "Bulgarian Car Marketplace EOOD",
        address: "гр. София, България",
        email: "privacy@bulgariancarmarketplace.com",
        phone: "+359 888 123 456",
        dataProtection: "Длъжностно лице по защита на данните: dpo@bulgariancarmarketplace.com"
      },

      changes: {
        title: "10. Промени в политиката",
        content: "Можем да актуализираме тази политика за поверителност от време на време. При съществени промени ще ви уведомим чрез имейл или известие на сайта."
      }
    },

    en: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: September 26, 2025",
      intro: "Bulgarian Car Marketplace is committed to protecting your personal information and your right to privacy. This privacy policy describes how we collect, use, and protect your information.",
      
      section1: {
        title: "1. Information We Collect",
        content: "We collect the following types of information:",
        items: [
          "Personal information: name, email address, phone number, address",
          "Vehicle information: make, model, year, price, photos, description",
          "Technical information: IP address, browser type, operating system",
          "Usage information: pages visited, time spent on site",
          "Facebook information: profile picture, name, email (when logging in with Facebook)"
        ]
      },

      section2: {
        title: "2. How We Use Your Information",
        content: "We use the collected information to:",
        items: [
          "Provide Bulgarian Car Marketplace services",
          "Process vehicle listings",
          "Connect buyers and sellers",
          "Improve user experience",
          "Send notifications and updates",
          "Create personalized Facebook advertisements",
          "Analytics and statistics through Facebook Analytics"
        ]
      },

      section3: {
        title: "3. Facebook Integration",
        content: "Our website is integrated with Facebook for:",
        items: [
          "Facebook Login for easy sign-in",
          "Facebook Pixel for conversion tracking",
          "Facebook Messenger for customer support",
          "Facebook ads for listing promotion",
          "Social media sharing of listings",
          "Facebook Analytics for service improvement"
        ],
        fbNote: "When you use Facebook features, your information is processed according to Facebook's Data Policy: https://www.facebook.com/policy/cookies/"
      },

      section4: {
        title: "4. Information Sharing",
        content: "We share your information only in the following cases:",
        items: [
          "With other users (only listing information)",
          "With Facebook for advertising and analytics",
          "With service providers (hosting, email services)",
          "When required by law",
          "To protect our rights and safety"
        ]
      },

      section5: {
        title: "5. Your Rights (GDPR)",
        content: "Under GDPR, you have the following rights:",
        items: [
          "Right to access your data",
          "Right to correct inaccurate data",
          "Right to deletion ('right to be forgotten')",
          "Right to restrict processing",
          "Right to data portability",
          "Right to object to processing",
          "Right to withdraw consent"
        ]
      },

      section6: {
        title: "6. Data Retention",
        content: "We store your data while:",
        items: [
          "You have an active account in our system",
          "You have active listings",
          "It's necessary for legal obligations",
          "For dispute resolution",
          "Maximum period: 7 years after account closure"
        ]
      },

      section7: {
        title: "7. Data Security",
        content: "We implement technical and organizational security measures:",
        items: [
          "SSL encryption for all data",
          "Secure servers and databases",
          "Regular security updates",
          "Limited access to personal information",
          "Regular data backups"
        ]
      },

      section8: {
        title: "8. Cookies and Tracking",
        content: "We use the following cookies:",
        items: [
          "Functional cookies for website operation",
          "Facebook Pixel for advertising and analytics",
          "Google Analytics for statistics",
          "Session cookies for convenience",
          "You can manage cookies from your browser settings"
        ]
      },

      section8a: {
        title: "8.1. Facebook Data Deletion Request",
        content: "In accordance with GDPR and Facebook policies, you can request deletion of your personal data:",
        items: [
          "You have the right to request deletion of all data associated with your Facebook account",
          "Deletion requests are processed within 30 days",
          "We verify your identity before deletion for security",
          "We delete all personal data from our servers and databases",
          "We delete activity data, messages, and preferences",
          "We notify you when the deletion process is complete"
        ],
        process: "To request data deletion, send an email to privacy@bulgariancarmarketplace.com with your Facebook ID and reason for the request.",
        note: "After data deletion, you will not be able to recover your account or activity.",
        deletionUrl: "You can also use the automated deletion system: https://bulgariancarmarketplace.com/data-deletion"
      },

      contact: {
        title: "9. Contact",
        content: "For questions about this privacy policy:",
        company: "Bulgarian Car Marketplace EOOD",
        address: "Sofia, Bulgaria",
        email: "privacy@bulgariancarmarketplace.com",
        phone: "+359 888 123 456",
        dataProtection: "Data Protection Officer: dpo@bulgariancarmarketplace.com"
      },

      changes: {
        title: "10. Policy Changes",
        content: "We may update this privacy policy from time to time. For significant changes, we will notify you via email or website notice."
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  return (
    <Container>
      <Title>{currentContent.title}</Title>
      
      <LastUpdated>
        {currentContent.lastUpdated}
      </LastUpdated>

      <Section>
        <Paragraph>{currentContent.intro}</Paragraph>
      </Section>

      <Section>
        <SectionTitle>{currentContent.section1.title}</SectionTitle>
        <Paragraph>{currentContent.section1.content}</Paragraph>
        <List>
          {currentContent.section1.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>{currentContent.section2.title}</SectionTitle>
        <Paragraph>{currentContent.section2.content}</Paragraph>
        <List>
          {currentContent.section2.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>{currentContent.section3.title}</SectionTitle>
        <Paragraph>{currentContent.section3.content}</Paragraph>
        <List>
          {currentContent.section3.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
        <Paragraph>
          <strong>{language === 'bg' ? 'Забележка' : 'Note'}:</strong> {currentContent.section3.fbNote}
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>{currentContent.section4.title}</SectionTitle>
        <Paragraph>{currentContent.section4.content}</Paragraph>
        <List>
          {currentContent.section4.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>{currentContent.section5.title}</SectionTitle>
        <Paragraph>{currentContent.section5.content}</Paragraph>
        <List>
          {currentContent.section5.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>{currentContent.section6.title}</SectionTitle>
        <Paragraph>{currentContent.section6.content}</Paragraph>
        <List>
          {currentContent.section6.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>{currentContent.section7.title}</SectionTitle>
        <Paragraph>{currentContent.section7.content}</Paragraph>
        <List>
          {currentContent.section7.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>{currentContent.section8.title}</SectionTitle>
        <Paragraph>{currentContent.section8.content}</Paragraph>
        <List>
          {currentContent.section8.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>{currentContent.section8a.title}</SectionTitle>
        <Paragraph>{currentContent.section8a.content}</Paragraph>
        <List>
          {currentContent.section8a.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
        <ContactInfo style={{ marginTop: '1rem' }}>
          <p><strong>{language === 'bg' ? 'Процедура' : 'Process'}:</strong> {currentContent.section8a.process}</p>
          <p><strong>{language === 'bg' ? 'Забележка' : 'Note'}:</strong> {currentContent.section8a.note}</p>
          <p><strong>{language === 'bg' ? 'Автоматично изтриване' : 'Automatic Deletion'}:</strong> <a href="https://bulgariancarmarketplace.com/data-deletion" target="_blank" rel="noopener noreferrer">{currentContent.section8a.deletionUrl}</a></p>
        </ContactInfo>
      </Section>

      <Section>
        <SectionTitle>{currentContent.contact.title}</SectionTitle>
        <Paragraph>{currentContent.contact.content}</Paragraph>
        <ContactInfo>
          <p><strong>{currentContent.contact.company}</strong></p>
          <p>{currentContent.contact.address}</p>
          <p>{language === 'bg' ? 'Имейл' : 'Email'}: <a href={`mailto:${currentContent.contact.email}`}>{currentContent.contact.email}</a></p>
          <p>{language === 'bg' ? 'Телефон' : 'Phone'}: <a href={`tel:${currentContent.contact.phone}`}>{currentContent.contact.phone}</a></p>
          <p>{currentContent.contact.dataProtection}</p>
        </ContactInfo>
      </Section>

      <Section>
        <SectionTitle>{currentContent.changes.title}</SectionTitle>
        <Paragraph>{currentContent.changes.content}</Paragraph>
      </Section>
    </Container>
  );
};

export default PrivacyPolicyPage;