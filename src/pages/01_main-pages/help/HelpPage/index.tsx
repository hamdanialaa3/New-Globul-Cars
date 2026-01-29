// src/pages/HelpPage.tsx
// Help Page for Koli One

import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../../../hooks/useTranslation';
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
const HelpContainer = styled.div`
min - height: 100vh;
background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  };
padding: 2rem 0;
`;

const Container = styled.div`
max - width: 1200px;
margin: 0 auto;
padding: 0 1rem;
`;

const Header = styled.section`
text - align: center;
padding: 3rem 0;
background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
      : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
  };
color: white;
border - radius: 24px;
margin - bottom: 3rem;

  h1 {
  font - size: 2.5rem;
  font - weight: 700;
  margin - bottom: 1rem;
}

  p {
  font - size: 1.1rem;
  opacity: 0.9;
  max - width: 600px;
  margin: 0 auto 2rem;
}
`;

const SearchBox = styled.div`
max - width: 500px;
margin: 0 auto;
position: relative;

  input {
  width: 100 %;
  padding: 1rem 1rem 1rem 3rem;
  border: none;
  border - radius: 12px;
  font - size: 1rem;
  box - shadow: 0 4px 20px ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'};
  background: ${({ theme }) => theme.colors?.background?.paper || theme.colors.background.light || 'white'};
  color: ${({ theme }) => theme.colors?.text?.primary || theme.text?.primary || '#333'};

    &:focus {
    outline: none;
  }
}

  .search - icon {
  position: absolute;
  left: 1rem;
  top: 50 %;
  transform: translateY(-50 %);
  color: ${({ theme }) => theme.colors?.text?.secondary || theme.text?.secondary || '#64748b'};
}
`;

const HelpGrid = styled.div`
display: grid;
grid - template - columns: 1fr 2fr;
gap: 3rem;
margin - bottom: 3rem;

@media(max - width: 768px) {
  grid - template - columns: 1fr;
  gap: 2rem;
}
`;

const CategoriesSidebar = styled.div`
background: ${({ theme }) => theme.colors?.background?.paper || theme.colors.background.light || 'white'};
padding: 2rem;
border - radius: 20px;
box - shadow: 0 4px 20px ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'};
height: fit - content;

  h3 {
  font - size: 1.3rem;
  font - weight: 600;
  color: ${({ theme }) => theme.colors?.primary?.main || theme.colors.primary.main || '#1e40af'};
  margin - bottom: 1.5rem;
}
`;

const CategoryItem = styled.div<{ $active: boolean }>`
display: flex;
align - items: center;
gap: 0.75rem;
padding: 0.75rem;
border - radius: 8px;
cursor: pointer;
transition: all 0.3s ease;
background: ${({ $active, theme }) =>
    $active
      ? (theme.mode === 'dark' ? 'rgba(30, 64, 175, 0.2)' : '#f1f5f9')
      : 'transparent'
  };
color: ${({ $active, theme }) =>
    $active
      ? (theme.colors?.primary?.main || theme.colors.primary.main || '#1e40af')
      : (theme.colors?.text?.secondary || theme.text?.secondary || '#64748b')
  };

  &:hover {
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(30, 64, 175, 0.1)' : '#f1f5f9'};
  color: ${({ theme }) => theme.colors?.primary?.main || theme.colors.primary.main || '#1e40af'};
}

  .icon {
  width: 20px;
  height: 20px;
}
`;

const ContentArea = styled.div`
background: ${({ theme }) => theme.colors?.background?.paper || theme.colors.background.light || 'white'};
padding: 2rem;
border - radius: 20px;
box - shadow: 0 4px 20px ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'};
`;

const FAQSection = styled.div`
  h2 {
  font - size: 1.8rem;
  font - weight: 600;
  color: ${({ theme }) => theme.colors?.primary?.main || theme.colors.primary.main || '#1e40af'};
  margin - bottom: 1.5rem;
}
`;

const FAQItem = styled.div<{ $isOpen: boolean }>`
border: 1px solid ${({ theme }) => theme.colors?.border || theme.colors.border.default || '#e2e8f0'};
border - radius: 8px;
margin - bottom: 1rem;
overflow: hidden;

  .question {
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(30, 64, 175, 0.1)' : '#f8fafc'};
  padding: 1rem;
  font - weight: 600;
  color: ${({ theme }) => theme.colors?.primary?.main || theme.colors.primary.main || '#1e40af'};
  cursor: pointer;
  display: flex;
  justify - content: space - between;
  align - items: center;
  transition: background 0.3s ease;

    &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(30, 64, 175, 0.2)' : '#f1f5f9'};
  }
}

  .answer {
  padding: 1rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || theme.text?.secondary || '#64748b'};
  line - height: 1.6;
  border - top: 1px solid ${({ theme }) => theme.colors?.border || theme.colors.border.default || '#e2e8f0'};
  max - height: ${props => props.$isOpen ? '200px' : '0'};
  overflow: hidden;
  transition: max - height 0.3s ease;
}
`;

