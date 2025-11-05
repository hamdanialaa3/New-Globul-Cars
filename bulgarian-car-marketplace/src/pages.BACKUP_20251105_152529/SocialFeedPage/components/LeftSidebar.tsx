import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthProvider';
import { useLanguage } from '../../../contexts/LanguageContext';

const MENU_ITEMS = [
  { icon: '👤', key: 'yourProfile', link: '/profile', requireAuth: true },
  { icon: '👥', key: 'friends', link: '/users', requireAuth: false },
  { icon: '💾', key: 'saved', link: '/favorites', requireAuth: true },
  { icon: '🔍', key: 'savedSearches', link: '/saved-searches', requireAuth: true },
  { icon: '💬', key: 'allPosts', link: '/all-posts', requireAuth: false },
  { icon: '🚗', key: 'marketplace', link: '/cars', requireAuth: false },
  { icon: '📰', key: 'newsFeed', link: '/', requireAuth: false },
  { icon: '💼', key: 'dealers', link: '/dealers', requireAuth: false },
  { icon: '📅', key: 'events', link: '/events', requireAuth: false },
  { icon: '📸', key: 'gallery', link: '/brand-gallery', requireAuth: false },
  { icon: '📧', key: 'messages', link: '/messages', requireAuth: true },
  { icon: '🔔', key: 'notifications', link: '/notifications', requireAuth: true },
];

const SHORTCUTS = [
  { nameKey: 'All Cars', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100', link: '/all-cars' },
  { nameKey: 'All Users', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=100', link: '/all-users' },
  { nameKey: 'Top Brands', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=100', link: '/top-brands' },
  { nameKey: 'Dealer Dashboard', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=100', link: '/dealer-dashboard' },
];

const LeftSidebarComponent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleMenuClick = (item: typeof MENU_ITEMS[0]) => {
    if (item.requireAuth && !user) {
      navigate('/login');
      return;
    }
    navigate(item.link);
  };

  const handleShortcutClick = (shortcut: typeof SHORTCUTS[0]) => {
    navigate(shortcut.link);
  };

  return (
    <Container>
      <MenuItem onClick={() => user ? navigate('/profile') : navigate('/login')}>
        <Avatar 
          src={user?.photoURL || 'https://i.pravatar.cc/150?img=1'} 
          loading="lazy"
          decoding="async"
        />
        <Label>{user?.displayName || 'Guest User'}</Label>
      </MenuItem>

      {MENU_ITEMS.map((item, idx) => (
        <MenuItem key={idx} onClick={() => handleMenuClick(item)}>
          <Icon>{item.icon}</Icon>
          <Label>{t(`social.sidebar.${item.key}`)}</Label>
        </MenuItem>
      ))}

      <Divider />

      <SectionHeader>
        <SectionTitle>{t('social.sidebar.shortcuts')}</SectionTitle>
      </SectionHeader>

      {SHORTCUTS.map((shortcut, idx) => (
        <MenuItem key={idx} onClick={() => handleShortcutClick(shortcut)}>
          <GroupIcon 
            src={shortcut.image} 
            loading="lazy"
            decoding="async"
          />
          <Label>{shortcut.nameKey}</Label>
        </MenuItem>
      ))}

      <ShowMore onClick={() => navigate('/dealers')}>{t('social.sidebar.seeMore')}</ShowMore>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 8px 8px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e4e6eb;
  }
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
`;

const Icon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const GroupIcon = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
`;

const Label = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #050505;
  flex: 1;
`;

const Divider = styled.div`
  height: 1px;
  background: #e4e6eb;
  margin: 8px 4px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 8px 4px;
`;

const SectionTitle = styled.div`
  font-size: 17px;
  font-weight: 600;
  color: #65676b;
`;

const ShowMore = styled.div`
  padding: 8px 8px 8px 4px;
  font-size: 15px;
  font-weight: 500;
  color: #65676b;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #e4e6eb;
  }
`;

// Export with React.memo for performance optimization
export const LeftSidebar = React.memo(LeftSidebarComponent);
