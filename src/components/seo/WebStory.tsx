/**
 * WebStory.tsx
 * 📱 Google Web Stories Component
 * 
 * Web Stories appear in:
 * - Google Discover
 * - Google Search (Stories carousel)
 * - Google Images
 * 
 * Based on AMP Stories format for maximum compatibility.
 * 
 * @author SEO Supremacy System
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import styled, { keyframes } from 'styled-components';

// ============================================================================
// TYPES
// ============================================================================

export interface WebStorySlide {
    id: string;
    type: 'image' | 'video';
    src: string;
    alt?: string;
    headline?: string;
    description?: string;
    ctaText?: string;
    ctaUrl?: string;
    duration?: number; // seconds
}

export interface WebStoryData {
    id: string;
    title: string;
    publisher: string;
    publisherLogo: string;
    posterImage: string;
    slides: WebStorySlide[];
    publishedDate: string;
    modifiedDate?: string;
}

interface WebStoryProps {
    story: WebStoryData;
    onClose?: () => void;
    onSlideChange?: (index: number) => void;
}

// ============================================================================
// ANIMATIONS
// ============================================================================

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const progressFill = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StoryContainer = styled.div`
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999;
  display: flex;
  flex-direction: column;
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
`;

const ProgressSegment = styled.div<{ $active: boolean; $completed: boolean; $duration: number }>`
  flex: 1;
  height: 3px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: #fff;
    width: ${props => props.$completed ? '100%' : '0%'};
    animation: ${props => props.$active ? progressFill : 'none'} ${props => props.$duration}s linear forwards;
  }
`;

const Header = styled.div`
  position: absolute;
  top: 24px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
`;

const PublisherLogo = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
`;

const PublisherInfo = styled.div`
  flex: 1;
`;

const PublisherName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`;

const StoryDate = styled.div`
  font-size: 12px;
  color: rgba(255,255,255,0.7);
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

const SlideContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const Slide = styled.div<{ $active: boolean }>`
  position: absolute;
  inset: 0;
  display: ${props => props.$active ? 'flex' : 'none'};
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-out;
`;

const SlideMedia = styled.div`
  position: absolute;
  inset: 0;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SlideOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.8) 0%,
    rgba(0,0,0,0.4) 30%,
    transparent 60%
  );
`;

const SlideContent = styled.div`
  position: absolute;
  bottom: 80px;
  left: 16px;
  right: 16px;
  animation: ${slideUp} 0.5s ease-out;
`;

const SlideHeadline = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
`;

const SlideDescription = styled.p`
  font-size: 16px;
  color: rgba(255,255,255,0.9);
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #fff;
  color: #000;
  font-weight: 600;
  font-size: 14px;
  border-radius: 24px;
  text-decoration: none;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const NavigationOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  z-index: 5;
`;

const NavZone = styled.div`
  flex: 1;
  cursor: pointer;
`;

// ============================================================================
// COMPONENT
// ============================================================================

export const WebStory: React.FC<WebStoryProps> = ({
    story,
    onClose,
    onSlideChange,
}) => {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);

    const slide = story.slides[currentSlide];
    const slideDuration = slide?.duration || 5;

    // Auto-advance slides
    React.useEffect(() => {
        if (isPaused) return;

        const timer = setTimeout(() => {
            if (currentSlide < story.slides.length - 1) {
                setCurrentSlide(prev => prev + 1);
            } else {
                onClose?.();
            }
        }, slideDuration * 1000);

        return () => clearTimeout(timer);
    }, [currentSlide, isPaused, slideDuration, story.slides.length, onClose]);

    // Notify parent of slide change
    React.useEffect(() => {
        onSlideChange?.(currentSlide);
    }, [currentSlide, onSlideChange]);

    const goToPrevious = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const goToNext = () => {
        if (currentSlide < story.slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            onClose?.();
        }
    };

    const handleTouch = () => {
        setIsPaused(true);
    };

    const handleRelease = () => {
        setIsPaused(false);
    };

    // Generate Web Story schema
    const webStorySchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: story.title,
        image: story.posterImage,
        datePublished: story.publishedDate,
        dateModified: story.modifiedDate || story.publishedDate,
        author: {
            '@type': 'Organization',
            name: story.publisher,
            logo: story.publisherLogo,
        },
        publisher: {
            '@type': 'Organization',
            name: story.publisher,
            logo: {
                '@type': 'ImageObject',
                url: story.publisherLogo,
            },
        },
    };

    return (
        <>
            <Helmet>
                <title>{story.title} | Web Story</title>
                <meta name="robots" content="max-image-preview:large" />
                <script type="application/ld+json">
                    {JSON.stringify(webStorySchema)}
                </script>
            </Helmet>

            <StoryContainer>
                {/* Progress bar */}
                <ProgressBar>
                    {story.slides.map((s, index) => (
                        <ProgressSegment
                            key={s.id}
                            $active={index === currentSlide}
                            $completed={index < currentSlide}
                            $duration={s.duration || 5}
                        />
                    ))}
                </ProgressBar>

                {/* Header */}
                <Header>
                    <PublisherLogo src={story.publisherLogo} alt={story.publisher} />
                    <PublisherInfo>
                        <PublisherName>{story.publisher}</PublisherName>
                        <StoryDate>{new Date(story.publishedDate).toLocaleDateString()}</StoryDate>
                    </PublisherInfo>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </Header>

                {/* Slides */}
                <SlideContainer
                    onMouseDown={handleTouch}
                    onMouseUp={handleRelease}
                    onTouchStart={handleTouch}
                    onTouchEnd={handleRelease}
                >
                    {story.slides.map((s, index) => (
                        <Slide key={s.id} $active={index === currentSlide}>
                            <SlideMedia>
                                {s.type === 'video' ? (
                                    <video src={s.src} autoPlay muted loop playsInline />
                                ) : (
                                    <img src={s.src} alt={s.alt || s.headline || ''} />
                                )}
                            </SlideMedia>
                            <SlideOverlay />
                            <SlideContent>
                                {s.headline && <SlideHeadline>{s.headline}</SlideHeadline>}
                                {s.description && <SlideDescription>{s.description}</SlideDescription>}
                                {s.ctaText && s.ctaUrl && (
                                    <CTAButton href={s.ctaUrl}>
                                        {s.ctaText}
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                        </svg>
                                    </CTAButton>
                                )}
                            </SlideContent>
                        </Slide>
                    ))}

                    {/* Navigation zones */}
                    <NavigationOverlay>
                        <NavZone onClick={goToPrevious} />
                        <NavZone onClick={goToNext} />
                    </NavigationOverlay>
                </SlideContainer>
            </StoryContainer>
        </>
    );
};

