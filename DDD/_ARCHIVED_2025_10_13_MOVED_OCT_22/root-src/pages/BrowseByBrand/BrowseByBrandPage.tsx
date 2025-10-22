import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './BrowseByBrandPage.css';
import brandsData from '../../../data/car-brands-complete.json';
import translations from '../../../locales/brands.i18n.json';

interface BrowseByBrandPageProps {
  language?: 'en' | 'bg';
  userCars?: any[]; // السيارات المضافة من المستخدمين
}

const BrowseByBrandPage: React.FC<BrowseByBrandPageProps> = ({ 
  language = 'en',
  userCars = [] 
}) => {
  const { brandId, seriesId, generationCode } = useParams();
  const navigate = useNavigate();
  const t = translations[language];

  const [filteredCars, setFilteredCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const currentBrand = brandsData.brands.find(b => b.id === brandId);
  const currentSeries = currentBrand?.series.find(s => s.id === seriesId);
  const currentGeneration = currentSeries?.generations.find(g => g.code === generationCode);

  useEffect(() => {
    // Filter cars based on selection
    setLoading(true);
    
    let filtered = [...userCars];

    if (brandId) {
      filtered = filtered.filter(car => car.brandId === brandId);
    }

    if (seriesId) {
      filtered = filtered.filter(car => car.seriesId === seriesId);
    }

    if (generationCode) {
      filtered = filtered.filter(car => car.generationCode === generationCode);
    }

    setTimeout(() => {
      setFilteredCars(filtered);
      setLoading(false);
    }, 300);
  }, [brandId, seriesId, generationCode, userCars]);

  // Render: All Brands View
  if (!brandId) {
    return (
      <div className="browse-page">
        <div className="browse-container">
          <div className="browse-header">
            <h1>{t.browseByBrand}</h1>
            <p className="subtitle">
              {t.total} {brandsData.statistics.totalBrands} {t.allBrands.toLowerCase()}
            </p>
          </div>

          <div className="brands-showcase-grid">
            {brandsData.brands.map(brand => (
              <Link
                key={brand.id}
                to={`/browse/${brand.id}`}
                className="brand-showcase-card"
              >
                <div className="brand-showcase-logo">
                  <img 
                    src={brand.logo} 
                    alt={brand.name}
                    onError={(e) => {
                      e.currentTarget.src = '/assets/brands/placeholder.svg';
                    }}
                  />
                </div>
                <div className="brand-showcase-info">
                  <h3>{brand.name}</h3>
                  <p className="brand-country">
                    {t.madeIn} {t.brandCountry[brand.country as keyof typeof t.brandCountry]}
                  </p>
                  <div className="brand-showcase-stats">
                    <span className="stat">
                      <strong>{brand.totalSeries}</strong> {t.series}
                    </span>
                  </div>
                </div>
                <svg className="arrow-icon" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render: Brand Selected - Show Series
  if (brandId && !seriesId) {
    return (
      <div className="browse-page">
        <div className="browse-container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link to="/browse">{t.allBrands}</Link>
            <span className="separator">/</span>
            <span>{currentBrand?.name}</span>
          </nav>

          {/* Brand Header */}
          <div className="brand-header">
            <div className="brand-header-logo">
              <img src={currentBrand?.logo} alt={currentBrand?.name} />
            </div>
            <div className="brand-header-info">
              <h1>{currentBrand?.name}</h1>
              <p className="brand-description">
                {t.madeIn} {t.brandCountry[currentBrand?.country as keyof typeof t.brandCountry]}
              </p>
              <div className="brand-header-stats">
                <span>{currentBrand?.totalSeries} {t.series}</span>
              </div>
            </div>
          </div>

          {/* Series Grid */}
          <div className="series-grid">
            {currentBrand?.series.map(series => (
              <Link
                key={series.id}
                to={`/browse/${brandId}/${series.id}`}
                className="series-card"
              >
                <div className="series-card-header">
                  <h3>{series.name}</h3>
                  <svg className="arrow-icon" width="20" height="20" viewBox="0 0 20 20">
                    <path d="M7 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="series-generations">
                  {series.generations.length} {t.generation}
                </p>
                <div className="series-years">
                  {series.generations[0]?.years} - {series.generations[series.generations.length - 1]?.years}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render: Series Selected - Show Generations
  if (brandId && seriesId && !generationCode) {
    return (
      <div className="browse-page">
        <div className="browse-container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link to="/browse">{t.allBrands}</Link>
            <span className="separator">/</span>
            <Link to={`/browse/${brandId}`}>{currentBrand?.name}</Link>
            <span className="separator">/</span>
            <span>{currentSeries?.name}</span>
          </nav>

          {/* Series Header */}
          <div className="series-header">
            <h1>{currentBrand?.name} {currentSeries?.name}</h1>
            <p>{currentSeries?.generations.length} {t.generation}</p>
          </div>

          {/* Generations Grid */}
          <div className="generations-grid">
            {currentSeries?.generations.map(generation => (
              <Link
                key={generation.code}
                to={`/browse/${brandId}/${seriesId}/${generation.code}`}
                className="generation-card"
              >
                <div className="generation-code">{generation.code}</div>
                <div className="generation-years">{generation.years}</div>
                <svg className="arrow-icon" width="20" height="20" viewBox="0 0 20 20">
                  <path d="M7 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render: Generation Selected - Show Cars or Coming Soon
  return (
    <div className="browse-page">
      <div className="browse-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/browse">{t.allBrands}</Link>
          <span className="separator">/</span>
          <Link to={`/browse/${brandId}`}>{currentBrand?.name}</Link>
          <span className="separator">/</span>
          <Link to={`/browse/${brandId}/${seriesId}`}>{currentSeries?.name}</Link>
          <span className="separator">/</span>
          <span>{currentGeneration?.code}</span>
        </nav>

        {/* Selection Header */}
        <div className="selection-header">
          <h1>
            {currentBrand?.name} {currentSeries?.name} {currentGeneration?.code}
          </h1>
          <p className="generation-years">{currentGeneration?.years}</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t.loading}</p>
          </div>
        )}

        {/* Cars Found */}
        {!loading && filteredCars.length > 0 && (
          <div className="cars-results">
            <p className="results-count">
              {filteredCars.length} {t.carsFound}
            </p>
            <div className="cars-grid">
              {filteredCars.map(car => (
                <div key={car.id} className="car-result-card">
                  <div className="car-image">
                    <img src={car.image} alt={car.title} />
                  </div>
                  <div className="car-details">
                    <h3>{car.title}</h3>
                    <p className="car-price">{car.price}</p>
                    <Link to={`/car/${car.id}`} className="view-details-btn">
                      {t.viewDetails}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Cars - Coming Soon */}
        {!loading && filteredCars.length === 0 && (
          <div className="coming-soon-state">
            <div className="coming-soon-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="38" stroke="#e5e7eb" strokeWidth="4"/>
                <path d="M40 20v20l14 14" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <h2>{t.noCarsMessage}</h2>
            <p>{t.comingSoonMessage}</p>
            <div className="coming-soon-actions">
              <Link to={`/browse/${brandId}/${seriesId}`} className="btn-secondary">
                {t.exploreOther}
              </Link>
              <Link to="/browse" className="btn-primary">
                {t.backToBrands}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseByBrandPage;
