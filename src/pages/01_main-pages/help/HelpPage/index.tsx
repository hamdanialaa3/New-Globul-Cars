// src/pages/HelpPage.tsx
// Help Page for Koli One - Redesigned with Obsidian & Peach Theme

import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { SOCIAL_LINKS } from '../../../../constants/socialLinks';
import {
  Search,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  Car,
  User,
  CreditCard,
  Shield,
  Settings,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter
} from 'lucide-react';

// Styled Components
const HelpContainer = styled.div<{ $isDark: boolean }>`
  min-height: 100vh;
  background: ${props => props.$isDark ? '#0F1419' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  padding: 40px 0;
  transition: all 0.3s ease;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.section<{ $isDark: boolean }>`
  text-align: center;
  padding: 64px 24px;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #1A1F2E 0%, #0F1419 100%)'
    : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'};
  color: white;
  border-radius: 24px;
  margin-bottom: 48px;
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};

  h1 {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 800;
    margin-bottom: 16px;
    color: ${props => props.$isDark ? '#FF8C61' : 'white'};
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    font-size: 1.15rem;
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)'};
    max-width: 650px;
    margin: 0 auto 32px;
    font-weight: 500;
  }
`;

const SearchBox = styled.div<{ $isDark: boolean }>`
  max-width: 500px;
  margin: 0 auto;
  position: relative;

  input {
    width: 100%;
    padding: 16px 16px 16px 48px;
    border: 2px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};
    border-radius: 12px;
    font-size: 1rem;
    background: ${props => props.$isDark ? '#0F1419' : 'white'};
    color: ${props => props.$isDark ? '#f8fafc' : '#1F2937'};
    box-shadow: ${props => props.$isDark ? '0 10px 30px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${props => props.$isDark ? '#FF8C61' : '#3b82f6'};
    }
  }

  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.$isDark ? '#FF8C61' : '#64748b'};
  }
`;

const HelpGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const CategoriesSidebar = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E2432' : 'white'};
  padding: 32px;
  border-radius: 24px;
  box-shadow: ${props => props.$isDark ? '0 10px 30px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'rgba(0,0,0,0.05)'};
  height: fit-content;

  h3 {
    font-size: 1.3rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
    margin-bottom: 24px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const CategoryItem = styled.div<{ $active: boolean; $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: ${props =>
    props.$active
      ? (props.$isDark ? 'rgba(255, 140, 97, 0.15)' : '#f1f5f9')
      : 'transparent'
  };
  color: ${props =>
    props.$active
      ? (props.$isDark ? '#FF8C61' : '#1e40af')
      : (props.$isDark ? '#94a3b8' : '#64748b')
  };
  font-weight: ${props => props.$active ? '700' : '500'};

  &:hover {
    background: ${props => props.$isDark ? 'rgba(255, 140, 97, 0.1)' : '#f1f5f9'};
    color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
    transform: translateX(5px);
  }

  .icon {
    width: 20px;
    height: 20px;
  }
`;

