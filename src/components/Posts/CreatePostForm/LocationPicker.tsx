import { logger } from '../../../services/logger-service';
// Location Picker - Google Maps Location Selector (Like Facebook)
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { MapPin, Search, X, Map as MapIcon, Navigation } from 'lucide-react';

export interface DetailedLocation {
  // Short display name
  displayName: string;
  
  // Full address components
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  
  // Precise coordinates
  coordinates: {
    latitude: number;
    longitude: number;
  };
  
  // Google Place ID (for future features)
  placeId?: string;
}

interface LocationPickerProps {
  value: DetailedLocation | null;
  onChange: (location: DetailedLocation | null) => void;
}

// Google Maps API Key (from .env)
const validateMapAPIKey = (): string => {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error('VITE_GOOGLE_MAPS_API_KEY environment variable is not set. Please configure it in your .env file.');
  }
  return key;
};

const GOOGLE_MAPS_API_KEY = validateMapAPIKey();

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Initialize Google Maps Services
  useEffect(() => {
    if (isOpen && typeof google !== 'undefined') {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isOpen]);

  // Search places (autocomplete)
  useEffect(() => {
    if (!searchQuery || !autocompleteServiceRef.current) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      autocompleteServiceRef.current!.getPlacePredictions(
        {
          input: searchQuery,
          componentRestrictions: { country: 'bg' }, // Bulgaria only
          types: ['geocode', 'establishment']
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchResults(predictions);
          } else {
            setSearchResults([]);
          }
        }
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          
          // Reverse geocode to get address
          if (geocoderRef.current) {
            geocoderRef.current.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  const place = results[0];
                  selectLocation(place, latitude, longitude);
                }
              }
            );
          }
        },
        (error) => {
          logger.error('Geolocation error:', error);
          alert(language === 'bg' 
            ? 'Не можахме да определим местоположението ви'
            : 'Could not determine your location');
        }
      );
    } else {
      alert(language === 'bg'
        ? 'Геолокацията не се поддържа от вашия браузър'
        : 'Geolocation is not supported by your browser');
    }
  }, [language]);

  // Select location from search
  const handleSelectResult = useCallback((place: any) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode(
      { placeId: place.place_id },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const result = results[0];
          const lat = result.geometry.location.lat();
          const lng = result.geometry.location.lng();
          
          selectLocation(result, lat, lng);
          setSearchQuery('');
          setSearchResults([]);
        }
      }
    );
  }, []);

  // Select location (from search or current location)
  const selectLocation = (place: google.maps.GeocoderResult, lat: number, lng: number) => {
    const addressComponents = place.address_components || [];
    
    const getComponent = (types: string[]) => {
      const component = addressComponents.find(c => 
        types.some(type => c.types.includes(type))
      );
      return component?.long_name || '';
    };

    const detailedLocation: DetailedLocation = {
      displayName: place.formatted_address?.split(',')[0] || '',
      address: place.formatted_address || '',
      city: getComponent(['locality', 'administrative_area_level_3']),
      region: getComponent(['administrative_area_level_1']),
      country: getComponent(['country']),
      postalCode: getComponent(['postal_code']),
      coordinates: {
        latitude: lat,
        longitude: lng
      },
      placeId: place.place_id
    };

    setSelectedPlace(detailedLocation);
    
    // Show on map
    if (mapRef.current && !googleMapRef.current) {
      initializeMap(lat, lng);
    } else if (googleMapRef.current) {
      updateMapMarker(lat, lng);
    }
  };

  // Initialize Google Map
  const initializeMap = (lat: number, lng: number) => {
    if (!mapRef.current || typeof google === 'undefined') return;

    setIsLoadingMap(true);

    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP
    });

    // Update location when marker is dragged
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position && geocoderRef.current) {
        const lat = position.lat();
        const lng = position.lng();
        
        geocoderRef.current.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results && results[0]) {
              selectLocation(results[0], lat, lng);
            }
          }
        );
      }
    });

    googleMapRef.current = map;
    markerRef.current = marker;
    setIsLoadingMap(false);
  };

  // Update map marker position
  const updateMapMarker = (lat: number, lng: number) => {
    if (googleMapRef.current && markerRef.current) {
      const position = { lat, lng };
      googleMapRef.current.setCenter(position);
      markerRef.current.setPosition(position);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    onChange(selectedPlace);
    setIsOpen(false);
  };

  // Clear selection
  const handleClear = () => {
    onChange(null);
    setSelectedPlace(null);
    setIsOpen(false);
  };

  const t = {
    bg: {
      addLocation: 'Добави местоположение',
      changeLocation: 'Промени местоположението',
      searchPlaceholder: 'Търси местоположение...',
      currentLocation: 'Използвай текущото местоположение',
      confirm: 'Потвърди',
      cancel: 'Откажи',
      clear: 'Изчисти',
      noResults: 'Няма резултати',
      dragMarker: 'Плъзнете маркера за точно местоположение'
    },
    en: {
      addLocation: 'Add Location',
      changeLocation: 'Change Location',
      searchPlaceholder: 'Search for a location...',
      currentLocation: 'Use Current Location',
      confirm: 'Confirm',
      cancel: 'Cancel',
      clear: 'Clear',
      noResults: 'No results',
      dragMarker: 'Drag marker for precise location'
    }
  }[language];

  return (
    <Container>
      {!value ? (
        <AddLocationButton onClick={() => setIsOpen(true)}>
          <MapPin size={16} />
          <span>{t.addLocation}</span>
        </AddLocationButton>
      ) : (
        <SelectedLocation>
          <MapPin size={14} color="#FF7900" />
          <span>{value.displayName}</span>
          <ClearButton onClick={handleClear}>
            <X size={14} />
          </ClearButton>
        </SelectedLocation>
      )}

      {isOpen && (
        <Modal onClick={() => setIsOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <MapIcon size={20} />
                {t.addLocation}
              </ModalTitle>
              <CloseButton onClick={() => setIsOpen(false)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <SearchSection>
              <SearchBar>
                <Search size={18} />
                <SearchInput
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </SearchBar>

              <CurrentLocationButton onClick={getCurrentLocation}>
                <Navigation size={16} />
                {t.currentLocation}
              </CurrentLocationButton>

              {searchResults.length > 0 && (
                <SearchResults>
                  {searchResults.map((result) => (
                    <ResultItem
                      key={result.place_id}
                      onClick={() => handleSelectResult(result)}
                    >
                      <MapPin size={16} />
                      <div>
                        <div className="main">{result.structured_formatting.main_text}</div>
                        <div className="secondary">{result.structured_formatting.secondary_text}</div>
                      </div>
                    </ResultItem>
                  ))}
                </SearchResults>
              )}

              {searchQuery && searchResults.length === 0 && (
                <NoResults>{t.noResults}</NoResults>
              )}
            </SearchSection>

            {selectedPlace && (
              <>
                <MapContainer ref={mapRef} />
                {isLoadingMap && <MapLoading>Loading map...</MapLoading>}
                <MapHint>{t.dragMarker}</MapHint>
              </>
            )}

            <ModalFooter>
              <CancelButton onClick={() => setIsOpen(false)}>
                {t.cancel}
              </CancelButton>
              <ConfirmButton
                onClick={handleConfirm}
                disabled={!selectedPlace}
              >
                {t.confirm}
              </ConfirmButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  margin: 12px 0;
`;

const AddLocationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 8px;
  color: #495057;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  
  &:hover {
    background: #e9ecef;
    border-color: #FF8F10;
    color: #FF7900;
  }
`;

const SelectedLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff4e6;
  border: 1px solid #ffb74d;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #212529;
  
  span {
    flex: 1;
    font-weight: 500;
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #212529;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
`;

const ModalTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #212529;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s;
  color: #6c757d;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const SearchSection = styled.div`
  padding: 20px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 12px;
  
  &:focus-within {
    border-color: #FF8F10;
    background: white;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 1rem;
  outline: none;
  color: #212529;
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const CurrentLocationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SearchResults = styled.div`
  margin-top: 12px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
`;

const ResultItem = styled.button`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: none;
  border-bottom: 1px solid #f8f9fa;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  svg {
    margin-top: 2px;
    flex-shrink: 0;
    color: #FF7900;
  }
  
  .main {
    font-weight: 600;
    color: #212529;
    margin-bottom: 2px;
  }
  
  .secondary {
    font-size: 0.85rem;
    color: #6c757d;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 20px;
  color: #6c757d;
  font-size: 0.9rem;
`;

const MapContainer = styled.div`
  height: 300px;
  margin: 0 20px 12px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e9ecef;
`;

const MapLoading = styled.div`
  text-align: center;
  padding: 20px;
  color: #6c757d;
`;

const MapHint = styled.div`
  text-align: center;
  padding: 0 20px 20px;
  color: #6c757d;
  font-size: 0.85rem;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
  }
`;

const ConfirmButton = styled.button`
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export default LocationPicker;

