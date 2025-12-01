import styled from 'styled-components';

// ==================== Layout Components ====================

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--bg-primary);
  min-height: 100vh;
  transition: background-color 0.3s ease;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-primary);
  transition: border-color 0.3s ease;
`;

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  box-shadow: var(--shadow-card);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

export const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// ==================== Seller Info Components ====================

export const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const SellerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--btn-primary-text);
  font-size: 1.25rem;
  font-weight: 700;
  box-shadow: var(--shadow-button);
  transition: background-color 0.3s ease;
`;

export const SellerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const SellerName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
`;

export const SellerPhone = styled.a`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.3s ease;

  &:hover {
    color: var(--accent-secondary);
    text-decoration: underline;
  }

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
`;

export const VehicleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-accent);
  border: 1px solid var(--border-accent);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

export const VehicleBrand = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: color 0.3s ease;
`;

export const VehicleModel = styled.div`
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.3s ease;
`;

// ==================== Button Components ====================

export const BackButton = styled.button`
  background: var(--btn-secondary-bg);
  color: var(--btn-secondary-text);
  border: 1px solid var(--btn-secondary-border);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);

  &:hover {
    background: var(--btn-secondary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

export const ThemeToggleButton = styled.button`
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1000;
  background: var(--accent-primary);
  color: var(--btn-primary-text);
  border: none;
  padding: 12px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-button);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--accent-secondary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const EditButton = styled.button`
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: 1px solid var(--btn-primary-bg);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-button);

  &:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

export const SaveButtonEnhanced = styled.button`
  background: var(--success);
  color: var(--btn-primary-text);
  border: 1px solid var(--success);
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }
`;

export const CancelButtonEnhanced = styled.button`
  background: var(--btn-secondary-bg);
  color: var(--btn-secondary-text);
  border: 1px solid var(--btn-secondary-border);
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;

  &:hover {
    background: var(--btn-secondary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }
`;

// ==================== Title Components ====================

export const CarTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  transition: color 0.3s ease;
`;

export const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--border-accent);
  text-transform: none;
  letter-spacing: 0.3px;
  transition: color 0.3s ease, border-color 0.3s ease;
`;

export const SectionIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--accent-primary);
  margin-right: 0.625rem;
  box-shadow: var(--shadow-button);
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  will-change: transform;
  transition: background-color 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.3), transparent 30%);
    opacity: 0.6;
  }

  svg {
    position: relative;
    z-index: 1;
    width: 18px;
    height: 18px;
  }
`;

// ==================== Image Section Components ====================

export const ImageSection = styled.div`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: background-color 0.3s ease;
`;

export const ImagePlaceholder = styled.div`
  width: 100%;
  height: 300px;
  background: var(--bg-hover);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: background-color 0.3s ease;
`;

export const LogoContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin: 1rem auto;
  perspective: 1000px;
  transform-style: preserve-3d;
`;

export const LogoImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 5;
`;

export const LogoBrandName = styled.span`
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
  text-transform: uppercase;
  z-index: 3;
  transition: color 0.3s ease;
`;

export const GalleryContainer = styled.div`
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--border-light);
  transition: border-color 0.3s ease;
`;

export const GalleryTitle = styled.h3`
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
`;

export const MainImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 350px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  box-shadow: var(--shadow-md);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

export const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

export const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
`;

export const ThumbnailItem = styled.div<{ $isActive?: boolean }>`
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.$isActive ? 'var(--accent-primary)' : 'var(--border-primary)'};
  transition: all 0.3s ease;
  background: var(--bg-card);

  &:hover {
    border-color: var(--accent-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-button);
  }
`;

export const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ImageCount = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: var(--text-inverse);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.688rem;
  font-weight: 600;
`;

// ==================== Photo Upload Components ====================

export const PhotoUploadSection = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

export const PhotoUploadTitle = styled.h3`
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  transition: color 0.3s ease;
`;

