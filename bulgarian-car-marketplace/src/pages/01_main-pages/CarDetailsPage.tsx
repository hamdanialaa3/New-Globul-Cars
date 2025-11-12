import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { CarIcon } from '@/components/icons/CarIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { useCarViewTracking } from '@/hooks/useProfileTracking';
import { unifiedCarService } from '@/services/car';
import { CarListing } from '@/types/CarListing';
import { BULGARIA_REGIONS, getCitiesByRegion } from '@/data/bulgaria-locations';
import { getAllMakes, getModelsByMake, hasModels } from '@/data/car-makes-models';
import DistanceIndicator from '@/components/DistanceIndicator';
import StaticMapEmbed from '@/components/StaticMapEmbed';
import { logger } from '@/services/logger-service';
import CarDetailsModernView from './components/CarDetailsModernView';

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
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 1px solid #d0d7de;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SellerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF7900, #FF9533);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(255, 121, 0, 0.3);
`;

const SellerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SellerName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #0a0a0a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SellerPhone = styled.a`
  font-size: 0.875rem;
  font-weight: 600;
  color: #FF7900;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.3s ease;

  &:hover {
    color: #e66a00;
    text-decoration: underline;
  }

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
`;

const VehicleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 121, 0, 0.08), rgba(255, 149, 51, 0.08));
  border: 1px solid rgba(255, 138, 26, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(255, 121, 0, 0.15);
`;

const VehicleBrand = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #0a0a0a;
`;

const VehicleModel = styled.div`
  font-size: 0.938rem;
  font-weight: 600;
  color: #2a2a2a;
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #a8b3c0, #c5ccd4);
  color: #0a0a0a;
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
  color: #0a0a0a;
  margin: 0;
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
  padding: 0.625rem 1rem;
  border-radius: 8px;
  display: inline-block;
  margin: 0.5rem 0 1rem 0;
  box-shadow: 0 3px 10px rgba(255, 121, 0, 0.25);
  border: 1px solid rgba(255, 138, 26, 0.5);
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  display: inline;
  letter-spacing: -0.3px;
`;

const PriceLabel = styled.span`
  font-size: 0.75rem;
  opacity: 0.9;
  font-weight: 500;
  margin-left: 0.5rem;
`;

const LocationMapContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 1.5rem 0;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
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

// Contact Method Icons - Professional 3D Style
const ContactIcon = styled.div<{ $isActive: boolean }>`
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

const ContactLabel = styled.span<{ $isActive: boolean }>`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.$isActive ? '#2c3e50' : '#b8b8b8'};
  transition: all 0.3s ease;
  text-align: center;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  letter-spacing: 0.3px;
`;

const ContactItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 0.65rem;
  border-radius: 14px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  background: ${props => props.$isActive ? 'transparent' : 'rgba(248, 248, 248, 0.6)'};
  min-width: 92px;
  max-width: 115px;
  border: 2px solid ${props => props.$isActive ? 'transparent' : '#e5e5e5'};

  &:hover {
    transform: ${props => props.$isActive ? 'translateY(-5px)' : 'none'};
    background: ${props => props.$isActive ? 'rgba(255, 121, 0, 0.05)' : 'rgba(248, 248, 248, 0.6)'};
  }

  &:hover ${ContactLabel} {
    color: ${props => props.$isActive ? '#FF7900' : '#b8b8b8'};
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
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
`;

const PhotoUploadTitle = styled.h3`
  font-size: 0.813rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
`;

const PhotoUploadArea = styled.div<{ $isDragOver: boolean }>`
  border: 2px dashed ${props => props.$isDragOver ? '#FF7900' : '#d0d7de'};
  border-radius: 6px;
  padding: 0.75rem;
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
  font-size: 2rem;
  color: #FF7900;
  margin-bottom: 0.5rem;
  
  svg {
    width: 40px;
    height: 40px;
  }
`;

const UploadText = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
`;

const ChoosePhotosButton = styled.button`
  background: linear-gradient(135deg, #FF7900, #FF9533);
  color: white;
  border: 1px solid #FF8A1A;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(255, 121, 0, 0.2);
  margin-top: 0.25rem;

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

// ==================== Professional Contact Icons ====================
const PhoneIcon = () => (
  <img 
    src="/assets/bottom/call.png" 
    alt="Phone"
  />
);

const EmailIcon = () => (
  <img 
    src="/assets/bottom/email.png" 
    alt="Email"
  />
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 48 48" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="whatsappGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#25D366" />
        <stop offset="100%" stopColor="#128C7E" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="20" fill="url(#whatsappGradient)" />
    <path d="M24 4C12.95 4 4 12.95 4 24c0 3.53.92 6.84 2.53 9.71L4 44l10.57-2.47A19.93 19.93 0 0024 44c11.05 0 20-8.95 20-20S35.05 4 24 4zm10.19 28.38c-.43 1.21-2.14 2.22-3.51 2.51-.93.19-2.14.35-6.23-1.34-5.25-2.16-8.65-7.49-8.91-7.84-.26-.35-2.11-2.81-2.11-5.36s1.34-3.8 1.81-4.32c.47-.52 1.03-.65 1.37-.65.34 0 .69.01.99.02.32.01.74-.12 1.16.88.43 1.03 1.46 3.58 1.59 3.84.13.26.22.56.04.91-.17.35-.26.56-.52.86-.26.3-.55.67-.78.9-.26.26-.53.54-.23.98.3.52 1.34 2.21 2.88 3.58 1.98 1.76 3.65 2.31 4.17 2.57.52.26.82.22 1.12-.13.3-.35 1.29-1.51 1.64-2.03.34-.52.69-.43 1.16-.26.47.17 2.99 1.41 3.51 1.67.52.26.86.39.99.61.13.21.13 1.25-.3 2.46z" fill="white" />
  </svg>
);

const ViberIcon = () => (
  <img 
    src="/assets/bottom/viber.png" 
    alt="Viber"
  />
);

const TelegramIcon = () => (
  <img 
    src="/assets/bottom/telegram.png" 
    alt="Telegram"
  />
);

const FacebookMessengerIcon = () => (
  <img 
    src="/assets/bottom/massenger.png" 
    alt="Messenger"
  />
);

const SMSIcon = () => (
  <img 
    src="/assets/bottom/SMS.png" 
    alt="SMS"
  />
);

// ==================== Component ====================
const CarDetailsPage: React.FC = () => {
  const { id: carId } = useParams<{ id: string }>();
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
  
  // 🔒 Check if current user is the owner
  const isOwner = currentUser && car && (
    currentUser.uid === car.sellerId || 
    currentUser.uid === (car as any).userId ||
    currentUser.uid === (car as any).ownerId
  );
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
  
  // State for image gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const loadCar = async () => {
      if (!carId) {
        console.log('❌ No carId provided');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Loading car with ID:', carId);
      
      try {
        const carData = await carListingService.getListing(carId);
        console.log('✅ Car data loaded:', carData);
        
        if (carData) {
          setCar(carData);
          setEditedCar(carData);
        } else {
          console.log('⚠️ Car not found in database');
        }
      } catch (error) {
        console.error('❌ Error loading car:', error);
        logger.error('Error loading car details', error as Error, { carId });
      } finally {
        setLoading(false);
        console.log('✅ Loading finished');
      }
    };

    loadCar();
  }, [carId]);

  useEffect(() => {
    const editParam = searchParams.get('edit');
    // ✅ Only allow edit mode if user is the owner
    if (editParam === 'true' && currentUser && car) {
      const isCarOwner = currentUser.uid === car.sellerId || 
                         currentUser.uid === (car as any).userId ||
                         currentUser.uid === (car as any).ownerId;
      if (isCarOwner) {
        setIsEditMode(true);
      } else {
        // Redirect to view mode if not owner
        navigate(`/cars/${carId}`, { replace: true });
      }
    }
  }, [searchParams, currentUser, car, carId, navigate]);

  // Load cities when car data is loaded or region changes
  useEffect(() => {
    if (editedCar.region) {
      const cities = getCitiesByRegion(editedCar.region);
      const cityNames = cities.map(city => typeof city === 'string' ? city : city.name);
      setAvailableCities(cityNames);
    }
  }, [editedCar.region]);
  
  // Load models when make changes
  useEffect(() => {
    if (editedCar.make) {
      const models = getModelsByMake(editedCar.make);
      setAvailableModels(models);
      
      // If current model is not in the new models list, clear it
      if (editedCar.model && !models.includes(editedCar.model)) {
        setEditedCar(prev => ({ ...prev, model: '' }));
      }
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
      // Step 1: Upload new photos to Firebase Storage
      let uploadedUrls: string[] = [];
      if (photos.length > 0) {
        uploadedUrls = await carListingService.uploadImages(carId, photos);
      }

      // Step 2: Merge existing images with new ones
      const existingImages = car?.images || [];
      const updatedImages = [...existingImages, ...uploadedUrls];

      // Step 3: Save all changes
      const updatedCarData = {
        ...editedCar,
        images: updatedImages
      };

      await unifiedCarService.updateCar(carId, updatedCarData);
      setCar(updatedCarData as CarListing);
      setIsEditMode(false);
      setPhotos([]);
      setPhotoUrls([]);
      
      alert(language === 'bg' ? 'Промените са запазени успешно!' : 'Changes saved successfully!');
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

  // 🗑️ Delete existing image from car.images
  const deleteExistingImage = async (imageUrl: string) => {
    if (!window.confirm(language === 'bg' 
      ? 'Сигурни ли сте, че искате да изтриете тази снимка?' 
      : 'Are you sure you want to delete this image?'
    )) {
      return;
    }

    try {
      // Remove from Firebase Storage
      await carListingService.deleteImages(carId, [imageUrl]);
      
      // Update car.images array
      const updatedImages = (car?.images || []).filter(img => img !== imageUrl);
      await unifiedCarService.updateCar(carId, { images: updatedImages });
      
      // Update local state
      setCar({ ...car, images: updatedImages } as CarListing);
      
      alert(language === 'bg' ? 'Снимката е изтрита!' : 'Image deleted successfully!');
    } catch (error) {
      logger.error('Error deleting existing image', error as Error, { carId, imageUrl });
      alert(language === 'bg' ? 'Грешка при изтриване' : 'Error deleting image');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bg-BG', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(price);
  };

  // Contact Method Handlers
  const handleContactClick = (method: string) => {
    if (isEditMode) return; // في وضع التعديل، لا تفتح الروابط
    
    const phone = car.sellerPhone || '';
    const email = car.sellerEmail || '';
    const cleanPhone = phone.replace(/\D/g, ''); // إزالة كل شيء ما عدا الأرقام
    
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
          window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Inquiry about ${car.make} ${car.model} ${car.year}`)}`;
        } else {
          alert(language === 'bg' ? 'Няма наличен имейл адрес' : 'No email address available');
        }
        break;
        
      case 'whatsapp':
        if (phone) {
          const message = encodeURIComponent(`Hello! I'm interested in your ${car.make} ${car.model} ${car.year}`);
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
        // Facebook Messenger يحتاج معرف Facebook، سنفتح صفحة Messenger
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
          const smsBody = encodeURIComponent(`Hi, I'm interested in your ${car.make} ${car.model} ${car.year}`);
          window.location.href = `sms:${phone}${/iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?'}body=${smsBody}`;
        } else {
          alert(language === 'bg' ? 'Няма наличен телефонен номер за SMS' : 'No phone number available for SMS');
        }
        break;
        
      default:
        break;
    }
  };

  if (loading) {
    return <LoadingContainer>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingContainer>;
  }

  if (!car) {
    return <LoadingContainer>{language === 'bg' ? 'Автомобилът не е намерен' : 'Car not found'}</LoadingContainer>;
  }

  if (!isEditMode) {
    return (
      <CarDetailsModernView
        car={car}
        language={(language as 'bg' | 'en')}
        onBack={() => navigate(-1)}
        onEdit={isOwner ? handleEdit : undefined}
        isOwner={Boolean(isOwner)}
        onContact={handleContactClick}
      />
    );
  }

  return (
    <Container>
      <Header>
        <TopBar>
          <BackButton onClick={() => navigate(-1)}>
            ← {language === 'bg' ? 'Назад' : 'Back'}
          </BackButton>
          
          {!isEditMode && isOwner ? (
            <EditButton onClick={handleEdit}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M0 14.25V18h3.75L14.81 6.94l-3.75-3.75L0 14.25zM17.71 4.04a.996.996 0 000-1.41L15.37.29a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="white"/>
              </svg>
              {language === 'bg' ? 'Редактирай' : 'Edit'}
            </EditButton>
          ) : null}
          
          {isEditMode && isOwner && (
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
        </TopBar>

        <InfoBar>
          <SellerInfo>
            <SellerAvatar>
              {car.sellerName ? car.sellerName.charAt(0).toUpperCase() : '?'}
            </SellerAvatar>
            <SellerDetails>
              <SellerName>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0a0a">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                {car.sellerName || (language === 'bg' ? 'Неизвестен' : 'Unknown')}
              </SellerName>
              <SellerPhone href={`tel:${car.sellerPhone}`}>
                <svg viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                {car.sellerPhone || (language === 'bg' ? 'Без телефон' : 'No phone')}
              </SellerPhone>
            </SellerDetails>
          </SellerInfo>

          <VehicleInfo>
            <VehicleBrand>{car.make}</VehicleBrand>
            <div style={{ color: '#d0d7de', fontSize: '1.25rem', fontWeight: '300' }}>•</div>
            <VehicleModel>{car.model}</VehicleModel>
            <div style={{ color: '#d0d7de', fontSize: '1.25rem', fontWeight: '300' }}>•</div>
            <VehicleModel>{car.year}</VehicleModel>
          </VehicleInfo>
        </InfoBar>
        
        {/* Price under title */}
        {!isEditMode && car.price && (
          <PriceSection>
            <Price>€{car.price.toLocaleString()}</Price>
            <PriceLabel>{language === 'bg' ? '(EUR)' : '(EUR)'}</PriceLabel>
          </PriceSection>
        )}
      </Header>

      <MainContent>
        <ImageSection>
          {car.make && (
            <LogoContainer>
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
                    ? String(car.images[selectedImageIndex])
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
                      src={typeof image === 'string' ? String(image) : URL.createObjectURL(image)} 
                      alt={`Thumbnail ${index + 1}`} 
                    />
                    {isEditMode && isOwner && (
                      <PhotoRemoveButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteExistingImage(typeof image === 'string' ? image : '');
                        }}
                        title={language === 'bg' ? 'Изтрий снимка' : 'Delete image'}
                      >
                        ×
                      </PhotoRemoveButton>
                    )}
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

          {/* 📸 Photo Upload Section - Compact Version */}
          {isEditMode && isOwner && (
            <PhotoUploadSection style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <PhotoUploadTitle>
                  {language === 'bg' ? 'Добави снимки' : 'Add Photos'}
                </PhotoUploadTitle>
                <span style={{ fontSize: '0.688rem', color: '#6c757d', fontWeight: 500 }}>
                  {car?.images?.length || 0} + {photos.length} / 20
                </span>
              </div>
              
              <PhotoUploadArea
                $isDragOver={isDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('photo-upload-main')?.click()}
              >
                <UploadIcon>
                  <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="30" fill="url(#camera-gradient-compact)" opacity="0.2"/>
                    <path d="M23 18L26 14H38L41 18H50C51.1 18 52 18.9 52 20V46C52 47.1 51.1 48 50 48H14C12.9 48 12 47.1 12 46V20C12 18.9 12.9 18 14 18H23Z" fill="url(#camera-body-compact)"/>
                    <circle cx="32" cy="32" r="8" fill="url(#lens-gradient-compact)"/>
                    <circle cx="32" cy="32" r="5" fill="white" opacity="0.3"/>
                    <defs>
                      <linearGradient id="camera-gradient-compact" x1="2" y1="2" x2="62" y2="62" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF7900"/>
                        <stop offset="1" stopColor="#FF9500"/>
                      </linearGradient>
                      <linearGradient id="camera-body-compact" x1="12" y1="14" x2="52" y2="48" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF7900"/>
                        <stop offset="1" stopColor="#FF9500"/>
                      </linearGradient>
                      <linearGradient id="lens-gradient-compact" x1="24" y1="24" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2c3e50"/>
                        <stop offset="1" stopColor="#34495e"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </UploadIcon>
                <UploadText>
                  {language === 'bg' ? 'Drag & Drop или кликнете' : 'Drag & Drop or click'}
                </UploadText>
                <ChoosePhotosButton type="button">
                  {language === 'bg' ? 'Избери' : 'Choose'}
                </ChoosePhotosButton>
                <HiddenFileInput
                  id="photo-upload-main"
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
                  aria-label={language === 'bg' ? 'Изберете марка' : 'Select make'}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherMake(true);
                      handleInputChange('make', '');
                    } else {
                      setShowOtherMake(false);
                      handleInputChange('make', e.target.value);
                    }
                  }}
                >
                  <option value="">{language === 'bg' ? 'Изберете марка' : 'Select make'}</option>
                  {getAllMakes().filter(make => make !== 'Other').map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
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
                  aria-label={language === 'bg' ? 'Изберете модел' : 'Select model'}
                  disabled={!editedCar.make || availableModels.length === 0}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherModel(true);
                      handleInputChange('model', '');
                    } else {
                      setShowOtherModel(false);
                      handleInputChange('model', e.target.value);
                    }
                  }}
                >
                  <option value="">
                    {!editedCar.make 
                      ? (language === 'bg' ? 'Първо изберете марка' : 'Select make first')
                      : (language === 'bg' ? 'Изберете модел' : 'Select model')
                    }
                  </option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  {availableModels.length > 0 && (
                    <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
                  )}
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
                  aria-label={language === 'bg' ? 'Изберете гориво' : 'Select fuel type'}
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
                  aria-label={language === 'bg' ? 'Изберете трансмисия' : 'Select transmission'}
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
                  aria-label={language === 'bg' ? 'Изберете цвят' : 'Select color'}
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
                  value={showOtherDoors ? 'Other' : (editedCar.numberOfDoors?.toString() || editedCar.doors?.toString() || '')}
                  aria-label={language === 'bg' ? 'Изберете брой врати' : 'Select doors'}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherDoors(true);
                    } else {
                      setShowOtherDoors(false);
                      handleInputChange('numberOfDoors', parseInt(e.target.value));
                      handleInputChange('doors', parseInt(e.target.value)); // backward compatibility
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
                    value={editedCar.numberOfDoors || editedCar.doors || ''}
                    onChange={(e) => {
                      handleInputChange('numberOfDoors', parseInt(e.target.value));
                      handleInputChange('doors', parseInt(e.target.value)); // backward compatibility
                    }}
                    placeholder={language === 'bg' ? 'Въведете брой врати' : 'Enter doors'}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </>
            ) : (
              <DetailValue>{car.numberOfDoors || car.doors || 'N/A'}</DetailValue>
            )}
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>{language === 'bg' ? 'Места' : 'Seats'}</DetailLabel>
            {isEditMode ? (
              <>
                <EditableSelect
                  value={showOtherSeats ? 'Other' : (editedCar.numberOfSeats?.toString() || editedCar.seats?.toString() || '')}
                  aria-label={language === 'bg' ? 'Изберете брой места' : 'Select seats'}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setShowOtherSeats(true);
                    } else {
                      setShowOtherSeats(false);
                      handleInputChange('numberOfSeats', parseInt(e.target.value));
                      handleInputChange('seats', parseInt(e.target.value)); // backward compatibility
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
                    value={editedCar.numberOfSeats || editedCar.seats || ''}
                    onChange={(e) => {
                      handleInputChange('numberOfSeats', parseInt(e.target.value));
                      handleInputChange('seats', parseInt(e.target.value)); // backward compatibility
                    }}
                    placeholder={language === 'bg' ? 'Въведете брой места' : 'Enter seats'}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </>
            ) : (
              <DetailValue>{car.numberOfSeats || car.seats || 'N/A'}</DetailValue>
            )}
          </DetailRow>
        </DetailsSection>
      </MainContent>

      {/* Price Section - Only for Edit Mode */}
      {isEditMode && (
        <PriceSection>
          <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
              {language === 'bg' ? 'Цена (EUR)*' : 'Price (EUR)*'}
            </h3>
          </div>
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
        </PriceSection>
      )}

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
              aria-label={language === 'bg' ? 'Изберете регион' : 'Select region'}
              onChange={(e) => {
                const regionName = e.target.value;
                handleInputChange('region', regionName);
                
                // Update available cities based on selected region
                if (regionName) {
                  const cities = getCitiesByRegion(regionName);
                  const cityNames = cities.map(city => typeof city === 'string' ? city : city.name);
                  setAvailableCities(cityNames);
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
                aria-label={language === 'bg' ? 'Изберете град' : 'Select city'}
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
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '1rem', 
          marginTop: '1.5rem',
          padding: '1rem 0'
        }}>
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
            
            // في Edit Mode: استخدم الحقول المخصصة
            // في View Mode: استخدم القيم المحفوظة في قاعدة البيانات
            let isActive = false;
            let canClick = false;
            
            if (isEditMode) {
              // وضع التعديل: نعتمد على editedCar
              isActive = Boolean(editedCar[fieldKey]);
              canClick = true;
            } else {
              // وضع العرض: نعتمد على القيم المحفوظة في car
              isActive = Boolean(car[fieldKey]);
              canClick = isActive;
              
              // التأكد من وجود البيانات المطلوبة أيضاً
              const hasPhone = Boolean(car.sellerPhone);
              const hasEmail = Boolean(car.sellerEmail);
              
              // إذا كان الزر مفعّل لكن لا توجد بيانات، اجعله غير نشط
              if (isActive) {
                switch(contact.key) {
                  case 'phone':
                  case 'whatsapp':
                  case 'viber':
                  case 'telegram':
                  case 'sms':
                    isActive = hasPhone;
                    canClick = hasPhone;
                    break;
                  case 'email':
                    isActive = hasEmail;
                    canClick = hasEmail;
                    break;
                  case 'facebook':
                    isActive = hasPhone || hasEmail;
                    canClick = hasPhone || hasEmail;
                    break;
                }
              }
            }
            
            return (
              <ContactItem 
                key={contact.key} 
                $isActive={isActive}
                onClick={(e) => {
                  if (!isActive && !isEditMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditMode) {
                    handleInputChange(fieldKey, !Boolean(editedCar[fieldKey]));
                  } else if (canClick) {
                    handleContactClick(contact.key);
                  }
                }}
                style={{
                  pointerEvents: isEditMode || isActive ? 'auto' : 'none'
                }}
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

      {/* Distance & Directions - Only in view mode */}
      {!isEditMode && car && car.city && (
        <LocationMapContainer>
          <StaticMapEmbed
            location={{
              city: car.city,
              region: car.region,
              coordinates: car.coordinates
            }}
            zoom={14}
          />
          
          <DistanceIndicator
            carLocation={{
              city: car.city,
              region: car.region,
              coordinates: car.coordinates
            }}
          />
        </LocationMapContainer>
      )}
    </Container>
  );
};

export default CarDetailsPage;
