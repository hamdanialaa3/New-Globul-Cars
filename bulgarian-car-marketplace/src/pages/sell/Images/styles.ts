// Images Page Styles
// أنماط صفحة الصور

import styled from 'styled-components';

export const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const HeaderCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  border: 1px solid rgba(255, 143, 16, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff8f10, #005ca9);
  }
`;

export const Title = styled.h1`
  font-size: 1.425rem; /* 150% من 0.95rem */
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.375rem 0;
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
`;

export const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
`;

export const UploadCard = styled.div<{ $isDragOver: boolean }>`
  background: white;
  border: 3px dashed ${props => props.$isDragOver ? '#ff8f10' : 'rgba(255, 143, 16, 0.3)'};
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  ${props => props.$isDragOver && `
    background: rgba(255, 143, 16, 0.05);
    transform: scale(1.02);
  `}

  &:hover {
    border-color: #ff8f10;
    box-shadow: 0 8px 20px rgba(255, 143, 16, 0.1);
  }
`;

export const UploadIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
  background: rgba(255, 143, 16, 0.1);
  border-radius: 50%;
  color: #ff8f10;
`;

export const UploadText = styled.p`
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-weight: 500;
`;

export const FileInput = styled.input`
  display: none;
`;

export const UploadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(255, 143, 16, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(255, 143, 16, 0.4);
  }
`;

export const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
`;

export const PreviewCard = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 143, 16, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(255, 143, 16, 0.2);
    border-color: #ff8f10;
  }
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  background: rgba(231, 76, 60, 0.9);
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
    background: #e74c3c;
    transform: scale(1.1);
  }
`;

export const ImageNumber = styled.div`
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  background: rgba(255, 143, 16, 0.9);
  color: white;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
`;

export const InfoBox = styled.div`
  background: rgba(255, 143, 16, 0.08);
  border-left: 4px solid #ff8f10;
  padding: 1.25rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #2c3e50;
  line-height: 1.8;
`;

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ecf0f1;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
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
      background: linear-gradient(135deg, #ff8f10, #005ca9);
      color: white;
      box-shadow: 0 8px 20px rgba(255, 143, 16, 0.3);
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 25px rgba(255, 143, 16, 0.4);
      }
    `
    : `
      background: #f8f9fa;
      color: #6c757d;
      border: 2px solid #e9ecef;
      
      &:hover {
        background: #e9ecef;
      }
    `
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

