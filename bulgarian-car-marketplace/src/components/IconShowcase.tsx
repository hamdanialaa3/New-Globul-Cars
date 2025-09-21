// src/components/IconShowcase.tsx
// Ultra Professional Icons Showcase with Ghost Effects

import React from 'react';
import styled from 'styled-components';
import {
  ProfessionalFacebookIcon,
  ProfessionalInstagramIcon,
  ProfessionalTwitterIcon,
  ProfessionalLinkedInIcon,
  ProfessionalCarIcon,
  ProfessionalSettingsIcon,
  ProfessionalSearchIcon,
  ProfessionalCheckIcon,
  ProfessionalMoneyIcon,
  ProfessionalShieldIcon,
  ProfessionalUserIcon,
  ProfessionalLogoutIcon,
  ProfessionalLoginIcon,
  ProfessionalUserPlusIcon,
  ProfessionalFontIcon,
  ProfessionalBellIcon,
  ProfessionalHomeIcon,
  ProfessionalLocationIcon,
  ProfessionalClockIcon,
  ProfessionalChatIcon,
  ProfessionalSendIcon,
  ProfessionalInboxIcon,
  ProfessionalEmailIcon,
  ProfessionalMobileIcon,
  ProfessionalHeartIcon,
  ProfessionalLockIcon,
  ProfessionalUnlockIcon,
  ProfessionalPlusIcon,
  ProfessionalArrowLeftIcon,
  ProfessionalKeyIcon,
  ProfessionalStarIcon
} from './CustomIcons';

const ShowcaseContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.primary.main};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    max-width: 600px;
    margin: 0 auto;
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const IconCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  .icon-container {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
  }

  .icon-name {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .icon-description {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary.main};
  margin: 3rem 0 2rem 0;
  text-align: center;
`;

const IconShowcase: React.FC = () => {
  const socialIcons = [
    { component: ProfessionalFacebookIcon, name: 'Facebook', description: 'تأثير إضاءة متلاشية' },
    { component: ProfessionalInstagramIcon, name: 'Instagram', description: 'تأثير فاخر مع تدرج' },
    { component: ProfessionalTwitterIcon, name: 'Twitter', description: 'موجات نبضية' },
    { component: ProfessionalLinkedInIcon, name: 'LinkedIn', description: 'ظل شبحي متقدم' }
  ];

  const appIcons = [
    { component: ProfessionalCarIcon, name: 'Car', description: 'شعاع ضوئي متحرك' },
    { component: ProfessionalSettingsIcon, name: 'Settings', description: 'تأثير طافي' },
    { component: ProfessionalSearchIcon, name: 'Search', description: 'إضاءة متوهجة' },
    { component: ProfessionalCheckIcon, name: 'Check', description: 'تأثير فاخر' },
    { component: ProfessionalMoneyIcon, name: 'Money', description: 'شعاع ذهبي' },
    { component: ProfessionalShieldIcon, name: 'Shield', description: 'ظل شبحي حمائي' }
  ];

  const userIcons = [
    { component: ProfessionalUserIcon, name: 'User', description: 'تأثير طافي' },
    { component: ProfessionalLogoutIcon, name: 'Logout', description: 'إضاءة حمراء' },
    { component: ProfessionalLoginIcon, name: 'Login', description: 'ظل شبحي أخضر' },
    { component: ProfessionalUserPlusIcon, name: 'User Plus', description: 'نبضات زرقاء' },
    { component: ProfessionalFontIcon, name: 'Font', description: 'شعاع ضوئي' },
    { component: ProfessionalBellIcon, name: 'Bell', description: 'نبضات ذهبية' }
  ];

  const otherIcons = [
    { component: ProfessionalHomeIcon, name: 'Home', description: 'تأثير طافي' },
    { component: ProfessionalLocationIcon, name: 'Location', description: 'إضاءة حمراء' },
    { component: ProfessionalClockIcon, name: 'Clock', description: 'ظل شبحي' },
    { component: ProfessionalChatIcon, name: 'Chat', description: 'شعاع أزرق' },
    { component: ProfessionalSendIcon, name: 'Send', description: 'تأثير فاخر' },
    { component: ProfessionalInboxIcon, name: 'Inbox', description: 'تأثير طافي' },
    { component: ProfessionalEmailIcon, name: 'Email', description: 'ظل شبحي' },
    { component: ProfessionalMobileIcon, name: 'Mobile', description: 'شعاع ضوئي' },
    { component: ProfessionalHeartIcon, name: 'Heart', description: 'نبضات حمراء' },
    { component: ProfessionalLockIcon, name: 'Lock', description: 'تأثير فاخر' },
    { component: ProfessionalUnlockIcon, name: 'Unlock', description: 'إضاءة خضراء' },
    { component: ProfessionalPlusIcon, name: 'Plus', description: 'نبضات خضراء' },
    { component: ProfessionalArrowLeftIcon, name: 'Arrow Left', description: 'تأثير طافي' },
    { component: ProfessionalKeyIcon, name: 'Key', description: 'شعاع ذهبي' },
    { component: ProfessionalStarIcon, name: 'Star', description: 'تأثير فاخر ذهبي' }
  ];

  const renderIconGrid = (icons: any[], title: string) => (
    <>
      <SectionTitle>{title}</SectionTitle>
      <IconGrid>
        {icons.map((icon, index) => {
          const IconComponent = icon.component;
          return (
            <IconCard key={index}>
              <div className="icon-container">
                <IconComponent size={48} />
              </div>
              <div className="icon-name">{icon.name}</div>
              <div className="icon-description">{icon.description}</div>
            </IconCard>
          );
        })}
      </IconGrid>
    </>
  );

  return (
    <ShowcaseContainer>
      <Header>
        <h1>✨ الأيقونات فائقة الاحترافية الجديدة</h1>
        <p>
          أيقونات ثورية مع تأثيرات ضوئية متلاشية وظلال شبحية خيالية - تجربة بصرية لا مثيل لها
        </p>
      </Header>

      {renderIconGrid(socialIcons, '📱 وسائل التواصل الاجتماعي')}
      {renderIconGrid(appIcons, '⚙️ أيقونات التطبيق')}
      {renderIconGrid(userIcons, '👤 أيقونات المستخدم')}
      {renderIconGrid(otherIcons, '🔧 أيقونات متنوعة')}

      <SectionTitle>🌟 التأثيرات فائقة التطور</SectionTitle>
      <IconGrid>
        <IconCard>
          <div className="icon-container">
            <ProfessionalStarIcon size={48} />
          </div>
          <div className="icon-name">إضاءة متلاشية</div>
          <div className="icon-description">Fade Glow مع ظلال متعددة</div>
        </IconCard>

        <IconCard>
          <div className="icon-container">
            <ProfessionalShieldIcon size={48} />
          </div>
          <div className="icon-name">ظلال شبحية</div>
          <div className="icon-description">Ghost Shadow متقدمة</div>
        </IconCard>

        <IconCard>
          <div className="icon-container">
            <ProfessionalCarIcon size={48} />
          </div>
          <div className="icon-name">شعاع ضوئي</div>
          <div className="icon-description">Light Beam متحرك</div>
        </IconCard>

        <IconCard>
          <div className="icon-container">
            <ProfessionalSettingsIcon size={48} />
          </div>
          <div className="icon-name">تأثير طافي</div>
          <div className="icon-description">Floating Effect سلس</div>
        </IconCard>

        <IconCard>
          <div className="icon-container">
            <ProfessionalHeartIcon size={48} />
          </div>
          <div className="icon-name">موجات نبضية</div>
          <div className="icon-description">Pulse Waves متتالية</div>
        </IconCard>

        <IconCard>
          <div className="icon-container">
            <ProfessionalInstagramIcon size={48} />
          </div>
          <div className="icon-name">تأثير فاخر</div>
          <div className="icon-description">Luxury Premium مع انعكاس</div>
        </IconCard>
      </IconGrid>
    </ShowcaseContainer>
  );
};

export default IconShowcase;