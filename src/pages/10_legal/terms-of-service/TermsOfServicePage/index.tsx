// src/pages/TermsOfServicePage.tsx
// Terms of Service Page for Bulgarian Car Marketplace
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

const TermsOfServicePage: React.FC = () => {
  const { language } = useTranslation();

  const content = {
    bg: {
      title: "Общи Условия",
      lastUpdated: "Последна актуализация: 26 септември 2025",
      intro: "Добре дошли в Bulgarian Car Marketplace! Тези общи условия регулират използването на нашата платформа за търговия с автомобили.",
      
      section1: {
        title: "1. Приемане на условията",
        content: "Чрез използването на Bulgarian Car Marketplace, вие се съгласявате с тези общи условия. Ако не се съгласявате с някое от условията, моля не използвайте нашата платформа."
      },

      section2: {
        title: "2. Описание на услугите",
        content: "Bulgarian Car Marketplace е онлайн платформа, която:",
        items: [
          "Свързва купувачи и продавачи на автомобили",
          "Предоставя възможност за публикуване на обяви",
          "Предлага търсене и филтриране на автомобили",
          "Интегрира Facebook услуги за подобрено изживяване",
          "Предоставя комуникационни инструменти"
        ]
      },

      section3: {
        title: "3. Регистрация и акаунти",
        content: "За да използвате пълната функционалност, трябва да:",
        items: [
          "Предоставите точна и актуална информация",
          "Поддържате сигурността на паролата си",
          "Уведомите ни за неоторизиран достъп",
          "Отговаряте за всички дейности в акаунта си",
          "Можете да влизате чрез Facebook Login"
        ]
      },

      section4: {
        title: "4. Обяви за автомобили",
        content: "При публикуване на обява, се задължавате да:",
        items: [
          "Предоставяте точна информация за автомобила",
          "Използвате реални и актуални снимки",
          "Не публикувате измамни или подвеждащи обяви",
          "Спазвате българското законодателство",
          "Актуализирате или премахвате продадени автомобили",
          "Не нарушавате авторски права при снимките"
        ]
      },

      section5: {
        title: "5. Facebook интеграция",
        content: "Нашата платформа използва Facebook услуги за:",
        items: [
          "Автентификация чрез Facebook Login",
          "Реклами и маркетинг чрез Facebook Ads",
          "Комуникация чрез Messenger",
          "Анализ и статистики чрез Facebook Analytics",
          "Споделяне в социалните мрежи"
        ],
        note: "При използване на Facebook функции се прилагат и Facebook Terms of Service."
      },

      section6: {
        title: "6. Забранени дейности",
        content: "Забранено е:",
        items: [
          "Публикуване на неточна или измамна информация",
          "Нарушаване на авторски права",
          "Спам или нежелана комуникация",
          "Хакинг или нарушаване на сигурността",
          "Използване за незаконни дейности",
          "Продажба на крадени автомобили",
          "Дискриминация или езикови нарушения"
        ]
      },

      section7: {
        title: "7. Интелектуална собственост",
        content: "Bulgarian Car Marketplace запазва правата върху:",
        items: [
          "Дизайна и функционалността на платформата",
          "Логото и търговските марки",
          "Софтуерния код и алгоритми",
          "Съдържанието, създадено от нас"
        ],
        note: "Потребителите запазват правата върху своите обяви и снимки."
      },

      section8: {
        title: "8. Отказ от отговорност",
        content: "Bulgarian Car Marketplace не носи отговорност за:",
        items: [
          "Точността на информацията в обявите",
          "Качеството или състоянието на автомобилите",
          "Транзакциите между потребителите",
          "Загуби или щети от използването на платформата",
          "Действията на трети страни (включително Facebook)"
        ]
      },

      section9: {
        title: "9. Лимитиране на отговорността",
        content: "Нашата отговорност е ограничена до:",
        items: [
          "Максимална стойност равна на таксите, платени през последните 12 месеца",
          "Не включва непреки или последващи щети",
          "Не се отнася за умишлени нарушения",
          "Спазва българското законодателство"
        ]
      },

      section10: {
        title: "10. Прекратяване на услугата",
        content: "Можем да прекратим достъпа ви при:",
        items: [
          "Нарушаване на тези общи условия",
          "Измамна или незаконна дейност",
          "Многократни оплаквания от други потребители",
          "По ваше искане",
          "Прекратяване на платформата"
        ]
      },

      section11: {
        title: "11. Приложимо право и спорове",
        content: "Тези условия се регулират от:",
        items: [
          "Българското право",
          "Европейското право (GDPR, Digital Services Act)",
          "Международните конвенции",
          "Спорове се решават в българските съдилища"
        ]
      },

      contact: {
        title: "12. Контакт",
        content: "За въпроси относно тези общи условия:",
        company: "Bulgarian Car Marketplace EOOD",
        address: "гр. София, България",
        email: "legal@bulgariancarmarketplace.com",
        phone: "+359 888 123 456"
      },

      changes: {
        title: "13. Промени в условията",
        content: "Можем да актуализираме тези условия от време на време. При съществени промени ще ви уведомим чрез имейл или известие на платформата. Продължаването на използването след промените означава приемане на новите условия."
      }
    },

    en: {
      title: "Terms of Service",
      lastUpdated: "Last updated: September 26, 2025",
      intro: "Welcome to Bulgarian Car Marketplace! These terms of service govern your use of our automotive trading platform.",
      
      section1: {
        title: "1. Acceptance of Terms",
        content: "By using Bulgarian Car Marketplace, you agree to these terms of service. If you disagree with any part of these terms, please do not use our platform."
      },

      section2: {
        title: "2. Service Description",
        content: "Bulgarian Car Marketplace is an online platform that:",
        items: [
          "Connects car buyers and sellers",
          "Provides vehicle listing capabilities",
          "Offers search and filtering tools",
          "Integrates Facebook services for enhanced experience",
          "Provides communication tools"
        ]
      },

      section3: {
        title: "3. Registration and Accounts",
        content: "To use full functionality, you must:",
        items: [
          "Provide accurate and current information",
          "Maintain the security of your password",
          "Notify us of unauthorized access",
          "Be responsible for all account activities",
          "Can sign in through Facebook Login"
        ]
      },

      section4: {
        title: "4. Vehicle Listings",
        content: "When posting a listing, you commit to:",
        items: [
          "Provide accurate vehicle information",
          "Use real and current photos",
          "Not post fraudulent or misleading listings",
          "Comply with Bulgarian law",
          "Update or remove sold vehicles",
          "Not violate copyrights in photos"
        ]
      },

      section5: {
        title: "5. Facebook Integration",
        content: "Our platform uses Facebook services for:",
        items: [
          "Authentication through Facebook Login",
          "Advertising and marketing via Facebook Ads",
          "Communication through Messenger",
          "Analytics and statistics via Facebook Analytics",
          "Social media sharing"
        ],
        note: "When using Facebook features, Facebook Terms of Service also apply."
      },

      section6: {
        title: "6. Prohibited Activities",
        content: "It is prohibited to:",
        items: [
          "Post inaccurate or fraudulent information",
          "Violate copyrights",
          "Send spam or unwanted communication",
          "Hack or breach security",
          "Use for illegal activities",
          "Sell stolen vehicles",
          "Engage in discrimination or offensive language"
        ]
      },

      section7: {
        title: "7. Intellectual Property",
        content: "Bulgarian Car Marketplace retains rights to:",
        items: [
          "Platform design and functionality",
          "Logo and trademarks",
          "Software code and algorithms",
          "Content created by us"
        ],
        note: "Users retain rights to their own listings and photos."
      },

      section8: {
        title: "8. Disclaimer",
        content: "Bulgarian Car Marketplace is not responsible for:",
        items: [
          "Accuracy of information in listings",
          "Quality or condition of vehicles",
          "Transactions between users",
          "Losses or damages from platform use",
          "Actions of third parties (including Facebook)"
        ]
      },

      section9: {
        title: "9. Limitation of Liability",
        content: "Our liability is limited to:",
        items: [
          "Maximum value equal to fees paid in the last 12 months",
          "Does not include indirect or consequential damages",
          "Does not apply to intentional violations",
          "Complies with Bulgarian law"
        ]
      },

      section10: {
        title: "10. Service Termination",
        content: "We may terminate your access upon:",
        items: [
          "Violation of these terms of service",
          "Fraudulent or illegal activity",
          "Multiple complaints from other users",
          "Your request",
          "Platform termination"
        ]
      },

      section11: {
        title: "11. Applicable Law and Disputes",
        content: "These terms are governed by:",
        items: [
          "Bulgarian law",
          "European law (GDPR, Digital Services Act)",
          "International conventions",
          "Disputes resolved in Bulgarian courts"
        ]
      },

      contact: {
        title: "12. Contact",
        content: "For questions about these terms of service:",
        company: "Bulgarian Car Marketplace EOOD",
        address: "Sofia, Bulgaria",
        email: "legal@bulgariancarmarketplace.com",
        phone: "+359 888 123 456"
      },

      changes: {
        title: "13. Changes to Terms",
        content: "We may update these terms from time to time. For significant changes, we will notify you via email or platform notice. Continued use after changes means acceptance of the new terms."
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
        <Paragraph>
          <strong>{language === 'bg' ? 'Забележка' : 'Note'}:</strong> {currentContent.section5.note}
        </Paragraph>
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
        <Paragraph>
          <strong>{language === 'bg' ? 'Забележка' : 'Note'}:</strong> {currentContent.section7.note}
        </Paragraph>
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
        <SectionTitle>{currentContent.section9.title}</SectionTitle>
        <Paragraph>{currentContent.section9.content}</Paragraph>
        <List>
          {currentContent.section9.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>{currentContent.section10.title}</SectionTitle>
        <Paragraph>{currentContent.section10.content}</Paragraph>
        <List>
          {currentContent.section10.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>{currentContent.section11.title}</SectionTitle>
        <Paragraph>{currentContent.section11.content}</Paragraph>
        <List>
          {currentContent.section11.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>{currentContent.contact.title}</SectionTitle>
        <Paragraph>{currentContent.contact.content}</Paragraph>
        <ContactInfo>
          <p><strong>{currentContent.contact.company}</strong></p>
          <p>{currentContent.contact.address}</p>
          <p>{language === 'bg' ? 'Имейл' : 'Email'}: <a href={`mailto:${currentContent.contact.email}`}>{currentContent.contact.email}</a></p>
          <p>{language === 'bg' ? 'Телефон' : 'Phone'}: <a href={`tel:${currentContent.contact.phone}`}>{currentContent.contact.phone}</a></p>
        </ContactInfo>
      </Section>

      <Section>
        <SectionTitle>{currentContent.changes.title}</SectionTitle>
        <Paragraph>{currentContent.changes.content}</Paragraph>
      </Section>
    </Container>
  );
};

export default TermsOfServicePage;