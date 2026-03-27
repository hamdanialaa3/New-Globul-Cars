// Horizontal Scroll Container - Professional Horizontal Scrolling with Navigation Arrows
// حاوية التمرير الأفقي - تمرير أفقي احترافي مع أسهم التنقل

import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ScrollWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ScrollContainer = styled.div`
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  gap: ${props => props.$gap || '1.5rem'};
  padding: ${props => props.$padding || '0'};
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 215, 0, 0.3) transparent' 
    : 'rgba(139, 92, 246, 0.3) transparent'};
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(255, 215, 0, 0.3)' 
      : 'rgba(139, 92, 246, 0.3)'};
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => theme.mode === 'dark' 
        ? 'rgba(255, 215, 0, 0.5)' 
        : 'rgba(139, 92, 246, 0.5)'};
    }
  }
  
  /* Hide scrollbar on mobile but keep functionality */
  @media (max-width: 768px) {
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const ScrollButton = styled.button<{ $position: 'left' | 'right'; $visible: boolean }>`
  position: absolute;
  top: 50%;
  ${props => props.$position === 'left' ? 'left: -20px;' : 'right: -20px;'}
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  min-width: 50px;
  min-height: 50px;
  max-width: 50px;
  max-height: 50px;
  border-radius: 50%;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 215, 0, 0.25)' 
    : 'rgba(139, 92, 246, 0.25)'};
  border: 2px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 215, 0, 0.5)' 
    : 'rgba(139, 92, 246, 0.5)'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#3B82F6'};
  display: ${props => props.$visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ theme }) => theme.mode === 'dark' 
    ? '0 4px 12px rgba(255, 215, 0, 0.2)' 
    : '0 4px 12px rgba(139, 92, 246, 0.2)'};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(255, 215, 0, 0.4)' 
      : 'rgba(139, 92, 246, 0.4)'};
    border-color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#3B82F6'};
    transform: translateY(-50%) scale(1.1);
    box-shadow: ${({ theme }) => theme.mode === 'dark' 
      ? '0 6px 16px rgba(255, 215, 0, 0.3)' 
      : '0 6px 16px rgba(139, 92, 246, 0.3)'};
  }
  
  &:active {
    transform: translateY(-50%) scale(1.05);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  svg {
    width: 24px;
    height: 24px;
    stroke-width: 2.5;
    flex-shrink: 0;
    display: block;
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    min-width: 50px;
    min-height: 50px;
    max-width: 50px;
    max-height: 50px;
    ${props => props.$position === 'left' ? 'left: -15px;' : 'right: -15px;'}
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    min-width: 50px;
    min-height: 50px;
    max-width: 50px;
    max-height: 50px;
    ${props => props.$position === 'left' ? 'left: -12px;' : 'right: -12px;'}
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  gap?: string;
  padding?: string;
  itemMinWidth?: string;
  showArrows?: boolean;
  className?: string;
}

const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({
  children,
  gap = '1.5rem',
  padding = '0',
  itemMinWidth = '280px',
  showArrows = true,
  className
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    checkScrollButtons();
    scrollElement.addEventListener('scroll', checkScrollButtons);
    
    // Check on resize
    const resizeObserver = new ResizeObserver(checkScrollButtons);
    resizeObserver.observe(scrollElement);

    return () => {
      scrollElement.removeEventListener('scroll', checkScrollButtons);
      resizeObserver.disconnect();
    };
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    const targetScroll = direction === 'left' 
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;
    
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <ScrollWrapper className={className}>
      {showArrows && (
        <>
          <ScrollButton
            $position="left"
            $visible={showLeftArrow}
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft />
          </ScrollButton>
          <ScrollButton
            $position="right"
            $visible={showRightArrow}
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight />
          </ScrollButton>
        </>
      )}
      <ScrollContainer
        ref={scrollRef}
        $gap={gap}
        $padding={padding}
        style={{
          // Ensure items don't shrink
          '--item-min-width': itemMinWidth
        } as React.CSSProperties}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            style={{
              ...(itemMinWidth !== 'auto' ? { minWidth: itemMinWidth } : {}),
              flexShrink: 0
            }}
          >
            {child}
          </div>
        ))}
      </ScrollContainer>
    </ScrollWrapper>
  );
};

export default HorizontalScrollContainer;


