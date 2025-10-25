import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './CarCarousel3D.css';

interface CarSlide {
  id: number;
  image: string;
  title: {
    bg: string;
    en: string;
  };
  description: {
    bg: string;
    en: string;
  };
  buttonText: {
    bg: string;
    en: string;
  };
  category: string;
}

/**
 * 3D Car Carousel Component
 * Professional 3D rotating carousel showcasing car safety and buying tips
 */
const CarCarousel3D: React.FC = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isVisible, setIsVisible] = useState(false); // ✅ Track visibility
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentRotation = useRef(0);

  // Car slides data with safety and buying tips
  const slides: CarSlide[] = [
    {
      id: 1,
      image: '/assets/images/Pic/pexels-axp-photography-500641970-19573775.jpg',
      title: {
        bg: 'Безопасност на първо място',
        en: 'Safety First'
      },
      description: {
        bg: 'Проверете винаги техническата изправност на автомобила преди покупка. В България, задължителна е годишна техническа проверка за автомобили над 4 години.',
        en: 'Always check the technical condition of the vehicle before purchase. In Bulgaria, annual technical inspection is mandatory for cars over 4 years old.'
      },
      buttonText: {
        bg: 'Научи повече',
        en: 'Learn More'
      },
      category: 'safety'
    },
    {
      id: 2,
      image: '/assets/images/Pic/pexels-bylukemiller-29566896.jpg',
      title: {
        bg: 'Изберете правилния автомобил',
        en: 'Choose the Right Car'
      },
      description: {
        bg: 'Размислете за вашите нужди - градско шофиране, дълги пътувания или семейни нужди. Проверете разхода на гориво и разходите за поддръжка.',
        en: 'Consider your needs - city driving, long trips, or family requirements. Check fuel consumption and maintenance costs.'
      },
      buttonText: {
        bg: 'Разгледай',
        en: 'Explore'
      },
      category: 'buying'
    },
    {
      id: 3,
      image: '/assets/images/Pic/pexels-james-collington-2147687246-30772805.jpg',
      title: {
        bg: 'Правила за безопасно шофиране',
        en: 'Safe Driving Rules'
      },
      description: {
        bg: 'Използвайте винаги предпазни колани. Скоростните ограничения в България: 50 км/ч в града, 90 км/ч извън града, 140 км/ч на магистрала.',
        en: 'Always use seat belts. Speed limits in Bulgaria: 50 km/h in cities, 90 km/h outside cities, 140 km/h on highways.'
      },
      buttonText: {
        bg: 'Прочети повече',
        en: 'Read More'
      },
      category: 'safety'
    },
    {
      id: 4,
      image: '/assets/images/Pic/pexels-maoriginalphotography-1454253.jpg',
      title: {
        bg: 'Проверка на историята',
        en: 'Vehicle History Check'
      },
      description: {
        bg: 'Преди покупка, проверете историята на автомобила чрез CARFAX или подобни услуги. Проверете за инциденти, повреди и реален пробег.',
        en: 'Before purchasing, check the vehicle history through CARFAX or similar services. Check for incidents, damages, and actual mileage.'
      },
      buttonText: {
        bg: 'Провери сега',
        en: 'Check Now'
      },
      category: 'buying'
    },
    {
      id: 5,
      image: '/assets/images/Pic/pexels-pixabay-315938.jpg',
      title: {
        bg: 'Зимна подготовка',
        en: 'Winter Preparation'
      },
      description: {
        bg: 'В България зимните гуми са задължителни от 15 ноември до 1 март. Проверете антифриза, акумулатора и чистачките преди зимния сезон.',
        en: 'In Bulgaria, winter tires are mandatory from November 15 to March 1. Check antifreeze, battery, and wipers before winter season.'
      },
      buttonText: {
        bg: 'Подготви се',
        en: 'Get Ready'
      },
      category: 'safety'
    },
    {
      id: 6,
      image: '/assets/images/Pic/pexels-rockwell-branding-agency-85164430-9137238.jpg',
      title: {
        bg: 'Финансиране и застраховка',
        en: 'Financing & Insurance'
      },
      description: {
        bg: 'Проучете различните опции за финансиране и застраховка. Задължителна е Гражданска отговорност (ГО). Каско е препоръчително за нови автомобили.',
        en: 'Research different financing and insurance options. Civil liability (GO) insurance is mandatory. Comprehensive insurance (Casco) is recommended for new cars.'
      },
      buttonText: {
        bg: 'Сравни цени',
        en: 'Compare Prices'
      },
      category: 'buying'
    }
  ];

  const totalSlides = slides.length;
  const angleIncrement = useMemo(() => 360 / totalSlides, [totalSlides]);

  // ✅ Intersection Observer - Pause rotation when not visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // ✅ Memoized rotate function
  const rotateCarousel = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
      setRotation((prev) => prev + angleIncrement);
    } else {
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
      setRotation((prev) => prev - angleIncrement);
    }
  }, [totalSlides, angleIncrement]);

  // ✅ Auto-rotate carousel (only when visible) - Optimized for performance
  useEffect(() => {
    if (!isVisible) return; // ✅ Don't rotate if not visible

    const interval = setInterval(() => {
      rotateCarousel('next');
    }, 7000); // ✅ Rotate every 7 seconds (reduced frequency for better performance)

    return () => clearInterval(interval);
  }, [rotateCarousel, isVisible]); // ✅ Only rotate when visible

  // ✅ Memoized mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    currentRotation.current = rotation;
  }, [rotation]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - startX.current;
    const rotationDelta = deltaX * 0.5; // Sensitivity
    setRotation(currentRotation.current + rotationDelta);
  }, []); // ✅ No dependencies - uses refs only

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    // Snap to nearest slide
    setRotation((currentRotation) => {
      const nearestIndex = Math.round(-currentRotation / angleIncrement) % totalSlides;
      const normalizedIndex = (nearestIndex + totalSlides) % totalSlides;
      setCurrentIndex(normalizedIndex);
      return -normalizedIndex * angleIncrement;
    });
  }, [angleIncrement, totalSlides]);

  // ✅ Memoized touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
    currentRotation.current = rotation;
  }, [rotation]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.touches[0].clientX - startX.current;
    const rotationDelta = deltaX * 0.5;
    setRotation(currentRotation.current + rotationDelta);
  }, []); // ✅ No dependencies - uses refs only

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  const currentSlide = slides[currentIndex];

  return (
    <section className="carousel-3d-section" ref={sectionRef}>
      <div className="carousel-3d-container">
        {/* Header */}
        <div className="carousel-3d-header">
          <h2 className="carousel-3d-title">
            {language === 'bg' 
              ? 'Вашият пътеводител за безопасно шофиране и покупка' 
              : 'Your Guide to Safe Driving & Buying'}
          </h2>
          <p className="carousel-3d-subtitle">
            {language === 'bg'
              ? 'Научете всичко необходимо за избор, покупка и безопасно управление на автомобил в България'
              : 'Learn everything you need about choosing, buying, and safely driving a car in Bulgaria'}
          </p>
        </div>

        {/* 3D Carousel */}
        <div className="carousel-3d-wrapper">
          <div
            className="carousel-3d"
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="carousel-3d-inner"
              style={{
                transform: `rotateY(${rotation}deg)`
              }}
            >
              {slides.map((slide, index) => {
                const angle = index * angleIncrement;
                const isActive = index === currentIndex;
                
                return (
                  <div
                    key={slide.id}
                    className={`carousel-slide ${isActive ? 'active' : ''}`}
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(450px)`
                    }}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title[language]}
                      className="slide-image"
                      loading="lazy"
                    />
                    <div className={`slide-overlay ${isActive ? 'visible' : ''}`}>
                      <span className="slide-category">{slide.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Box */}
          <div className={`carousel-content ${currentSlide ? 'visible' : ''}`}>
            <h3 className="content-title">{currentSlide.title[language]}</h3>
            <p className="content-description">{currentSlide.description[language]}</p>
            <button className="content-button">
              {currentSlide.buttonText[language]}
            </button>
          </div>

          {/* Navigation Arrows */}
          <button
            className="carousel-nav carousel-nav-prev"
            onClick={() => rotateCarousel('prev')}
            aria-label="Previous"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="carousel-nav carousel-nav-next"
            onClick={() => rotateCarousel('next')}
            aria-label="Next"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentIndex(index);
                setRotation(-index * angleIncrement);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarCarousel3D;

