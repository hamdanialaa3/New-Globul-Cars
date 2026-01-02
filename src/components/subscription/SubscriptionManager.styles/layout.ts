import defaultStyled from 'styled-components';

const styled = defaultStyled;
import { fadeInUp } from './animations';

export const Container = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const PlansCarousel = styled.div`
  position: relative;
  margin-top: 3rem;
`;

export const PlansViewport = styled.div`
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  overflow-y: visible;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding: 0.25rem 0.25rem 1rem;
  scroll-padding: 0.25rem;

  /* Hide scrollbar (cross-browser) */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  /* Prevent vertical stacking at all widths */
  flex-wrap: nowrap;

  /* Desktop: keep 3 cards visible; still no wrap */
  @media (min-width: 1201px) {
    overflow-x: hidden;
    justify-content: center;
  }

  /* ✅ Mobile portrait: show ONE full card (no peeking) */
  @media (max-width: 600px) {
    gap: 0;
    padding: 0 0 1rem;
    scroll-padding: 0;
  }
`;

export const CarouselItem = styled.div`
  flex: 0 0 360px;
  scroll-snap-align: center;
  scroll-snap-stop: always;

  @media (max-width: 900px) {
    flex-basis: 340px;
  }

  @media (max-width: 600px) {
    /* One card per viewport width */
    flex: 0 0 100%;
    scroll-snap-align: start;
  }
`;

export const ExpandOverlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: ${({ $open }) => ($open ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
`;

export const ExpandSheet = styled.div`
  width: min(520px, 94vw);
  max-height: 90vh;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 18px;
`;

export const ExpandHint = styled.div`
  margin-top: 10px;
  text-align: center;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  user-select: none;
`;
