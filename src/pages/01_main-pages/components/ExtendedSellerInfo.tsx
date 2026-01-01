import React, { useState } from 'react';
import styled from 'styled-components';
import { CarListing } from '../../../../types/CarListing';
import { MapPin, Phone, Mail, Clock, ChevronDown, ChevronUp, ExternalLink, Globe } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ExtendedSellerInfoProps {
    car: CarListing;
    language: 'bg' | 'en';
}

const Container = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Value = styled.div`
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.5;
`;

const Link = styled.a`
  color: var(--accent-primary);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const ServiceList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ServiceItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  font-size: 15px;

  &::before {
    content: "•";
    color: var(--accent-primary);
    font-weight: bold;
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 350px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  margin-top: 1rem;
`;

const MapFrame = styled.iframe<{ $isDark: boolean }>`
  width: 100%;
  height: 100%;
  border: 0;
  transition: filter 0.3s ease;
  ${props => props.$isDark && `
    filter: invert(1) hue-rotate(180deg) contrast(0.85) grayscale(0.2);
  `}
`;

const CollapsibleHeader = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: ${props => props.$isOpen ? '1rem' : '0'};
  
  &:hover {
    background: var(--bg-hover);
  }
`;

const CollapsibleContent = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  padding: 0 1rem;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
`;

const Footer = styled.footer`
  background: #1a1a1a;
  color: #ffffff;
  padding: 3rem 1.5rem;
  margin-top: 3rem;
  border-radius: 24px 24px 0 0;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FooterTitle = styled.h4`
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const FooterLink = styled.a`
  color: #a0a0a0;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;

  &:hover {
    color: white;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #333;
  color: #666;
  font-size: 13px;
`;

