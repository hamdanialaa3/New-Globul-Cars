// src/components/Profile/ImageCropper.tsx
// Image Cropper Component - مكون قص الصور
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Crop, RotateCw, ZoomIn, ZoomOut, Check, X } from 'lucide-react';

// ==================== STYLED COMPONENTS ====================

const CropperOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const CropperContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CropperHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #333;
  }
`;

const CanvasContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  min-height: 400px;
`;

const CropperCanvas = styled.canvas`
  max-width: 100%;
  max-height: 60vh;
  border-radius: 8px;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ControlButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'danger' ? `
    background: #ef5350;
    color: white;
    &:hover { background: #e53935; }
  ` : props.$variant === 'primary' ? `
    background: #FF7900;
    color: white;
    &:hover { background: #ff8c1a; }
  ` : `
    background: #f0f0f0;
    color: #666;
    &:hover { background: #e0e0e0; }
  `}
  
  &:active {
    transform: scale(0.95);
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  
  input[type="range"] {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: #e0e0e0;
    outline: none;
    
    &::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #FF7900;
      cursor: pointer;
    }
  }
`;

// ==================== COMPONENT ====================

interface ImageCropperProps {
  imageFile: File;
  aspectRatio?: number;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageFile,
  aspectRatio = 1,
  onCropComplete,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = URL.createObjectURL(imageFile);
    
    return () => URL.revokeObjectURL(img.src);
  }, [imageFile]);

  // Draw image on canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 400;
    canvas.width = size;
    canvas.height = size / aspectRatio;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply zoom
    ctx.scale(zoom, zoom);

    // Draw image centered
    ctx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    );

    // Restore context state
    ctx.restore();
  }, [image, zoom, rotation, aspectRatio]);

  // Handle crop
  const handleCrop = async () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      
      const file = new File([blob], imageFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      onCropComplete(file);
    }, 'image/jpeg', 0.9);
  };

  return (
    <CropperOverlay onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <CropperContainer onClick={(e) => e.stopPropagation()}>
        <CropperHeader>
          <h3>Edit Image</h3>
          <ControlButton onClick={onCancel} $variant="danger">
            <X size={18} />
          </ControlButton>
        </CropperHeader>

        <CanvasContainer>
          <CropperCanvas ref={canvasRef} />
        </CanvasContainer>

        {/* Zoom Control */}
        <SliderContainer>
          <ZoomOut size={20} />
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
          <ZoomIn size={20} />
        </SliderContainer>

        {/* Controls */}
        <ControlsContainer>
          <ControlButton onClick={() => setRotation(r => r - 90)}>
            <RotateCw size={18} style={{ transform: 'scaleX(-1)' }} />
            Rotate Left
          </ControlButton>
          
          <ControlButton onClick={() => setRotation(r => r + 90)}>
            <RotateCw size={18} />
            Rotate Right
          </ControlButton>
          
          <ControlButton onClick={() => { setZoom(1); setRotation(0); }}>
            Reset
          </ControlButton>
          
          <ControlButton onClick={handleCrop} $variant="primary">
            <Check size={18} />
            Crop & Save
          </ControlButton>
        </ControlsContainer>
      </CropperContainer>
    </CropperOverlay>
  );
};

export default ImageCropper;
