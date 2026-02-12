import defaultStyled from 'styled-components';

const styled = defaultStyled;

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
