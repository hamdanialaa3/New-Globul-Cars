/**
 * CarStripSection.tsx
 * Horizontal scrolling strip of car cards – mobile.de style
 * شريط أفقي لبطاقات السيارات
 *
 * Features:
 * - Smooth horizontal scroll with snap
 * - Hidden scrollbar (clean look)
 * - "Show all ›" link
 * - Responsive card widths
 * - Dark/light theme via CSS vars
 */

import React, { useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CarSummary } from '../../types/car';
import { CarCardCompact } from './CarCardCompact';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Section = styled.section`
  width: 100%;
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

const HeaderLeft = styled.div``;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #1a202c);
  margin: 0;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: var(--text-secondary, #64748b);
  margin: 2px 0 0;
`;

const ShowAll = styled.a`
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-primary, #6366F1);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s;
  flex-shrink: 0;

  &:hover {
    color: var(--accent-dark, #E85A28);
    text-decoration: underline;
  }
`;

const ScrollWrap = styled.div`
  position: relative;
`;

const ScrollTrack = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding-bottom: 4px;

  /* Hide scrollbar */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CardSlot = styled.div`
  min-width: 250px;
  max-width: 280px;
  flex: 0 0 auto;
  scroll-snap-align: start;

  @media (max-width: 768px) {
    min-width: 220px;
    max-width: 260px;
  }
`;

const ArrowBtn = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => ($side === 'left' ? 'left: -16px;' : 'right: -16px;')}
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-primary, #e2e8f0);
  background: var(--bg-card, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 3;
  color: var(--text-primary, #1a202c);
  transition: background 0.15s, box-shadow 0.15s;

  &:hover {
    background: var(--bg-hover, #f0f0f0);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const EmptyState = styled.div`
  padding: 40px 0;
  text-align: center;
  background: var(--bg-section-light, #f7fafc);
  border-radius: 10px;
  border: 1px dashed var(--border-primary, #e2e8f0);
  color: var(--text-secondary, #64748b);
  font-size: 14px;
`;

// ============================================================================
// COMPONENT
// ============================================================================

interface Props {
  title: string;
  subtitle?: string;
  cars: CarSummary[];
  emptyStateText?: string;
  showAllHref?: string;
}

export const CarStripSection: React.FC<Props> = ({
  title,
  subtitle,
  cars,
  emptyStateText,
  showAllHref,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  if (!cars.length && !emptyStateText) return null;

  const checkArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = dir === 'left' ? -300 : 300;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkArrows, 350);
  };

  return (
    <Section>
      <Header>
        <HeaderLeft>
          <SectionTitle>{title}</SectionTitle>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </HeaderLeft>
        {showAllHref && <ShowAll href={showAllHref}>Show all ›</ShowAll>}
      </Header>

      {cars.length ? (
        <ScrollWrap>
          {canLeft && (
            <ArrowBtn $side="left" onClick={() => scroll('left')} aria-label="Scroll left">
              <ChevronLeft size={20} />
            </ArrowBtn>
          )}

          <ScrollTrack ref={scrollRef} onScroll={checkArrows}>
            {cars.map((car) => (
              <CardSlot key={car.id}>
                <CarCardCompact car={car} />
              </CardSlot>
            ))}
          </ScrollTrack>

          {canRight && cars.length > 3 && (
            <ArrowBtn $side="right" onClick={() => scroll('right')} aria-label="Scroll right">
              <ChevronRight size={20} />
            </ArrowBtn>
          )}
        </ScrollWrap>
      ) : (
        <EmptyState>{emptyStateText}</EmptyState>
      )}
    </Section>
  );
};

