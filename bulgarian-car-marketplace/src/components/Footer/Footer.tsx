// Smart Footer Component with Global Translation Support
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Footer Content */}
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-brand">
              <img 
                src="/globul-logo.png" 
                alt="Globul Cars Logo" 
                className="footer-logo"
                style={{ width: '50px', height: '50px', objectFit: 'contain' }}
              />
              <h3 className="footer-title">Globul</h3>
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
                  <MapPin size={18} color="#FF8F10" />
                </span>
                <span>{t('footer.address')}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <Phone size={18} color="#FF8F10" />
                </span>
                <span>+359 2 123 4567</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <Mail size={18} color="#FF8F10" />
                </span>
                <span>info@globulcars.bg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Globul. {t('footer.rights')}
            </p>
            <div className="footer-bottom-links">
              <a href="/privacy-policy">{t('footer.privacy')}</a>
              <a href="/terms-of-service">{t('footer.terms')}</a>
              <a href="/cookie-policy">{t('footer.cookies')}</a>
              <a href="/data-deletion">{t('footer.dataDeletion')}</a>
            </div>
            <div className="language-info">
              <span className="current-language">
                <Globe size={16} style={{ marginRight: '6px' }} />
                {language === 'bg' ? 'Български' : 'English'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;