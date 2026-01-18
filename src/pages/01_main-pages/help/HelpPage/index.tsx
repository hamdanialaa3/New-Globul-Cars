// src/pages/HelpPage.tsx
// Help Page for Koli One

import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../../../hooks/useTranslation';
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
  Settings
} from 'lucide-react';

// Styled Components
const HelpContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.section`
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  border-radius: 24px;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto 2rem;
  }
`;

const SearchBox = styled.div`
  max-width: 500px;
  margin: 0 auto;
  position: relative;

  input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    &:focus {
      outline: none;
    }
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
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

const CategoriesSidebar = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: fit-content;

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1.5rem;
  }
`;

const CategoryItem = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$active ? '#f1f5f9' : 'transparent'};
  color: ${props => props.$active ? '#1e40af' : '#64748b'};

  &:hover {
    background: #f1f5f9;
    color: #1e40af;
  }

  .icon {
    width: 20px;
    height: 20px;
  }
`;

const ContentArea = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const FAQSection = styled.div`
  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1.5rem;
  }
`;

const FAQItem = styled.div<{ $isOpen: boolean }>`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;

  .question {
    background: #f8fafc;
    padding: 1rem;
    font-weight: 600;
    color: #1e40af;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.3s ease;

    &:hover {
      background: #f1f5f9;
    }
  }

  .answer {
    padding: 1rem;
    color: #64748b;
    line-height: 1.6;
    border-top: 1px solid #e2e8f0;
    max-height: ${props => props.$isOpen ? '200px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
`;

const ContactSupport = styled.div`
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  margin-top: 3rem;

  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1rem;
  }

  p {
    color: #64748b;
    margin-bottom: 2rem;
  }
`;

const SupportButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const SupportButton = styled.button`
  background: white;
  border: 2px solid #e2e8f0;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  color: #1e40af;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
            {t('help.contact.subtitle', 'Our support team is here to help you with any questions or concerns.')}
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
              {t('help.contact.phone', 'Phone Support')}
            </SupportButton>
            <SupportButton>
              <BookOpen className="icon" size={20} />
              {t('help.contact.docs', 'Documentation')}
            </SupportButton>
          </SupportButtons>
        </ContactSupport>
      </Container>
    </HelpContainer>
  );
};

export default HelpPage;

