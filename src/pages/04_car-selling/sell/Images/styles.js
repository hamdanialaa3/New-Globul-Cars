// Images Page Styles
// أنماط صفحة الصور
import styled from 'styled-components';
export const ContentSection = styled.div `
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;
export const HeaderCard = styled.div `
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  padding: 2.5rem;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--accent-primary);
  }
`;
export const Title = styled.h1 `
  font-size: 1.75rem; /* 28px - Global Standard */
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;
export const Subtitle = styled.p `
  font-size: 1rem; /* 16px */
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
`;
export const BrandOrbitInline = styled.div `
  align-self: flex-start;
  max-width: 240px;
  margin-top: 1rem;
`;
export const UploadCard = styled.div `
  background: var(--bg-card);
  border: 3px dashed ${props => props.$isDragOver ? 'var(--accent-primary)' : 'var(--border-primary)'};
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  ${props => props.$isDragOver && `
    background: var(--bg-accent);
    transform: scale(1.02);
  `}

  &:hover {
    border-color: var(--accent-primary);
    box-shadow: var(--shadow-md);
  }
`;
export const UploadIcon = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
  background: var(--bg-accent);
  border-radius: 50%;
  color: var(--accent-orange);
`;
export const UploadText = styled.p `
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  font-weight: 500;
`;
export const FileInput = styled.input `
  display: none;
`;
export const UploadButton = styled.button `
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: var(--accent-primary);
  color: var(--text-on-accent);
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;
export const PreviewGrid = styled.div `
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
`;
export const PreviewCard = styled.div `
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--border);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-orange);
  }
`;
export const PreviewImage = styled.img `
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
export const RemoveButton = styled.button `
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  background: var(--error);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;

  ${PreviewCard}:hover & {
    opacity: 1;
  }

  &:hover {
    background: var(--error);
    transform: scale(1.1);
  }
`;
export const ImageNumber = styled.div `
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  background: var(--accent-orange);
  color: var(--text-on-accent);
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
`;
export const InfoBox = styled.div `
  background: var(--bg-accent);
  border-left: 4px solid var(--accent-orange);
  padding: 1.25rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.8;
`;
export const NavigationButtons = styled.div `
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
`;
export const Button = styled.button `
  padding: 0.3rem 0.75rem; /* حجم المربع */
  border: none;
  border-radius: 50px;
  font-size: 0.945rem; /* 150% من 0.63rem */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 48px;

  ${props => props.$variant === 'primary'
    ? `
      background: var(--accent-primary);
      color: var(--text-on-accent);
      box-shadow: var(--shadow-md);
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }
    `
    : `
      background: var(--bg-secondary);
      color: var(--text-secondary);
      border: 2px solid var(--border);
      
      &:hover {
        background: var(--bg-accent);
      }
    `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;
