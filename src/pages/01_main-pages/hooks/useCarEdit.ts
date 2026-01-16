import { useState, useEffect } from 'react';
import { CarListing } from '../../../types/CarListing';
import { unifiedCarService } from '../../../services/car';
import { imageUploadService } from '../../../services/car/image-upload.service';
import { logger } from '../../../services/logger-service';
import { getCitiesByRegion } from '../../../data/bulgaria-locations';
import { brandsModelsDataService } from '../../../services/brands-models-data.service';
import { carDeleteService } from '../../../services/garage/car-delete.service';

export const useCarEdit = (
  car: CarListing | null,
  carId: string | undefined,
  language: 'bg' | 'en',
  onSaveSuccess?: () => void
) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCar, setEditedCar] = useState<Partial<CarListing>>({});
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // State for "Other" option inputs
  const [showOtherMake, setShowOtherMake] = useState(false);
  const [showOtherModel, setShowOtherModel] = useState(false);
  const [showOtherFuelType, setShowOtherFuelType] = useState(false);
  const [showOtherTransmission, setShowOtherTransmission] = useState(false);
  const [showOtherColor, setShowOtherColor] = useState(false);
  const [showOtherDoors, setShowOtherDoors] = useState(false);
  const [showOtherSeats, setShowOtherSeats] = useState(false);

  // State for Bulgarian regions and cities
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // State for car models based on selected make
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Initialize editedCar when car is loaded
  useEffect(() => {
    if (car) {
      setEditedCar(car);
    }
  }, [car]);

  // Load cities when car data is loaded or region changes
  useEffect(() => {
    if ((editedCar as any).locationData?.regionName) {
      const cities = getCitiesByRegion((editedCar as any).locationData?.regionName);
      const cityNames = cities.map(city => typeof city === 'string' ? city : city.name);
      setAvailableCities(cityNames);
    }
  }, [(editedCar as any).locationData?.regionName]);

  // Load models when make changes
  useEffect(() => {
    if (editedCar.make) {
      brandsModelsDataService.getModelsForBrand(editedCar.make)
        .then(models => {
          setAvailableModels(models);

          // If current model is not in the new models list, clear it
          if (editedCar.model && !models.includes(editedCar.model)) {
            setEditedCar(prev => ({ ...prev, model: '' }));
          }
        })
        .catch(error => {
          // Ignore abort errors as they are expected during rapid navigation
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }

          logger.error('Error loading models for brand', error as Error, { make: editedCar.make });
          setAvailableModels([]);
        });
    } else {
      setAvailableModels([]);
    }
  }, [editedCar.make]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      photoUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // URL already revoked
        }
      });
    };
  }, [photoUrls]);

  const handleEdit = () => {
    setIsEditMode(true);
    setEditedCar(car || {});
  };

  const handleSave = async () => {
    if (!carId || !editedCar) return;

    setSaving(true);
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Starting save process', { carId, photosCount: photos.length, editedCarKeys: Object.keys(editedCar) });
      }

      // Step 1: Upload new photos to Firebase Storage
      let uploadedUrls: string[] = [];
      if (photos.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Uploading new photos', {
            count: photos.length,
            photos: photos.map((p, i) => ({
              index: i,
              name: p.name,
              size: p.size,
              type: p.type,
              isFile: p instanceof File,
              isBlob: p instanceof Blob
            }))
          });
        }

        // ✅ Validate photos are File objects
        const validPhotos = photos.filter((photo, index) => {
          if (!photo) {
            logger.warn(`Photo at index ${index} is null or undefined`);
            return false;
          }
          if (!(photo instanceof File)) {
            logger.warn(`Photo at index ${index} is not a File object`, { type: typeof photo });
            return false;
          }
          return true;
        });

        if (validPhotos.length === 0) {
          throw new Error('No valid photos to upload. Please select image files.');
        }

        if (validPhotos.length < photos.length) {
          logger.warn('Some photos were filtered out', {
            original: photos.length,
            valid: validPhotos.length
          });
        }

        try {
          uploadedUrls = await imageUploadService.uploadImages(carId, validPhotos, {
            make: editedCar.make || 'unknown',
            model: editedCar.model || 'unknown',
            year: Number(editedCar.year) || new Date().getFullYear(),
            city: editedCar.city || 'bulgaria'
          });
        } catch (uploadError) {
          logger.error('Failed to upload photos', uploadError as Error);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
          throw new Error(`Failed to upload images: ${errorMessage}`);
        }
      }

      // Step 2: Merge existing images with new ones
      const existingImages = (car?.images || []) as string[];
      const updatedImages = [...existingImages, ...uploadedUrls];

      // Step 3: Save all changes
      const updatedCarData = {
        ...editedCar,
        images: updatedImages
      };
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Updating car data', { carId, updates: Object.keys(updatedCarData), imagesCount: updatedImages.length });
      }

      await unifiedCarService.updateCar(carId, updatedCarData);

      setIsEditMode(false);
      setPhotos([]);
      setPhotoUrls([]);

      alert(language === 'bg' ? 'Промените са запазени успешно!' : 'Changes saved successfully!');

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      logger.error('Error saving car changes', error as Error, { carId });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(language === 'bg'
        ? `Грешка при запазване: ${errorMessage}`
        : `Error saving changes: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedCar(car || {});
    setPhotos([]);
    setPhotoUrls([]);
  };

  const handleInputChange = (field: keyof CarListing, value: any) => {
    setEditedCar(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const newPhotos = [...photos, ...fileArray].slice(0, 20);
    setPhotos(newPhotos);

    const urls = newPhotos.map(file => URL.createObjectURL(file));
    setPhotoUrls(urls);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newUrls = photoUrls.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoUrls(newUrls);
  };

  const deleteExistingImage = async (imageUrl: string) => {
    if (!window.confirm(language === 'bg'
      ? 'Сигурни ли сте, че искате да изтриете тази снимка?'
      : 'Are you sure you want to delete this image?'
    )) {
      return;
    }

    try {
      // Remove from Firebase Storage
      await imageUploadService.deleteImages(carId!, [imageUrl]);

      // Update car.images array
      const updatedImages = (car?.images || []).filter(img => img !== imageUrl);
      await unifiedCarService.updateCar(carId!, { images: updatedImages });

      alert(language === 'bg' ? 'Снимката е изтрита!' : 'Image deleted successfully!');

      return updatedImages;
    } catch (error) {
      logger.error('Error deleting existing image', error as Error, { carId, imageUrl });
      alert(language === 'bg' ? 'Грешка при изтриване' : 'Error deleting image');
      return null;
    }
  };

  const handleDelete = async (userId: string): Promise<boolean> => {
    if (!carId) {
      logger.error('Cannot delete car: carId is undefined', new Error('No carId'), {});
      return false;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Starting car deletion process', { carId, userId });
      }

      const result = await carDeleteService.deleteCar(carId, userId);

      if (result.success) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Car deleted successfully', { carId });
        }
        return true;
      } else {
        logger.error('Car deletion failed', new Error(result.message), { carId });
        alert(result.message);
        return false;
      }
    } catch (error) {
      logger.error('Exception during car deletion', error as Error, { carId, userId });
      alert(language === 'bg' ? 'Грешка при изтриване на обявата' : 'Error deleting listing');
      return false;
    }
  };

  return {
    isEditMode,
    setIsEditMode,
    editedCar,
    setEditedCar,
    saving,
    photos,
    photoUrls,
    isDragOver,
    showOtherMake,
    setShowOtherMake,
    showOtherModel,
    setShowOtherModel,
    showOtherFuelType,
    setShowOtherFuelType,
    showOtherTransmission,
    setShowOtherTransmission,
    showOtherColor,
    setShowOtherColor,
    showOtherDoors,
    setShowOtherDoors,
    showOtherSeats,
    setShowOtherSeats,
    availableCities,
    setAvailableCities,
    availableModels,
    handleEdit,
    handleSave,
    handleCancel,
    handleInputChange,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removePhoto,
    deleteExistingImage,
    handleDelete,
  };
};

