import React from 'react';
import styled from 'styled-components';
import { CarListing } from '@/types/CarListing';
import {
  EquipmentSection,
  SectionTitle,
  ContactItem,
  ContactIcon,
  ContactLabel,
} from '../CarDetailsPage.styles';
import {
  PhoneIcon,
  EmailIcon,
  WhatsAppIcon,
  ViberIcon,
  TelegramIcon,
  FacebookMessengerIcon,
  SMSIcon,
} from './ContactIcons';
import { MessageCircle } from 'lucide-react';

interface CarContactMethodsProps {
  car: CarListing;
  editedCar: Partial<CarListing>;
  isEditMode: boolean;
  language: 'bg' | 'en';
  onContactClick: (method: string) => void;
  onToggleContact: (fieldKey: keyof CarListing) => void;
}

// ✅ Desktop Sticky Wrapper
const DesktopStickyWrapper = styled.div`
  @media (max-width: 767px) {
    display: none; /* Hide on mobile - use floating FAB instead */
  }
  
  @media (min-width: 768px) {
    position: sticky;
    top: 100px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(8px);
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    
    @media (prefers-color-scheme: dark) {
      background: rgba(15, 23, 42, 0.98);
      border-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

export const CarContactMethods: React.FC<CarContactMethodsProps> = ({
  car,
  editedCar,
  isEditMode,
  language,
  onContactClick,
  onToggleContact,
}) => {
  const contacts = [
    { key: 'message', label: 'Chat', Icon: MessageCircle },
    { key: 'phone', label: 'Phone', Icon: PhoneIcon },
    { key: 'email', label: 'Email', Icon: EmailIcon },
    { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon },
    { key: 'viber', label: 'Viber', Icon: ViberIcon },
    { key: 'telegram', label: 'Telegram', Icon: TelegramIcon },
    { key: 'facebook', label: 'Facebook Messenger', Icon: FacebookMessengerIcon },
    { key: 'sms', label: 'SMS', Icon: SMSIcon }
  ];

  return (
    <DesktopStickyWrapper>
      <EquipmentSection style={{ marginBottom: 0 }}>
        <SectionTitle>
          {language === 'bg' ? 'Предпочитан начин на контакт' : 'Preferred Contact Method'}
        </SectionTitle>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1.5rem',
          padding: '1rem 0'
        }}>
          {contacts.map(contact => {
            const fieldKey = `contact${contact.key.charAt(0).toUpperCase() + contact.key.slice(1)}` as keyof CarListing;

            let isActive = false;
            let canClick = false;

            if (isEditMode) {
              isActive = Boolean(fieldKey in editedCar ? editedCar[fieldKey] : false);
              // Note: 'contactMessage' doesn't exist on CarListing, so we handle it gracefully below or just ignore for edit mode
              if (contact.key === 'message') isActive = true; // Always show chat in edit mode? Or maybe just hide it.
              canClick = true;
            } else {
              // View Mode
              if (contact.key === 'message') {
                isActive = true; // Always active for viewer
                canClick = true;
              } else {
                isActive = Boolean(car[fieldKey]);
                canClick = isActive;

                const hasPhone = Boolean(car.sellerPhone);
                const hasEmail = Boolean(car.sellerEmail);

                if (isActive) {
                  switch (contact.key) {
                    case 'phone':
                    case 'whatsapp':
                    case 'viber':
                    case 'telegram':
                    case 'sms':
                      isActive = hasPhone;
                      canClick = hasPhone;
                      break;
                    case 'email':
                      isActive = hasEmail;
                      canClick = hasEmail;
                      break;
                    case 'facebook':
                      isActive = hasPhone || hasEmail;
                      canClick = hasPhone || hasEmail;
                      break;
                  }
                }
              }
            }

            return (
              <ContactItem
                key={contact.key}
                $isActive={isActive}
                onClick={(e) => {
                  if (!isActive && !isEditMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditMode) {
                    // Don't toggle 'message' as it's not a field
                    if (contact.key !== 'message') {
                      onToggleContact(fieldKey);
                    }
                  } else if (canClick) {
                    onContactClick(contact.key);
                  }
                }}
                style={{
                  pointerEvents: isEditMode || isActive ? 'auto' : 'none'
                }}
              >
                <ContactIcon $isActive={isActive}>
                  <contact.Icon />
                </ContactIcon>
                <ContactLabel $isActive={isActive}>
                  {contact.label}
                </ContactLabel>
              </ContactItem>
            );
          })}
        </div>
      </EquipmentSection>
    </DesktopStickyWrapper>
  );
};
