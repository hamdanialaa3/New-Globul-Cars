import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { SOCIAL_PLATFORMS } from '@/constants/socialLinks';
import {
    Facebook,
    Instagram,
    Youtube,
    Linkedin,
    Twitter,
    ExternalLink,
    Share2
} from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 4rem 1rem;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  
  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    font-size: 1.25rem;
    color: var(--text-secondary);
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const PlatformCard = styled.a<{ $color: string }>`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  padding: 2rem;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.$color};
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.$color};
  }
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  background: ${props => props.$color + '15'};
  color: ${props => props.$color};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const PlatformName = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PlatformDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex: 1;
`;

const ActionLink = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.$color};
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const getIcon = (id: string) => {
    switch (id) {
        case 'facebook': return <Facebook />;
        case 'instagram': return <Instagram />;
        case 'youtube': return <Youtube />;
        case 'linkedin': return <Linkedin />;
        case 'twitter': return <Twitter />;
        case 'tiktok': return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
        );
        case 'threads': return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126 1.974a11.881 11.881 0 0 0-2.588-.12c-1.014.057-1.83.339-2.43.84-.537.449-.827 1.014-.794 1.546.032.496.296.936.764 1.273.555.4 1.27.574 2.068.527 1.06-.058 1.857-.4 2.37-1.016.45-.54.73-1.314.833-2.3-.73-.244-1.485-.43-2.252-.555-2.81-.457-5.03.196-6.61 1.942-1.298 1.437-1.946 3.305-1.875 5.403.07 2.098.948 3.834 2.541 5.02 1.412.952 3.14 1.43 5.14 1.43 3.302 0 5.83-1.218 7.513-3.619 1.31-1.869 1.972-4.302 1.972-7.236 0-2.933-.663-5.366-1.972-7.236-1.683-2.401-4.21-3.619-7.513-3.619z" />
            </svg>
        );
        default: return <Share2 />;
    }
};

const SocialHubPage: React.FC = () => {
    const { language } = useLanguage();

    return (
        <PageContainer>
            <SEOHead
                title={language === 'bg' ? 'Социален център | Koli One' : 'Social Hub | Koli One'}
                description={language === 'bg' ? 'Свържете се с Koli One във всички социални платформи.' : 'Connect with Koli One across all social platforms.'}
            />

            <ContentWrapper>
                <Header>
                    <h1>{language === 'bg' ? 'Социален център' : 'Social Hub'}</h1>
                    <p>
                        {language === 'bg'
                            ? 'Бъдете в крак с нашите най-нови предложения, автомобилни съвети и новини от общността.'
                            : 'Stay up to date with our latest listings, automotive tips, and community news.'}
                    </p>
                </Header>

                <Grid>
                    {SOCIAL_PLATFORMS.map((platform) => (
                        <PlatformCard
                            key={platform.id}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            $color={platform.color}
                        >
                            <IconWrapper $color={platform.color}>
                                {getIcon(platform.id)}
                            </IconWrapper>

                            <PlatformName>
                                {platform.name}
                                <ExternalLink size={20} />
                            </PlatformName>

                            <PlatformDescription>
                                {platform.description[language as 'bg' | 'en'] || platform.description.en}
                            </PlatformDescription>

                            <ActionLink $color={platform.color}>
                                {language === 'bg' ? 'Последвайте ни' : 'Follow Us'}
                            </ActionLink>
                        </PlatformCard>
                    ))}
                </Grid>
            </ContentWrapper>
        </PageContainer>
    );
};

export default SocialHubPage;
