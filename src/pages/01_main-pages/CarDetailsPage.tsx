import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { logger } from '../../services/logger-service';
import { userService } from '../../services/user/canonical-user.service';
import { realtimeMessagingService } from '../../services/messaging/realtime';
import { useCarViewTracking } from '../../hooks/useProfileTracking';
import { unifiedCarService } from '../../services/car';
import DistanceIndicator from '../../components/DistanceIndicator';
import StaticMapEmbed from '../../components/StaticMapEmbed';
import CarDetailsMobileDEStyle from './components/CarDetailsMobileDEStyle';
import { useCarDetails } from './hooks/useCarDetails';
import { useCarEdit } from './hooks/useCarEdit';
import CarSEO from '../../components/seo/CarSEO';
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
import { UnifiedCar } from '../../services/car/unified-car-types';
import { PromotionPurchaseModal } from '../../components/billing/PromotionPurchaseModal';

interface CarDetailsPageProps {
  forcedCarId?: string;
  initialEditMode?: boolean; // ✅ Support for URL-based edit state
}

const CarDetailsPage: React.FC<CarDetailsPageProps> = ({ forcedCarId, initialEditMode = false }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const carId = forcedCarId || paramId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  // Use custom hooks
  const { car, loading, setCar } = useCarDetails(carId);

  // Auto-track car views
  useCarViewTracking(carId, car?.sellerId);

  // ✅ FIX: Hydrate seller numeric ID if missing (for legacy listings)
  useEffect(() => {
    if (car && car.sellerId && !car.sellerNumericId && !loading) {
      import('../../services/user/canonical-user.service').then(({ userService }) => {
        userService.getUserProfile(car.sellerId).then(profile => {
          if (profile && profile.numericId) {
            logger.debug('Hydrating seller numericId', { numericId: profile.numericId });
            setCar(prev => prev ? { ...prev, sellerNumericId: profile.numericId } : null);
          }
        }).catch(err => logger.error('Failed to hydrate seller numeric ID', err as Error));
      });
    }
  }, [car?.id, car?.sellerId, loading, setCar]);

  // Check if current user is the owner
  const isOwner = currentUser && car && (
    currentUser.uid === car.sellerId ||
    currentUser.uid === (car as CarListing & { userId?: string }).userId ||
    currentUser.uid === (car as CarListing & { ownerId?: string }).ownerId
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
            const extendedCar = updatedCar as UnifiedCar & Partial<CarListing>;
            const carData: CarListing = {
              ...updatedCar,
              vehicleType: extendedCar.vehicleType || 'car',
              sellerType: updatedCar.sellerType || 'private',
              sellerName: extendedCar.sellerName || '',
              sellerEmail: extendedCar.sellerEmail || '',
              sellerPhone: extendedCar.sellerPhone || '',
              city: extendedCar.city || '',
              region: extendedCar.region || '',
              accidentHistory: extendedCar.accidentHistory ?? false,
              serviceHistory: extendedCar.serviceHistory ?? false,
            };
            setCar(carData);
          }
        });
      }
    }
  );

  // ✅ NEW: Sync internal edit state with prop or URL param
  useEffect(() => {
    // If initialEditMode prop is explicitly passed (e.g. from NumericCarDetailsPage on /edit route)
    if (initialEditMode) {
      if (!editHook.isEditMode) {
        editHook.setIsEditMode(true);
      }
    }
    // Backward compatibility for ?edit=true
    else if (searchParams.get('edit') === 'true') {
      if (!editHook.isEditMode) {
        editHook.setIsEditMode(true);
      }
    }
  }, [initialEditMode, searchParams, editHook.isEditMode]);

  // ✅ NEW: Handle Edit Button Click -> Navigate to /edit URL
  const handleEditClick = () => {
    if (!car) return;

    // Construct Edit URL
    // Priority: Numeric ID URL -> Legacy ID URL
    if (car.sellerNumericId && (car.carNumericId || car.numericId)) {
      const url = `/car/${car.sellerNumericId}/${car.carNumericId || car.numericId}/edit`;
      navigate(url);
    } else {
      // Fallback to legacy edit pattern if no numeric IDs (should be rare)
      navigate(`/edit-car/${car.id}`);
    }
  };

  // ✅ NEW: Handle Cancel -> Navigate back to View URL
  const handleCancelClick = () => {
    editHook.handleCancel();

    // If we are on /edit URL, navigate back
    if (window.location.pathname.endsWith('/edit')) {
      navigate(-1); // Go back to view page
    }
    // If using ?edit=true, remove it
    if (searchParams.get('edit') === 'true') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('edit');
      navigate({ search: newParams.toString() }, { replace: true });
    }
  };

  // Contact Method Handlers
  const handleContactClick = useCallback(async (method: string) => {
    if (editHook.isEditMode) return;

    const phone = car?.sellerPhone || '';
    const email = car?.sellerEmail || '';
    const cleanPhone = phone.replace(/\D/g, '');

    switch (method) {
      case 'message':
        if (currentUser) {
          try {
            // Get buyer profile to get numericId
            const buyerProfile = await userService.getUserProfile(currentUser.uid);
            if (!buyerProfile?.numericId) {
              logger.error('[CarDetailsPage] Buyer has no numericId');
              alert(language === 'bg' ? 'Грешка при зареждане на профила.' : 'Error loading user profile.');
              return;
            }

            const sellerNumericId = car?.sellerNumericId;
            const carNumericId = car?.carNumericId || car?.numericId;
            const sellerFirebaseId = car?.sellerId;

            if (!sellerNumericId || !carNumericId || !sellerFirebaseId) {
              logger.error('[CarDetailsPage] Missing seller, car numericId, or sellerId');
              alert(language === 'bg' ? 'Грешка при зареждане на данните.' : 'Error loading data.');
              return;
            }

            // 🚀 CREATE the channel in database (not just generate ID)
            const channel = await realtimeMessagingService.getOrCreateChannel({
              buyer: {
                numericId: buyerProfile.numericId,
                firebaseId: currentUser.uid,
                displayName: buyerProfile.displayName || 'User',
                avatarUrl: buyerProfile.photoURL,
              },
              seller: {
                numericId: sellerNumericId,
                firebaseId: sellerFirebaseId,
                displayName: car?.sellerName || 'Seller',
                avatarUrl: null, // Seller photo not available in CarListing
              },
              car: {
                numericId: carNumericId,
                firebaseId: car?.id || '',
                title: `${car?.make || ''} ${car?.model || ''} ${car?.year || ''}`.trim(),
                price: car?.price || 0,
                // images in Firestore is string[] (URLs), but TypeScript expects File[] from CarListing interface
                image: typeof car?.images?.[0] === 'string'
                  ? car.images[0]
                  : '',
                make: car?.make,
                model: car?.model,
              },
            });

            logger.info('[CarDetailsPage] Channel created/found', { channelId: channel.id });

            // Navigate to the realtime messaging page with channel
            navigate(`/messages?channel=${channel.id}`);

          } catch (err) {
            logger.error('[CarDetailsPage] Error starting chat', err instanceof Error ? err : undefined);
            alert(language === 'bg' ? 'Грешка при свързване.' : 'Connection error.');
          }
        } else {
          alert(language === 'bg' ? 'Моля влезте в профила си, за да изпратите съобщение.' : 'Please log in to send a message.');
        }
        break;

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

      case 'share':
        // Share the car link with social media
        const carUrl = car?.sellerNumericId && (car?.carNumericId || car?.numericId)
          ? `${window.location.origin}/car/${car.sellerNumericId}/${car.carNumericId || car.numericId}`
          : `${window.location.origin}/car/${car?.id}`;
        const shareTitle = `${car?.make} ${car?.model} ${car?.year} - ${car?.price}€`;
        const shareText = encodeURIComponent(shareTitle);
        const encodedUrl = encodeURIComponent(carUrl);

        // Use Web Share API if available (mobile)
        if (navigator.share) {
          navigator.share({
            title: shareTitle,
            text: shareTitle,
            url: carUrl,
          }).catch(() => {
            // Fallback to clipboard if share fails
            navigator.clipboard.writeText(carUrl);
            alert(language === 'bg' ? 'Линкът е копиран в клипборда!' : 'Link copied to clipboard!');
          });
        } else {
          // Fallback: Copy to clipboard and show share options
          navigator.clipboard.writeText(carUrl).then(() => {
            alert(language === 'bg'
              ? `Линкът е копиран! Споделете го: ${carUrl}`
              : `Link copied! Share it: ${carUrl}`);
          });
        }
        break;

      default:
        break;
    }
  }, [car, currentUser, editHook.isEditMode, language, navigate]);

  const handleToggleContact = (fieldKey: keyof CarListing) => {
    editHook.handleInputChange(fieldKey, !editHook.editedCar[fieldKey]);
  };

  const handleSetShowOther = (field: string, value: boolean) => {
    switch (field) {
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

    const confirmed = window.confirm(
      language === 'bg'
        ? 'Моля потвърдете изтриването. Това действие е необратимо!'
        : 'Please confirm deletion. This action cannot be undone!'
    );

    if (!confirmed) return;

    const success = await editHook.handleDelete(currentUser.uid);

    if (success) {
      alert(
        language === 'bg'
          ? isSold
            ? '✅ Честито за продажбата! Обявата е изтрита успешно.'
            : '✅ Обявата е изтрита успешно.'
          : isSold
            ? '✅ Congratulations on the sale! Listing deleted successfully.'
            : '✅ Listing deleted successfully.'
      );
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
            {language === 'bg' ? `ID: ${carId}` : `ID: ${carId}`}
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

  if (!editHook.isEditMode) {
    return (
      <CarDetailsMobileDEStyle
        car={car}
        language={(language as 'bg' | 'en')}
        onBack={() => navigate(-1)}
        onEdit={isOwner ? handleEditClick : undefined}
        isOwner={Boolean(isOwner)}
        onContact={handleContactClick}
      />
    );
  }

  return (
    <Container>
      <ThemeToggleButton onClick={toggleTheme}>
        {theme === 'dark' ? '☀️' : '🌙'}
        {theme === 'dark' ? (language === 'bg' ? 'وضع نهاري' : 'Light Mode') : (language === 'bg' ? 'وضع ليلي' : 'Dark Mode')}
      </ThemeToggleButton>

      {/* ✅ SEO Metadata */}
      <CarSEO car={car} />

      <CarHeader
        car={car}
        isEditMode={editHook.isEditMode}
        isOwner={Boolean(isOwner)}
        saving={editHook.saving}
        language={language as 'bg' | 'en'}
        onBack={() => navigate(-1)}
        onEdit={handleEditClick}
        onSave={editHook.handleSave}
        onCancel={handleCancelClick}
      />

      {/* Promote listing CTA for owners */}
      {!editHook.isEditMode && isOwner && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }}>
          <button
            onClick={() => setShowPromoModal(true)}
            style={{
              background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
              color: '#fff',
              padding: '12px 18px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              letterSpacing: '0.3px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
            }}
          >
            🚀 {language === 'bg' ? 'Популяризирай обявата' : 'Boost this listing'}
          </button>
        </div>
      )}

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

      <CarContactMethods
        car={car}
        editedCar={editHook.editedCar}
        isEditMode={editHook.isEditMode}
        language={language as 'bg' | 'en'}
        onContactClick={handleContactClick}
        onToggleContact={handleToggleContact}
      />

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

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        language={language as 'bg' | 'en'}
        sellerType={car?.sellerType || 'private'}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {isOwner && (
        <PromotionPurchaseModal
          isOpen={showPromoModal}
          onClose={() => setShowPromoModal(false)}
          listingId={carId || ''}
          userId={currentUser?.uid || ''}
          onSuccess={() => {
            setShowPromoModal(false);
            window.location.reload();
          }}
        />
      )}
    </Container>
  );
};

export default CarDetailsPage;
