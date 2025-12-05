import React from 'react';
import { CarListing } from '../../../types/CarListing';
import {
  Header,
  TopBar,
  InfoBar,
  SellerInfo,
  SellerAvatar,
  SellerDetails,
  SellerName,
  SellerPhone,
  VehicleInfo,
  VehicleBrand,
  VehicleModel,
  BackButton,
  EditButton,
  SaveButtonEnhanced,
  CancelButtonEnhanced,
  PriceSection,
  Price,
  PriceLabel,
} from '../CarDetailsPage.styles';

interface CarHeaderProps {
  car: CarListing;
  isEditMode: boolean;
  isOwner: boolean;
  saving: boolean;
  language: 'bg' | 'en';
  onBack: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const CarHeader: React.FC<CarHeaderProps> = ({
  car,
  isEditMode,
  isOwner,
  saving,
  language,
  onBack,
  onEdit,
  onSave,
  onCancel,
}) => {
  return (
    <Header>
      <TopBar>
        <BackButton onClick={onBack}>
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </BackButton>
        
        {!isEditMode && isOwner ? (
          <EditButton onClick={onEdit}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
              <path d="M0 14.25V18h3.75L14.81 6.94l-3.75-3.75L0 14.25zM17.71 4.04a.996.996 0 000-1.41L15.37.29a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="white"/>
            </svg>
            {language === 'bg' ? 'Редактирай' : 'Edit'}
          </EditButton>
        ) : null}
        
        {isEditMode && isOwner && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <SaveButtonEnhanced onClick={onSave} disabled={saving}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M15.833 3.333H4.167C3.247 3.333 2.5 4.08 2.5 5v10c0 .92.747 1.667 1.667 1.667h11.666c.92 0 1.667-.747 1.667-1.667V5c0-.92-.747-1.667-1.667-1.667zM10 14.167c-1.15 0-2.083-.933-2.083-2.084C7.917 10.933 8.85 10 10 10c1.15 0 2.083.933 2.083 2.083 0 1.151-.933 2.084-2.083 2.084zM12.5 7.5h-7.5V5h7.5v2.5z" fill="white"/>
              </svg>
              {saving ? (language === 'bg' ? 'Запазване...' : 'Saving...') : (language === 'bg' ? 'Запази' : 'Save')}
            </SaveButtonEnhanced>
            <CancelButtonEnhanced onClick={onCancel}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M15 5.41L13.59 4 10 7.59 6.41 4 5 5.41 8.59 9 5 12.59 6.41 14 10 10.41 13.59 14 15 12.59 11.41 9 15 5.41z" fill="white"/>
              </svg>
              {language === 'bg' ? 'Отказ' : 'Cancel'}
            </CancelButtonEnhanced>
          </div>
        )}
      </TopBar>

      <InfoBar>
        <SellerInfo>
          <SellerAvatar>
            {car.sellerName ? car.sellerName.charAt(0).toUpperCase() : '?'}
          </SellerAvatar>
          <SellerDetails>
            <SellerName>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              {car.sellerName || (language === 'bg' ? 'Неизвестен' : 'Unknown')}
            </SellerName>
            <SellerPhone href={`tel:${car.sellerPhone}`}>
              <svg viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              {car.sellerPhone || (language === 'bg' ? 'Без телефон' : 'No phone')}
            </SellerPhone>
          </SellerDetails>
        </SellerInfo>

        <VehicleInfo>
          <VehicleBrand>{car.make}</VehicleBrand>
          <div style={{ color: 'var(--border-primary)', fontSize: '1.25rem', fontWeight: '300' }}>•</div>
          <VehicleModel>{car.model}</VehicleModel>
          <div style={{ color: 'var(--border-primary)', fontSize: '1.25rem', fontWeight: '300' }}>•</div>
          <VehicleModel>{car.year}</VehicleModel>
        </VehicleInfo>
      </InfoBar>
      
      {/* Price under title */}
      {!isEditMode && car.price && (
        <PriceSection>
          <Price>€{car.price.toLocaleString()}</Price>
          <PriceLabel>{language === 'bg' ? '(EUR)' : '(EUR)'}</PriceLabel>
        </PriceSection>
      )}
    </Header>
  );
};

