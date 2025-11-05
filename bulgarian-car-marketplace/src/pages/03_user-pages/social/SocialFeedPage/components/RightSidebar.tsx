import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { smartContactsService } from '@/services/social/smart-contacts.service';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';

interface SmartContact {
  id: string;
  displayName: string;
  photoURL?: string;
  isOnline: boolean;
  location?: {
    city?: string;
    country?: string;
  };
  relevanceScore: number;
}

const GROUP_CONVERSATIONS = [
  { name: 'BMW Fans Chat', avatar: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100', unread: 3 },
  { name: 'Sofia Cars Group', avatar: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=100', unread: 0 },
];

const RightSidebarComponent: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<SmartContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        
        // Get smart contacts (ranked by intelligent algorithm)
        // Smart ranking based on: Recent Activity, Online Status
        const smartContacts = await smartContactsService.getSmartContacts(
          user?.uid || 'anonymous',
          12 // Optimized: 12 contacts for better performance
        );
        
        setContacts(smartContacts);

        // Get online users count
        const count = await smartContactsService.getOnlineUsersCount();
        setOnlineCount(count);
      } catch (error) {
        console.error('Error loading contacts:', error);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();

    // Refresh contacts every 5 minutes (optimized for performance)
    const interval = setInterval(loadContacts, 300000);
    return () => clearInterval(interval);
  }, [user]);

  // Separate online and offline contacts (with memoization)
  const onlineContacts = useMemo(
    () => contacts.filter(c => c.isOnline),
    [contacts]
  );
  
  const offlineContacts = useMemo(
    () => contacts.filter(c => !c.isOnline),
    [contacts]
  );

  return (
    <Container>
      <SectionHeader>
        <Title>{t('social.sidebar.sponsored')}</Title>
      </SectionHeader>

      <AdCard>
        <AdImage 
          src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300" 
          loading="lazy"
          decoding="async"
        />
        <AdContent>
          <AdTitle>BMW X5 2024 - Special Offer</AdTitle>
          <AdLink>bmw.bg</AdLink>
        </AdContent>
      </AdCard>

      <AdCard>
        <AdImage 
          src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=300" 
          loading="lazy"
          decoding="async"
        />
        <AdContent>
          <AdTitle>Mercedes E-Class - Test Drive</AdTitle>
          <AdLink>mercedes-benz.bg</AdLink>
        </AdContent>
      </AdCard>

      <Divider />

      <SectionHeader>
        <Title>
          {t('social.sidebar.contacts')}
          {onlineCount > 0 && <OnlineIndicator>({onlineCount} {t('social.sidebar.online')})</OnlineIndicator>}
        </Title>
        <IconGroup>
          <IconButton title="Video call">📹</IconButton>
          <IconButton title="Search">🔍</IconButton>
          <IconButton title="More">⋯</IconButton>
        </IconGroup>
      </SectionHeader>

      {loading ? (
        <LoadingState>
          <LoadingSpinner />
          <LoadingText>{t('notifications.loading')}</LoadingText>
        </LoadingState>
      ) : (
        <>
          {/* Group Conversations */}
          {GROUP_CONVERSATIONS.map((group, idx) => (
            <Contact key={`group-${idx}`}>
              <AvatarContainer>
                <Avatar 
                  src={group.avatar} 
                  loading="lazy"
                  decoding="async"
                />
                {group.unread > 0 && <UnreadBadge>{group.unread}</UnreadBadge>}
              </AvatarContainer>
              <ContactInfo>
                <Name>{group.name}</Name>
                <Status>Group • {group.unread > 0 ? `${group.unread} new` : 'Active'}</Status>
              </ContactInfo>
            </Contact>
          ))}

          {GROUP_CONVERSATIONS.length > 0 && contacts.length > 0 && <MiniDivider />}

          {/* Online Contacts - Smart Ranked */}
          {onlineContacts.length > 0 && (
            <>
              <SubSectionTitle>
                {t('social.sidebar.online')} ({onlineContacts.length})
              </SubSectionTitle>
              {onlineContacts.map((contact, idx) => (
                <Contact key={contact.id}>
                  <AvatarContainer>
                    <Avatar 
                      src={contact.photoURL || `https://i.pravatar.cc/150?u=${contact.id}`} 
                      loading="lazy"
                      decoding="async"
                    />
                    <OnlineDot />
                  </AvatarContainer>
                  <ContactInfo>
                    <Name>{contact.displayName}</Name>
                    <Status>
                      {contact.location?.city && contact.location?.country
                        ? `${contact.location.city}, ${contact.location.country}`
                        : contact.location?.city || 'Bulgaria'}
                    </Status>
                  </ContactInfo>
                  {contact.relevanceScore > 50 && (
                    <RelevanceBadge title={`Relevance Score: ${contact.relevanceScore}`}>
                      ⭐
                    </RelevanceBadge>
                  )}
                </Contact>
              ))}
            </>
          )}

          {/* Offline Contacts - Smart Ranked */}
          {offlineContacts.length > 0 && (
            <>
              {onlineContacts.length > 0 && <MiniDivider />}
              <SubSectionTitle>
                {t('social.sidebar.offline')} ({offlineContacts.length})
              </SubSectionTitle>
              {offlineContacts.slice(0, 5).map((contact) => (
                <Contact key={contact.id} $offline>
                  <AvatarContainer>
                    <Avatar 
                      src={contact.photoURL || `https://i.pravatar.cc/150?u=${contact.id}`} 
                      loading="lazy"
                      decoding="async"
                    />
                  </AvatarContainer>
                  <ContactInfo>
                    <Name $offline>{contact.displayName}</Name>
                    <Status>
                      {contact.location?.city || 'Bulgaria'}
                    </Status>
                  </ContactInfo>
                  {contact.relevanceScore > 60 && (
                    <RelevanceBadge title={`Match: ${contact.relevanceScore}%`}>
                      🎯
                    </RelevanceBadge>
                  )}
                </Contact>
              ))}
            </>
          )}

          {contacts.length === 0 && (
            <EmptyContacts>
              <EmptyIcon>👥</EmptyIcon>
              <EmptyText>{t('social.sidebar.noContacts')}</EmptyText>
              <EmptySubText>{t('social.sidebar.contactsWillAppear')}</EmptySubText>
            </EmptyContacts>
          )}
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 16px 8px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 8px;
`;

const Title = styled.h3`
  font-size: 17px;
  font-weight: 600;
  color: #65676b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OnlineIndicator = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #31a24c;
`;

const IconGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: #f0f2f5;
  }
`;

const AdCard = styled.div`
  display: flex;
  gap: 12px;
  padding: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #f0f2f5;
  }
`;

const AdImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
`;

const AdContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const AdTitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #050505;
  margin-bottom: 4px;
  line-height: 1.3;
`;

const AdLink = styled.div`
  font-size: 12px;
  color: #65676b;
`;

const Divider = styled.div`
  height: 1px;
  background: #e4e6eb;
  margin: 12px 8px;
`;

const MiniDivider = styled.div`
  height: 1px;
  background: #e4e6eb;
  margin: 8px 8px;
`;

const LoadingState = styled.div`
  padding: 20px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e4e6eb;
  border-top-color: #1877f2;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 13px;
  color: #65676b;
`;

const SubSectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #65676b;
  padding: 8px 8px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Contact = styled.div<{ $offline?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  opacity: ${props => props.$offline ? 0.6 : 1};

  &:hover {
    background: #f0f2f5;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
`;

const OnlineDot = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #31a24c;
  border: 2px solid white;
`;

const UnreadBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #e41e3f;
  color: white;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;

const ContactInfo = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const Name = styled.span<{ $offline?: boolean }>`
  font-size: 15px;
  font-weight: 500;
  color: ${props => props.$offline ? '#65676b' : '#050505'};
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Status = styled.span`
  font-size: 12px;
  color: #65676b;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RelevanceBadge = styled.span`
  font-size: 14px;
  flex-shrink: 0;
`;

const EmptyContacts = styled.div`
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const EmptyText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #050505;
  margin-bottom: 4px;
`;

const EmptySubText = styled.div`
  font-size: 12px;
  color: #65676b;
`;

// Export with React.memo for performance optimization
export const RightSidebar = React.memo(RightSidebarComponent);
