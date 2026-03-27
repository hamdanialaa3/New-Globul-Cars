import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import styled from 'styled-components';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  LayoutTemplate,
  RefreshCw,
  Save,
  Shield,
  Smartphone,
  Brain,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';
import { siteSettingsService } from '@/services/site-settings.service';
import type {
  FeaturedContent,
  HomepageHeroIcon,
  HomepageHeroTrustItem,
} from '@/services/site-settings-types';
import {
  DEFAULT_FEATURED_CONTENT,
  DEFAULT_HOMEPAGE_HERO,
} from '@/services/site-settings-defaults';
import { DEFAULT_HOMEPAGE_SECTIONS, SECTION_VISIBILITY_PATH } from '@/services/section-visibility-defaults';
import type { HomepageSection, HomepageSectionsConfig } from '@/services/section-visibility-types';

const Container = styled.div`
  background: #0f1419;
  border-radius: 12px;
  border: 1px solid #1e2432;
  padding: 24px;
  margin: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 24px;

  @media (max-width: 840px) {
    flex-direction: column;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #8b5cf6;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
  max-width: 720px;
  line-height: 1.6;
`;

const LiveBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.14);
  color: #bfdbfe;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(99, 102, 241, 0.28);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
  gap: 20px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: #111827;
  border: 1px solid #243041;
  border-radius: 12px;
  padding: 20px;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px;
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
`;

const CardDescription = styled.p`
  margin: 0 0 18px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
`;

const TextInput = styled.input`
  width: 100%;
  background: #0b1220;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
  color: #f8fafc;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 92px;
  resize: vertical;
  background: #0b1220;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
  color: #f8fafc;
  font-size: 13px;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
`;

const Select = styled.select`
  width: 100%;
  background: #0b1220;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
  color: #f8fafc;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
`;

const TrustList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 18px;
`;

const TrustItemCard = styled.div`
  background: #0b1220;
  border: 1px solid #243041;
  border-radius: 10px;
  padding: 14px;
`;

const TrustHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const TrustTitle = styled.div`
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 700;
`;

const TrustControls = styled.div`
  display: flex;
  gap: 8px;
`;

const MiniButton = styled.button<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid ${props => (props.$danger ? '#7f1d1d' : '#334155')};
  background: ${props => (props.$danger ? '#3f1313' : '#172033')};
  color: ${props => (props.$danger ? '#fca5a5' : '#cbd5e1')};
  cursor: pointer;

  &:hover {
    border-color: ${props => (props.$danger ? '#ef4444' : '#6366f1')};
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px dashed #475569;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;

  &:hover {
    border-color: #6366f1;
    color: #ffffff;
  }
`;

const Preview = styled.div`
  background: linear-gradient(160deg, #0b0e14 0%, #121822 50%, #192033 100%);
  border-radius: 14px;
  border: 1px solid rgba(99, 102, 241, 0.22);
  padding: 24px;
  color: #ffffff;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const PreviewInner = styled.div`
  position: relative;
  z-index: 1;
`;

const PreviewTitle = styled.h4`
  margin: 0 0 10px;
  font-size: 28px;
  line-height: 1.25;
`;

const PreviewSubtitle = styled.p`
  margin: 0 0 20px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
`;

const PreviewStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PreviewPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.42);
  border: 1px solid rgba(99, 102, 241, 0.22);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.92);
`;

const SectionStatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionStatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #243041;
  background: #0b1220;
`;

const SectionMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SectionName = styled.div`
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 700;
`;

const SectionHint = styled.div`
  color: #94a3b8;
  font-size: 11px;
`;

const StatusChip = styled.div<{ $visible: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: ${props => (props.$visible ? 'rgba(22, 163, 74, 0.16)' : 'rgba(127, 29, 29, 0.18)')};
  color: ${props => (props.$visible ? '#86efac' : '#fca5a5')};
  border: 1px solid ${props => (props.$visible ? 'rgba(22, 163, 74, 0.32)' : 'rgba(239, 68, 68, 0.32)')};
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
  border: 1px solid;
  background: ${props => (props.$type === 'success' ? '#052e28' : '#3f1313')};
  border-color: ${props => (props.$type === 'success' ? '#0f766e' : '#b91c1c')};
  color: ${props => (props.$type === 'success' ? '#99f6e4' : '#fecaca')};
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $secondary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 16px;
  border-radius: 10px;
  border: 1px solid ${props => (props.$secondary ? '#334155' : 'transparent')};
  background: ${props => (props.$secondary ? '#172033' : 'linear-gradient(135deg, #2563eb, #6366f1 58%, #8b5cf6)')};
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HelperText = styled.p`
  margin: 18px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
`;

const iconOptions: Array<{ value: HomepageHeroIcon; label: string }> = [
  { value: 'brain', label: 'AI / Brain' },
  { value: 'search', label: 'Search / Valuation' },
  { value: 'shield', label: 'Shield / Trust' },
  { value: 'smartphone', label: 'Smartphone / Platform' },
];

const renderIcon = (icon: HomepageHeroIcon) => {
  switch (icon) {
    case 'brain':
      return <Brain size={16} aria-hidden="true" />;
    case 'search':
      return <Search size={16} aria-hidden="true" />;
    case 'shield':
      return <Shield size={16} aria-hidden="true" />;
    case 'smartphone':
      return <Smartphone size={16} aria-hidden="true" />;
    default:
      return <LayoutTemplate size={16} aria-hidden="true" />;
  }
};

const createTrustItem = (): HomepageHeroTrustItem => ({
  id: `hero-trust-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  icon: 'brain',
  labelBg: '',
  labelEn: '',
});

