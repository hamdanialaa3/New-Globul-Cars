/**
 * AspectRatioBox.tsx
 * 🎯 Core Web Vitals Fix - Prevents CLS (Cumulative Layout Shift)
 * 
 * This component reserves space for images/videos BEFORE they load,
 * ensuring CLS = 0.00 and perfect Google PageSpeed scores.
 * 
 * @author SEO Supremacy System
 */

import React from 'react';
import styled from 'styled-components';

// ============================================================================
// TYPES
// ============================================================================

export interface AspectRatioBoxProps {
    /** Aspect ratio as "width:height" e.g., "16:9", "4:3", "1:1", "3:4" */
    ratio?: string;
    /** Pre-calculated ratio (width / height) */
    ratioValue?: number;
    /** Background color while loading */
    backgroundColor?: string;
    /** Border radius */
    borderRadius?: string;
    /** Children to render inside */
    children: React.ReactNode;
    /** Additional className */
    className?: string;
}

// ============================================================================
// COMMON RATIOS
// ============================================================================

export const ASPECT_RATIOS = {
    'car-card': 4 / 3,      // Standard car card (landscape)
    'car-thumbnail': 16 / 9, // Wide thumbnail
    'car-gallery': 4 / 3,    // Gallery image
    'story-vertical': 9 / 16, // Vertical story (mobile)
    'story-square': 1,       // Square story
    'profile-avatar': 1,     // Square avatar
    'profile-cover': 3 / 1,  // Wide cover photo
    'dealer-logo': 1,        // Square logo
} as const;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div<{
    $paddingBottom: string;
    $backgroundColor: string;
    $borderRadius: string;
}>`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: ${props => props.$paddingBottom};
  background-color: ${props => props.$backgroundColor};
  border-radius: ${props => props.$borderRadius};
  overflow: hidden;
  
  /* Skeleton animation while loading */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: rgba(139, 92, 246, 0.03);
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes skeleton-pulse {
    0%, 100% {
      background-color: rgba(139, 92, 246, 0.03);
      opacity: 0.6;
    }
    50% {
      background-color: rgba(139, 92, 246, 0.08);
      opacity: 1;
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
      background-color: rgba(139, 92, 246, 0.05);
    }
  }
`;

const Content = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  /* Ensure images fill the container */
  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AspectRatioBox - Prevents CLS by reserving space
 * 
 * Usage:
 * ```tsx
 * <AspectRatioBox ratio="16:9">
 *   <img src={carImage} alt="BMW X5" loading="lazy" />
 * </AspectRatioBox>
 * ```
 */
export const AspectRatioBox: React.FC<AspectRatioBoxProps> = ({
    ratio = '4:3',
    ratioValue,
    backgroundColor = 'var(--bg-tertiary, #1a1a2e)',
    borderRadius = '0',
    children,
    className,
}) => {
    // Calculate padding-bottom from ratio
    const calculatePaddingBottom = (): string => {
        if (ratioValue) {
            return `${(1 / ratioValue) * 100}%`;
        }

        const [width, height] = ratio.split(':').map(Number);
        if (!width || !height) return '75%'; // Default 4:3

        return `${(height / width) * 100}%`;
    };

    return (
        <Container
            $paddingBottom={calculatePaddingBottom()}
            $backgroundColor={backgroundColor}
            $borderRadius={borderRadius}
            className={className}
        >
            <Content>{children}</Content>
        </Container>
    );
};

// ============================================================================
// SKELETON SCREEN COMPONENTS
// ============================================================================

const SkeletonPulse = styled.div<{ $width?: string; $height?: string; $borderRadius?: string }>`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '20px'};
  border-radius: ${props => props.$borderRadius || '4px'};
  background-color: rgba(139, 92, 246, 0.03);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  
  @keyframes skeleton-pulse {
    0%, 100% {
      background-color: rgba(139, 92, 246, 0.03);
      opacity: 0.6;
    }
    50% {
      background-color: rgba(139, 92, 246, 0.08);
      opacity: 1;
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background-color: rgba(139, 92, 246, 0.05);
  }
`;

const CardSkeletonContainer = styled.div`
  background: var(--bg-secondary, #16213e);
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
`;

const SkeletonContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

/**
 * CarCardSkeleton - Skeleton screen for car cards
 * Prevents CLS during data loading
 */
export const CarCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
    <CardSkeletonContainer className={className}>
        <AspectRatioBox ratio="4:3" backgroundColor="var(--bg-tertiary, #1a1a2e)">
            <div /> {/* Empty placeholder */}
        </AspectRatioBox>
        <SkeletonContent>
            <SkeletonPulse $height="24px" $width="80%" />
            <SkeletonPulse $height="16px" $width="60%" />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <SkeletonPulse $height="32px" $width="33%" $borderRadius="8px" />
                <SkeletonPulse $height="32px" $width="33%" $borderRadius="8px" />
                <SkeletonPulse $height="32px" $width="33%" $borderRadius="8px" />
            </div>
            <SkeletonPulse $height="28px" $width="50%" />
        </SkeletonContent>
    </CardSkeletonContainer>
);

/**
 * StoryFeedSkeleton - Skeleton for story items
 */
export const StoryFeedSkeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div style={{ display: 'flex', gap: '12px' }} className={className}>
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ flexShrink: 0 }}>
                <SkeletonPulse $width="80px" $height="80px" $borderRadius="50%" />
                <div style={{ marginTop: '8px' }}>
                    <SkeletonPulse $width="60px" $height="12px" $borderRadius="4px" />
                </div>
            </div>
        ))}
    </div>
);

/**
 * DealerCardSkeleton - Skeleton for dealer cards
 */
export const DealerCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
    <CardSkeletonContainer className={className}>
        <AspectRatioBox ratio="3:1" backgroundColor="var(--bg-tertiary, #1a1a2e)">
            <div />
        </AspectRatioBox>
        <SkeletonContent>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <SkeletonPulse $width="60px" $height="60px" $borderRadius="50%" />
                <div style={{ flex: 1 }}>
                    <SkeletonPulse $height="20px" $width="70%" />
                    <div style={{ marginTop: '8px' }}>
                        <SkeletonPulse $height="14px" $width="50%" />
                    </div>
                </div>
            </div>
        </SkeletonContent>
    </CardSkeletonContainer>
);

export { SkeletonPulse };
export default AspectRatioBox;

