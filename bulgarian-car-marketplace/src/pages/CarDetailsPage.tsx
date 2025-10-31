import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { CarIcon } from '../components/icons/CarIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthProvider';
import { useCarViewTracking } from '../hooks/useProfileTracking';
import carListingService from '../services/carListingService';
import { CarListing } from '../types/CarListing';
import { BULGARIA_REGIONS, getCitiesByRegion } from '../data/bulgaria-locations';
import DistanceIndicator from '../components/DistanceIndicator';
import StaticMapEmbed from '../components/StaticMapEmbed';
import { logger } from '../services/logger-service';

// ==================== Styled Components ====================

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #a8b3c0, #c5ccd4);
  color: #2c3e50;
  border: 1px solid #d0d7de;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: linear-gradient(135deg, #959fac, #b0b9c3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const EditButton = styled.button`
  background: linear-gradient(135deg, #FF7900, #FF9533);
  color: white;
  border: 1px solid #FF8A1A;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 121, 0, 0.25);

  &:hover {
    background: linear-gradient(135deg, #e66a00, #e68429);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.35);
  }
`;

const CarTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  text-align: center;
  flex: 1;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 300px;
  background: #e9ecef;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const DetailsSection = styled.div`
  background: linear-gradient(135deg, #f5f7fa, #e8ecf1);
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid rgba(255, 121, 0, 0.25);
  text-transform: none;
  letter-spacing: 0.3px;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(208, 215, 222, 0.3);
  gap: 0.375rem;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.label`
  font-weight: 500;
  color: #6c757d;
  font-size: 0.688rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0;
  display: block;
`;

const DetailValue = styled.div`
  color: #495057;
  font-size: 0.813rem;
  font-weight: 500;
  padding: 0.4rem 0.625rem;
  background: rgba(248, 249, 250, 0.5);
  border: 1px solid rgba(208, 215, 222, 0.5);
  border-radius: 5px;
  min-height: 34px;
  display: flex;
  align-items: center;
`;

const PriceSection = styled.div`
  background: linear-gradient(135deg, #FF7900 0%, #FF9533 100%);
  color: white;
  padding: 1.25rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(255, 121, 0, 0.25);
  border: 1px solid rgba(255, 138, 26, 0.5);
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const PriceLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const EquipmentSection = styled.div`
  background: linear-gradient(135deg, #f5f7fa, #e8ecf1);
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const EditableInput = styled.input`
  width: 100%;
  padding: 0.4rem 0.625rem;
  border: 1px solid #d0d7de;
  border-radius: 5px;
  font-size: 0.813rem;
  transition: all 0.3s ease;
  background: white;
  color: #495057;

  &:focus {
    outline: none;
    border-color: #FF7900;
    box-shadow: 0 0 0 2px rgba(255, 121, 0, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
    font-size: 0.75rem;
  }
`;

const EditableSelect = styled.select`
  width: 100%;
  padding: 0.4rem 0.625rem;
  border: 1px solid #d0d7de;
  border-radius: 5px;
  font-size: 0.813rem;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
  color: #495057;

  &:focus {
    outline: none;
    border-color: #FF7900;
    box-shadow: 0 0 0 2px rgba(255, 121, 0, 0.1);
  }

  option {
    font-size: 0.813rem;
    padding: 0.5rem;
  }

  option.other-option {
    font-weight: 700;
    color: #2c3e50;
    background: rgba(255, 121, 0, 0.05);
  }
`;

const SaveButtonEnhanced = styled.button`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: 1px solid #1e7e34;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.25);
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(135deg, #218838, #1ea085);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.35);
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

const CancelButtonEnhanced = styled.button`
  background: linear-gradient(135deg, #a8b3c0, #c5ccd4);
  color: #2c3e50;
  border: 1px solid #d0d7de;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(135deg, #959fac, #b0b9c3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

const rotate = keyframes`
  100% { transform: rotate(360deg); }
`;

const rotateVertical = keyframes`
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
`;

const rotateHorizontal = keyframes`
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
`;

const SectionIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #FF7900, #FF9533);
  margin-right: 0.625rem;
  box-shadow: 0 2px 8px rgba(255, 121, 0, 0.25);
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  will-change: transform;
  
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

// Contact Method Icons with Real SVG
const ContactIcon = styled.div<{ $isActive: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, #FF7900, #FF9533)' 
    : 'linear-gradient(135deg, #f5f7fa, #e8ecf1)'
  };
  border: 1px solid ${props => props.$isActive ? '#FF8A1A' : '#d0d7de'};
  box-shadow: ${props => props.$isActive 
    ? '0 4px 12px rgba(255, 121, 0, 0.3), 0 0 0 2px rgba(255, 121, 0, 0.1)' 
    : '0 2px 6px rgba(0, 0, 0, 0.08)'
  };
  cursor: pointer;

  &:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: ${props => props.$isActive 
      ? '0 6px 18px rgba(255, 121, 0, 0.4), 0 0 0 3px rgba(255, 121, 0, 0.15)' 
      : '0 4px 12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 121, 0, 0.15)'
    };
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  svg {
    width: 20px;
    height: 20px;
    position: relative;
    z-index: 1;
    fill: ${props => props.$isActive ? 'white' : '#6c757d'};
    transition: all 0.3s ease;
  }
`;

const ContactLabel = styled.span<{ $isActive: boolean }>`
  font-size: 0.813rem;
  font-weight: 600;
  color: ${props => props.$isActive ? '#FF7900' : '#495057'};
  transition: all 0.3s ease;
  text-shadow: ${props => props.$isActive ? '0 0 6px rgba(255, 121, 0, 0.25)' : 'none'};
`;

const ContactItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, rgba(255, 121, 0, 0.06), rgba(255, 149, 51, 0.06))' 
    : 'linear-gradient(135deg, #ffffff, #fafbfc)'
  };
  border: 1px solid ${props => props.$isActive ? '#FF8A1A' : '#d0d7de'};
  box-shadow: ${props => props.$isActive 
    ? '0 4px 12px rgba(255, 121, 0, 0.18)' 
    : '0 2px 6px rgba(0, 0, 0, 0.06)'
  };

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.$isActive 
      ? '0 6px 18px rgba(255, 121, 0, 0.25)' 
      : '0 4px 12px rgba(0, 0, 0, 0.1)'
    };
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10px;
    background: ${props => props.$isActive 
      ? 'linear-gradient(45deg, rgba(255, 121, 0, 0.08), transparent, rgba(255, 121, 0, 0.08))' 
      : 'transparent'
    };
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

// Neomorphism Toggle Switch - 50% smaller
const ToggleSwitchContainer = styled.div<{ $isOn: boolean }>`
  position: relative;
  width: 40px;
  height: 20px;
  background: #3e3e3e;
  border-radius: 10px;
  box-shadow: 
    5px 5px 10px rgba(0, 0, 0, 0.4), 
    -5px -5px 10px rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.4s ease;

  &:hover {
    box-shadow: 
      6px 6px 12px rgba(0, 0, 0, 0.5), 
      -6px -6px 12px rgba(255, 255, 255, 0.12);
  }
`;

const ToggleSwitchInner = styled.div<{ $isOn: boolean }>`
  position: absolute;
  top: 1.5px;
  left: 1.5px;
  width: calc(100% - 3px);
  height: calc(100% - 3px);
  background-color: #3e3e3e;
  border-radius: 8.5px;
  box-shadow: 
    inset 2.5px 2.5px 5px rgba(0, 0, 0, 0.4), 
    inset -2.5px -2.5px 5px rgba(255, 255, 255, 0.1);
  transition: background-color 0.4s ease;
`;

const ToggleSwitchKnobContainer = styled.div<{ $isOn: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.4s ease;
  transform: ${props => props.$isOn ? 'translateX(100%)' : 'translateX(0)'};
`;

const ToggleSwitchKnob = styled.div<{ $isOn: boolean }>`
  position: relative;
  width: 17px;
  height: 17px;
  top: 1.5px;
  left: 1.5px;
  background-color: #3e3e3e;
  border-radius: 50%;
  box-shadow: 
    2.5px 2.5px 5px rgba(0, 0, 0, 0.5), 
    -2.5px -2.5px 5px rgba(255, 255, 255, 0.1);
  transition: background-color 0.4s ease;
`;

const ToggleSwitchNeon = styled.div<{ $isOn: boolean }>`
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: ${props => props.$isOn
    ? '0 0 5px #0f0, 0 0 10px #0f0, 0 0 15px #0f0, 0 0 20px #0f0'
    : '0 0 5px #ff8c00, 0 0 10px #ff8c00'
  };
  background: ${props => props.$isOn ? '#0f0' : '#ff8c00'};
  transition: all 0.4s ease;
`;

const ToggleLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  margin-left: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.25rem;
  color: #6c757d;
`;

const PhotoUploadSection = styled.div`
  background: linear-gradient(135deg, #f5f7fa, #e8ecf1);
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const PhotoUploadTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const PhotoUploadArea = styled.div<{ $isDragOver: boolean }>`
  border: 2px dashed ${props => props.$isDragOver ? '#FF7900' : '#d0d7de'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: ${props => props.$isDragOver ? 'rgba(255, 121, 0, 0.05)' : 'white'};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #FF7900;
    background: rgba(255, 121, 0, 0.05);
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #FF7900;
  margin-bottom: 1rem;
`;

const UploadText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const ChoosePhotosButton = styled.button`
  background: linear-gradient(135deg, #FF7900, #FF9533);
  color: white;
  border: 1px solid #FF8A1A;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 121, 0, 0.25);
  margin-top: 1rem;

  &:hover {
    background: linear-gradient(135deg, #e66a00, #e68429);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.35);
  }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const PhotoItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d0d7de;
  transition: all 0.3s ease;

  &:hover {
    border-color: #FF7900;
    transform: scale(1.02);
  }
`;

const PhotoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PhotoRemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
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
    background: #c82333;
    transform: scale(1.1);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const LogoContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin: 1rem auto;
  perspective: 1000px;
  transform-style: preserve-3d;
`;

const LogoImage = styled.img`
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

const GlowRingVertical = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid transparent;
  border-top: 4px solid #FF7900;
  border-bottom: 4px solid #FF9533;
  transform: translate(-50%, -50%);
  opacity: 0.6;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0 0 8px rgba(255, 121, 0, 0.3);
`;

const GlowRingHorizontal = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 145px;
  height: 145px;
  border-radius: 50%;
  border: 4px solid transparent;
  border-left: 4px solid #FF9533;
  border-right: 4px solid #FF7900;
  transform: translate(-50%, -50%) rotate(45deg);
  opacity: 0.5;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0 0 8px rgba(255, 149, 51, 0.3);
`;

const LogoGlow = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 121, 0, 0.15), transparent 70%);
  transform: translate(-50%, -50%);
  z-index: 3;
  opacity: 0.7;
`;

const LogoBrandName = styled.span`
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 1px;
  text-transform: uppercase;
  z-index: 3;
`;

const GalleryContainer = styled.div`
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid rgba(208, 215, 222, 0.3);
`;

const GalleryTitle = styled.h3`
  font-size: 0.938rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MainImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 350px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border: 2px solid #d0d7de;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
`;

const ThumbnailItem = styled.div<{ $isActive?: boolean }>`
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.$isActive ? '#FF7900' : '#d0d7de'};
  transition: all 0.3s ease;
  background: #f8f9fa;

  &:hover {
    border-color: #FF7900;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageCount = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.688rem;
  font-weight: 600;
`;

// Toggle Switch Component
const ToggleSwitch: React.FC<{ 
  isOn: boolean; 
  onToggle: () => void;
  label?: string;
}> = ({ isOn, onToggle, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <ToggleSwitchContainer $isOn={isOn} onClick={onToggle}>
      <ToggleSwitchInner $isOn={isOn}>
        <ToggleSwitchKnobContainer $isOn={isOn}>
          <ToggleSwitchKnob $isOn={isOn}>
            <ToggleSwitchNeon $isOn={isOn} />
          </ToggleSwitchKnob>
        </ToggleSwitchKnobContainer>
      </ToggleSwitchInner>
    </ToggleSwitchContainer>
    {label && <ToggleLabel>{label}</ToggleLabel>}
  </div>
);

// ==================== Real SVG Icons ====================
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ViberIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.617 6.55 20.24h.005l-.004 2.429s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.851.322 6.812-.416 7.152-.526.79-.255 5.262-.826 5.996-6.732.759-6.101-.357-9.956-2.906-11.623 0 0-1.536-1.52-5.453-1.534-3.917-.015-5.923.03-5.923.03zm.116 1.773s1.767-.107 5.37-.03c2.947.054 4.087.96 4.087.96 2.026 1.334 2.971 4.481 2.375 9.517-.6 5.077-4.164 5.378-4.764 5.568-.283.09-2.882.737-6.269.546 0 0-2.477 2.99-3.251 3.768-.12.12-.26.167-.352.145-.13-.03-.167-.188-.165-.414l.02-4.016c-4.78-1.287-4.493-5.638-4.443-8.052s.508-4.064 1.896-5.516c1.816-1.683 5.145-1.97 6.496-1.976zm.132 1.55l-.07.002c-.235.008-.484.022-.734.044-2.057.181-3.513.878-4.28 2.18-1.125 1.908-.673 4.634-.274 6.265.173.706.765 1.314 1.38 1.728.378.254.666.582.868.97.33.635.425 1.403.416 2.37.004.004.002.006.002.01.003.01-.004.023 0 .032v.01c-.003-.003-.002-.006-.004-.01-.58-.846-1.524-1.97-2.122-2.705-.143-.178-.358-.286-.588-.3-.047-.002-.092-.003-.138-.003-.168 0-.335.033-.493.1-.452.19-1.073.38-1.66.486-.716.13-1.44.165-2.14.104-.247-.022-.498-.054-.747-.096-1.01-.17-2.006-.519-2.853-1.053-1.044-.656-1.864-1.55-2.382-2.65-.518-1.1-.724-2.364-.602-3.704.124-1.363.602-2.7 1.39-3.91 1.573-2.422 4.428-3.888 7.665-4.005.11-.005.22-.003.33-.003l.015-.002c.11.002.22 0 .33.002.11.002.22 0 .33.005 1.616.045 3.146.482 4.453 1.277 1.307.795 2.393 1.973 3.132 3.463.74 1.49 1.128 3.29.925 5.254-.202 1.963-1.06 3.935-2.6 5.424-.77.745-1.74 1.346-2.853 1.71-1.113.363-2.37.49-3.698.307-.47-.066-.94-.16-1.407-.284-.472-.124-.94-.278-1.4-.458-.92-.36-1.78-.85-2.548-1.447-.766-.597-1.444-1.305-1.99-2.11-.547-.805-.96-1.713-1.193-2.68-.232-.966-.282-1.99-.136-3.007.146-1.017.485-2.03 1.015-2.97.53-.94 1.255-1.81 2.14-2.54 1.77-1.46 4.18-2.266 6.81-2.266.11 0 .22.002.33.005.11.003.22.01.33.02z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const FacebookMessengerIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
  </svg>
);

const SMSIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
  </svg>
);

// ==================== Component ====================
const CarDetailsPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  
  const [car, setCar] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // 🎯 Auto-track car views (REAL ANALYTICS!)
  useCarViewTracking(carId, car?.sellerId);
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
  const [showOtherRegion, setShowOtherRegion] = useState(false);
  
  // State for Bulgarian regions and cities
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // State for image gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const loadCar = async () => {
      if (!carId) return;
      
      try {
        const carData = await carListingService.getListing(carId);
        if (carData) {
          setCar(carData);
          setEditedCar(carData);
        }
      } catch (error) {
          logger.error('Error loading car details', error as Error, { carId });
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [carId]);

  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam === 'true' && currentUser) {
      setIsEditMode(true);
    }
  }, [searchParams, currentUser]);

  // Load cities when car data is loaded or region changes
  useEffect(() => {
    if (editedCar.region) {
      const cities = getCitiesByRegion(editedCar.region);
      setAvailableCities(cities);
      setSelectedRegion(editedCar.region);
    }
  }, [editedCar.region]);

  const handleEdit = () => {
    setIsEditMode(true);
    setEditedCar(car || {});
  };

  const handleSave = async () => {
    if (!carId || !editedCar) return;
    
    setSaving(true);
    try {
      await carListingService.updateListing(carId, editedCar);
      setCar(editedCar as CarListing);
      setIsEditMode(false);
      alert(language === 'bg' ? 'Промените са запазени!' : 'Changes saved successfully!');
    } catch (error) {
        logger.error('Error saving car changes', error as Error, { carId });
      alert(language === 'bg' ? 'Грешка при запазване' : 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedCar(car || {});
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bg-BG', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(price);
  };

  if (loading) {
    return <LoadingContainer>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingContainer>;
  }

  if (!car) {
    return <LoadingContainer>{language === 'bg' ? 'Автомобилът не е намерен' : 'Car not found'}</LoadingContainer>;
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </BackButton>
        <CarTitle>
          {isEditMode ? editedCar.make : car.make} {isEditMode ? editedCar.model : car.model} {isEditMode ? editedCar.year : car.year}
        </CarTitle>
        {!isEditMode ? (
          <EditButton onClick={handleEdit}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
              <path d="M0 14.25V18h3.75L14.81 6.94l-3.75-3.75L0 14.25zM17.71 4.04a.996.996 0 000-1.41L15.37.29a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="white"/>
            </svg>
            {language === 'bg' ? 'Редактирай' : 'Edit'}
          </EditButton>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <SaveButtonEnhanced onClick={handleSave} disabled={saving}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M15.833 3.333H4.167C3.247 3.333 2.5 4.08 2.5 5v10c0 .92.747 1.667 1.667 1.667h11.666c.92 0 1.667-.747 1.667-1.667V5c0-.92-.747-1.667-1.667-1.667zM10 14.167c-1.15 0-2.083-.933-2.083-2.084C7.917 10.933 8.85 10 10 10c1.15 0 2.083.933 2.083 2.083 0 1.151-.933 2.084-2.083 2.084zM12.5 7.5h-7.5V5h7.5v2.5z" fill="white"/>
              </svg>
              {saving ? (language === 'bg' ? 'Запазване...' : 'Saving...') : (language === 'bg' ? 'Запази' : 'Save')}
            </SaveButtonEnhanced>
            <CancelButtonEnhanced onClick={handleCancel}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M15 5.41L13.59 4 10 7.59 6.41 4 5 5.41 8.59 9 5 12.59 6.41 14 10 10.41 13.59 14 15 12.59 11.41 9 15 5.41z" fill="white"/>
              </svg>
              {language === 'bg' ? 'Отказ' : 'Cancel'}
            </CancelButtonEnhanced>
          </div>
        )}
      </Header>

      <MainContent>
        <ImageSection>
          {car.make && (
            <LogoContainer>
              <LogoGlow />
              <GlowRingVertical />
              <GlowRingHorizontal />
              <LogoImage 
                src={`/assets/images/professional_car_logos/${car.make}.png`}
                alt={car.make}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `/assets/images/professional_car_logos/mein_logo_rest.png`;
                }}
              />
              <LogoBrandName>{car.make}</LogoBrandName>
            </LogoContainer>
          )}

          {car.images && car.images.length > 0 && (
            <GalleryContainer>
              <GalleryTitle>
                {language === 'bg' ? 'Снимки на превозното средство' : 'Vehicle Photos'} ({car.images.length})
              </GalleryTitle>
              
              <MainImageContainer>
                <MainImage 
                  src={
                    typeof car.images[selectedImageIndex] === 'string' 
                      ? car.images[selectedImageIndex] as unknown as string
                      : URL.createObjectURL(car.images[selectedImageIndex])
                  } 
                  alt={`${car.make} ${car.model} - Photo ${selectedImageIndex + 1}`} 
                />
                <ImageCount>{selectedImageIndex + 1} / {car.images.length}</ImageCount>
              </MainImageContainer>

              <ThumbnailGrid>
                {car.images.map((image, index) => (
                  <ThumbnailItem 
                    key={index} 
                    $isActive={index === selectedImageIndex}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <ThumbnailImage 
                      src={typeof image === 'string' ? image as unknown as string : URL.createObjectURL(image)} 
                      alt={`Thumbnail ${index + 1}`} 
                    />
                  </ThumbnailItem>
                ))}
              </ThumbnailGrid>
            </GalleryContainer>
          )}

          {(!car.images || car.images.length === 0) && (
            <div style={{ marginTop: '2rem' }}>
              <ImagePlaceholder>
                <CarIcon size={60} color="#FF7900" />
              </ImagePlaceholder>
              <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '0.875rem', marginTop: '1rem' }}>
                {language === 'bg' ? 'Няма налични снимки' : 'No photos available'}
              </p>
            </div>
          )}
        </ImageSection>

        <DetailsSection>
          <SectionTitle>
            {language === 'bg' ? 'Основни данни' : 'Basic Information'}
          </SectionTitle>
          
          <DetailRow>
            <DetailLabel>{language === 'bg' ? 'Марка' : 'Make'}</DetailLabel>
            {isEditMode ? (
              <>
                <EditableSelect
                  value={showOtherMake ? 'Other' : (editedCar.make || '')}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherMake(true);
                    } else {
                      setShowOtherMake(false);
                      handleInputChange('make', e.target.value);
                    }
                  }}
                >
                  <option value="">{language === 'bg' ? 'Изберете марка' : 'Select make'}</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Audi">Audi</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Ford">Ford</option>
                  <option value="Opel">Opel</option>
                  <option value="Renault">Renault</option>
                  <option value="Peugeot">Peugeot</option>
                  <option value="Citroen">Citroen</option>
                  <option value="Skoda">Skoda</option>
                  <option value="SEAT">SEAT</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Kia">Kia</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Volvo">Volvo</option>
                  <option value="Fiat">Fiat</option>
                  <option value="Alfa Romeo">Alfa Romeo</option>
                  <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
                </EditableSelect>
                {showOtherMake && (
                  <EditableInput
                    value={editedCar.make || ''}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    placeholder={language === 'bg' ? 'Въведете марка' : 'Enter make'}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </>
            ) : (
              <DetailValue>{car.make || 'N/A'}</DetailValue>
            )}
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>{language === 'bg' ? 'Модел' : 'Model'}</DetailLabel>
            {isEditMode ? (
              <>
                <EditableSelect
                  value={showOtherModel ? 'Other' : (editedCar.model || '')}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherModel(true);
                    } else {
                      setShowOtherModel(false);
                      handleInputChange('model', e.target.value);
                    }
                  }}
                >
                  <option value="">{language === 'bg' ? 'Изберете модел' : 'Select model'}</option>
                  <option value="Golf">Golf</option>
                  <option value="Passat">Passat</option>
                  <option value="Polo">Polo</option>
                  <option value="Tiguan">Tiguan</option>
                  <option value="Touareg">Touareg</option>
                  <option value="Jetta">Jetta</option>
                  <option value="ID.3">ID.3</option>
                  <option value="ID.4">ID.4</option>
                  <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
                </EditableSelect>
                {showOtherModel && (
                  <EditableInput
                    value={editedCar.model || ''}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder={language === 'bg' ? 'Въведете модел' : 'Enter model'}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </>
            ) : (
              <DetailValue>{car.model || 'N/A'}</DetailValue>
            )}
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>{language === 'bg' ? 'Година' : 'Year'}</DetailLabel>
            {isEditMode ? (
              <EditableInput
                type="number"
                value={editedCar.year || ''}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value) || 0)}
                placeholder={language === 'bg' ? 'Въведете година' : 'Enter year'}
              />
            ) : (
              <DetailValue>{car.year || 'N/A'}</DetailValue>
            )}
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>{language === 'bg' ? 'Пробег' : 'Mileage'}</DetailLabel>
            {isEditMode ? (
              <EditableInput
                type="number"
                value={editedCar.mileage || ''}
                onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                placeholder={language === 'bg' ? 'Въведете пробег' : 'Enter mileage'}
              />
            ) : (
              <DetailValue>{car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}</DetailValue>
            )}
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>{language === 'bg' ? 'Гориво' : 'Fuel Type'}</DetailLabel>
            {isEditMode ? (
              <>
                <EditableSelect
                  value={showOtherFuelType ? 'Other' : (editedCar.fuelType || '')}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherFuelType(true);
                    } else {
                      setShowOtherFuelType(false);
                      handleInputChange('fuelType', e.target.value);
                    }
                  }}
                >
                  <option value="">{language === 'bg' ? 'Изберете гориво' : 'Select fuel type'}</option>
                  <option value="Petrol">{language === 'bg' ? 'Бензин' : 'Petrol'}</option>
                  <option value="Diesel">{language === 'bg' ? 'Дизел' : 'Diesel'}</option>
                  <option value="Electric">{language === 'bg' ? 'Електрически' : 'Electric'}</option>
                  <option value="Hybrid">{language === 'bg' ? 'Хибрид' : 'Hybrid'}</option>
                  <option value="LPG">{language === 'bg' ? 'ГПГ' : 'LPG'}</option>
                  <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
                </EditableSelect>
                {showOtherFuelType && (
                  <EditableInput
                    value={editedCar.fuelType || ''}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    placeholder={language === 'bg' ? 'Въведете вид гориво' : 'Enter fuel type'}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </>
            ) : (
              <DetailValue>{car.fuelType || 'N/A'}</DetailValue>
            )}
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>{language === 'bg' ? 'Скоростна кутия' : 'Transmission'}</DetailLabel>
            {isEditMode ? (
              <>
                <EditableSelect
                  value={showOtherTransmission ? 'Other' : (editedCar.transmission || '')}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherTransmission(true);
                    } else {
                      setShowOtherTransmission(false);
                      handleInputChange('transmission', e.target.value);
                    }
                  }}
                >
                  <option value="">{language === 'bg' ? 'Изберете трансмисия' : 'Select transmission'}</option>
                  <option value="Manual">{language === 'bg' ? 'Ръчна' : 'Manual'}</option>
                  <option value="Automatic">{language === 'bg' ? 'Автоматична' : 'Automatic'}</option>
                  <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
                </EditableSelect>
                {showOtherTransmission && (
                  <EditableInput
                    value={editedCar.transmission || ''}
                    onChange={(e) => handleInputChange('transmission', e.target.value)}
                    placeholder={language === 'bg' ? 'Въведете тип трансмисия' : 'Enter transmission type'}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </>
            ) : (
              <DetailValue>{car.transmission || 'N/A'}</DetailValue>
            )}
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>{language === 'bg' ? 'Мощност' : 'Power'}</DetailLabel>
            {isEditMode ? (
              <EditableInput
                type="number"
                value={editedCar.power || ''}
                onChange={(e) => handleInputChange('power', parseInt(e.target.value) || 0)}
                placeholder={language === 'bg' ? 'Въведете мощност (к.с.)' : 'Enter power (HP)'}
              />
            ) : (
              <DetailValue>{car.power ? `${car.power} HP` : 'N/A'}</DetailValue>
            )}
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>{language === 'bg' ? 'Цвят' : 'Color'}</DetailLabel>
            {isEditMode ? (
              <>
                <EditableSelect
                  value={showOtherColor ? 'Other' : (editedCar.color || '')}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherColor(true);
                    } else {
                      setShowOtherColor(false);
                      handleInputChange('color', e.target.value);
                    }
                  }}
                >
                  <option value="">{language === 'bg' ? 'Изберете цвят' : 'Select color'}</option>
                  <option value="White">{language === 'bg' ? 'Бял' : 'White'}</option>
                  <option value="Black">{language === 'bg' ? 'Черен' : 'Black'}</option>
                  <option value="Silver">{language === 'bg' ? 'Сребърен' : 'Silver'}</option>
                  <option value="Gray">{language === 'bg' ? 'Сив' : 'Gray'}</option>
                  <option value="Red">{language === 'bg' ? 'Червен' : 'Red'}</option>
                  <option value="Blue">{language === 'bg' ? 'Син' : 'Blue'}</option>
                  <option value="Green">{language === 'bg' ? 'Зелен' : 'Green'}</option>
                  <option value="Yellow">{language === 'bg' ? 'Жълт' : 'Yellow'}</option>
                  <option value="Orange">{language === 'bg' ? 'Оранжев' : 'Orange'}</option>
                  <option value="Brown">{language === 'bg' ? 'Кафяв' : 'Brown'}</option>
                  <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
                </EditableSelect>
                {showOtherColor && (
                  <EditableInput
                    value={editedCar.color || ''}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder={language === 'bg' ? 'Въведете цвят' : 'Enter color'}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </>
            ) : (
              <DetailValue>{car.color || 'N/A'}</DetailValue>
            )}
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>{language === 'bg' ? 'Врати' : 'Doors'}</DetailLabel>
            {isEditMode ? (
              <>
                <EditableSelect
                  value={showOtherDoors ? 'Other' : (editedCar.doors?.toString() || '')}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherDoors(true);
                    } else {
                      setShowOtherDoors(false);
                      handleInputChange('doors', e.target.value);
                    }
                  }}
                >
                  <option value="">{language === 'bg' ? 'Изберете брой врати' : 'Select doors'}</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
                </EditableSelect>
                {showOtherDoors && (
                  <EditableInput
                    value={editedCar.doors || ''}
                    onChange={(e) => handleInputChange('doors', e.target.value)}
                    placeholder={language === 'bg' ? 'Въведете брой врати' : 'Enter doors'}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </>
            ) : (
              <DetailValue>{car.doors || 'N/A'}</DetailValue>
            )}
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>{language === 'bg' ? 'Места' : 'Seats'}</DetailLabel>
            {isEditMode ? (
              <>
                <EditableSelect
                  value={showOtherSeats ? 'Other' : (editedCar.seats?.toString() || '')}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherSeats(true);
                    } else {
                      setShowOtherSeats(false);
                      handleInputChange('seats', e.target.value);
                    }
                  }}
                >
                  <option value="">{language === 'bg' ? 'Изберете брой места' : 'Select seats'}</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
                </EditableSelect>
                {showOtherSeats && (
                  <EditableInput
                    value={editedCar.seats || ''}
                    onChange={(e) => handleInputChange('seats', e.target.value)}
                    placeholder={language === 'bg' ? 'Въведете брой места' : 'Enter seats'}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </>
            ) : (
              <DetailValue>{car.seats || 'N/A'}</DetailValue>
            )}
          </DetailRow>
        </DetailsSection>
      </MainContent>

      <PriceSection>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
            {language === 'bg' ? 'Цена (EUR)*' : 'Price (EUR)*'}
          </h3>
        </div>
        {isEditMode ? (
          <div>
            <EditableInput
              type="number"
              value={editedCar.price || ''}
              onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
              placeholder={language === 'bg' ? 'Въведете цена' : 'Enter price'}
              style={{ 
                fontSize: '2rem', 
                textAlign: 'center', 
                marginBottom: '0.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <label style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={editedCar.negotiable || false}
                  onChange={(e) => handleInputChange('negotiable', e.target.checked)}
                />
                {language === 'bg' ? 'Договорна' : 'Negotiable'}
              </label>
            </div>
          </div>
        ) : (
          <>
            <Price>{formatPrice(car.price)}</Price>
            <PriceLabel>
              {language === 'bg' ? 'Цена' : 'Price'}
              {car.negotiable && ` (${language === 'bg' ? 'Договорна' : 'Negotiable'})`}
            </PriceLabel>
          </>
        )}
      </PriceSection>

      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'История' : 'History'}
        </SectionTitle>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Има история на аварии' : 'Has accident history'}</DetailLabel>
          {isEditMode ? (
            <ToggleSwitch
              isOn={editedCar.accidentHistory === true}
              onToggle={() => handleInputChange('accidentHistory', !editedCar.accidentHistory)}
              label={editedCar.accidentHistory ? (language === 'bg' ? 'Да' : 'Yes') : (language === 'bg' ? 'Не' : 'No')}
            />
          ) : (
            <DetailValue>
              {car.accidentHistory === true ? (language === 'bg' ? 'Да' : 'Yes') : 
               car.accidentHistory === false ? (language === 'bg' ? 'Не' : 'No') : 'N/A'}
            </DetailValue>
          )}
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Има сервизна история' : 'Has service history'}</DetailLabel>
          {isEditMode ? (
            <ToggleSwitch
              isOn={editedCar.serviceHistory === true}
              onToggle={() => handleInputChange('serviceHistory', !editedCar.serviceHistory)}
              label={editedCar.serviceHistory ? (language === 'bg' ? 'Да' : 'Yes') : (language === 'bg' ? 'Не' : 'No')}
            />
          ) : (
            <DetailValue>
              {car.serviceHistory === true ? (language === 'bg' ? 'Да' : 'Yes') : 
               car.serviceHistory === false ? (language === 'bg' ? 'Не' : 'No') : 'N/A'}
            </DetailValue>
          )}
        </DetailRow>
      </EquipmentSection>

      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'Оборудване за безопасност' : 'Safety Equipment'}
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {[
            { key: 'abs', label: 'ABS' },
            { key: 'esp', label: 'ESP' },
            { key: 'airbags', label: 'Airbags' },
            { key: 'parkingSensors', label: 'Parking Sensors' },
            { key: 'rearviewCamera', label: 'Rearview Camera' },
            { key: 'blindSpotMonitor', label: 'Blind Spot Monitor' },
            { key: 'laneDeparture', label: 'Lane Departure' },
            { key: 'collisionWarning', label: 'Collision Warning' }
          ].map(option => (
            <div key={option.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.813rem', color: '#495057', fontWeight: '500' }}>{option.label}</span>
              {isEditMode ? (
                <ToggleSwitch
                  isOn={Boolean(editedCar[option.key as keyof CarListing])}
                  onToggle={() => handleInputChange(option.key as keyof CarListing, !editedCar[option.key as keyof CarListing])}
                />
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                  {car[option.key as keyof CarListing] ? '✓' : '✗'}
                </span>
              )}
            </div>
          ))}
        </div>
      </EquipmentSection>

      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'Оборудване за комфорт' : 'Comfort Equipment'}
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {[
            { key: 'airConditioning', label: 'Air Conditioning' },
            { key: 'climateControl', label: 'Climate Control' },
            { key: 'heatedSeats', label: 'Heated Seats' },
            { key: 'ventilatedSeats', label: 'Ventilated Seats' },
            { key: 'sunroof', label: 'Sunroof' },
            { key: 'rainSensor', label: 'Rain Sensor' },
            { key: 'cruiseControl', label: 'Cruise Control' },
            { key: 'parkAssist', label: 'Park Assist' }
          ].map(option => (
            <div key={option.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.813rem', color: '#495057', fontWeight: '500' }}>{option.label}</span>
              {isEditMode ? (
                <ToggleSwitch
                  isOn={Boolean(editedCar[option.key as keyof CarListing])}
                  onToggle={() => handleInputChange(option.key as keyof CarListing, !editedCar[option.key as keyof CarListing])}
                />
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                  {car[option.key as keyof CarListing] ? '✓' : '✗'}
                </span>
              )}
            </div>
          ))}
        </div>
      </EquipmentSection>

      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'Информационно-развлекателна система' : 'Infotainment Equipment'}
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {[
            { key: 'bluetooth', label: 'Bluetooth' },
            { key: 'navigation', label: 'Navigation' },
            { key: 'appleCarPlay', label: 'Apple CarPlay' },
            { key: 'androidAuto', label: 'Android Auto' },
            { key: 'soundSystem', label: 'Sound System' },
            { key: 'radio', label: 'Radio' },
            { key: 'wifiHotspot', label: 'Wi-Fi Hotspot' },
            { key: 'usbPorts', label: 'USB Ports' }
          ].map(option => (
            <div key={option.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.813rem', color: '#495057', fontWeight: '500' }}>{option.label}</span>
              {isEditMode ? (
                <ToggleSwitch
                  isOn={Boolean(editedCar[option.key as keyof CarListing])}
                  onToggle={() => handleInputChange(option.key as keyof CarListing, !editedCar[option.key as keyof CarListing])}
                />
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                  {car[option.key as keyof CarListing] ? '✓' : '✗'}
                </span>
              )}
            </div>
          ))}
        </div>
      </EquipmentSection>

      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'Външно оборудване' : 'Exterior Equipment'}
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {[
            { key: 'ledLights', label: 'LED Lights' },
            { key: 'xenonLights', label: 'Xenon Lights' },
            { key: 'daytimeRunningLights', label: 'Daytime Running Lights' },
            { key: 'alloyWheels', label: 'Alloy Wheels' },
            { key: 'keylessEntry', label: 'Keyless Entry' },
            { key: 'startStopSystem', label: 'Start/Stop System' },
            { key: 'sportPackage', label: 'Sport Package' },
            { key: 'towHitch', label: 'Tow Hitch' }
          ].map(option => (
            <div key={option.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.813rem', color: '#495057', fontWeight: '500' }}>{option.label}</span>
              {isEditMode ? (
                <ToggleSwitch
                  isOn={Boolean(editedCar[option.key as keyof CarListing])}
                  onToggle={() => handleInputChange(option.key as keyof CarListing, !editedCar[option.key as keyof CarListing])}
                />
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                  {car[option.key as keyof CarListing] ? '✓' : '✗'}
                </span>
              )}
            </div>
          ))}
        </div>
      </EquipmentSection>

      <EquipmentSection>
        <SectionTitle style={{ display: 'flex', alignItems: 'center' }}>
          <SectionIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="white"/>
              <path d="M12 14C8.67 14 2 15.67 2 19V20C2 20.55 2.45 21 3 21H21C21.55 21 22 20.55 22 20V19C22 15.67 15.33 14 12 14Z" fill="white"/>
            </svg>
          </SectionIcon>
          {language === 'bg' ? 'Лична информация' : 'Personal Information'}
        </SectionTitle>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Име' : 'Name'}</DetailLabel>
          {isEditMode ? (
            <EditableInput
              value={editedCar.sellerName || ''}
              onChange={(e) => handleInputChange('sellerName', e.target.value)}
              placeholder={language === 'bg' ? 'Въведете име' : 'Enter name'}
            />
          ) : (
            <DetailValue>{car.sellerName || 'N/A'}</DetailValue>
          )}
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Имейл' : 'Email'}</DetailLabel>
          {isEditMode ? (
            <EditableInput
              type="email"
              value={editedCar.sellerEmail || ''}
              onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
              placeholder={language === 'bg' ? 'Въведете имейл' : 'Enter email'}
            />
          ) : (
            <DetailValue>{car.sellerEmail || 'N/A'}</DetailValue>
          )}
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Телефон' : 'Phone'}</DetailLabel>
          {isEditMode ? (
            <EditableInput
              type="tel"
              value={editedCar.sellerPhone || ''}
              onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
              placeholder={language === 'bg' ? 'Въведете телефон' : 'Enter phone'}
            />
          ) : (
            <DetailValue>{car.sellerPhone || 'N/A'}</DetailValue>
          )}
        </DetailRow>
      </EquipmentSection>

      <EquipmentSection>
        <SectionTitle style={{ display: 'flex', alignItems: 'center' }}>
          <SectionIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="white"/>
            </svg>
          </SectionIcon>
          {language === 'bg' ? 'Местоположение' : 'Location'}
        </SectionTitle>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Регион' : 'Region'}</DetailLabel>
          {isEditMode ? (
            <EditableSelect
              value={editedCar.region || ''}
              onChange={(e) => {
                const regionName = e.target.value;
                handleInputChange('region', regionName);
                setSelectedRegion(regionName);
                
                // Update available cities based on selected region
                if (regionName) {
                  const cities = getCitiesByRegion(regionName);
                  setAvailableCities(cities);
                  // Clear city selection when region changes
                  handleInputChange('city', '');
                } else {
                  setAvailableCities([]);
                }
              }}
            >
              <option value="">{language === 'bg' ? 'Изберете регион' : 'Select region'}</option>
              {BULGARIA_REGIONS.map((region) => (
                <option key={region.name} value={region.name}>
                  {language === 'bg' ? region.name : region.nameEn}
                </option>
              ))}
            </EditableSelect>
          ) : (
            <DetailValue>{car.region || 'N/A'}</DetailValue>
          )}
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Град' : 'City'}</DetailLabel>
          {isEditMode ? (
            availableCities.length > 0 ? (
              <EditableSelect
                value={editedCar.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
              >
                <option value="">{language === 'bg' ? 'Изберете град' : 'Select city'}</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </EditableSelect>
            ) : (
              <EditableInput
                value={editedCar.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder={language === 'bg' ? 'Първо изберете регион' : 'Select region first'}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            )
          ) : (
            <DetailValue>{car.city || 'N/A'}</DetailValue>
          )}
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}</DetailLabel>
          {isEditMode ? (
            <EditableInput
              value={editedCar.postalCode || ''}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              placeholder={language === 'bg' ? 'Въведете пощенски код' : 'Enter postal code'}
            />
          ) : (
            <DetailValue>{car.postalCode || 'N/A'}</DetailValue>
          )}
        </DetailRow>
      </EquipmentSection>

      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'Предпочитан начин на контакт' : 'Preferred Contact Method'}
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {[
            { key: 'phone', label: 'Phone', Icon: PhoneIcon },
            { key: 'email', label: 'Email', Icon: EmailIcon },
            { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon },
            { key: 'viber', label: 'Viber', Icon: ViberIcon },
            { key: 'telegram', label: 'Telegram', Icon: TelegramIcon },
            { key: 'facebook', label: 'Facebook Messenger', Icon: FacebookMessengerIcon },
            { key: 'sms', label: 'SMS', Icon: SMSIcon }
          ].map(contact => {
            const fieldKey = `contact${contact.key.charAt(0).toUpperCase() + contact.key.slice(1)}` as keyof CarListing;
            const isActive = Boolean(editedCar[fieldKey]);
            return (
              <ContactItem 
                key={contact.key} 
                $isActive={isActive}
                onClick={() => isEditMode && handleInputChange(fieldKey, !isActive)}
              >
                <ContactIcon $isActive={isActive}>
                  <contact.Icon />
                </ContactIcon>
                <ContactLabel $isActive={isActive}>
                  {contact.label}
                </ContactLabel>
              </ContactItem>
            );
          })}
        </div>
      </EquipmentSection>

      {isEditMode && (
        <PhotoUploadSection>
          <PhotoUploadTitle>
            {language === 'bg' ? 'Снимки на превозното средство' : 'Vehicle Photos'}
          </PhotoUploadTitle>
          <p style={{ fontSize: '0.813rem', color: '#6c757d', margin: '0 0 1rem 0' }}>
            {language === 'bg' ? 'Качете до 20 снимки на вашето превозно средство' : 'Upload up to 20 photos of your vehicle'}
          </p>
          
          <PhotoUploadArea
            $isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            <UploadIcon>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill="url(#camera-gradient)" opacity="0.2"/>
                <path d="M23 18L26 14H38L41 18H50C51.1 18 52 18.9 52 20V46C52 47.1 51.1 48 50 48H14C12.9 48 12 47.1 12 46V20C12 18.9 12.9 18 14 18H23Z" fill="url(#camera-body)"/>
                <circle cx="32" cy="32" r="8" fill="url(#lens-gradient)"/>
                <circle cx="32" cy="32" r="5" fill="white" opacity="0.3"/>
                <circle cx="45" cy="23" r="2" fill="#28a745"/>
                <defs>
                  <linearGradient id="camera-gradient" x1="2" y1="2" x2="62" y2="62" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF7900"/>
                    <stop offset="1" stopColor="#FF9500"/>
                  </linearGradient>
                  <linearGradient id="camera-body" x1="12" y1="14" x2="52" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF7900"/>
                    <stop offset="1" stopColor="#FF9500"/>
                  </linearGradient>
                  <linearGradient id="lens-gradient" x1="24" y1="24" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2c3e50"/>
                    <stop offset="1" stopColor="#34495e"/>
                  </linearGradient>
                </defs>
              </svg>
            </UploadIcon>
            <UploadText>
              {language === 'bg' ? 'Плъзнете снимки тук или кликнете за избор' : 'Drag photos here or click to select'}
            </UploadText>
            <ChoosePhotosButton type="button">
              {language === 'bg' ? 'Изберете снимки' : 'Choose Photos'}
            </ChoosePhotosButton>
            <HiddenFileInput
              id="photo-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </PhotoUploadArea>

          {photoUrls.length > 0 && (
            <PhotoGrid>
              {photoUrls.map((url, index) => (
                <PhotoItem key={index}>
                  <PhotoImg src={url} alt={`Photo ${index + 1}`} />
                  <PhotoRemoveButton onClick={() => removePhoto(index)}>
                    ×
                  </PhotoRemoveButton>
                </PhotoItem>
              ))}
            </PhotoGrid>
          )}
        </PhotoUploadSection>
      )}

      {/* Distance & Directions - Only in view mode */}
      {!isEditMode && car && car.city && (
        <>
          <DistanceIndicator
            carLocation={{
              city: car.city,
              region: car.region,
              coordinates: car.coordinates
            }}
          />

          <StaticMapEmbed
            location={{
              city: car.city,
              region: car.region,
              coordinates: car.coordinates
            }}
            zoom={14}
          />
        </>
      )}
    </Container>
  );
};

export default CarDetailsPage;
