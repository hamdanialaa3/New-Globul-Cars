import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  searchSummary: string;
}

export const SaveSearchModal: React.FC<SaveSearchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  searchSummary
}) => {
  const { t } = useTranslation();
  const [searchName, setSearchName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (searchName.trim()) {
      onSave(searchName);
      setSearchName('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchName.trim()) {
      handleSave();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#212529'
        }}>
          💾 {t('advancedSearch.saveSearch')}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#6c757d',
          marginBottom: '24px'
        }}>
          {t('advancedSearch.saveSearchDescription')}
        </p>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: '#212529'
          }}>
            {t('advancedSearch.searchName')}
          </label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('advancedSearch.searchNamePlaceholder')}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#005ca9'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e5e5e5'}
            autoFocus
          />
        </div>

        <div style={{
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#6c757d',
            marginBottom: '8px'
          }}>
            📋 {t('advancedSearch.searchSummary')}:
          </p>
          <p style={{
            fontSize: '14px',
            color: '#212529',
            fontWeight: '500'
          }}>
            {searchSummary}
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: '#f8f9fa',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!searchName.trim()}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: searchName.trim() ? '#28a745' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: searchName.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (searchName.trim()) e.currentTarget.style.background = '#218838';
            }}
            onMouseLeave={(e) => {
              if (searchName.trim()) e.currentTarget.style.background = '#28a745';
            }}
          >
            <Bookmark size={18} />
            {t('advancedSearch.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

