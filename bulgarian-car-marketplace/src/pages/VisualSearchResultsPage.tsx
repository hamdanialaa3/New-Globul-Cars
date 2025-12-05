// Visual Search Results Page - صفحة نتائج البحث المرئي
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { VisualSearchResult } from '../../services/advanced/visual-search.service';
import { CarCard } from '../../components/cars/CarCard';

export const VisualSearchResultsPage: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState<VisualSearchResult | null>(null);

  useEffect(() => {
    const state = location.state as { result?: VisualSearchResult };
    
    if (state?.result) {
      setResult(state.result);
    } else {
      // No results, redirect to visual search
      navigate('/visual-search');
    }
  }, [location, navigate]);

  if (!result) {
    return (
      <S.Container>
        <S.Loading>
          <S.Spinner />
          <S.LoadingText>{t('common.loading')}</S.LoadingText>
        </S.Loading>
      </S.Container>
    );
  }

  const { detectedFeatures, similarCars, processingTime } = result;
  const hasResults = similarCars.length > 0;

  return (
    <S.Container>
      {/* Header */}
      <S.Header>
        <S.BackButton onClick={() => navigate('/visual-search')}>
          <S.Icon>←</S.Icon>
          {t('common.back')}
        </S.BackButton>

        <S.Title>{t('visualSearch.results')}</S.Title>
        <S.ProcessingInfo>
          {t('visualSearch.processed')} {(processingTime / 1000).toFixed(2)}s
        </S.ProcessingInfo>
      </S.Header>

      {/* Detected Features */}
      <S.DetectedSection>
        <S.SectionTitle>{t('visualSearch.detectedFeatures')}</S.SectionTitle>
        
        <S.FeaturesGrid>
          {detectedFeatures.make && (
            <S.FeatureCard>
              <S.FeatureIcon>🚗</S.FeatureIcon>
              <S.FeatureLabel>{t('common.make')}</S.FeatureLabel>
              <S.FeatureValue>{detectedFeatures.make}</S.FeatureValue>
            </S.FeatureCard>
          )}

          {detectedFeatures.model && (
            <S.FeatureCard>
              <S.FeatureIcon>📝</S.FeatureIcon>
              <S.FeatureLabel>{t('common.model')}</S.FeatureLabel>
              <S.FeatureValue>{detectedFeatures.model}</S.FeatureValue>
            </S.FeatureCard>
          )}

          {detectedFeatures.bodyType && (
            <S.FeatureCard>
              <S.FeatureIcon>🏎️</S.FeatureIcon>
              <S.FeatureLabel>{t('common.bodyType')}</S.FeatureLabel>
              <S.FeatureValue>{t(`bodyType.${detectedFeatures.bodyType}`)}</S.FeatureValue>
            </S.FeatureCard>
          )}

          {detectedFeatures.color && (
            <S.FeatureCard>
              <S.FeatureIcon>🎨</S.FeatureIcon>
              <S.FeatureLabel>{t('common.color')}</S.FeatureLabel>
              <S.FeatureValue>{t(`color.${detectedFeatures.color}`)}</S.FeatureValue>
            </S.FeatureCard>
          )}

          {detectedFeatures.year && (
            <S.FeatureCard>
              <S.FeatureIcon>📅</S.FeatureIcon>
              <S.FeatureLabel>{t('common.year')}</S.FeatureLabel>
              <S.FeatureValue>{detectedFeatures.year}</S.FeatureValue>
            </S.FeatureCard>
          )}

          <S.FeatureCard>
            <S.FeatureIcon>🎯</S.FeatureIcon>
            <S.FeatureLabel>{t('visualSearch.confidence')}</S.FeatureLabel>
            <S.FeatureValue>
              {(detectedFeatures.confidence * 100).toFixed(0)}%
            </S.FeatureValue>
          </S.FeatureCard>
        </S.FeaturesGrid>

        {detectedFeatures.confidence < 0.5 && (
          <S.LowConfidenceWarning>
            <S.Icon>⚠️</S.Icon>
            {t('visualSearch.lowConfidence')}
          </S.LowConfidenceWarning>
        )}
      </S.DetectedSection>

      {/* Similar Cars */}
      <S.ResultsSection>
        <S.SectionHeader>
          <S.SectionTitle>
            {t('visualSearch.similarCars')}
            <S.ResultCount>({similarCars.length})</S.ResultCount>
          </S.SectionTitle>

          {hasResults && (
            <S.SortOptions>
              <S.SortLabel>{t('common.sortBy')}:</S.SortLabel>
              <S.SortSelect>
                <option value="similarity">{t('visualSearch.similarity')}</option>
                <option value="price-asc">{t('common.priceAsc')}</option>
                <option value="price-desc">{t('common.priceDesc')}</option>
                <option value="year-desc">{t('common.newest')}</option>
                <option value="mileage-asc">{t('common.lowestMileage')}</option>
              </S.SortSelect>
            </S.SortOptions>
          )}
        </S.SectionHeader>

        {hasResults ? (
          <S.CarsGrid>
            {similarCars.map(({ car, similarityScore, matchedFeatures }) => (
              <S.CarWrapper key={car.id}>
                <S.SimilarityBadge score={similarityScore}>
                  <S.Icon>🎯</S.Icon>
                  {similarityScore}% {t('visualSearch.match')}
                </S.SimilarityBadge>

                {matchedFeatures.length > 0 && (
                  <S.MatchedFeatures>
                    {matchedFeatures.map(feature => (
                      <S.FeatureBadge key={feature}>
                        {t(`visualSearch.matched.${feature}`)}
                      </S.FeatureBadge>
                    ))}
                  </S.MatchedFeatures>
                )}

                <CarCard car={car} />
              </S.CarWrapper>
            ))}
          </S.CarsGrid>
        ) : (
          <S.NoResults>
            <S.NoResultsIcon>🔍</S.NoResultsIcon>
            <S.NoResultsTitle>{t('visualSearch.noResults')}</S.NoResultsTitle>
            <S.NoResultsText>{t('visualSearch.noResultsHint')}</S.NoResultsText>
            
            <S.TryAgainButton onClick={() => navigate('/visual-search')}>
              <S.Icon>📸</S.Icon>
              {t('visualSearch.tryAgain')}
            </S.TryAgainButton>
          </S.NoResults>
        )}
      </S.ResultsSection>
    </S.Container>
  );
};

