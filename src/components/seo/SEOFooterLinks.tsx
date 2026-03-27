/**
 * SEOFooterLinks.tsx
 * Internal linking component for SEO - renders city and brand links
 * Helps Google discover and index all important pages
 */

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const BULGARIAN_CITIES = [
  { slug: 'sofia', name: 'София' },
  { slug: 'plovdiv', name: 'Пловдив' },
  { slug: 'varna', name: 'Варна' },
  { slug: 'burgas', name: 'Бургас' },
  { slug: 'stara-zagora', name: 'Стара Загора' },
  { slug: 'ruse', name: 'Русе' },
  { slug: 'pleven', name: 'Плевен' },
  { slug: 'sliven', name: 'Сливен' },
  { slug: 'dobrich', name: 'Добрич' },
  { slug: 'shumen', name: 'Шумен' },
  { slug: 'pernik', name: 'Перник' },
  { slug: 'haskovo', name: 'Хасково' },
  { slug: 'yambol', name: 'Ямбол' },
  { slug: 'pazardzhik', name: 'Пазарджик' },
  { slug: 'blagoevgrad', name: 'Благоевград' },
  { slug: 'veliko-tarnovo', name: 'Велико Търново' },
  { slug: 'vratsa', name: 'Враца' },
  { slug: 'gabrovo', name: 'Габрово' },
  { slug: 'vidin', name: 'Видин' },
  { slug: 'kazanlak', name: 'Казанлък' },
  { slug: 'kyustendil', name: 'Кюстендил' },
  { slug: 'montana', name: 'Монтана' },
  { slug: 'lovech', name: 'Ловеч' },
  { slug: 'silistra', name: 'Силистра' },
  { slug: 'razgrad', name: 'Разград' },
  { slug: 'kardzhali', name: 'Кърджали' },
  { slug: 'smolyan', name: 'Смолян' },
];

const TOP_BRANDS = [
  { slug: 'bmw', name: 'BMW' },
  { slug: 'mercedes', name: 'Mercedes-Benz' },
  { slug: 'audi', name: 'Audi' },
  { slug: 'volkswagen', name: 'Volkswagen' },
  { slug: 'toyota', name: 'Toyota' },
  { slug: 'opel', name: 'Opel' },
  { slug: 'ford', name: 'Ford' },
  { slug: 'peugeot', name: 'Peugeot' },
  { slug: 'renault', name: 'Renault' },
  { slug: 'hyundai', name: 'Hyundai' },
  { slug: 'kia', name: 'Kia' },
  { slug: 'skoda', name: 'Škoda' },
  { slug: 'nissan', name: 'Nissan' },
  { slug: 'honda', name: 'Honda' },
  { slug: 'mazda', name: 'Mazda' },
  { slug: 'fiat', name: 'Fiat' },
  { slug: 'citroen', name: 'Citroën' },
  { slug: 'volvo', name: 'Volvo' },
  { slug: 'seat', name: 'SEAT' },
  { slug: 'dacia', name: 'Dacia' },
];

const FooterLinksContainer = styled.nav`
  padding: 2rem 1rem;
  background: ${({ theme }) => theme.colors?.background || '#f8f9fa'};
  border-top: 1px solid ${({ theme }) => theme.colors?.border || '#e2e8f0'};
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.colors?.text || '#1a1a2e'};
`;

const LinksGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const StyledLink = styled(Link)`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.primary || '#3B82F6'};
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors?.primaryLight || 'rgba(59, 130, 246, 0.1)'};
    text-decoration: underline;
  }
`;

const SEOFooterLinks: React.FC = () => {
  return (
    <FooterLinksContainer aria-label="Навигация по градове и марки">
      <Section>
        <SectionTitle>Коли по градове</SectionTitle>
        <LinksGrid>
          {BULGARIAN_CITIES.map((city) => (
            <StyledLink key={city.slug} to={`/koli/${city.slug}`}>
              Коли в {city.name}
            </StyledLink>
          ))}
        </LinksGrid>
      </Section>
      <Section>
        <SectionTitle>Коли по марки</SectionTitle>
        <LinksGrid>
          {TOP_BRANDS.map((brand) => (
            <StyledLink key={brand.slug} to={`/marka/${brand.slug}`}>
              {brand.name}
            </StyledLink>
          ))}
        </LinksGrid>
      </Section>
      <Section>
        <SectionTitle>Полезни връзки</SectionTitle>
        <LinksGrid>
          <StyledLink to="/search">Търсене на коли</StyledLink>
          <StyledLink to="/sell">Продай кола</StyledLink>
          <StyledLink to="/financing">Финансиране</StyledLink>
          <StyledLink to="/about">За нас</StyledLink>
          <StyledLink to="/contact">Контакти</StyledLink>
        </LinksGrid>
      </Section>
    </FooterLinksContainer>
  );
};

export default SEOFooterLinks;