const ContactSupport = styled.div`
background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
      : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
  };
padding: 2rem;
border - radius: 20px;
text - align: center;
margin - top: 3rem;

  h2 {
  font - size: 1.8rem;
  font - weight: 600;
  color: ${({ theme }) => theme.colors?.primary?.main || theme.colors.primary.main || '#1e40af'};
  margin - bottom: 1rem;
}

  p {
  color: ${({ theme }) => theme.colors?.text?.secondary || theme.text?.secondary || '#64748b'};
  margin - bottom: 2rem;
}
`;

const SupportButtons = styled.div`
display: grid;
grid - template - columns: repeat(auto - fit, minmax(200px, 1fr));
gap: 1rem;
`;

const SupportButton = styled.button`
background: ${({ theme }) => theme.colors?.background?.paper || theme.colors.background.light || 'white'};
border: 2px solid ${({ theme }) => theme.colors?.border || theme.colors.border.default || '#e2e8f0'};
padding: 1rem;
border - radius: 12px;
cursor: pointer;
transition: all 0.3s ease;
display: flex;
align - items: center;
gap: 0.75rem;
font - weight: 500;
color: ${({ theme }) => theme.colors?.primary?.main || theme.colors.primary.main || '#1e40af'};

  &:hover {
  border - color: ${({ theme }) => theme.colors?.primary?.main || theme.colors.primary.main || '#3b82f6'};
  transform: translateY(-2px);
  box - shadow: 0 4px 20px ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'};
}

  .icon {
  width: 20px;
  height: 20px;
}
`;

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
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
        id: 'what-is-globul-cars',
        question: t('help.faq.general.q1', 'What is Globul Cars?'),
        answer: t('help.faq.general.a1', 'Globul Cars is Bulgaria\'s leading online marketplace for buying and selling cars. We connect buyers and sellers with quality vehicles and exceptional service.')
      },
      {
        id: 'how-to-register',
        question: t('help.faq.general.q2', 'How do I create an account?'),
        answer: t('help.faq.general.a2', 'Click on "Register" in the top right corner, fill out the required information, verify your email, and you\'re ready to start using our platform.')
      },
      {
        id: 'is-it-free',
        question: t('help.faq.general.q3', 'Is using Globul Cars free?'),
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
    <HelpContainer>
      <Container>
        <Header>
          <h1>{t('help.title', 'Help Center')}</h1>
          <p>
            {t('help.subtitle', 'Find answers to your questions and get the support you need.')}
          </p>

          <SearchBox>
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
          <CategoriesSidebar>
            <h3>{t('help.categories.title', 'Categories')}</h3>
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                $active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                <category.icon className="icon" size={20} />
                {category.name}
              </CategoryItem>
            ))}
          </CategoriesSidebar>

          <ContentArea>
            <FAQSection>
              <h2>{t('help.faq.title', 'Frequently Asked Questions')}</h2>

              {currentFAQs.map((faq) => (
                <FAQItem key={faq.id} $isOpen={openFAQ === faq.id}>
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

        <ContactSupport>
          <h2>{t('help.contact.title', 'Still Need Help?')}</h2>
          <p>
            {t('help.contact.subtitle', 'Our support team at Alaa Technologies is here to help you with any questions or concerns.')}
          </p>

          <SupportButtons>
            <SupportButton>
              <MessageCircle className="icon" size={20} />
              {t('help.contact.chat', 'Live Chat')}
            </SupportButton>
            <SupportButton>
              <Mail className="icon" size={20} />
              {t('help.contact.email', 'Email Support')}
            </SupportButton>
            <SupportButton>
              <Phone className="icon" size={20} />
              {t('help.contact.phone', 'Text Support')}
            </SupportButton>
            <SupportButton>
              <BookOpen className="icon" size={20} />
              {t('help.contact.docs', 'Documentation')}
            </SupportButton>
          </SupportButtons>

          {/* Department Contact Information */}
          <div style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.4rem' }}>
              {t('help.contact.departments', 'Contact by Department')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <strong>📧 {t('help.contact.general', 'General Inquiries')}:</strong><br />
                <a href="mailto:info@koli.one" style={{ color: '#3b82f6' }}>info@koli.one</a>
              </div>
              <div>
                <strong>🛠️ {t('help.contact.technical', 'Technical Support')}:</strong><br />
                <a href="mailto:support@koli.one" style={{ color: '#3b82f6' }}>support@koli.one</a>
              </div>
              <div>
                <strong>💼 {t('help.contact.sales', 'Sales')}:</strong><br />
                <a href="mailto:sales@koli.one" style={{ color: '#3b82f6' }}>sales@koli.one</a>
              </div>
              <div>
                <strong>🤖 {t('help.contact.ai', 'AI Services')}:</strong><br />
                <a href="mailto:ai@koli.one" style={{ color: '#3b82f6' }}>ai@koli.one</a>
              </div>
              <div>
                <strong>⚙️ {t('help.contact.service', 'Services')}:</strong><br />
                <a href="mailto:service@koli.one" style={{ color: '#3b82f6' }}>service@koli.one</a>
              </div>
              <div>
                <strong>💳 {t('help.contact.payments', 'Payments')}:</strong><br />
                <a href="mailto:payments@koli.one" style={{ color: '#3b82f6' }}>payments@koli.one</a>
              </div>
              <div>
                <strong>👔 {t('help.contact.management', 'Management')}:</strong><br />
                <a href="mailto:management@koli.one" style={{ color: '#3b82f6' }}>management@koli.one</a>
              </div>
            </div>

          </div>

          {/* Social Media Section */}
          <div style={{ marginTop: '2rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', borderRadius: '16px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', fontWeight: '600' }}>
              {t('help.contact.followUs', 'Follow Us on Social Media')}
            </h3>
            <p style={{ marginBottom: '1.5rem', opacity: 0.9, fontSize: '0.95rem' }}>
              {t('help.contact.socialDescription', 'Stay updated with our latest news, tips, and automotive content')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', background: '#1877f2', color: 'white', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(24, 119, 242, 0.5)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 119, 242, 0.3)'; }}
                title="Facebook" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(225, 48, 108, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(225, 48, 108, 0.5)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 48, 108, 0.3)'; }}
                title="Instagram" aria-label="Instagram">
                <Instagram size={24} />
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', background: '#ff0000', color: 'white', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 0, 0, 0.5)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 0, 0, 0.3)'; }}
                title="YouTube" aria-label="YouTube">
                <Youtube size={24} />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', background: '#0077b5', color: 'white', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 119, 181, 0.5)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 119, 181, 0.3)'; }}
                title="LinkedIn" aria-label="LinkedIn">
                <Linkedin size={24} />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', background: '#000000', color: 'white', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.5)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'; }}
                title="X (Twitter)" aria-label="X (Twitter)">
                <Twitter size={24} />
              </a>
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', background: '#000000', color: 'white', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.5)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'; }}
                title="TikTok" aria-label="TikTok">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a href={SOCIAL_LINKS.threads} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', background: '#000000', color: 'white', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.5)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'; }}
                title="Threads" aria-label="Threads">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126 1.974a11.881 11.881 0 0 0-2.588-.12c-1.014.057-1.83.339-2.43.84-.537.449-.827 1.014-.794 1.546.032.496.296.936.764 1.273.555.4 1.27.574 2.068.527 1.06-.058 1.857-.4 2.37-1.016.45-.54.73-1.314.833-2.3-.73-.244-1.485-.43-2.252-.555-2.81-.457-5.03.196-6.61 1.942-1.298 1.437-1.946 3.305-1.875 5.403.07 2.098.948 3.834 2.541 5.02 1.412.952 3.14 1.43 5.14 1.43 3.302 0 5.83-1.218 7.513-3.619 1.31-1.869 1.972-4.302 1.972-7.236 0-2.933-.663-5.366-1.972-7.236-1.683-2.401-4.21-3.619-7.513-3.619z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Company Information */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '12px', textAlign: 'center', fontSize: '0.95em' }}>
            <strong>Alaa Technologies</strong><br />
            {t('help.contact.address', '77 Tsar Simeon Blvd, Sofia, Bulgaria')} |
            📞 <strong>+359 87 983 9671</strong> ({t('help.contact.textOnly', 'Text messages only - No voice calls')})<br />
            <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
              {t('help.contact.jurisdiction', 'Operating under Bulgarian and EU law (GDPR compliant)')}
            </span>
          </div>
        </ContactSupport>
      </Container>
    </HelpContainer>
  );
};

export default HelpPage;

