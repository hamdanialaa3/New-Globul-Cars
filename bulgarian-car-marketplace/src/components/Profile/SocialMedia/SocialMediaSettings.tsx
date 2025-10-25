// SocialMediaSettings.tsx - Connect Social Media Accounts
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Inspired by: Buffer, Hootsuite, Later

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../../contexts/AuthProvider';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube,
  Link as LinkIcon,
  Unlink,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { PLATFORM_CONFIGS, SocialMediaAccount, SocialPlatform } from '../../../types/social-media.types';
import socialMediaService from '../../../services/social/social-media.service';

// TikTok Icon (custom SVG)
const TikTokIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const SocialMediaSettings: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<SocialPlatform | null>(null);

  const t = {
    bg: {
      title: 'Акаунти в социални мрежи',
      subtitle: 'Свържете вашите акаунти, за да споделяте публикации автоматично',
      connect: 'Свържи',
      disconnect: 'Изключи',
      reconnect: 'Свържи отново',
      connected: 'Свързан',
      notConnected: 'Не е свързан',
      lastUsed: 'Последно използван',
      connectedAt: 'Свързан на',
      permissions: 'Разрешения',
      status: 'Статус',
      active: 'Активен',
      expired: 'Изтекъл',
      loading: 'Зареждане...',
      benefits: {
        title: 'Предимства',
        auto: 'Автоматично споделяне',
        reach: 'По-голям обхват',
        time: 'Спестяване на време',
        unified: 'Унифицирано управление'
      }
    },
    en: {
      title: 'Social Media Accounts',
      subtitle: 'Connect your accounts to automatically share posts across platforms',
      connect: 'Connect',
      disconnect: 'Disconnect',
      reconnect: 'Reconnect',
      connected: 'Connected',
      notConnected: 'Not Connected',
      lastUsed: 'Last used',
      connectedAt: 'Connected on',
      permissions: 'Permissions',
      status: 'Status',
      active: 'Active',
      expired: 'Expired',
      loading: 'Loading...',
      benefits: {
        title: 'Benefits',
        auto: 'Automatic sharing',
        reach: 'Wider reach',
        time: 'Save time',
        unified: 'Unified management'
      }
    }
  };

  const text = t[language];

  // Load connected accounts
  useEffect(() => {
    if (user?.uid) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const userAccounts = await socialMediaService.getConnectedAccounts(user!.uid);
      setAccounts(userAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: SocialPlatform) => {
    try {
      setConnecting(platform);
      await socialMediaService.initiateOAuth(platform, user!.uid);
    } catch (error) {
      console.error('Error connecting:', error);
      alert('Connection failed. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform: SocialPlatform) => {
    if (!window.confirm(language === 'bg' 
      ? 'Сигурни ли сте, че искате да изключите този акаунт?' 
      : 'Are you sure you want to disconnect this account?')) {
      return;
    }

    try {
      await socialMediaService.disconnectAccount(user!.uid, platform);
      await loadAccounts();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const getIcon = (platform: SocialPlatform) => {
    const iconProps = { size: 24, color: 'white' };
    switch (platform) {
      case 'facebook': return <Facebook {...iconProps} />;
      case 'twitter': return <Twitter {...iconProps} />;
      case 'tiktok': return <TikTokIcon {...iconProps} />;
      case 'linkedin': return <Linkedin {...iconProps} />;
      case 'youtube': return <Youtube {...iconProps} />;
    }
  };

  const isConnected = (platform: SocialPlatform) => {
    return accounts.some(acc => acc.platform === platform && acc.isActive);
  };

  const getAccount = (platform: SocialPlatform) => {
    return accounts.find(acc => acc.platform === platform);
  };

  const isExpired = (account: SocialMediaAccount) => {
    return account.tokenExpiresAt < Date.now();
  };

  return (
    <Container>
      <Header>
        <Title>{text.title}</Title>
        <Subtitle>{text.subtitle}</Subtitle>
      </Header>

      <PlatformsList>
        {(Object.keys(PLATFORM_CONFIGS) as SocialPlatform[]).map((platform) => {
          const config = PLATFORM_CONFIGS[platform];
          const connected = isConnected(platform);
          const account = getAccount(platform);
          const expired = account ? isExpired(account) : false;

          return (
            <PlatformCard key={platform} $color={config.color}>
              <PlatformIcon $color={config.color}>
                {getIcon(platform)}
              </PlatformIcon>

              <PlatformInfo>
                <PlatformName>{config.displayName[language]}</PlatformName>
                
                {connected && account ? (
                  <AccountDetails>
                    <StatusBadge $active={!expired}>
                      {expired ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                      {expired ? text.expired : text.active}
                    </StatusBadge>
                    <AccountName>@{account.accountHandle}</AccountName>
                  </AccountDetails>
                ) : (
                  <Status>{text.notConnected}</Status>
                )}
              </PlatformInfo>

              <ActionButton
                $connected={connected}
                $color={config.color}
                onClick={() => connected ? handleDisconnect(platform) : handleConnect(platform)}
                disabled={connecting === platform}
              >
                {connecting === platform ? (
                  <RefreshCw size={18} className="spin" />
                ) : connected ? (
                  <>
                    <Unlink size={18} />
                    {text.disconnect}
                  </>
                ) : expired ? (
                  <>
                    <RefreshCw size={18} />
                    {text.reconnect}
                  </>
                ) : (
                  <>
                    <LinkIcon size={18} />
                    {text.connect}
                  </>
                )}
              </ActionButton>
            </PlatformCard>
          );
        })}
      </PlatformsList>

      <BenefitsSection>
        <BenefitsTitle>{text.benefits.title}</BenefitsTitle>
        <BenefitsList>
          <BenefitItem>
            <CheckCircle size={20} color="#10b981" />
            {text.benefits.auto}
          </BenefitItem>
          <BenefitItem>
            <CheckCircle size={20} color="#10b981" />
            {text.benefits.reach}
          </BenefitItem>
          <BenefitItem>
            <CheckCircle size={20} color="#10b981" />
            {text.benefits.time}
          </BenefitItem>
          <BenefitItem>
            <CheckCircle size={20} color="#10b981" />
            {text.benefits.unified}
          </BenefitItem>
        </BenefitsList>
      </BenefitsSection>
    </Container>
  );
};

export default SocialMediaSettings;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c2c2c;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
  line-height: 1.6;
`;

const PlatformsList = styled.div`
  display: grid;
  gap: 16px;
  margin-bottom: 32px;
`;

const PlatformCard = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${p => p.$color};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const PlatformIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px ${p => p.$color}40;
`;

const PlatformInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PlatformName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 8px 0;
`;

const AccountDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${p => p.$active ? '#dcfce7' : '#fee2e2'};
  color: ${p => p.$active ? '#16a34a' : '#dc2626'};
`;

const AccountName = styled.span`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const Status = styled.span`
  font-size: 0.9rem;
  color: #999;
`;

const ActionButton = styled.button<{ $connected: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 24px;
  border: 2px solid ${p => p.$connected ? '#e9ecef' : p.$color};
  background: ${p => p.$connected ? 'white' : p.$color};
  color: ${p => p.$connected ? '#666' : 'white'};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${p => p.$connected ? '#f8f9fa' : p.$color}dd;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${p => p.$color}40;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const BenefitsSection = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  border: 2px solid #e9ecef;
`;

const BenefitsTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 16px 0;
`;

const BenefitsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
`;

