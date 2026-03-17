import { logger } from '@/services/logger-service';
// SettingsSidebar.tsx - mobile.de Inspired Black Sidebar
// ⚡ Compact & Professional Navigation

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  User, Eye, MessageSquare, Search, Heart, ShoppingCart, 
  Package, CreditCard, Car, FileText, 
  Shield, Bell, Edit, Users, List
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';

interface SidebarCounts {
  messages: number;
  searches: number;
  favorites: number;
  myListings: number;
}

const SettingsSidebar: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [counts, setCounts] = useState<SidebarCounts>({
    messages: 0,
    searches: 0,
    favorites: 0,
    myListings: 0
  });

  // Load counts
  useEffect(() => {
    if (user?.uid) {
      loadCounts();
    }
  }, [user?.uid]);

  const loadCounts = async () => {
    if (!user?.uid) return;

    try {
      // Load messages count
      const messagesQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid),
        where('hasUnread', '==', true)
      );
      const messagesSnap = await getDocs(messagesQuery).catch(() => ({ docs: [] }));

      // Load saved searches count
      const searchesQuery = query(
        collection(db, 'searchHistory'),
        where('userId', '==', user.uid)
      );
      const searchesSnap = await getDocs(searchesQuery).catch(() => ({ docs: [] }));

      // Load favorites count
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid)
      );
      const favoritesSnap = await getDocs(favoritesQuery).catch(() => ({ docs: [] }));

      // Load my listings count
      const listingsQuery = query(
        collection(db, 'cars'),
        where('userId', '==', user.uid),
        where('status', '==', 'active')
      );
      const listingsSnap = await getDocs(listingsQuery).catch(() => ({ docs: [] }));

      setCounts({
        messages: messagesSnap.docs.length,
        searches: searchesSnap.docs.length,
        favorites: favoritesSnap.docs.length,
        myListings: listingsSnap.docs.length
      });
    } catch (error) {
      logger.error('Error loading sidebar counts:', error);
    }
  };

  const t = {
    bg: {
      edit: 'Редактирай',
      buy: 'Купуване',
      overview: 'Общ преглед',
      messages: 'Съобщения',
      mySearches: 'Моите търсения',
      savedCars: 'Запазени коли',
      orders: 'Поръчки',
      financing: 'Финансиране',
      sell: 'Продажба',
      myAds: 'Моите обяви',
      createAd: 'Създай обява',
      myProfile: 'Моят профил',
      myVehicles: 'Моите превозни средства',
      settings: 'Редактиране на информация',
      communication: 'Комуникация',
      browse: 'Разглеждане',
      allUsers: 'Всички потребители',
      allPosts: 'Всички публикации',
      allCars: 'Всички автомобили'
    },
    en: {
      edit: 'Edit',
      buy: 'Buy',
      overview: 'Overview',
      messages: 'Messages',
      mySearches: 'My Searches',
      savedCars: 'Car park',
      orders: 'Orders',
      financing: 'Financing',
      sell: 'Sell',
      myAds: 'Ads',
      createAd: 'Direct Sale',
      myProfile: 'My Profile',
      myVehicles: 'My vehicles',
      settings: 'Edit Information',
      communication: 'Communication',
      browse: 'Browse',
      allUsers: 'All Users',
      allPosts: 'All Posts',
      allCars: 'All Cars'
    }
  };

  const text = t[language as 'bg' | 'en'];

  return (
    <SidebarContainer>
      {/* User Profile Section */}
      <ProfileSection>
        <ProfileAvatar>
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} />
          ) : (
            <User size={32} color="#999" />
          )}
        </ProfileAvatar>
        <ProfileName>{user?.displayName || 'User'}</ProfileName>
        <EditLink to="/profile">
          <Edit size={12} />
          {text.edit}
        </EditLink>
      </ProfileSection>

      {/* Buy Section */}
      <NavSection>
        <SectionTitle>{text.buy}</SectionTitle>
        <NavItem to="/profile" end>
          <Eye size={14} />
          {text.overview}
        </NavItem>
        <NavItem to="/messages">
          <MessageSquare size={14} />
          {text.messages}
          {counts.messages > 0 && <Badge>{counts.messages}</Badge>}
        </NavItem>
        <NavItem to="/saved-searches">
          <Search size={14} />
          {text.mySearches}
          {counts.searches > 0 && <Badge>{counts.searches}</Badge>}
        </NavItem>
        <NavItem to="/favorites">
          <Heart size={14} />
          {text.savedCars}
          {counts.favorites > 0 && <Badge>{counts.favorites}</Badge>}
        </NavItem>
        <NavItem to="/my-listings">
          <ShoppingCart size={14} />
          {text.orders}
        </NavItem>
        <NavItem to="/finance">
          <CreditCard size={14} />
          {text.financing}
        </NavItem>
      </NavSection>

      {/* Sell Section */}
      <NavSection>
        <SectionTitle>{text.sell}</SectionTitle>
        <NavItem to="/profile/my-ads">
          <Car size={14} />
          {text.myAds}
        </NavItem>
        <NavItem to="/sell">
          <FileText size={14} />
          {text.createAd}
        </NavItem>
      </NavSection>

      {/* My Profile Section */}
      <NavSection>
        <SectionTitle>{text.myProfile}</SectionTitle>
        <NavItem to="/profile/settings">
          <Edit size={14} />
          {language === 'bg' ? 'Редактиране на информация' : 'Edit Information'}
        </NavItem>
        <NavItem to="/my-listings">
          <Car size={14} />
          {text.myVehicles}
          {counts.myListings > 0 && <Badge>{counts.myListings}</Badge>}
        </NavItem>
        <NavItem to="/notifications">
          <Bell size={14} />
          {text.communication}
        </NavItem>
      </NavSection>

      {/* ⚡ NEW: Browse Section */}
      <NavSection>
        <SectionTitle>{text.browse}</SectionTitle>
        <NavItem to="/all-users">
          <Users size={14} />
          {text.allUsers}
        </NavItem>
        <NavItem to="/all-posts">
          <MessageSquare size={14} />
          {text.allPosts}
        </NavItem>
        <NavItem to="/all-cars">
          <List size={14} />
          {text.allCars}
        </NavItem>
      </NavSection>
    </SidebarContainer>
  );
};

export default SettingsSidebar;

// ==================== STYLED COMPONENTS ====================

const SidebarContainer = styled.aside`
  width: 240px;
  background: #2d2d2d;
  border-radius: 8px;
  padding: 16px 0;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  flex-shrink: 0;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a1a;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    border-radius: 3px;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #3a3a3a;
  margin-bottom: 12px;
`;

const ProfileAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #3a3a3a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileName = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
`;

const EditLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #a855f7;
  text-decoration: none;
  transition: color 0.15s ease;
  
  &:hover {
    color: #c084fc;
  }
`;

const NavSection = styled.div`
  margin-bottom: 16px;
  padding: 0 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding: 0 8px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 2px;
  color: #ccc;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.15s ease;
  position: relative;
  
  svg {
    flex-shrink: 0;
    color: #999;
  }
  
  &:hover {
    background: #3a3a3a;
    color: #fff;
    
    svg {
      color: #fff;
    }
  }
  
  &.active {
    background: #a855f7;
    color: #fff;
    font-weight: 600;
    
    svg {
      color: #fff;
    }
  }
`;

const Badge = styled.span`
  margin-left: auto;
  background: #a855f7;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