const HomepageControlManager: React.FC = () => {
  const [content, setContent] = useState<FeaturedContent>(DEFAULT_FEATURED_CONTENT);
  const [sections, setSections] = useState<HomepageSection[]>(DEFAULT_HOMEPAGE_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let isActive = true;

    const unsubscribeHero = siteSettingsService.subscribeFeaturedContent((nextContent) => {
      if (!isActive) {
        return;
      }
      setContent(nextContent);
      setLoading(false);
    });

    const unsubscribeSections = onSnapshot(
      doc(db, SECTION_VISIBILITY_PATH.collection, SECTION_VISIBILITY_PATH.docId),
      (snapshot) => {
        if (!isActive) {
          return;
        }

        if (!snapshot.exists()) {
          setSections(DEFAULT_HOMEPAGE_SECTIONS);
          return;
        }

        const data = snapshot.data() as HomepageSectionsConfig;
        setSections([...data.sections].sort((a, b) => a.order - b.order));
      },
      (error) => {
        logger.error('HomepageControlManager sections subscription failed', error as Error);
        if (isActive) {
          setSections(DEFAULT_HOMEPAGE_SECTIONS);
        }
      }
    );

    return () => {
      isActive = false;
      unsubscribeHero();
      unsubscribeSections();
    };
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => {
      setMessage((current) => (current?.text === text ? null : current));
    }, 3000);
  };

  const handleHeroChange = (field: keyof FeaturedContent['homepageHero'], value: string) => {
    setContent((prev) => ({
      ...prev,
      homepageHero: {
        ...prev.homepageHero,
        [field]: value,
      },
    }));
  };

  const handleTrustItemChange = <K extends keyof HomepageHeroTrustItem>(
    index: number,
    field: K,
    value: HomepageHeroTrustItem[K]
  ) => {
    setContent((prev) => ({
      ...prev,
      homepageHero: {
        ...prev.homepageHero,
        trustItems: prev.homepageHero.trustItems.map((item, itemIndex) => (
          itemIndex === index ? { ...item, [field]: value } : item
        )),
      },
    }));
  };

  const addTrustItem = () => {
    setContent((prev) => ({
      ...prev,
      homepageHero: {
        ...prev.homepageHero,
        trustItems: [...prev.homepageHero.trustItems, createTrustItem()],
      },
    }));
  };

  const removeTrustItem = (index: number) => {
    setContent((prev) => ({
      ...prev,
      homepageHero: {
        ...prev.homepageHero,
        trustItems: prev.homepageHero.trustItems.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const resetHero = () => {
    if (!window.confirm('Reset homepage hero content to defaults?')) {
      return;
    }

    setContent((prev) => ({
      ...prev,
      homepageHero: DEFAULT_HOMEPAGE_HERO,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedBy = getAuth().currentUser?.email || 'unknown';

      await siteSettingsService.updateFeaturedContent({
        homepageHero: content.homepageHero,
      }, updatedBy);

      showMessage('success', 'Homepage hero saved to live Firestore settings.');
    } catch (error) {
      logger.error('HomepageControlManager failed to save hero', error as Error);
      showMessage('error', 'Failed to save homepage hero settings.');
    } finally {
      setSaving(false);
    }
  };

  const visibleSections = sections.filter((section) => section.visible).length;

  return (
    <Container>
      <Header>
        <TitleGroup>
          <Title>
            <Home size={22} /> Homepage Control Center
          </Title>
          <Subtitle>
            Live control for the homepage hero and a real-time readout of homepage section state.
            Hero copy below is read from and saved to Firestore in app_settings/featured_content.
          </Subtitle>
        </TitleGroup>
        <LiveBadge>
          <CheckCircle2 size={14} /> Live Firestore Data
        </LiveBadge>
      </Header>

      <Grid>
        <Card>
          <CardTitle>Homepage Hero</CardTitle>
          <CardDescription>
            Edit the exact headline, subtitle, accessibility labels, and trust strip shown in the live homepage hero.
          </CardDescription>

          <FieldsGrid>
            <FieldGroup>
              <FieldLabel htmlFor="hero-aria-bg">Hero aria label (BG)</FieldLabel>
              <TextInput
                id="hero-aria-bg"
                value={content.homepageHero.ariaLabelBg}
                onChange={(event) => handleHeroChange('ariaLabelBg', event.target.value)}
                disabled={loading || saving}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="hero-aria-en">Hero aria label (EN)</FieldLabel>
              <TextInput
                id="hero-aria-en"
                value={content.homepageHero.ariaLabelEn}
                onChange={(event) => handleHeroChange('ariaLabelEn', event.target.value)}
                disabled={loading || saving}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="hero-title-bg">Hero title (BG)</FieldLabel>
              <TextArea
                id="hero-title-bg"
                value={content.homepageHero.titleBg}
                onChange={(event) => handleHeroChange('titleBg', event.target.value)}
                disabled={loading || saving}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="hero-title-en">Hero title (EN)</FieldLabel>
              <TextArea
                id="hero-title-en"
                value={content.homepageHero.titleEn}
                onChange={(event) => handleHeroChange('titleEn', event.target.value)}
                disabled={loading || saving}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="hero-subtitle-bg">Hero subtitle (BG)</FieldLabel>
              <TextArea
                id="hero-subtitle-bg"
                value={content.homepageHero.subtitleBg}
                onChange={(event) => handleHeroChange('subtitleBg', event.target.value)}
                disabled={loading || saving}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="hero-subtitle-en">Hero subtitle (EN)</FieldLabel>
              <TextArea
                id="hero-subtitle-en"
                value={content.homepageHero.subtitleEn}
                onChange={(event) => handleHeroChange('subtitleEn', event.target.value)}
                disabled={loading || saving}
              />
            </FieldGroup>
          </FieldsGrid>

          <TrustList>
            {content.homepageHero.trustItems.map((item, index) => (
              <TrustItemCard key={item.id}>
                <TrustHeader>
                  <TrustTitle>Trust item {index + 1}</TrustTitle>
                  <TrustControls>
                    <MiniButton
                      type="button"
                      onClick={() => removeTrustItem(index)}
                      disabled={loading || saving || content.homepageHero.trustItems.length <= 1}
                      $danger
                    >
                      <Trash2 size={14} />
                    </MiniButton>
                  </TrustControls>
                </TrustHeader>

                <FieldsGrid>
                  <FieldGroup>
                    <FieldLabel>Icon</FieldLabel>
                    <Select
                      value={item.icon}
                      onChange={(event) => handleTrustItemChange(index, 'icon', event.target.value as HomepageHeroIcon)}
                      disabled={loading || saving}
                    >
                      {iconOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel>Label (BG)</FieldLabel>
                    <TextInput
                      value={item.labelBg}
                      onChange={(event) => handleTrustItemChange(index, 'labelBg', event.target.value)}
                      disabled={loading || saving}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel>Label (EN)</FieldLabel>
                    <TextInput
                      value={item.labelEn}
                      onChange={(event) => handleTrustItemChange(index, 'labelEn', event.target.value)}
                      disabled={loading || saving}
                    />
                  </FieldGroup>
                </FieldsGrid>
              </TrustItemCard>
            ))}
          </TrustList>

          <AddButton type="button" onClick={addTrustItem} disabled={loading || saving}>
            <Plus size={16} /> Add trust item
          </AddButton>

          <Actions>
            <ActionButton type="button" onClick={handleSave} disabled={loading || saving}>
              <Save size={16} /> Save homepage hero
            </ActionButton>
            <ActionButton type="button" $secondary onClick={resetHero} disabled={loading || saving}>
              <RefreshCw size={16} /> Reset hero defaults
            </ActionButton>
          </Actions>

          {message && <Message $type={message.type}>{message.text}</Message>}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card>
            <CardTitle>Live Hero Preview</CardTitle>
            <CardDescription>
              Preview of the exact hero content currently loaded in the admin editor.
            </CardDescription>

            <Preview>
              <PreviewInner>
                <PreviewTitle>{content.homepageHero.titleEn}</PreviewTitle>
                <PreviewSubtitle>{content.homepageHero.subtitleEn}</PreviewSubtitle>
                <PreviewStrip>
                  {content.homepageHero.trustItems.map((item) => (
                    <PreviewPill key={item.id}>
                      {renderIcon(item.icon)}
                      <span>{item.labelEn}</span>
                    </PreviewPill>
                  ))}
                </PreviewStrip>
              </PreviewInner>
            </Preview>
          </Card>

          <Card>
            <CardTitle>Live Homepage Sections</CardTitle>
            <CardDescription>
              Real-time visibility and order from app_settings/homepage_sections. Use the section control panel below to change order or visibility.
            </CardDescription>

            <HelperText>
              Visible now: {visibleSections} of {sections.length} sections.
            </HelperText>

            <SectionStatusList>
              {sections.map((section) => (
                <SectionStatusRow key={section.key}>
                  <SectionMeta>
                    <SectionName>
                      #{section.order} {section.label}
                    </SectionName>
                    <SectionHint>{section.key}</SectionHint>
                  </SectionMeta>

                  <StatusChip $visible={section.visible}>
                    {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    {section.visible ? 'Visible' : 'Hidden'}
                  </StatusChip>
                </SectionStatusRow>
              ))}
            </SectionStatusList>
          </Card>
        </div>
      </Grid>
    </Container>
  );
};

export default HomepageControlManager;