// ============================================================================
// HELPER: Generate Web Story from Car
// ============================================================================

export function generateCarWebStory(car: any, sellerName: string): WebStoryData {
    const images = car.images || [];

    return {
        id: `car-story-${car.id}`,
        title: `${car.make} ${car.model} ${car.year} - ${car.price}€`,
        publisher: 'Koli One',
        publisherLogo: 'https://koli.one/logo192.png',
        posterImage: images[0] || 'https://koli.one/images/placeholder.png',
        publishedDate: car.createdAt || new Date().toISOString(),
        slides: [
            // Intro slide
            {
                id: 'intro',
                type: 'image' as const,
                src: images[0] || 'https://koli.one/images/placeholder.png',
                headline: `${car.make} ${car.model}`,
                description: `${car.year} • ${car.mileage?.toLocaleString() || 'N/A'} км`,
                duration: 5,
            },
            // Price slide
            {
                id: 'price',
                type: 'image' as const,
                src: images[1] || images[0],
                headline: `${car.price?.toLocaleString()}€`,
                description: car.fuelType && car.transmission
                    ? `${car.fuelType} • ${car.transmission}`
                    : 'Вижте детайлите',
                duration: 4,
            },
            // Gallery slides
            ...images.slice(2, 5).map((img: string, index: number) => ({
                id: `gallery-${index}`,
                type: 'image' as const,
                src: img,
                duration: 3,
            })),
            // CTA slide
            {
                id: 'cta',
                type: 'image' as const,
                src: images[0],
                headline: 'Заинтересувани?',
                description: `Свържете се с ${sellerName}`,
                ctaText: 'Виж обявата',
                ctaUrl: `/car/${car.sellerNumericId}/${car.carNumericId}`,
                duration: 6,
            },
        ],
    };
}

export default WebStory;