const ContentArea = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E2432' : 'white'};
  padding: 32px;
  border-radius: 24px;
  box-shadow: ${props => props.$isDark ? '0 15px 40px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'rgba(0,0,0,0.05)'};
`;

const FAQSection = styled.div<{ $isDark: boolean }>`
  h2 {
    font-size: 1.8rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
    margin-bottom: 24px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const FAQItem = styled.div<{ $isOpen: boolean; $isDark: boolean }>`
  border: 1px solid ${props => props.$isDark ? '#2d3748' : '#e2e8f0'};
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.$isDark ? '#FF8C61' : '#3b82f6'};
  }

  .question {
    background: ${props => props.$isDark ? '#1A1F2E' : '#f8fafc'};
    padding: 16px 20px;
    font-weight: 700;
    color: ${props => props.$isDark ? '#f8fafc' : '#1e40af'};
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.3s ease;

    &:hover {
      background: ${props => props.$isDark ? '#2d3748' : '#f1f5f9'};
    }
  }

  .answer {
    padding: 20px;
    color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
    line-height: 1.7;
    border-top: 1px solid ${props => props.$isDark ? '#2d3748' : '#e2e8f0'};
    background: ${props => props.$isDark ? '#1E2432' : 'white'};
    font-weight: 500;
    max-height: ${props => props.$isOpen ? '500px' : '0'};
    padding: ${props => props.$isOpen ? '20px' : '0 20px'};
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const ContactSupport = styled.div<{ $isDark: boolean }>`
  background: ${props =>
    props.$isDark
      ? '#1A1F2E'
      : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
  };
  padding: 48px;
  border-radius: 24px;
  text-align: center;
  margin-top: 48px;
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};

  h2 {
    font-size: 2.2rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
    margin-bottom: 32px;
    font-size: 1.1rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    font-weight: 500;
  }
`;

const SupportButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const SupportButton = styled.button<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#0F1419' : 'white'};
  border: 2px solid ${props => props.$isDark ? '#2d3748' : '#e2e8f0'};
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f8fafc' : '#1e40af'};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    border-color: ${props => props.$isDark ? '#FF8C61' : '#3b82f6'};
    transform: translateY(-5px);
    box-shadow: ${props => props.$isDark ? '0 10px 20px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
    color: ${props => props.$isDark ? '#FF8C61' : '#3b82f6'};
  }

  .icon {
    width: 20px;
    height: 20px;
  }
`;

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState('general');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'general', name: t('help.categories.general', 'General'), icon: HelpCircle },
    { id: 'buying', name: t('help.categories.buying', 'Buying a Car'), icon: Car },
    { id: 'selling', name: t('help.categories.selling', 'Selling a Car'), icon: User },
    { id: 'account', name: t('help.categories.account', 'Account & Profile'), icon: Settings },
    { id: 'payment', name: t('help.categories.payment', 'Payment & Billing'), icon: CreditCard },
    { id: 'safety', name: t('help.categories.safety', 'Safety & Security'), icon: Shield }
  ];

  const faqs = {
    general: [
      {
        id: 'what-is-koli-one',
        question: t('help.faq.general.q1', 'What is Koli One?'),
        answer: t('help.faq.general.a1', 'Koli One is Bulgaria\'s leading online marketplace for buying and selling cars. We connect buyers and sellers with quality vehicles and exceptional service.')
      },
      {
        id: 'how-to-register',
        question: t('help.faq.general.q2', 'How do I create an account?'),
        answer: t('help.faq.general.a2', 'Click on "Register" in the top right corner, fill out the required information, verify your email, and you\'re ready to start using our platform.')
      },
      {
        id: 'is-it-free',
        question: t('help.faq.general.q3', 'Is using Koli One free?'),
        answer: t('help.faq.general.a3', 'Yes, basic features are completely free. We offer premium features for enhanced visibility and additional services.')
      }
    ],
    buying: [
      {
        id: 'how-to-search',
        question: t('help.faq.buying.q1', 'How do I search for cars?'),
        answer: t('help.faq.buying.a1', 'Use our advanced search filters to find cars by make, model, year, price range, location, and more. You can also browse by categories.')
      },
      {
        id: 'contact-seller',
        question: t('help.faq.buying.q2', 'How do I contact a seller?'),
        answer: t('help.faq.buying.a2', 'Click on the "Message Seller" button on any car listing to start a conversation with the seller through our secure messaging system.')
      },
      {
        id: 'inspection',
        question: t('help.faq.buying.q3', 'Can I inspect the car before buying?'),
        answer: t('help.faq.buying.a3', 'Yes, we encourage buyers to inspect cars before purchase. Contact the seller to arrange a viewing and test drive.')
      }
    ],
    selling: [
      {
        id: 'how-to-list',
        question: t('help.faq.selling.q1', 'How do I list my car for sale?'),
        answer: t('help.faq.selling.a1', 'Click "Sell Car" in the navigation menu, fill out the car details, upload photos, set your price, and publish your listing.')
      },
      {
        id: 'listing-fees',
        question: t('help.faq.selling.q2', 'Are there any fees for listing?'),
        answer: t('help.faq.selling.a2', 'Basic listings are free. Premium listings with enhanced visibility and features are available for a small fee.')
      },
      {
        id: 'edit-listing',
        question: t('help.faq.selling.q3', 'Can I edit my listing after publishing?'),
        answer: t('help.faq.selling.a3', 'Yes, you can edit your listing at any time from your dashboard. Changes will be reflected immediately.')
      }
    ],
    account: [
      {
        id: 'change-password',
        question: t('help.faq.account.q1', 'How do I change my password?'),
        answer: t('help.faq.account.a1', 'Go to your profile settings, click on "Security", and select "Change Password". Follow the instructions to update your password.')
      },
      {
        id: 'update-profile',
        question: t('help.faq.account.q2', 'How do I update my profile information?'),
        answer: t('help.faq.account.a2', 'Navigate to your profile page and click "Edit Profile" to update your personal information, contact details, and preferences.')
      }
    ],
    payment: [
      {
        id: 'payment-methods',
        question: t('help.faq.payment.q1', 'What payment methods do you accept?'),
        answer: t('help.faq.payment.a1', 'We support bank transfers via Revolut (international) and iCard (Bulgaria). Direct transfers to your subscription or payment plan are processed within 1-2 hours.')
      },
      {
        id: 'refund-policy',
        question: t('help.faq.payment.q2', 'What is your refund policy?'),
        answer: t('help.faq.payment.a2', 'Refunds are handled on a case-by-case basis. Contact our support team for assistance with refund requests.')
      }
    ],
    safety: [
      {
        id: 'data-protection',
        question: t('help.faq.safety.q1', 'How do you protect my data?'),
        answer: t('help.faq.safety.a1', 'We use industry-standard encryption and security measures to protect your personal and financial information.')
      },
      {
        id: 'scam-prevention',
        question: t('help.faq.safety.q2', 'How do you prevent scams?'),
        answer: t('help.faq.safety.a2', 'We verify all listings and sellers, provide secure messaging, and offer fraud protection measures.')
      }
    ]
  };

  const toggleFAQ = (faqId: string) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  const currentFAQs = faqs[activeCategory as keyof typeof faqs] || [];

  return (
    <HelpContainer $isDark={isDark}>
      <Container>
        <Header $isDark={isDark}>
          <h1>{t('help.title', 'Help Center')}</h1>
          <p>
            {t('help.subtitle', 'Find answers to your questions and get the support you need.')}
          </p>

          <SearchBox $isDark={isDark}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder={t('help.search.placeholder', 'Search for help...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>
        </Header>

        <HelpGrid>
          <CategoriesSidebar $isDark={isDark}>
            <h3>{t('help.categories.title', 'Categories')}</h3>
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                $active={activeCategory === category.id}
                $isDark={isDark}
                onClick={() => setActiveCategory(category.id)}
              >
                <category.icon className="icon" size={20} />
                {category.name}
              </CategoryItem>
            ))}
          </CategoriesSidebar>

          <ContentArea $isDark={isDark}>
            <FAQSection $isDark={isDark}>
              <h2>{t('help.faq.title', 'Frequently Asked Questions')}</h2>

              {currentFAQs.map((faq) => (
                <FAQItem key={faq.id} $isOpen={openFAQ === faq.id} $isDark={isDark}>
                  <div className="question" onClick={() => toggleFAQ(faq.id)}>
                    {faq.question}
                    {openFAQ === faq.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                  <div className="answer">
                    {faq.answer}
                  </div>
                </FAQItem>
              ))}
            </FAQSection>
          </ContentArea>
        </HelpGrid>

        <ContactSupport $isDark={isDark}>
          <h2>{t('help.contact.title', 'Still Need Help?')}</h2>
          <p>
            {t('help.contact.subtitle', 'Our support team at Alaa Technologies is here to help you with any questions or concerns.')}
          </p>

          <SupportButtons>
            <SupportButton $isDark={isDark}>
              <MessageCircle className="icon" size={20} />
              {t('help.contact.chat', 'Live Chat')}
            </SupportButton>
            <SupportButton $isDark={isDark}>
              <Mail className="icon" size={20} />
              {t('help.contact.email', 'Email Support')}
            </SupportButton>
            <SupportButton $isDark={isDark}>
              <Phone className="icon" size={20} />
              {t('help.contact.phone', 'Text Support')}
            </SupportButton>
            <SupportButton $isDark={isDark}>
              <BookOpen className="icon" size={20} />
              {t('help.contact.docs', 'Documentation')}
            </SupportButton>
          </SupportButtons>

          <div style={{ marginTop: '2rem', padding: '2rem', background: isDark ? '#141A26' : 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', textAlign: 'left', border: isDark ? '1px solid #2d3748' : 'none' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.4rem', color: isDark ? '#FF8C61' : '#1e40af', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('help.contact.departments', 'Contact by Department')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <strong style={{ color: isDark ? '#f8fafc' : '#333' }}>📧 {t('help.contact.general', 'General Inquiries')}:</strong><br />
                <a href="mailto:info@koli.one" style={{ color: isDark ? '#FF8C61' : '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>info@koli.one</a>
              </div>
              <div>
                <strong style={{ color: isDark ? '#f8fafc' : '#333' }}>🛠️ {t('help.contact.technical', 'Technical Support')}:</strong><br />
                <a href="mailto:support@koli.one" style={{ color: isDark ? '#FF8C61' : '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>support@koli.one</a>
              </div>
              <div>
                <strong style={{ color: isDark ? '#f8fafc' : '#333' }}>💼 {t('help.contact.sales', 'Sales')}:</strong><br />
                <a href="mailto:sales@koli.one" style={{ color: isDark ? '#FF8C61' : '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>sales@koli.one</a>
              </div>
              <div>
                <strong style={{ color: isDark ? '#f8fafc' : '#333' }}>🤖 {t('help.contact.ai', 'AI Services')}:</strong><br />
                <a href="mailto:ai@koli.one" style={{ color: isDark ? '#FF8C61' : '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>ai@koli.one</a>
              </div>
              <div>
                <strong style={{ color: isDark ? '#f8fafc' : '#333' }}>⚙️ {t('help.contact.service', 'Services')}:</strong><br />
                <a href="mailto:service@koli.one" style={{ color: isDark ? '#FF8C61' : '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>service@koli.one</a>
              </div>
              <div>
                <strong style={{ color: isDark ? '#f8fafc' : '#333' }}>💳 {t('help.contact.payments', 'Payments')}:</strong><br />
                <a href="mailto:payments@koli.one" style={{ color: isDark ? '#FF8C61' : '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>payments@koli.one</a>
              </div>
              <div>
                <strong style={{ color: isDark ? '#f8fafc' : '#333' }}>👔 {t('help.contact.management', 'Management')}:</strong><br />
                <a href="mailto:management@koli.one" style={{ color: isDark ? '#FF8C61' : '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>management@koli.one</a>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', padding: '32px', background: isDark ? 'linear-gradient(135deg, rgba(255, 140, 97, 0.1), rgba(0, 0, 0, 0.2))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', borderRadius: '24px', textAlign: 'center', border: isDark ? '1px solid #2d3748' : 'none' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: '800', color: isDark ? '#FF8C61' : '#1e40af', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('help.contact.followUs', 'Follow Us')}
            </h3>
            <p style={{ marginBottom: '24px', opacity: 0.9, fontSize: '1rem', color: isDark ? '#cbd5e1' : '#475569', fontWeight: 500 }}>
              {t('help.contact.socialDescription', 'Stay updated with our latest news, tips, and automotive content')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#1877f2', color: 'white', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)' }}
                title="Facebook" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 4px 12px rgba(225, 48, 108, 0.3)' }}
                title="Instagram" aria-label="Instagram">
                <Instagram size={24} />
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#ff0000', color: 'white', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)' }}
                title="YouTube" aria-label="YouTube">
                <Youtube size={24} />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#0077b5', color: 'white', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)' }}
                title="LinkedIn" aria-label="LinkedIn">
                <Linkedin size={24} />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#000000', color: 'white', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
                title="X (Twitter)" aria-label="X (Twitter)">
                <Twitter size={24} />
              </a>
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#000000', color: 'white', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
                title="TikTok" aria-label="TikTok">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          <div style={{ marginTop: '32px', padding: '24px', background: isDark ? '#0F1419' : 'rgba(148, 163, 184, 0.1)', borderRadius: '16px', textAlign: 'center', fontSize: '1rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: 600, border: isDark ? '1px solid #2d3748' : 'none' }}>
            <strong style={{ color: isDark ? '#f8fafc' : '#1F2937', fontSize: '1.1rem' }}>Alaa Technologies</strong><br />
            {t('help.contact.address', '77 Tsar Simeon Blvd, Sofia, Bulgaria')} |
            📞 <strong style={{ color: isDark ? '#FF8C61' : '#3b82f6' }}>+359 87 983 9671</strong> ({t('help.contact.textOnly', 'Text messages only')})<br />
            <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 500 }}>
              {t('help.contact.jurisdiction', 'Operating under Bulgarian and EU law (GDPR compliant)')}
            </span>
          </div>
        </ContactSupport>
      </Container>
    </HelpContainer>
  );
};

export default HelpPage;
