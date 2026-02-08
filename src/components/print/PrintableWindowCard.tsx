import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Printer, Download, MapPin, Phone, Car } from 'lucide-react';
import QRCode from 'react-qr-code';

interface PrintableWindowCardProps {
    car: any;
    isOpen: boolean;
    onClose: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: white;
  width: 90vw;
  max-width: 800px;
  height: 90vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
`;

const Toolbar = styled.div`
  padding: 15px 25px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PrintArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: clamp(12px, 4vw, 40px);
  background: #eee;
  display: flex;
  justify-content: center;
`;

const A4Page = styled.div`
  width: min(210mm, 88vw, calc((100vh - 220px) * 210 / 297));
  height: auto;
  aspect-ratio: 210 / 297;
  background: white;
  padding: clamp(16px, 6vw, 20mm);
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 100%;

  @media (max-width: 768px) {
    width: min(94vw, calc((100vh - 180px) * 210 / 297));
    max-height: calc(100% - 12px);
    border-radius: 10px;
  }

  @media print {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 20mm !important;
    box-shadow: none;
    z-index: 10000;
  }
`;

const PromoHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 3px solid #E31E24; // Koli Red
  padding-bottom: 15px;
`;

const MainTitle = styled.h1`
  font-size: clamp(24px, 6vw, 42px);
  font-weight: 900;
  color: #111;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: -1px;
`;

const SubTitle = styled.h2`
  font-size: clamp(14px, 4vw, 24px);
  color: #666;
  margin: 5px 0 0;
  font-weight: 300;
`;

const MainImage = styled.div<{ src: string }>`
  width: 100%;
  height: clamp(160px, 35vw, 350px);
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid #ddd;
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const SpecCard = styled.div`
  display: flex;
  align-items: center;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #333;
`;

const SpecLabel = styled.div`
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const SpecValue = styled.div`
  font-size: clamp(16px, 4.2vw, 20px);
  font-weight: 700;
  color: #111;
`;

const PriceTag = styled.div`
  background: #E31E24;
  color: white;
  font-size: clamp(24px, 7vw, 64px);
  font-weight: 900;
  text-align: center;
  padding: clamp(12px, 3vw, 20px);
  border-radius: 12px;
  margin: 20px 0;
  letter-spacing: -1px;
  box-shadow: 0 10px 30px rgba(227, 30, 36, 0.3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid #eee;
  padding-top: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const PhoneLarge = styled.div`
  font-size: clamp(18px, 6vw, 32px);
  font-weight: 800;
  color: #111;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const QRContainer = styled.div`
  text-align: center;
`;

const QRLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  text-transform: uppercase;
`;

const ActionButton = styled.button`
  background: #111;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #333;
  }
`;

export const PrintableWindowCard: React.FC<PrintableWindowCardProps> = ({ car, isOpen, onClose }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        // Add print class to body to hide other elements (handled by global CSS or scoped styles usually)
        // For simplicity here, window.print() works if we use @media print styles correctly on A4Page

        // Inject print styles dynamically
        const style = document.createElement('style');
        style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #printable-card, #printable-card * { visibility: visible; }
        #printable-card { 
          position: fixed; 
          left: 0; top: 0; 
          width: 100%; height: 100%; 
          z-index: 9999;
          margin: 0; 
          padding: 20px; 
        }
      }
    `;
        document.head.appendChild(style);

        window.print();

        // Cleanup
        setTimeout(() => {
            document.head.removeChild(style);
        }, 1000);
    };

    const listingUrl = `${window.location.origin}/car/${car.id}`;
    const displayImage = car.images?.[0] || '/images/placeholder.png';

    return (
        <Overlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <Toolbar>
                    <h3 style={{ margin: 0 }}>🖨️ Window Sticker Preview</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <ActionButton onClick={handlePrint}>
                            <Printer size={18} /> Print
                        </ActionButton>
                        <ActionButton onClick={onClose} style={{ background: '#eee', color: '#333' }}>
                            Close
                        </ActionButton>
                    </div>
                </Toolbar>

                <PrintArea>
                    <A4Page id="printable-card">
                        <PromoHeader>
                            <MainTitle>PRODAVAM / FOR SALE</MainTitle>
                            <SubTitle>{car.make} {car.model} {car.year}</SubTitle>
                        </PromoHeader>

                        <MainImage src={displayImage} />

                        <SpecsGrid>
                            <SpecCard>
                                <Car size={32} style={{ marginRight: 15 }} />
                                <div>
                                    <SpecLabel>Engine / Power</SpecLabel>
                                    <SpecValue>{car.engineSize}L / {car.power} HP</SpecValue>
                                </div>
                            </SpecCard>
                            <SpecCard>
                                <div style={{ fontSize: 24, fontWeight: 900, marginRight: 15 }}>km</div>
                                <div>
                                    <SpecLabel>Mileage</SpecLabel>
                                    <SpecValue>{car.mileage?.toLocaleString()} km</SpecValue>
                                </div>
                            </SpecCard>
                            <SpecCard>
                                <div>
                                    <SpecLabel>Fuel Type</SpecLabel>
                                    <SpecValue>{car.fuelType}</SpecValue>
                                </div>
                            </SpecCard>
                            <SpecCard>
                                <div>
                                    <SpecLabel>Transmission</SpecLabel>
                                    <SpecValue>{car.transmission}</SpecValue>
                                </div>
                            </SpecCard>
                        </SpecsGrid>

                        {car.description && (
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 }}>Notes:</div>
                                <div style={{ fontStyle: 'italic', color: '#444' }}>
                                    {car.description.length > 200 ? car.description.substring(0, 200) + '...' : car.description}
                                </div>
                            </div>
                        )}

                        <PriceTag>
                            {car.price?.toLocaleString()} BGN
                        </PriceTag>

                        <Footer>
                            <ContactInfo>
                                <div style={{ fontSize: 14, color: '#666', textTransform: 'uppercase', marginBottom: 5 }}>Call Owner</div>
                                <PhoneLarge>
                                    <Phone size={32} strokeWidth={2.5} />
                                    {car.sellerPhone || '+359 --- --- ---'}
                                </PhoneLarge>
                                <div style={{ marginTop: 5 }}>{car.sellerName}</div>
                            </ContactInfo>

                            <QRContainer>
                                <QRCode value={listingUrl} size={100} />
                                <QRLabel>Scan for Details</QRLabel>
                            </QRContainer>
                        </Footer>
                    </A4Page>
                </PrintArea>
            </ModalContent>
        </Overlay>
    );
};
