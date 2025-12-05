// src/components/ActionBar/ActionBar.tsx
// Independent action bar for Language, Favorites, Messages, and Notifications

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bell } from 'lucide-react';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import './ActionBar.css';

const ActionBar: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  return (
    <div className="action-bar">
      <div className="action-bar-container">
        <div className="action-buttons">
          <LanguageToggle size="small" showText={false} className="action-bar-button" />
          
          <button
            className="action-bar-button"
            onClick={() => navigate('/favorites')}
            title={t('nav.favorites')}
          >
            <Heart size={20} />
          </button>
          
          <button
            className="action-bar-button"
            onClick={() => navigate('/messages')}
            title={t('nav.messages')}
          >
            <MessageCircle size={20} />
          </button>
          
          <NotificationDropdown
            isOpen={isNotificationsOpen}
            onToggle={toggleNotifications}
            onClose={closeNotifications}
          />
        </div>
      </div>
    </div>
  );
};

export default ActionBar;