import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TopBrandsMenu.css';
import brandsData from '../../../data/car-brands-complete.json';
import translations from '../../../locales/brands.i18n.json';

interface TopBrandsMenuProps {
  language?: 'en' | 'bg';
}

const TopBrandsMenu: React.FC<TopBrandsMenuProps> = ({ language = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedBrand(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const popularBrands = brandsData.brands.filter(brand => brand.popular);

  return (
    <div className="top-brands-menu" ref={menuRef}>
      <button 
        className="top-brands-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {/* أيقونة سيارة */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M5 17h14v-5l-3-4H8l-3 4v5zm0 0v2m14-2v2M7 11h10M9 14h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{t.topBrands}</span>
        <svg 
          className={`arrow ${isOpen ? 'rotate' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>

      {isOpen && (
        <div className="top-brands-dropdown">
          <div className="brands-grid-container">
            {/* Popular Brands Grid */}
            <div className="popular-brands-section">
              <h3 className="section-title">{t.popularBrands}</h3>
              <div className="brands-grid">
                {popularBrands.map(brand => (
                  <div
                    key={brand.id}
                    className={`brand-card ${selectedBrand === brand.id ? 'active' : ''}`}
                    onMouseEnter={() => setSelectedBrand(brand.id)}
                  >
                    <Link 
                      to={`/browse/${brand.id}`}
                      className="brand-link"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="brand-logo-wrapper">
                        <img 
                          src={brand.logo} 
                          alt={brand.name}
                          className="brand-logo"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/brands/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="brand-info">
                        <h4 className="brand-name">{brand.name}</h4>
                        <p className="brand-stats">
                          {brand.totalSeries} {t.series}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Series Preview (if brand is hovered) */}
            {selectedBrand && (
              <div className="series-preview">
                {(() => {
                  const brand = brandsData.brands.find(b => b.id === selectedBrand);
                  if (!brand) return null;

                  return (
                    <>
                      <h3 className="section-title">{brand.name} {t.series}</h3>
                      <div className="series-list">
                        {brand.series.slice(0, 8).map(series => (
                          <Link
                            key={series.id}
                            to={`/browse/${brand.id}/${series.id}`}
                            className="series-item"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="series-name">{series.name}</span>
                            <span className="series-count">
                              {series.generations.length} {t.generation}
                            </span>
                          </Link>
                        ))}
                        {brand.series.length > 8 && (
                          <Link
                            to={`/browse/${brand.id}`}
                            className="series-item view-all"
                            onClick={() => setIsOpen(false)}
                          >
                            <span>{t.viewAll}</span>
                            <svg width="16" height="16" viewBox="0 0 16 16">
                              <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </Link>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* View All Brands Link */}
          <div className="dropdown-footer">
            <Link 
              to="/browse"
              className="view-all-link"
              onClick={() => setIsOpen(false)}
            >
              {t.allBrands}
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBrandsMenu;