export const ExtendedSellerInfo: React.FC<ExtendedSellerInfoProps> = ({ car, language }) => {
    const { theme } = useTheme();
    const [isPrivacyOpen, setPrivacyOpen] = useState(false);
    const [isCookieOpen, setCookieOpen] = useState(false);

    // Construct map query from available location data
    const mapQuery = [car.city, car.region].filter(Boolean).join(', ');
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || 'Bulgaria')}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

    return (
        <Container>
            {/* Dealer Info Section */}
            <Section>
                <Grid>
                    <div>
                        <SectionTitle>{car.sellerName || 'Claas Wehner Autohaus GmbH'}</SectionTitle>
                        <InfoGroup>
                            <Value>
                                {car.companyAddress || 'Hanomagstraße 15'}<br />
                                {car.city ? `${car.postalCode || ''} ${car.city}` : 'DE-21244 Buchholz'}
                            </Value>
                            <Link href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${car.companyAddress || ''} ${car.city || ''}`)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                                <MapPin size={14} />
                                Calculate route
                            </Link>
                        </InfoGroup>

                        {car.sellerType !== 'private' && (
                            <InfoGroup>
                                <Label>Additional services</Label>
                                <ServiceList>
                                    <ServiceItem>Repair Center</ServiceItem>
                                    <ServiceItem>Financing</ServiceItem>
                                    <ServiceItem>Used vehicle trade-in</ServiceItem>
                                </ServiceList>
                            </InfoGroup>
                        )}
                    </div>

                    <div>
                        <SectionTitle>Imprint</SectionTitle>
                        <InfoGroup>
                            <Value>
                                <strong>{car.sellerName || 'Claas Wehner Autohaus GmbH'}</strong><br />
                                {car.companyAddress || 'Volksparkstrasse 38'}<br />
                                {car.city ? `${car.postalCode || ''} ${car.city}` : 'DE-22525 Hamburg'}<br /><br />
                                Telefon: {car.sellerPhone || '040 244 260'}<br />
                                eMail: {car.sellerEmail || 'ah-wehner@mobile.de'}<br /><br />
                                Handelsregister: Amtsgericht Hamburg<br />
                                Handelsregisternr.: HRB63320<br />
                                Umsatzsteuer-Identifikationsnr.: DE189336425<br />
                                Vertretungsberechtigt: Claas Wehner
                            </Value>
                        </InfoGroup>
                    </div>
                </Grid>
            </Section>

            {/* Map Section */}
            <Section>
                <SectionTitle>
                    <MapPin />
                    {language === 'bg' ? 'Местоположение' : 'Location'}
                </SectionTitle>
                <Value>
                    {car.city || 'Sofia'}, {car.region || 'Sofia-City'}
                </Value>
                <MapContainer>
                    <MapFrame
                        src={mapUrl}
                        loading="lazy"
                        title="Seller Location"
                        $isDark={theme === 'dark'}
                    />
                </MapContainer>
            </Section>

            {/* Legal / Data Protection (Collapsible) */}
            <Section>
                <CollapsibleHeader $isOpen={isPrivacyOpen} onClick={() => setPrivacyOpen(!isPrivacyOpen)}>
                    <span style={{ fontWeight: 600 }}>Data Protection & Privacy Policy</span>
                    {isPrivacyOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </CollapsibleHeader>
                <CollapsibleContent $isOpen={isPrivacyOpen}>
                    <strong>Name und Anschrift des Datenschutzbeauftragten</strong><br />
                    Der Datenschutzbeauftragte des Verantwortlichen ist:<br /><br />
                    Niklas Wehner<br />
                    Claas Wehner Autohaus GmbH<br />
                    Volksparkstraße 38 + 42<br />
                    22525 Hamburg<br />
                    Deutschland<br />
                    Tel.: +49 40 - 244 260<br />
                    E-Mail: n.wehner@autohaus-wehner.de<br />
                    Website: www.autohaus-wehner.de<br /><br />
                    <strong>ZWECK DER DATENVERARBEITUNG</strong><br />
                    Eine Registrierung des Nutzers ist für das Bereithalten bestimmter Inhalte und Leistungen auf unserer Website erforderlich.<br />
                    • Zustellen von Prospekten<br />
                    • Kontaktaufnahme & Vergabe von Werkstattterminen<br />
                    • Kontaktaufnahme & Vergabe von Probefahrten<br /><br />
                    Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind.
                </CollapsibleContent>

                <CollapsibleHeader $isOpen={isCookieOpen} onClick={() => setCookieOpen(!isCookieOpen)} style={{ marginTop: '1rem' }}>
                    <span style={{ fontWeight: 600 }}>Cookie Policy</span>
                    {isCookieOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </CollapsibleHeader>
                <CollapsibleContent $isOpen={isCookieOpen}>
                    <strong>Verwendung von Cookies</strong><br />
                    Beschreibung und Umfang der Datenverarbeitung<br />
                    Unsere Webseite verwendet Cookies. Bei Cookies handelt es sich um Textdateien, die im Internetbrowser bzw. vom Internetbrowser auf dem Computersystem des Nutzers gespeichert werden...
                </CollapsibleContent>
            </Section>

            {/* Specific Footer */}
            <Footer>
                <FooterGrid>
                    <FooterColumn>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Bulgarski Avtomobili</h3>
                        <p style={{ fontSize: '14px', color: '#ccc' }}>
                            Най-добрата платформа за купуване и продажба на автомобили в България.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <div>
                                <strong style={{ display: 'block', fontSize: '18px', color: '#fff' }}>15,000+</strong>
                                <span style={{ fontSize: '12px', color: '#888' }}>Коли</span>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '18px', color: '#fff' }}>8,500+</strong>
                                <span style={{ fontSize: '12px', color: '#888' }}>Доволни клиенти</span>
                            </div>
                        </div>
                    </FooterColumn>

                    <FooterColumn>
                        <FooterTitle>Бързи връзки</FooterTitle>
                        <FooterLink href="/">Начало</FooterLink>
                        <FooterLink href="/search">Търси коли</FooterLink>
                        <FooterLink href="/sell">Продай</FooterLink>
                        <FooterLink href="/brands">Бранд Галерия</FooterLink>
                    </FooterColumn>

                    <FooterColumn>
                        <FooterTitle>Услуги</FooterTitle>
                        <FooterLink href="/financing">Финансови решения</FooterLink>
                        <FooterLink href="/insurance">Застраховка</FooterLink>
                        <FooterLink href="/verified">Проверени обяви</FooterLink>
                        <FooterLink href="/support">Поддръжка</FooterLink>
                    </FooterColumn>

                    <FooterColumn>
                        <FooterTitle>Контакт</FooterTitle>
                        <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6' }}>
                            ул. Цар Симеон 77, София 1000<br />
                            България<br /><br />
                            +359 2 123 4567<br />
                            info@mobilebg.eu
                        </div>
                    </FooterColumn>
                </FooterGrid>

                <Copyright>
                    © 2026 Bulgarski Avtomobili. Всички права запазени.<br />
                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <FooterLink href="/privacy">Политика за поверителност</FooterLink>
                        <FooterLink href="/terms">Условия за ползване</FooterLink>
                        <FooterLink href="/cookies">Политика за бисквитки</FooterLink>
                    </div>
                </Copyright>
            </Footer>
        </Container>
    );
};
