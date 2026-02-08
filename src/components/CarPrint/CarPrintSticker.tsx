/**
 * Car Print Sticker Component
 * Creates a professional A4 sticker for car listings
 * Designed to be printed and placed on car windows
 */

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';

import { Printer, Download, X } from 'lucide-react';

import { CarListing } from '../../types/CarListing';
import IdentityStamp from '../Profile/IdentityStamp';
import { userService } from '../../services/user/canonical-user.service';
import { BulgarianUser } from '../../types/user/bulgarian-user.types';
import { logger } from '@/services/logger-service';

const PrintGlobalStyle = createGlobalStyle`
  @media print {
    /* Reset all elements */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box !important;
    }
    
    /* Force A4 dimensions */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 210mm !important;
      height: 297mm !important;
      max-width: 210mm !important;
      max-height: 297mm !important;
      overflow: hidden !important;
      background: white !important;
    }
    
    /* CRITICAL: Hide everything except print content */
    body > * {
      display: none !important;
      visibility: hidden !important;
      position: absolute !important;
      left: -9999px !important;
    }
    
    /* Show ONLY the print root */
    body > [data-print-root] {
      display: block !important;
      visibility: visible !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 210mm !important;
      height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      overflow: hidden !important;
      z-index: 999999 !important;
    }
    
    /* Print content */
    [data-print-content] {
      display: block !important;
      visibility: visible !important;
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
      max-width: 210mm !important;
      max-height: 297mm !important;
      margin: 0 !important;
      padding: 15mm !important;
      background: white !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
    }
    
    /* Force no page breaks */
    [data-print-root],
    [data-print-content],
    [data-print-content] * {
      page-break-before: avoid !important;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
      break-before: avoid !important;
      break-after: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Hide UI elements */
    .print-actions,
    .print-close,
    button {
      display: none !important;
    }
    
    /* Page settings */
    @page {
      size: A4 portrait;
      margin: 0;
    }
    
    /* Force black text */
    [data-print-content],
    [data-print-content] * {
      color: #000000 !important;
    }
    
    /* Images */
    img, svg {
      max-width: 100% !important;
      height: auto !important;
      page-break-inside: avoid !important;
    }
  }
`;

interface CarPrintStickerProps {
  car: CarListing;
  language: 'bg' | 'en';
  onClose: () => void;
  onPrint?: () => void;
  onDownloadPDF?: () => void;
}

const PrintOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 999999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Start from top, allow scrolling */
  gap: 1.5rem;
  padding: 2rem 0; /* Vertical padding */
  overflow-y: auto;

  @media print {
    /* Transform into the print container */
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 210mm !important;
    height: 297mm !important;
    max-width: 210mm !important;
    max-height: 297mm !important;
    overflow: hidden !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
  }
`;

const PrintContainer = styled.div`
  background: white !important;
  width: 210mm;
  min-height: 297mm;
  max-height: 297mm;
  /* Screen Mode: A4 Preview positioned below header */
  transform: scale(0.85); /* Slight scale to fit on smaller laptop screens if needed, or remove if strict A4 required */
  transform-origin: top center;
  margin-top: 80px; /* Push below header */
  padding: 15mm;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  color: #000000 !important;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: 4px;

  * {
    color: #000000 !important;
  }

  @media (max-width: 768px) {
    width: min(92vw, calc((100vh - 180px) * 210 / 297));
    min-height: auto;
    max-height: none;
    aspect-ratio: 210 / 297;
    margin-top: 60px;
    padding: clamp(8px, 3vw, 15mm);
    transform: none;
    border-radius: 10px;
  }

  @media print {
    /* Become the single A4 page */
    box-shadow: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: 15mm !important;
    width: 210mm !important;
    height: 297mm !important;
    min-height: 297mm !important;
    max-height: 297mm !important;
    position: relative !important;
    overflow: hidden !important;
    page-break-before: avoid !important;
    page-break-after: avoid !important;
    page-break-inside: avoid !important;
    box-sizing: border-box !important;
  }
`;

const PrintHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #000000;
  width: 100%;
`;

const PrintTitle = styled.h1`
  font-size: clamp(18px, 5vw, 28px);
  font-weight: 900;
  color: #000000;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const PrintPrice = styled.div`
  font-size: clamp(20px, 6vw, 36px);
  font-weight: 900;
  color: #FF8F10;
  text-align: right;
