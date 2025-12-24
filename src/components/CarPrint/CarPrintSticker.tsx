/**
 * Car Print Sticker Component
 * Creates a professional A4 sticker for car listings
 * Designed to be printed and placed on car windows
 */

import React, { useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import { Printer, Download, X } from 'lucide-react';

import { CarListing } from '../../types/CarListing';

const PrintGlobalStyle = createGlobalStyle`
  [data-print-content] {
    * {
      color: #000000 !important;
      font-weight: 900 !important;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: #000000 !important;
      font-weight: 900 !important;
    }
    
    span, div, p {
      color: #000000 !important;
      font-weight: 900 !important;
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
  background: rgba(0, 0, 0, 0.8);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media print {
    display: none;
  }
`;

const PrintContainer = styled.div`
  background: white !important;
  width: 210mm;
  height: 297mm;
  padding: 10mm;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.5rem;
  color: #000000 !important;
  overflow: hidden;
  box-sizing: border-box;

  * {
    color: #000000 !important;
  }

  @media print {
    box-shadow: none !important;
    margin: 0 !important;
    padding: 10mm !important;
    width: 210mm !important;
    height: 297mm !important;
    page-break-inside: avoid;
    overflow: visible;
  }
`;

const PrintHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #000000;
  gap: 2rem;
`;

const PrintTitle = styled.h1`
  font-size: 24px;
  font-weight: 900;
  color: #000000;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const PrintPrice = styled.div`
  font-size: 32px;
  font-weight: 900;
  color: #000000;
  text-align: right;
`;

const PrintContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  flex: 1;
`;

const PrintImageContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
`;

const PrintImage = styled.img`
  width: auto;
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
  border: 1px solid #000;
`;

const PrintSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 900;
  color: #000000;
  text-transform: uppercase;
  margin: 0;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid #000000;
`;

const SectionContent = styled.div`
  font-size: 13px;
  color: #000000 !important;
  line-height: 1.4;
  font-weight: 900;
  
  * {
    color: #000000 !important;
    font-weight: 900 !important;
  }
  
  span {
    color: #000000 !important;
    font-weight: 900 !important;
  }
`;

const PrintRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.15rem 0;
  border-bottom: 1px dotted #999;
`;

const PrintLabel = styled.span`
  font-weight: 900;
  color: #000000;
  font-size: 12px;
`;

const PrintValue = styled.span`
  font-weight: 900;
  color: #000000;
  text-align: right;
  font-size: 12px;
`;

const PrintFooter = styled.div`
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid #000000;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 16px;
  font-size: 10px;
  color: #000000 !important;
  font-weight: 900;
  
  * {
    color: #000000 !important;
  }
`;

const PrintActions = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10001;

  @media print {
    display: none !important;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  background: ${props => props.$variant === 'primary' ? '#FF8F10' : '#fff'};
  color: ${props => props.$variant === 'primary' ? '#fff' : '#000'};
  border: ${props => props.$variant === 'primary' ? 'none' : '2px solid #000'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #000;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10002;

  &:hover {
    background: #f0f0f0;
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

    // Create a print window with proper styling
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(language === 'bg' 
        ? 'Моля разрешете popup прозорци за печат' 
        : 'Please allow popups for printing');
      return;
    }

    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${car.make} ${car.model} ${car.year} - Print</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 20mm;
              background: white !important;
              color: black !important;
              font-family: Arial, sans-serif;
            }
            .print-actions,
            .print-close {
              display: none !important;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 250);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
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
      console.error('PDF generation error:', error);
      alert(language === 'bg' 
        ? 'Моля инсталирайте библиотеките: npm install jspdf html2canvas' 
        : 'Please install libraries: npm install jspdf html2canvas');
    }
  };

  const mainImage = car.images && car.images.length > 0 
    ? (typeof car.images[0] === 'string' ? car.images[0] : URL.createObjectURL(car.images[0] as File))
    : null;

  return (
    <>
      <PrintGlobalStyle />
      <PrintOverlay onClick={onClose}>
        <PrintContainer ref={printRef} data-print-content onClick={(e) => e.stopPropagation()}>
        <CloseButton className="print-close" onClick={onClose}>
          <X size={20} />
        </CloseButton>

        <PrintActions className="print-actions">
          <ActionButton $variant="primary" onClick={handlePrint}>
            <Printer size={18} />
            {t.print}
          </ActionButton>
          <ActionButton $variant="secondary" onClick={handleDownloadPDF}>
            <Download size={18} />
            {t.downloadPDF}
          </ActionButton>
        </PrintActions>

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
          <div style={{ color: '#000000', fontWeight: '900' }}>Bulgarski Mobili - {window.location.origin}</div>
          <div style={{ color: '#000000', fontWeight: '900' }}>{new Date().toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')}</div>
        </PrintFooter>
        </PrintContainer>
      </PrintOverlay>
    </>
  );
};

