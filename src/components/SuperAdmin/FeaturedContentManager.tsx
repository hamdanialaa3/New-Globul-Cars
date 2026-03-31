import React, { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import styled from 'styled-components';
import {
  Star,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Car,
  Building2,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Search
} from 'lucide-react';
import { siteSettingsService } from '@/services/site-settings.service';
import type { FeaturedContent } from '@/services/site-settings-types';
import { DEFAULT_FEATURED_CONTENT } from '@/services/site-settings-defaults';
import { useAdminLang } from '@/contexts/AdminLanguageContext';

const Container = styled.div`
  background: var(--admin-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--admin-border-subtle);
  padding: 24px;
  margin: 20px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #8B5CF6;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--admin-text-secondary);
  margin: 0;
`;

const Section = styled.div`
  margin-bottom: 32px;
  background: #1a1f2e;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #2d3748;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #e5e7eb;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #374151;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--admin-bg-secondary);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #374151;
`;

const ItemInput = styled.input`
  flex: 1;
  background: #1a1f2e;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 8px 12px;
  color: #e5e7eb;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const IconButton = styled.button<{ $variant?: 'danger' | 'primary' }>`
  padding: 6px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;

  ${props => props.$variant === 'danger' ? `
    background: #7f1d1d;
    color: #fca5a5;
    &:hover {
      background: #991b1b;
    }
  ` : `
    background: #374151;
    color: #e5e7eb;
    &:hover {
      background: #4b5563;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddButton = styled.button`
  padding: 10px 16px;
  border: 1px dashed #4b5563;
  border-radius: 6px;
  background: transparent;
  color: var(--admin-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
  margin-top: 12px;

  &:hover {
    background: #1a1f2e;
    border-color: #8B5CF6;
    color: #8B5CF6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BannerCard = styled.div`
  background: var(--admin-bg-secondary);
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
`;

const BannerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const BannerTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BannerControls = styled.div`
  display: flex;
  gap: 6px;
`;

const BannerFields = styled.div`
  display: grid;
  gap: 12px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  color: var(--admin-text-secondary);
  display: block;
  margin-bottom: 6px;
`;

const ToggleSwitch = styled.label<{ $active: boolean }>`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.$active ? '#10b981' : '#4b5563'};
    transition: 0.3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: ${props => props.$active ? '26px' : '3px'};
      bottom: 3px;
      background-color: var(--admin-text-primary);
      transition: 0.3s;
      border-radius: 50%;
    }
  }
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  ${props => props.$active ? `
    background: #064e3b;
    color: #6ee7b7;
  ` : `
    background: #3f3f46;
    color: #a1a1aa;
  `}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #2d3748;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: #ef4444;
        color: var(--admin-text-primary);
        &:hover {
          background: #dc2626;
        }
      `;
    }
    if (props.$variant === 'secondary') {
      return `
        background: #374151;
        color: #e5e7eb;
        &:hover {
          background: #4b5563;
        }
      `;
    }
    return `
      background: #8B5CF6;
      color: #0f1419;
      &:hover {
        background: #ff7a47;
      }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$type === 'success' ? `
    background: #064e3b;
    color: #6ee7b7;
    border: 1px solid #047857;
  ` : `
    background: #7f1d1d;
    color: #fca5a5;
    border: 1px solid #b91c1c;
  `}
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  background: var(--admin-bg-secondary);
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 10px 36px 10px 12px;
  color: #e5e7eb;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
  }

  &::placeholder {
    color: #6b7280;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
`;

const FeaturedContentManager: React.FC = () => {
  const { t } = useAdminLang();
  const [content, setContent] = useState<FeaturedContent>(DEFAULT_FEATURED_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const adminEmail = getAuth().currentUser?.email || 'unknown';

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await siteSettingsService.getFeaturedContent();
      setContent(data);
    } catch (error) {
      showMessage('error', t.featured.loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await siteSettingsService.updateFeaturedContent(content, adminEmail);
      showMessage('success', '✅ ' + t.featured.saveSuccess);
    } catch (error) {
      showMessage('error', '❌ ' + t.featured.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('⚠️ ' + t.featured.confirmReset)) {
      return;
    }
    try {
      setSaving(true);
      await siteSettingsService.updateFeaturedContent(DEFAULT_FEATURED_CONTENT, adminEmail);
      setContent(DEFAULT_FEATURED_CONTENT);
      showMessage('success', '✅ ' + t.featured.resetSuccess);
    } catch (error) {
      showMessage('error', '❌ ' + t.featured.resetError);
    } finally {
      setSaving(false);
    }
  };

  // Featured Cars Management
  const addFeaturedCar = () => {
    setContent(prev => ({
      ...prev,
      featuredCars: [...prev.featuredCars, '']
    }));
  };

  const updateFeaturedCar = (index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      featuredCars: prev.featuredCars.map((item, i) => i === index ? value : item)
    }));
  };

  const removeFeaturedCar = (index: number) => {
    setContent(prev => ({
      ...prev,
      featuredCars: prev.featuredCars.filter((_, i) => i !== index)
    }));
  };

  // Featured Dealers Management
  const addFeaturedDealer = () => {
    setContent(prev => ({
      ...prev,
      featuredDealers: [...prev.featuredDealers, '']
    }));
  };

  const updateFeaturedDealer = (index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      featuredDealers: prev.featuredDealers.map((item, i) => i === index ? value : item)
    }));
  };

  const removeFeaturedDealer = (index: number) => {
    setContent(prev => ({
      ...prev,
      featuredDealers: prev.featuredDealers.filter((_, i) => i !== index)
    }));
  };

  // Featured Brands Management
  const addFeaturedBrand = () => {
    setContent(prev => ({
      ...prev,
      featuredBrands: [...prev.featuredBrands, '']
    }));
  };

  const updateFeaturedBrand = (index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      featuredBrands: prev.featuredBrands.map((item, i) => i === index ? value : item)
    }));
  };

  const removeFeaturedBrand = (index: number) => {
    setContent(prev => ({
      ...prev,
      featuredBrands: prev.featuredBrands.filter((_, i) => i !== index)
    }));
  };

  // Homepage Banners Management
  const addBanner = () => {
    const newBanner = {
      id: `banner-${Date.now()}`,
      image: '',
      link: '',
      title: '',
      active: true,
      order: content.homepageBanners.length + 1
    };
    setContent(prev => ({
      ...prev,
      homepageBanners: [...prev.homepageBanners, newBanner]
    }));
  };

  const updateBanner = (index: number, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      homepageBanners: prev.homepageBanners.map((banner, i) =>
        i === index ? { ...banner, [field]: value } : banner
      )
    }));
  };

  const removeBanner = (index: number) => {
    setContent(prev => ({
      ...prev,
      homepageBanners: prev.homepageBanners.filter((_, i) => i !== index)
    }));
  };

  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.homepageBanners.length) return;

    const banners = [...content.homepageBanners];
    [banners[index], banners[newIndex]] = [banners[newIndex], banners[index]];

    // Update order values
    banners.forEach((banner, i) => {
      banner.order = i + 1;
    });

    setContent(prev => ({
      ...prev,
      homepageBanners: banners
    }));
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title><Star size={24} /> {t.common.loading}</Title>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Star size={24} />
          {t.featured.title}
        </Title>
        <Subtitle>
          {t.featured.subtitle}
        </Subtitle>
      </Header>

      {message && (
        <Message $type={message.type}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </Message>
      )}

      {/* ═══ Featured Cars ═══ */}
      <Section>
        <SectionTitle>
          <Car size={18} />
          {t.featured.featuredCars} ({content.featuredCars.length})
        </SectionTitle>

        <SearchContainer>
          <SearchInput
            placeholder={t.featured.searchCar}
            disabled={saving}
          />
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
        </SearchContainer>

        <ItemsList>
          {content.featuredCars.map((carId, index) => (
            <ItemRow key={index}>
              <ItemInput
                type="text"
                value={carId}
                onChange={(e) => updateFeaturedCar(index, e.target.value)}
                placeholder={t.featured.placeholderCarId}
                disabled={saving}
              />
              <IconButton
                onClick={() => removeFeaturedCar(index)}
                disabled={saving}
                $variant="danger"
              >
                <Trash2 size={16} />
              </IconButton>
            </ItemRow>
          ))}
        </ItemsList>

        <AddButton onClick={addFeaturedCar} disabled={saving}>
          <Plus size={16} />
          {t.featured.addFeaturedCar}
        </AddButton>
      </Section>

      {/* ═══ Featured Dealers ═══ */}
      <Section>
        <SectionTitle>
          <Building2 size={18} />
          {t.featured.featuredDealers} ({content.featuredDealers.length})
        </SectionTitle>

        <SearchContainer>
          <SearchInput
            placeholder={t.featured.searchDealer}
            disabled={saving}
          />
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
        </SearchContainer>

        <ItemsList>
          {content.featuredDealers.map((dealerId, index) => (
            <ItemRow key={index}>
              <ItemInput
                type="text"
                value={dealerId}
                onChange={(e) => updateFeaturedDealer(index, e.target.value)}
                placeholder={t.featured.placeholderDealerId}
                disabled={saving}
              />
              <IconButton
                onClick={() => removeFeaturedDealer(index)}
                disabled={saving}
                $variant="danger"
              >
                <Trash2 size={16} />
              </IconButton>
            </ItemRow>
          ))}
        </ItemsList>

        <AddButton onClick={addFeaturedDealer} disabled={saving}>
          <Plus size={16} />
          {t.featured.addFeaturedDealer}
        </AddButton>
      </Section>

      {/* ═══ Featured Brands ═══ */}
      <Section>
        <SectionTitle>
          <Star size={18} />
          {t.featured.featuredBrands} ({content.featuredBrands.length})
        </SectionTitle>

        <ItemsList>
          {content.featuredBrands.map((brand, index) => (
            <ItemRow key={index}>
              <ItemInput
                type="text"
                value={brand}
                onChange={(e) => updateFeaturedBrand(index, e.target.value)}
                placeholder={t.featured.placeholderBrand}
                disabled={saving}
              />
              <IconButton
                onClick={() => removeFeaturedBrand(index)}
                disabled={saving}
                $variant="danger"
              >
                <Trash2 size={16} />
              </IconButton>
            </ItemRow>
          ))}
        </ItemsList>

        <AddButton onClick={addFeaturedBrand} disabled={saving}>
          <Plus size={16} />
          {t.featured.addFeaturedBrand}
        </AddButton>
      </Section>

      {/* ═══ Homepage Banners ═══ */}
      <Section>
        <SectionTitle>
          <ImageIcon size={18} />
          {t.featured.homeBanners} ({content.homepageBanners.length})
        </SectionTitle>

        {content.homepageBanners.map((banner, index) => (
          <BannerCard key={banner.id}>
            <BannerHeader>
              <BannerTitle>
                <ImageIcon size={14} />
                Banner #{index + 1}
                <StatusBadge $active={banner.active}>
                  {banner.active ? t.featured.active : t.common.inactive}
                </StatusBadge>
              </BannerTitle>
              <BannerControls>
                <IconButton
                  onClick={() => moveBanner(index, 'up')}
                  disabled={index === 0 || saving}
                >
                  <ArrowUp size={14} />
                </IconButton>
                <IconButton
                  onClick={() => moveBanner(index, 'down')}
                  disabled={index === content.homepageBanners.length - 1 || saving}
                >
                  <ArrowDown size={14} />
                </IconButton>
                <IconButton
                  onClick={() => removeBanner(index)}
                  disabled={saving}
                  $variant="danger"
                >
                  <Trash2 size={14} />
                </IconButton>
              </BannerControls>
            </BannerHeader>

            <BannerFields>
              <div>
                <FieldLabel>{t.featured.bannerTitle}</FieldLabel>
                <ItemInput
                  type="text"
                  value={banner.title}
                  onChange={(e) => updateBanner(index, 'title', e.target.value)}
                  placeholder={t.featured.bannerTitle}
                  disabled={saving}
                />
              </div>

              <div>
                <FieldLabel>{t.featured.bannerImage}</FieldLabel>
                <ItemInput
                  type="text"
                  value={banner.image}
                  onChange={(e) => updateBanner(index, 'image', e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  disabled={saving}
                />
              </div>

              <div>
                <FieldLabel>{t.featured.bannerLink}</FieldLabel>
                <ItemInput
                  type="text"
                  value={banner.link}
                  onChange={(e) => updateBanner(index, 'link', e.target.value)}
                  placeholder="/browse"
                  disabled={saving}
                />
              </div>

              <div>
                <FieldLabel>{t.featured.activateBanner}</FieldLabel>
                <ToggleSwitch $active={banner.active}>
                  <input
                    type="checkbox"
                    checked={banner.active}
                    onChange={(e) => updateBanner(index, 'active', e.target.checked)}
                    disabled={saving}
                  />
                  <span />
                </ToggleSwitch>
              </div>
            </BannerFields>
          </BannerCard>
        ))}

        <AddButton onClick={addBanner} disabled={saving}>
          <Plus size={16} />
          {t.featured.addBanner}
        </AddButton>
      </Section>

      {/* ═══ Action Buttons ═══ */}
      <ActionButtons>
        <Button
          $variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>

        <Button
          $variant="secondary"
          onClick={loadContent}
          disabled={saving}
        >
          <RefreshCw size={16} />
          Refresh
        </Button>

        <Button
          $variant="danger"
          onClick={handleReset}
          disabled={saving}
        >
          <AlertCircle size={16} />
          Reset
        </Button>
      </ActionButtons>
    </Container>
  );
};

export default FeaturedContentManager;

