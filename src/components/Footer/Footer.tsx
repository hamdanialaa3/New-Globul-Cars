// Smart Footer Component with Global Translation Support
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { MapPin, Phone, Mail, Globe, Facebook, Instagram, Linkedin, Youtube, Twitter, ChevronDown, Share2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { SOCIAL_LINKS } from '../../constants/socialLinks';
import './Footer.css';

const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const blogUrl = 'https://koli-one.blogspot.com/';

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
              <picture>
                <source srcSet="/logo-40.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="Koli One Logo"
                  className="footer-logo"
                  width={40}
                  height={40}
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </picture>
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
              <li>
                <a href={blogUrl} target="_blank" rel="noopener noreferrer">
                  {language === 'bg' ? 'Блог' : 'Blog'}
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.services')}</h4>
            <ul className="footer-links">
              <li><a href="/finance">{t('home.features.finance.title')}</a></li>
              <li><a href="/financing">{language === 'bg' ? 'Калкулатор за финансиране' : 'Financing Calculator'}</a></li>
              <li><a href="/verification">{t('home.features.verified.title')}</a></li>
              <li><a href="/support">{t('footer.support')}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-subtitle">{language === 'bg' ? 'Контакт' : 'Contact'}</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">
                  <MapPin size={18} />
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ fontSize: '0.95em' }}>
                    {language === 'bg' ? 'Алаа Технолоджи' : 'Alaa Technology'}
                  </strong>
                  <span>
                    {language === 'bg'
                      ? 'бул. Цар Симеон 77, София, България'
                      : '77 Tsar Simeon Str., Sofia, Bulgaria'}
                  </span>
                </span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <Phone size={18} />
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>+359 87 983 9671</span>
                  <span style={{ fontSize: '0.85em', opacity: 0.8 }}>
                    ({language === 'bg' ? 'Само текст/чат' : 'Text/Chat Only'})
                  </span>
                </span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <Mail size={18} />
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span><strong>{language === 'bg' ? 'Поддержка:' : 'Support:'}</strong> support@koli.one</span>
                  <span style={{ fontSize: '0.9em', opacity: 0.8 }}><strong>{language === 'bg' ? 'Продажби:' : 'Sales:'}</strong> sales@koli.one</span>
                  <span style={{ fontSize: '0.9em', opacity: 0.8 }}><strong>{language === 'bg' ? 'AI помощ:' : 'AI Help:'}</strong> ai@koli.one</span>
                </span>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <h4 className="footer-subtitle" style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
                {language === 'bg' ? 'Последвайте ни' : 'Follow Us'}
              </h4>
              <div style={{ marginBottom: '1rem' }}>
                <a href="/social-hub" className="social-hub-link" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  marginBottom: '10px'
                }}>
                  <Share2 size={18} />
                  {language === 'bg' ? 'Социален център' : 'Social Hub'}
                </a>
              </div>
              <div className="social-links" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer"
                  className="social-link" title="Facebook" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer"
                  className="social-link" title="Instagram" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer"
                  className="social-link" title="YouTube" aria-label="YouTube">
                  <Youtube size={20} />
                </a>
                <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer"
                  className="social-link" title="LinkedIn" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
                <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer"
                  className="social-link" title="X (Twitter)" aria-label="X (Twitter)">
                  <Twitter size={20} />
                </a>
                <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer"
                  className="social-link" title="TikTok" aria-label="TikTok">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
                <a href={SOCIAL_LINKS.threads} target="_blank" rel="noopener noreferrer"
                  className="social-link" title="Threads" aria-label="Threads">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126 1.974a11.881 11.881 0 0 0-2.588-.12c-1.014.057-1.83.339-2.43.84-.537.449-.827 1.014-.794 1.546.032.496.296.936.764 1.273.555.4 1.27.574 2.068.527 1.06-.058 1.857-.4 2.37-1.016.45-.54.73-1.314.833-2.3-.73-.244-1.485-.43-2.252-.555-2.81-.457-5.03.196-6.61 1.942-1.298 1.437-1.946 3.305-1.875 5.403.07 2.098.948 3.834 2.541 5.02 1.412.952 3.14 1.43 5.14 1.43 3.302 0 5.83-1.218 7.513-3.619 1.31-1.869 1.972-4.302 1.972-7.236 0-2.933-.663-5.366-1.972-7.236-1.683-2.401-4.21-3.619-7.513-3.619z" />
                  </svg>
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
                © {currentYear} Alaa Technology. {language === 'bg' ? 'Всички права запазени.' : 'All rights reserved.'}<br />
                <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
                  {language === 'bg'
                    ? 'GDPR и Закон за защита на личните данни на България - Съответствие'
                    : 'GDPR & Bulgarian Data Protection Act - Compliant'}
                </span>
              </p>
              <div className="footer-bottom-links">
                <a href="/privacy-policy">{language === 'bg' ? 'Политика за поверителност' : 'Privacy Policy'}</a>
                <a href="/terms-of-service">{language === 'bg' ? 'Условия за ползване' : 'Terms of Service'}</a>
                <a href="/cookie-policy">{language === 'bg' ? 'Политика за бисквитки' : 'Cookie Policy'}</a>
                <a href="/data-deletion">{language === 'bg' ? 'Изтриване на данни' : 'Data Deletion'}</a>
                <a href={blogUrl} target="_blank" rel="noopener noreferrer">
                  {language === 'bg' ? 'Блог' : 'Blog'}
                </a>
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