`;

const PrintContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  flex: 1;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const PrintImageContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  max-height: 180px;
`;

const PrintImage = styled.img`
  width: auto;
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
  border: 2px solid #000;
  border-radius: 4px;
`;

const PrintSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 900;
  color: #FF8F10;
  text-transform: uppercase;
  margin: 0;
  padding-bottom: 0.35rem;
  border-bottom: 2px solid #FF8F10;
`;

const SectionContent = styled.div`
  font-size: 14px;
  color: #000000 !important;
  line-height: 1.6;
  font-weight: 600;
  
  * {
    color: #000000 !important;
    font-weight: 600 !important;
  }
  
  span {
    color: #000000 !important;
    font-weight: 600 !important;
  }
`;

const PrintRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px dotted #ccc;
`;

const PrintLabel = styled.span`
  font-weight: 600;
  color: #666;
  font-size: 13px;
`;

const PrintValue = styled.span`
  font-weight: 700;
  color: #000000;
  text-align: right;
  font-size: 14px;
`;

const PrintFooter = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px solid #000000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 11px;
  color: #666 !important;
  font-weight: 600;
  
  * {
    color: #666 !important;
  }
`;

const PrintActions = styled.div`
  display: flex;
  gap: 1rem;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.6);
  padding: 1rem 2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);

  @media (max-width: 600px) {
    flex-direction: column;
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    width: min(92vw, 360px);
  }

  @media print {
    display: none !important;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s;
  background: ${props => props.$variant === 'primary' ? '#FF8F10' : '#fff'};
  color: ${props => props.$variant === 'primary' ? '#fff' : '#000'};
  border: ${props => props.$variant === 'primary' ? 'none' : '2px solid #fff'};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

  @media (max-width: 600px) {
    padding: 0.75rem 1.5rem;
    font-size: 14px;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    background: ${props => props.$variant === 'primary' ? '#FF7900' : '#f0f0f0'};
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: -50px;
  right: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10002;
  backdrop-filter: blur(10px);
  transition: all 0.3s;

  &:hover {
    background: #fff;
    color: #000;
    transform: scale(1.1);
  }

  @media print {
    display: none !important;
  }
`;

const translations = {
  bg: {
    price: 'Цена',
    make: 'Марка',
    model: 'Модел',
    year: 'Година',
    mileage: 'Пробег',
    fuel: 'Гориво',
    transmission: 'Скоростна кутия',
    power: 'Мощност',
    color: 'Цвят',
    location: 'Локация',
    contact: 'Контакт',
    phone: 'Телефон',
    email: 'Имейл',
    print: 'Печат',
    downloadPDF: 'Изтегли PDF',
    forSale: 'За продажба',
    seller: 'Продавач',
    vin: 'VIN',
    engineSize: 'Обем на двигателя',
    doors: 'Брой врати',
    seats: 'Брой места',
    driveType: 'Задвижване',
    previousOwners: 'Предишни собственици',
    accidentFree: 'Без аварии',
    serviceHistory: 'Сервизна книжка',
    firstRegistration: 'Първа регистрация',
    inspectionValid: 'Годност на прегледа',
    warranty: 'Гаранция',
    condition: 'Състояние',
    interior: 'Интериор',
    consumption: 'Разход',
    co2Emissions: 'CO2 емисии',
    euroStandard: 'Евро стандарт'
  },
  en: {
    price: 'Price',
    make: 'Make',
    model: 'Model',
    year: 'Year',
    mileage: 'Mileage',
    fuel: 'Fuel',
    transmission: 'Transmission',
    power: 'Power',
    color: 'Color',
    location: 'Location',
    contact: 'Contact',
    phone: 'Phone',
    email: 'Email',
    print: 'Print',
    downloadPDF: 'Download PDF',
    forSale: 'For Sale',
    seller: 'Seller',
    vin: 'VIN',
    engineSize: 'Engine Size',
    doors: 'Doors',
    seats: 'Seats',
    driveType: 'Drive Type',
    previousOwners: 'Previous Owners',
    accidentFree: 'Accident Free',
    serviceHistory: 'Service History',
    firstRegistration: 'First Registration',
    inspectionValid: 'Inspection Valid Until',
    warranty: 'Warranty',
    condition: 'Condition',
    interior: 'Interior',
    consumption: 'Fuel Consumption',
    co2Emissions: 'CO2 Emissions',
    euroStandard: 'Euro Standard'
  }
};

export const CarPrintSticker: React.FC<CarPrintStickerProps> = ({
  car,
  language,
  onClose,
  onPrint,
  onDownloadPDF
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const t = translations[language];
  const [sellerInfo, setSellerInfo] = useState<BulgarianUser | null>(null);

  // جلب معلومات البائع (صاحب السيارة)
  useEffect(() => {
    if (car.sellerId) {
      userService.getUserProfile(car.sellerId).then(profile => {
        if (profile) {
          setSellerInfo(profile);
        }
      }).catch(err => logger.error('Failed to load seller info for stamp', err as Error, { sellerId: car.sellerId }));
    }
  }, [car.sellerId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('bg-BG').format(mileage) + ' km';
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }

    // طباعة مباشرة للمحتوى المرئي فقط
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadPDF = async () => {
    if (onDownloadPDF) {
      onDownloadPDF();
      return;
    }

    // Fallback: Use html2canvas and jsPDF if available
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      if (printRef.current) {
        const canvas = await html2canvas(printRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${car.make}-${car.model}-${car.year}.pdf`);
      }
    } catch (error) {
      logger.error('PDF generation error', error as Error, { carId: car.id });
      alert(language === 'bg'
        ? 'Моля инсталирайте библиотеките: npm install jspdf html2canvas'
        : 'Please install libraries: npm install jspdf html2canvas');
    }
  };

  const mainImage = car.images && car.images.length > 0
    ? (typeof car.images[0] === 'string' ? car.images[0] : URL.createObjectURL(car.images[0] as File))
    : null;

  return createPortal(
    <>
      <PrintGlobalStyle />
      <PrintOverlay data-print-root onClick={onClose}>
        <PrintContainer ref={printRef} data-print-content onClick={(e) => e.stopPropagation()}>
          <CloseButton className="print-close" onClick={onClose}>
            <X size={24} />
          </CloseButton>

          <PrintHeader>
            <div style={{ color: '#000000' }}>
              <PrintTitle style={{ color: '#000000' }}>{car.make} {car.model} {car.year}</PrintTitle>
            </div>
            <PrintPrice style={{ color: '#000000' }}>{formatPrice(car.price)}</PrintPrice>
          </PrintHeader>

          {mainImage && (
            <PrintImageContainer>
              <PrintImage src={mainImage} alt={`${car.make} ${car.model}`} />
            </PrintImageContainer>
          )}

          <PrintContent>
            <PrintSection>
              <SectionTitle>{t.make} / {t.model}</SectionTitle>
              <SectionContent>
                <PrintRow>
                  <PrintLabel>{t.make}:</PrintLabel>
                  <PrintValue>{car.make}</PrintValue>
                </PrintRow>
                <PrintRow>
                  <PrintLabel>{t.model}:</PrintLabel>
                  <PrintValue>{car.model}</PrintValue>
                </PrintRow>
                <PrintRow>
                  <PrintLabel>{t.year}:</PrintLabel>
                  <PrintValue>{car.year}</PrintValue>
                </PrintRow>
                {car.vin && (
                  <PrintRow>
                    <PrintLabel>{t.vin}:</PrintLabel>
                    <PrintValue style={{ fontSize: '10px' }}>{car.vin}</PrintValue>
                  </PrintRow>
                )}
                <PrintRow>
                  <PrintLabel>{t.mileage}:</PrintLabel>
                  <PrintValue>{car.mileage ? formatMileage(car.mileage) : 'N/A'}</PrintValue>
                </PrintRow>
              </SectionContent>
            </PrintSection>

            <PrintSection>
              <SectionTitle>{t.fuel} / {t.transmission}</SectionTitle>
              <SectionContent>
                <PrintRow>
                  <PrintLabel>{t.fuel}:</PrintLabel>
                  <PrintValue>{car.fuelType || 'N/A'}</PrintValue>
                </PrintRow>
                <PrintRow>
                  <PrintLabel>{t.transmission}:</PrintLabel>
                  <PrintValue>{car.transmission || 'N/A'}</PrintValue>
                </PrintRow>
                {(car.power || car.powerKW) && (
                  <PrintRow>
                    <PrintLabel>{t.power}:</PrintLabel>
                    <PrintValue>{car.powerKW ? `${car.powerKW} kW` : car.power ? `${car.power} hp` : 'N/A'}</PrintValue>
                  </PrintRow>
                )}
                {car.engineSize && (
                  <PrintRow>
                    <PrintLabel>{t.engineSize}:</PrintLabel>
                    <PrintValue>{car.engineSize} cm³</PrintValue>
                  </PrintRow>
                )}
                {car.driveType && (
                  <PrintRow>
                    <PrintLabel>{t.driveType}:</PrintLabel>
                    <PrintValue>{car.driveType}</PrintValue>
                  </PrintRow>
                )}
                {car.color && (
                  <PrintRow>
                    <PrintLabel>{t.color}:</PrintLabel>
                    <PrintValue>{car.color}</PrintValue>
                  </PrintRow>
                )}
                {(car.doors || car.numberOfDoors) && (
                  <PrintRow>
                    <PrintLabel>{t.doors}:</PrintLabel>
                    <PrintValue>{car.numberOfDoors || car.doors || 'N/A'}</PrintValue>
                  </PrintRow>
                )}
                {(car.seats || car.numberOfSeats) && (
                  <PrintRow>
                    <PrintLabel>{t.seats}:</PrintLabel>
                    <PrintValue>{car.numberOfSeats || car.seats || 'N/A'}</PrintValue>
                  </PrintRow>
                )}
              </SectionContent>
            </PrintSection>

            <PrintSection>
              <SectionTitle>{t.condition} / {t.serviceHistory}</SectionTitle>
              <SectionContent>
                {car.previousOwners && (
                  <PrintRow>
                    <PrintLabel>{t.previousOwners}:</PrintLabel>
                    <PrintValue>{car.previousOwners}</PrintValue>
                  </PrintRow>
                )}
                <PrintRow>
                  <PrintLabel>{t.accidentFree}:</PrintLabel>
                  <PrintValue>{car.accidentHistory ? (language === 'bg' ? 'Не' : 'No') : (language === 'bg' ? 'Да' : 'Yes')}</PrintValue>
                </PrintRow>
                <PrintRow>
                  <PrintLabel>{t.serviceHistory}:</PrintLabel>
                  <PrintValue>{car.serviceHistory ? (language === 'bg' ? 'Да' : 'Yes') : (language === 'bg' ? 'Не' : 'No')}</PrintValue>
                </PrintRow>
                {car.firstRegistrationDate && (
                  <PrintRow>
                    <PrintLabel>{t.firstRegistration}:</PrintLabel>
                    <PrintValue>{new Date(car.firstRegistrationDate).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')}</PrintValue>
                  </PrintRow>
                )}
                {car.inspectionValidUntil && (
                  <PrintRow>
                    <PrintLabel>{t.inspectionValid}:</PrintLabel>
                    <PrintValue>{new Date(car.inspectionValidUntil).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')}</PrintValue>
                  </PrintRow>
                )}
                <PrintRow>
                  <PrintLabel>{t.warranty}:</PrintLabel>
                  <PrintValue>{car.warranty ? (car.warrantyMonths ? `${car.warrantyMonths} ${language === 'bg' ? 'месеца' : 'months'}` : (language === 'bg' ? 'Да' : 'Yes')) : (language === 'bg' ? 'Не' : 'No')}</PrintValue>
                </PrintRow>
              </SectionContent>
            </PrintSection>

            {(car.fuelConsumption || car.co2Emissions || car.euroStandard) && (
              <PrintSection>
                <SectionTitle>{language === 'bg' ? 'Екология' : 'Ecology'}</SectionTitle>
                <SectionContent>
                  {car.fuelConsumption && (
                    <PrintRow>
                      <PrintLabel>{t.consumption}:</PrintLabel>
                      <PrintValue>{car.fuelConsumption} l/100km</PrintValue>
                    </PrintRow>
                  )}
                  {car.co2Emissions && (
                    <PrintRow>
                      <PrintLabel>{t.co2Emissions}:</PrintLabel>
                      <PrintValue>{car.co2Emissions} g/km</PrintValue>
                    </PrintRow>
                  )}
                  {car.euroStandard && (
                    <PrintRow>
                      <PrintLabel>{t.euroStandard}:</PrintLabel>
                      <PrintValue>{car.euroStandard}</PrintValue>
                    </PrintRow>
                  )}
                </SectionContent>
              </PrintSection>
            )}

            <PrintSection style={{ color: '#000000' }}>
              <SectionTitle style={{ color: '#000000' }}>{t.location}</SectionTitle>
              <SectionContent style={{ color: '#000000' }}>
                <PrintRow>
                  <PrintLabel>{t.location}:</PrintLabel>
                  <PrintValue>{car.city && car.region ? `${car.city}, ${car.region}` : car.city || car.region || 'N/A'}</PrintValue>
                </PrintRow>
                {car.postalCode && (
                  <PrintRow>
                    <PrintLabel>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}:</PrintLabel>
                    <PrintValue>{car.postalCode}</PrintValue>
                  </PrintRow>
                )}
              </SectionContent>
            </PrintSection>

            <PrintSection style={{ color: '#000000' }}>
              <SectionTitle style={{ color: '#000000' }}>{t.contact}</SectionTitle>
              <SectionContent style={{ color: '#000000' }}>
                {car.sellerName && (
                  <PrintRow>
                    <PrintLabel>{t.seller}:</PrintLabel>
                    <PrintValue>{car.sellerName}</PrintValue>
                  </PrintRow>
                )}
                {car.sellerPhone && (
                  <PrintRow>
                    <PrintLabel>{t.phone}:</PrintLabel>
                    <PrintValue>{car.sellerPhone}</PrintValue>
                  </PrintRow>
                )}
                {car.sellerEmail && (
                  <PrintRow>
                    <PrintLabel>{t.email}:</PrintLabel>
                    <PrintValue style={{ fontSize: '11px', wordBreak: 'break-all', fontWeight: '900', color: '#000000' }}>{car.sellerEmail}</PrintValue>
                  </PrintRow>
                )}
                {car.companyName && (
                  <PrintRow>
                    <PrintLabel>{language === 'bg' ? 'Фирма' : 'Company'}:</PrintLabel>
                    <PrintValue>{car.companyName}</PrintValue>
                  </PrintRow>
                )}
              </SectionContent>
            </PrintSection>
          </PrintContent>

          <PrintFooter>
            <div style={{ color: '#666', fontWeight: '600' }}>Koli One - {window.location.origin}</div>
            <div style={{ color: '#666', fontWeight: '600' }}>{new Date().toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')}</div>
          </PrintFooter>

          {/* الختم الاحترافي لمعلومات البائع */}
          {sellerInfo && (
            <div className="print-identity-stamp" style={{
              position: 'absolute',
              top: '-168px',
              right: '10mm',
              bottom: '10mm',
              left: '368px',
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gridTemplateRows: 'repeat(5, 1fr)',
              width: 'fit-content',
              height: 'fit-content',
              transform: 'scale(0.7)',
              transformOrigin: 'right bottom',
              zIndex: 9999
            }}>
              <style>{`
                @media (max-width: 768px) {
                  .print-identity-stamp {
                    display: none !important;
                  }
                }
              `}</style>
              <IdentityStamp
                firstName={sellerInfo.firstName || car.sellerName?.split(' ')[0] || 'SELLER'}
                lastName={sellerInfo.lastName || car.sellerName?.split(' ').slice(1).join(' ') || 'NAME'}
                email={sellerInfo.email || car.sellerEmail || 'EMAIL@EXAMPLE.COM'}
                phone={sellerInfo.phoneNumber || car.sellerPhone || '+359 00 000 000'}
                region={sellerInfo.region || car.region || 'REGION'}
                city={sellerInfo.city || car.city || 'CITY'}
                address={sellerInfo.address || 'ADDRESS'}
                numericId={sellerInfo.numericId || 0}
                isDark={false}
              />
            </div>
          )}
        </PrintContainer>

        {/* أزرار الطباعة أسفل الورقة */}
        <PrintActions className="print-actions">
          <ActionButton $variant="primary" onClick={handlePrint}>
            <Printer size={20} />
            {t.print}
          </ActionButton>
          <ActionButton $variant="secondary" onClick={handleDownloadPDF}>
            <Download size={20} />
            {t.downloadPDF}
          </ActionButton>
        </PrintActions>
      </PrintOverlay>
    </>,
    document.body
  );
};

