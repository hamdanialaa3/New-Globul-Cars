// Smart Footer Component with Global Translation Support
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { MapPin, Phone, Mail, Globe, Facebook, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageDropdownOpen]);

  const handleLanguageChange = (lang: 'bg' | 'en') => {
    setLanguage(lang);
    setIsLanguageDropdownOpen(false);
  };

  // Hide footer on /cars page
  if (location.pathname === '/cars') {
    return null;
  }

  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Footer Content */}
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-brand">
              <img
                src="/Logo1.png"
                alt="Koli One Logo"
                className="footer-logo footer-logo-enhanced"
                style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Logo1.png';
                }}
              />
              <h3 className="footer-title">Koli One</h3>
            </div>
            <p className="footer-description">
              {t('footer.description')}
            </p>
            <div className="footer-stats">
              <div className="stat-item">
                <span className="stat-number">15,000+</span>
                <span className="stat-label">{t('home.stats.cars')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">8,500+</span>
                <span className="stat-label">{t('home.stats.satisfiedCustomers')}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.quickLinks')}</h4>
            <ul className="footer-links">
              <li><a href="/">{t('nav.home')}</a></li>
              <li><a href="/cars">{t('nav.cars')}</a></li>
              <li><a href="/advanced-search">{t('nav.advancedSearch')}</a></li>
              <li><a href="/sell">{t('nav.sell')}</a></li>
              <li><a href="/brand-gallery">{t('nav.brandGallery')}</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.services')}</h4>
            <ul className="footer-links">
              <li><a href="/finance">{t('home.features.finance.title')}</a></li>
              <li><a href="/insurance">{t('home.features.insurance.title')}</a></li>
              <li><a href="/verification">{t('home.features.verified.title')}</a></li>
              <li><a href="/support">{t('footer.support')}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.contact')}</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">
                  <MapPin size={18} />
                </span>
                <span>{t('footer.address')}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <Phone size={18} />
                </span>
                <span>+359 2 123 4567</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <Mail size={18} />
                </span>
                <span>info@koli.one</span>
              </div>
              <div className="contact-item">
                <a
                  href="https://www.facebook.com/people/Bulgarian-Car-Marketplace/100080260449528/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="facebook-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <span className="contact-icon">
                    <Facebook size={18} />
                  </span>
                  <span>{language === 'bg' ? 'Последвайте ни във Facebook' : 'Follow us on Facebook'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-bottom-main">
              <p className="copyright">
                © {currentYear} Koli One. {t('footer.rights')}
              </p>
              <div className="footer-bottom-links">
                <a href="/privacy-policy">{t('footer.privacy')}</a>
                <a href="/terms-of-service">{t('footer.terms')}</a>
                <a href="/cookie-policy">{t('footer.cookies')}</a>
                <a href="/data-deletion">{t('footer.dataDeletion')}</a>
              </div>
            </div>
            <div className="footer-bottom-language">
              <div className="language-info" ref={languageDropdownRef}>
              <button
                className="language-dropdown-button"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                aria-label={language === 'bg' ? 'Избери език' : 'Select language'}
                aria-expanded={isLanguageDropdownOpen}
              >
                <img
                  src={language === 'bg' ? 'https://flagcdn.com/w20/bg.png' : 'https://flagcdn.com/w20/gb.png'}
                  alt={language === 'bg' ? 'Български' : 'English'}
                  className="flag-icon"
                />
                <span>{language === 'bg' ? 'Български' : 'English'}</span>
                <ChevronDown 
                  size={14} 
                  style={{ 
                    marginLeft: '6px',
                    transform: isLanguageDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} 
                />
              </button>
              {isLanguageDropdownOpen && (
                <div className="language-dropdown-menu">
                  <button
                    className={`language-option ${language === 'bg' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('bg')}
                  >
                    <img
                      src="https://flagcdn.com/w20/bg.png"
                      alt="Български"
                      className="flag-icon"
                    />
                    <span>Български</span>
                    {language === 'bg' && <span className="check-mark">✓</span>}
                  </button>
                  <button
                    className={`language-option ${language === 'en' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    <img
                      src="https://flagcdn.com/w20/gb.png"
                      alt="English"
                      className="flag-icon"
                    />
                    <span>English</span>
                    {language === 'en' && <span className="check-mark">✓</span>}
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;