// Styled Components
namespace S {
  export const Container = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px 20px;
  `;

  export const Loading = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 20px;
  `;

  export const Spinner = styled.div`
    width: 50px;
    height: 50px;
    border: 4px solid rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  export const LoadingText = styled.div`
    font-size: 18px;
    color: #666;
  `;

  export const Header = styled.div`
    margin-bottom: 40px;
  `;

  export const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: 2px solid #ddd;
    border-radius: 10px;
    background: white;
    color: #666;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 20px;

    &:hover {
      border-color: #667eea;
      color: #667eea;
    }
  `;

  export const Title = styled.h1`
    font-size: 32px;
    color: #333;
    margin-bottom: 10px;
  `;

  export const ProcessingInfo = styled.div`
    font-size: 14px;
    color: #888;
  `;

  export const DetectedSection = styled.div`
    margin-bottom: 50px;
  `;

  export const SectionTitle = styled.h2`
    font-size: 24px;
    color: #333;
    margin-bottom: 25px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  export const ResultCount = styled.span`
    font-size: 18px;
    color: #888;
    font-weight: 400;
  `;

  export const FeaturesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
  `;

  export const FeatureCard = styled.div`
    padding: 25px;
    background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
    border-radius: 16px;
    text-align: center;
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }
  `;

  export const FeatureIcon = styled.div`
    font-size: 36px;
    margin-bottom: 12px;
  `;

  export const FeatureLabel = styled.div`
    font-size: 13px;
    color: #888;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `;

  export const FeatureValue = styled.div`
    font-size: 18px;
    color: #333;
    font-weight: 600;
  `;

  export const LowConfidenceWarning = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 20px;
    background: #fff8e6;
    border: 1px solid #ffd966;
    border-radius: 12px;
    color: #b8860b;
    font-size: 14px;
    margin-top: 20px;
  `;

  export const ResultsSection = styled.div``;

  export const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 20px;
  `;

  export const SortOptions = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  export const SortLabel = styled.span`
    font-size: 14px;
    color: #666;
  `;

  export const SortSelect = styled.select`
    padding: 10px 16px;
    border: 2px solid #ddd;
    border-radius: 10px;
    font-size: 14px;
    background: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #667eea;
    }
  `;

  export const CarsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 30px;
  `;

  export const CarWrapper = styled.div`
    position: relative;
  `;

  export const SimilarityBadge = styled.div<{ score: number }>`
    position: absolute;
    top: 15px;
    right: 15px;
    z-index: 10;
    padding: 8px 16px;
    background: ${props => 
      props.score >= 80 ? 'linear-gradient(135deg, #4caf50, #66bb6a)' :
      props.score >= 60 ? 'linear-gradient(135deg, #ff9800, #ffa726)' :
      'linear-gradient(135deg, #f44336, #ef5350)'
    };
    color: white;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  `;

  export const MatchedFeatures = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  `;

  export const FeatureBadge = styled.span`
    padding: 6px 12px;
    background: #667eea20;
    color: #667eea;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  `;

  export const NoResults = styled.div`
    text-align: center;
    padding: 80px 40px;
    background: #fafafa;
    border-radius: 20px;
  `;

  export const NoResultsIcon = styled.div`
    font-size: 80px;
    margin-bottom: 20px;
  `;

  export const NoResultsTitle = styled.h3`
    font-size: 24px;
    color: #333;
    margin-bottom: 15px;
  `;

  export const NoResultsText = styled.p`
    font-size: 16px;
    color: #666;
    margin-bottom: 30px;
  `;

  export const TryAgainButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 30px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  `;

  export const Icon = styled.span`
    font-size: 18px;
  `;
}