export const PhotoUploadArea = styled.div<{ $isDragOver: boolean }>`
  border: 2px dashed ${props => props.$isDragOver ? 'var(--accent-primary)' : 'var(--border-primary)'};
  border-radius: 6px;
  padding: 0.75rem;
  text-align: center;
  background: ${props => props.$isDragOver ? 'var(--bg-accent)' : 'var(--bg-secondary)'};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: var(--accent-primary);
    background: var(--bg-accent);
  }
`;

export const UploadIcon = styled.div`
  font-size: 2rem;
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
  
  svg {
    width: 40px;
    height: 40px;
  }
`;

export const UploadText = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
`;

export const ChoosePhotosButton = styled.button`
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: 1px solid var(--btn-primary-bg);
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-button);
  margin-top: 0.25rem;

  &:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

export const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

export const PhotoItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-primary);
    transform: scale(1.02);
  }
`;

export const PhotoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const PhotoRemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: var(--error);
  color: var(--btn-primary-text);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    filter: brightness(0.9);
    transform: scale(1.1);
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

// ==================== Details Section Components ====================

export const DetailsSection = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: var(--shadow-card);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

export const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-light);
  gap: 0.375rem;
  transition: border-color 0.3s ease;

  &:last-child {
    border-bottom: none;
  }
`;

export const DetailLabel = styled.label`
  font-weight: 500;
  color: var(--text-tertiary);
  font-size: 0.688rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0;
  display: block;
  transition: color 0.3s ease;
`;

export const DetailValue = styled.div`
  color: var(--text-secondary);
  font-size: 0.813rem;
  font-weight: 500;
  padding: 0.4rem 0.625rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 5px;
  min-height: 34px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
`;

// ==================== Form Input Components ====================

export const EditableInput = styled.input`
  width: 100%;
  padding: 0.4rem 0.625rem;
  border: 1px solid var(--border-primary);
  border-radius: 5px;
  font-size: 0.813rem;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px var(--bg-accent);
  }

  &::placeholder {
    color: var(--text-muted);
    font-size: 0.75rem;
  }
`;

export const EditableSelect = styled.select`
  width: 100%;
  padding: 0.4rem 0.625rem;
  border: 1px solid var(--border-primary);
  border-radius: 5px;
  font-size: 0.813rem;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
  cursor: pointer;
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px var(--bg-accent);
  }

  option {
    font-size: 0.813rem;
    padding: 0.5rem;
  }

  option.other-option {
    font-weight: 700;
    color: var(--text-primary);
    background: var(--bg-accent);
  }
`;

// ==================== Price Components ====================

export const PriceSection = styled.div`
  background: var(--accent-primary);
  color: var(--btn-primary-text);
  padding: 0.625rem 1rem;
  border-radius: 8px;
  display: inline-block;
  margin: 0.5rem 0 1rem 0;
  box-shadow: var(--shadow-button);
  border: 1px solid var(--accent-secondary);
  transition: background-color 0.3s ease, color 0.3s ease;
  
  h3, label, input[type="number"] {
    color: var(--btn-primary-text) !important;
  }
  
  input[type="number"] {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
  }
`;

export const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  display: inline;
  letter-spacing: -0.3px;
`;

export const PriceLabel = styled.span`
  font-size: 0.75rem;
  opacity: 0.9;
  font-weight: 500;
  margin-left: 0.5rem;
