import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { useCarViewTracking } from '../../hooks/useProfileTracking';
import { unifiedCarService } from '../../services/car';
import DistanceIndicator from '../../components/DistanceIndicator';
import StaticMapEmbed from '../../components/StaticMapEmbed';
import CarDetailsGermanStyle from './components/CarDetailsGermanStyle';
import { useCarDetails } from './hooks/useCarDetails';
import { useCarEdit } from './hooks/useCarEdit';
import { CarImageGallery } from './components/CarImageGallery';
import { CarHeader } from './components/CarHeader';
import { CarBasicInfo } from './components/CarBasicInfo';
import { CarEditForm } from './components/CarEditForm';
import { CarContactMethods } from './components/CarContactMethods';
import { CarEquipmentDisplay } from './components/CarEquipmentDisplay';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import {
  Container,
  MainContent,
  ThemeToggleButton,
  LoadingContainer,
  LocationMapContainer,
} from './CarDetailsPage.styles';
import { CarListing } from '../../types/CarListing';

const CarDetailsPage: React.FC = () => {
  const { id: carId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Use custom hooks
  const { car, loading, setCar } = useCarDetails(carId);
  
  // Auto-track car views
  useCarViewTracking(carId, car?.sellerId);
  
  // Check if current user is the owner
  const isOwner = currentUser && car && (
    currentUser.uid === car.sellerId || 
    currentUser.uid === (car as any).userId ||
    currentUser.uid === (car as any).ownerId
  );

  // Use edit hook
  const editHook = useCarEdit(
    car,
    carId,
    language as 'bg' | 'en',
    () => {
      // Refresh car data after save
      if (carId) {
        unifiedCarService.getCarById(carId).then(updatedCar => {
          if (updatedCar) {
            const carData = {
              ...updatedCar,
              vehicleType: (updatedCar as any).vehicleType || 'car',
              sellerType: updatedCar.sellerType || 'private',
              sellerName: (updatedCar as any).sellerName || '',
              sellerEmail: (updatedCar as any).sellerEmail || '',
              sellerPhone: (updatedCar as any).sellerPhone || '',
              city: (updatedCar as any).city || '',
              region: (updatedCar as any).region || '',
              accidentHistory: (updatedCar as any).accidentHistory || false,
              serviceHistory: (updatedCar as any).serviceHistory || false,
            } as CarListing;
          setCar(carData);
          }
        });
      }
    }
  );

  // Handle edit mode from URL
  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam === 'true' && currentUser && car) {
      const isCarOwner = currentUser.uid === car.sellerId || 
                         currentUser.uid === (car as any).userId ||
                         currentUser.uid === (car as any).ownerId;
      if (isCarOwner) {
        editHook.setIsEditMode(true);
      } else {
        navigate(`/cars/${carId}`, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentUser, car, carId, navigate]);

  // Contact Method Handlers
  const handleContactClick = (method: string) => {
    if (editHook.isEditMode) return;
    
    const phone = car?.sellerPhone || '';
    const email = car?.sellerEmail || '';
    const cleanPhone = phone.replace(/\D/g, '');
    
    switch(method) {
      case 'phone':
        if (phone) {
          window.location.href = `tel:${phone}`;
        } else {
          alert(language === 'bg' ? 'Няма наличен телефонен номер' : 'No phone number available');
        }
        break;
        
      case 'email':
        if (email) {
          window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Inquiry about ${car?.make} ${car?.model} ${car?.year}`)}`;
        } else {
          alert(language === 'bg' ? 'Няма наличен имейл адрес' : 'No email address available');
        }
        break;
        
      case 'whatsapp':
        if (phone) {
          const message = encodeURIComponent(`Hello! I'm interested in your ${car?.make} ${car?.model} ${car?.year}`);
          window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
        } else {
          alert(language === 'bg' ? 'Няма наличен телефонен номер за WhatsApp' : 'No phone number available for WhatsApp');
        }
        break;
        
      case 'viber':
        if (phone) {
          window.open(`viber://chat?number=${cleanPhone}`, '_blank');
        } else {
          alert(language === 'bg' ? 'Няма наличен телефонен номер за Viber' : 'No phone number available for Viber');
        }
        break;
        
      case 'telegram':
        if (phone) {
          window.open(`https://t.me/${cleanPhone}`, '_blank');
        } else {
          alert(language === 'bg' ? 'Няма наличен телефонен номер за Telegram' : 'No phone number available for Telegram');
        }
        break;
        
      case 'facebook':
        if (email || phone) {
          window.open('https://www.messenger.com/', '_blank');
          setTimeout(() => {
            alert(language === 'bg' 
              ? `Свържете се чрез Messenger: ${email || phone}` 
              : `Contact via Messenger: ${email || phone}`
            );
          }, 500);
        } else {
          alert(language === 'bg' ? 'Няма налична информация за контакт' : 'No contact information available');
        }
        break;
        
      case 'sms':
        if (phone) {
          const smsBody = encodeURIComponent(`Hi, I'm interested in your ${car?.make} ${car?.model} ${car?.year}`);
          window.location.href = `sms:${phone}${/iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?'}body=${smsBody}`;
        } else {
          alert(language === 'bg' ? 'Няма наличен телефонен номер за SMS' : 'No phone number available for SMS');
        }
        break;
        
      default:
        break;
    }
  };

  const handleToggleContact = (fieldKey: keyof CarListing) => {
    editHook.handleInputChange(fieldKey, !editHook.editedCar[fieldKey]);
  };

  const handleSetShowOther = (field: string, value: boolean) => {
    switch(field) {
      case 'make':
        editHook.setShowOtherMake(value);
        break;
      case 'model':
        editHook.setShowOtherModel(value);
        break;
      case 'fuelType':
        editHook.setShowOtherFuelType(value);
        break;
      case 'transmission':
        editHook.setShowOtherTransmission(value);
        break;
      case 'color':
        editHook.setShowOtherColor(value);
        break;
      case 'doors':
        editHook.setShowOtherDoors(value);
        break;
      case 'seats':
        editHook.setShowOtherSeats(value);
        break;
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async (isSold: boolean) => {
    if (!currentUser) {
      alert(language === 'bg' ? 'Моля влезте в профила си' : 'Please log in');
      return;
    }

    setShowDeleteDialog(false);
    
    // Show loading indicator
    const confirmed = window.confirm(
      language === 'bg'
        ? 'Моля потвърдете изтриването. Това действие е необратимо!'
        : 'Please confirm deletion. This action cannot be undone!'
    );

    if (!confirmed) return;

    const success = await editHook.handleDelete(currentUser.uid);
    
    if (success) {
      // Show success message
      alert(
        language === 'bg'
          ? isSold 
            ? '✅ Честито за продажбата! Обявата е изтрита успешно.'
            : '✅ Обявата е изтрита успешно.'
          : isSold
            ? '✅ Congratulations on the sale! Listing deleted successfully.'
            : '✅ Listing deleted successfully.'
      );
      
      // Navigate to profile
      navigate('/profile/my-ads');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  if (loading) {
    return <LoadingContainer>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingContainer>;
  }

  if (!car) {
    return (
      <LoadingContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--error)' }}>
            {language === 'bg' ? 'Автомобилът не е намерен' : 'Car not found'}
          </h2>
          <p style={{ marginBottom: '1rem', color: 'var(--text-tertiary)' }}>
            {language === 'bg' 
              ? `ID: ${carId}` 
              : `ID: ${carId}`}
          </p>
          <button 
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 20px',
              background: 'var(--accent-primary)',
              color: 'var(--btn-primary-text)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600
            }}
          >
            {language === 'bg' ? 'Назад' : 'Back'}
          </button>
        </div>
      </LoadingContainer>
    );
  }

  // View mode - use CarDetailsGermanStyle
  if (!editHook.isEditMode) {
    return (
      <CarDetailsGermanStyle
        car={car}
        language={(language as 'bg' | 'en')}
        onBack={() => navigate(-1)}
        onEdit={isOwner ? editHook.handleEdit : undefined}
        isOwner={Boolean(isOwner)}
        onContact={handleContactClick}
      />
    );
  }

  // Edit mode
  return (
    <Container>
      <ThemeToggleButton onClick={toggleTheme}>
        {theme === 'dark' ? '☀️' : '🌙'}
        {theme === 'dark' ? (language === 'bg' ? 'وضع نهاري' : 'Light Mode') : (language === 'bg' ? 'وضع ليلي' : 'Dark Mode')}
      </ThemeToggleButton>

      <CarHeader
        car={car}
        isEditMode={editHook.isEditMode}
        isOwner={Boolean(isOwner)}
        saving={editHook.saving}
        language={language as 'bg' | 'en'}
        onBack={() => navigate(-1)}
        onEdit={editHook.handleEdit}
        onSave={editHook.handleSave}
        onCancel={editHook.handleCancel}
      />

      <MainContent>
        <CarImageGallery
          car={car}
          isEditMode={editHook.isEditMode}
          isOwner={Boolean(isOwner)}
          language={language as 'bg' | 'en'}
          photos={editHook.photos}
          photoUrls={editHook.photoUrls}
          isDragOver={editHook.isDragOver}
          onImageSelect={editHook.handleFileSelect}
          onImageDelete={async (imageUrl: string) => {
            const updatedImages = await editHook.deleteExistingImage(imageUrl);
            if (updatedImages) {
              setCar({ ...car, images: updatedImages } as CarListing);
            }
            return updatedImages || [];
          }}
          onDragOver={editHook.handleDragOver}
          onDragLeave={editHook.handleDragLeave}
          onDrop={editHook.handleDrop}
          onRemovePhoto={editHook.removePhoto}
        />

        {editHook.isEditMode ? (
          <CarEditForm
            car={car}
            editedCar={editHook.editedCar}
            language={language as 'bg' | 'en'}
            showOtherMake={editHook.showOtherMake}
            showOtherModel={editHook.showOtherModel}
            showOtherFuelType={editHook.showOtherFuelType}
            showOtherTransmission={editHook.showOtherTransmission}
            showOtherColor={editHook.showOtherColor}
            showOtherDoors={editHook.showOtherDoors}
            showOtherSeats={editHook.showOtherSeats}
            availableModels={editHook.availableModels}
            availableCities={editHook.availableCities}
            onInputChange={editHook.handleInputChange}
            onSetShowOther={handleSetShowOther}
            onSetAvailableCities={editHook.setAvailableCities}
            onDelete={isOwner ? handleDeleteClick : undefined}
          />
        ) : (
          <CarBasicInfo
            car={car}
            language={language as 'bg' | 'en'}
          />
        )}
      </MainContent>

      {editHook.isEditMode ? (
        <CarContactMethods
          car={car}
          editedCar={editHook.editedCar}
          isEditMode={editHook.isEditMode}
          language={language as 'bg' | 'en'}
          onContactClick={handleContactClick}
          onToggleContact={handleToggleContact}
              />
            ) : (
        <>
          <CarEquipmentDisplay
            car={car}
            language={language as 'bg' | 'en'}
          />
          
          <CarContactMethods
            car={car}
            editedCar={editHook.editedCar}
            isEditMode={editHook.isEditMode}
            language={language as 'bg' | 'en'}
            onContactClick={handleContactClick}
            onToggleContact={handleToggleContact}
          />
        </>
      )}

      {/* Distance & Directions - Only in view mode */}
      {!editHook.isEditMode && car && car.locationData?.cityName && (
        <LocationMapContainer>
          <StaticMapEmbed
            location={{
              city: car.locationData?.cityName,
              region: car.region,
              coordinates: car.coordinates
            }}
            zoom={14}
          />
          
          <DistanceIndicator
            carLocation={{
              city: car.locationData?.cityName,
              region: car.region,
              coordinates: car.coordinates
            }}
          />
        </LocationMapContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        language={language as 'bg' | 'en'}
        sellerType={car?.sellerType || 'private'}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Container>
  );
};

export default CarDetailsPage;