`;

// ==================== Equipment Section Components ====================

export const EquipmentSection = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-card);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

// ==================== Toggle Switch Components ====================

export const ToggleSwitchContainer = styled.div<{ $isOn: boolean }>`
  position: relative;
  width: 32px;
  height: 32px;
  background: ${props => props.$isOn ? 'var(--success)' : 'var(--bg-card)'};
  border: 2px solid ${props => props.$isOn ? 'var(--success)' : 'var(--border-primary)'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$isOn 
    ? '0 2px 8px rgba(34, 197, 94, 0.3)'
    : 'var(--shadow-sm)'
  };

  &:hover {
    transform: scale(1.1);
    box-shadow: ${props => props.$isOn 
      ? '0 4px 12px rgba(34, 197, 94, 0.4)'
      : 'var(--shadow-md)'
    };
    border-color: ${props => props.$isOn ? 'var(--success)' : 'var(--accent-primary)'};
  }

  &:active {
    transform: scale(0.95);
  }

  &::before {
    content: ${props => props.$isOn ? "'✓'" : "'✗'"};
    font-size: 16px;
    font-weight: bold;
    color: ${props => props.$isOn ? 'var(--btn-primary-text)' : 'var(--text-tertiary)'};
    transition: all 0.3s ease;
  }
`;

export const ToggleSwitchInner = styled.div<{ $isOn: boolean }>`
  display: none; /* Not needed in icon design */
`;

export const ToggleSwitchKnobContainer = styled.div<{ $isOn: boolean }>`
  display: none; /* Not needed in icon design */
`;

export const ToggleSwitchKnob = styled.div<{ $isOn: boolean }>`
  display: none; /* Not needed in icon design */
`;

export const ToggleSwitchNeon = styled.div<{ $isOn: boolean }>`
  display: none; /* Not needed in icon design */
`;

export const ToggleLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-left: 0.5rem;
  transition: color 0.3s ease;
`;

// Toggle Switch Component - Icon Style
// ToggleSwitch component has been moved to components/ToggleSwitch.tsx

// ==================== Contact Method Components ====================

export const ContactIcon = styled.div<{ $isActive: boolean }>`
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  cursor: ${props => props.$isActive ? 'pointer' : 'not-allowed'};
  filter: ${props => props.$isActive ? 'none' : 'grayscale(100%)'};
  background: ${props => props.$isActive ? 'transparent' : 'rgba(220, 220, 220, 0.4)'};
  border-radius: 12px;

  &:hover {
    transform: ${props => props.$isActive ? 'translateY(-6px) scale(1.15)' : 'none'};
  }

  img, svg {
    width: 44px;
    height: 44px;
    position: relative;
    z-index: 1;
    opacity: ${props => props.$isActive ? '1' : '0.3'};
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    object-fit: contain;
    filter: ${props => props.$isActive 
      ? 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.15)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.12)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.1))'
      : 'none'
    };
  }

  &:hover img,
  &:hover svg {
    filter: ${props => props.$isActive 
      ? 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25)) drop-shadow(0 3px 6px rgba(0, 0, 0, 0.18)) drop-shadow(0 10px 20px rgba(255, 121, 0, 0.2))'
      : 'none'
    };
    transform: ${props => props.$isActive ? 'scale(1.1)' : 'none'};
  }
`;

export const ContactLabel = styled.span<{ $isActive: boolean }>`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.$isActive ? 'var(--text-primary)' : 'var(--text-muted)'};
  transition: all 0.3s ease;
  text-align: center;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  letter-spacing: 0.3px;
`;

export const ContactItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 0.65rem;
  border-radius: 14px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  background: ${props => props.$isActive ? 'transparent' : 'var(--bg-secondary)'};
  min-width: 92px;
  max-width: 115px;
  border: 2px solid ${props => props.$isActive ? 'transparent' : 'var(--border-primary)'};

  &:hover {
    transform: ${props => props.$isActive ? 'translateY(-5px)' : 'none'};
    background: ${props => props.$isActive ? 'var(--bg-accent)' : 'var(--bg-secondary)'};
  }

  &:hover ${ContactLabel} {
    color: ${props => props.$isActive ? 'var(--accent-primary)' : 'var(--text-muted)'};
  }
`;

// ==================== Location Components ====================

export const LocationMapContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 1.5rem 0;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

// ==================== Loading Components ====================

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.25rem;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
`;

// ==================== Contact Icons ====================
// Contact icons have been moved to components/ContactIcons.tsx

