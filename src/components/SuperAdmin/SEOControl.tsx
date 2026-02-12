import React, { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import styled from 'styled-components';
import {
  Globe,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Search as SearchIcon,
  Share2,
  Image as ImageIcon
} from 'lucide-react';
import { siteSettingsService } from '@/services/site-settings.service';
import type { SiteSettings } from '@/services/site-settings-types';
import { DEFAULT_SITE_SETTINGS } from '@/services/site-settings-defaults';

const Container = styled.div`
  background: #0f1419;
  border-radius: 12px;
  border: 1px solid #1e2432;
  padding: 24px;
  margin: 20px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #ff8c61;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #9ca3af;
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

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #e5e7eb;
  display: block;
  margin-bottom: 8px;
`;

const InputField = styled.input`
  background: #0f1419;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 10px 12px;
  color: #e5e7eb;
  font-size: 13px;
  width: 100%;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #ff8c61;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  background: #0f1419;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 10px 12px;
  color: #e5e7eb;
  font-size: 13px;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #ff8c61;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const KeywordsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const KeywordTag = styled.div`
  background: #374151;
  color: #e5e7eb;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RemoveKeywordBtn = styled.button`
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: #ef4444;
  }
`;

const AddKeywordInput = styled.div`
  display: flex;
  gap: 8px;
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
        color: #fff;
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
      background: #ff8c61;
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

const PreviewBox = styled.div`
  background: #0f1419;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const PreviewTitle = styled.div`
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 8px;
  font-weight: 600;
`;

const PreviewContent = styled.div`
  font-size: 13px;
  color: #e5e7eb;
  line-height: 1.6;
`;

const PreviewLink = styled.a`
  color: #60a5fa;
  text-decoration: none;
  font-size: 12px;
  &:hover {
    text-decoration: underline;
  }
`;

const SEOControl: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newKeyword, setNewKeyword] = useState('');

  const adminEmail = getAuth().currentUser?.email || 'unknown';

const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await siteSettingsService.getSiteSettings();
      setSettings(data);
    } catch (error) {
      showMessage('error', 'Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await siteSettingsService.updateSiteSettings(settings, adminEmail);
      showMessage('success', '✅ SEO settings saved successfully');
    } catch (error) {
      showMessage('error', '❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSEO = (field: keyof SiteSettings['seo'], value: any) => {
    setSettings(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !settings.seo.keywords.includes(newKeyword.trim())) {
      setSettings(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, newKeyword.trim()]
        }
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSettings(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(k => k !== keyword)
      }
    }));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const updateAnalytics = (field: keyof SiteSettings['analytics'], value: any) => {
    setSettings(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title><Globe size={24} /> Loading...</Title>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Globe size={24} />
          SEO & Analytics Control
        </Title>
        <Subtitle>
          Manage search engines, tags, and analytics to increase visibility and reach
        </Subtitle>
      </Header>

      {message && (
        <Message $type={message.type}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </Message>
      )}

      {/* ═══ Basic SEO ═══ */}
      <Section>
        <SectionTitle>
          <SearchIcon size={18} />
          Basic SEO Settings
        </SectionTitle>

        <div>
          <FieldLabel>Site Name</FieldLabel>
          <InputField
            type="text"
            value={settings.seo.siteName}
            onChange={(e) => updateSEO('siteName', e.target.value)}
            disabled={saving}
            placeholder="Koli One"
          />
        </div>

        <div>
          <FieldLabel>Site Description (Meta Description)</FieldLabel>
          <TextArea
            value={settings.seo.siteDescription}
            onChange={(e) => updateSEO('siteDescription', e.target.value)}
            disabled={saving}
            placeholder="The leading car buying and selling platform..."
          />
        </div>

        {/* Preview */}
        <PreviewBox>
          <PreviewTitle>Google Results Preview</PreviewTitle>
          <PreviewLink href="#">{settings.seo.siteName}</PreviewLink>
          <PreviewContent>
            {settings.seo.siteDescription}
          </PreviewContent>
        </PreviewBox>
      </Section>

      {/* ═══ Keywords ═══ */}
      <Section>
        <SectionTitle>
          <Globe size={18} />
          Keywords ({settings.seo.keywords.length})
        </SectionTitle>

        <KeywordsContainer>
          {settings.seo.keywords.map((keyword, index) => (
            <KeywordTag key={index}>
              {keyword}
              <RemoveKeywordBtn
                onClick={() => removeKeyword(keyword)}
                disabled={saving}
              >
                <X size={14} />
              </RemoveKeywordBtn>
            </KeywordTag>
          ))}
        </KeywordsContainer>

        <AddKeywordInput>
          <InputField
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={handleKeywordKeyPress}
            disabled={saving}
            placeholder="Add a keyword (press Enter)"
            style={{ marginBottom: 0 }}
          />
          <Button
            onClick={addKeyword}
            disabled={saving || !newKeyword.trim()}
          >
            <Plus size={16} />
          </Button>
        </AddKeywordInput>
      </Section>

      {/* ═══ Social Media / Open Graph ═══ */}
      <Section>
        <SectionTitle>
          <Share2 size={18} />
          Social Media Settings (Open Graph)
        </SectionTitle>

        <div>
          <FieldLabel>Open Graph Image (OG Image)</FieldLabel>
          <InputField
            type="text"
            value={settings.seo.ogImage}
            onChange={(e) => updateSEO('ogImage', e.target.value)}
            disabled={saving}
            placeholder="/assets/og-image.jpg"
          />
        </div>

        <div>
          <FieldLabel>Twitter Account</FieldLabel>
          <InputField
            type="text"
            value={settings.seo.twitterHandle}
            onChange={(e) => updateSEO('twitterHandle', e.target.value)}
            disabled={saving}
            placeholder="@KoliOne"
          />
        </div>

        {/* Preview */}
        <PreviewBox>
          <PreviewTitle>Share Preview</PreviewTitle>
          {settings.seo.ogImage && (
            <div style={{ marginBottom: '8px', color: '#6b7280', fontSize: '12px' }}>
              📸 {settings.seo.ogImage}
            </div>
          )}
          <PreviewContent style={{ fontWeight: 600, marginBottom: '4px' }}>
            {settings.seo.siteName}
          </PreviewContent>
          <PreviewContent style={{ fontSize: '12px', color: '#9ca3af' }}>
            {settings.seo.siteDescription.substring(0, 100)}...
          </PreviewContent>
        </PreviewBox>
      </Section>

      {/* ═══ Analytics ═══ */}
      <Section>
        <SectionTitle>
          <ImageIcon size={18} />
          Analytics & Tracking
        </SectionTitle>

        <div>
          <FieldLabel>Google Analytics ID</FieldLabel>
          <InputField
            type="text"
            value={settings.analytics.googleAnalyticsId}
            onChange={(e) => updateAnalytics('googleAnalyticsId', e.target.value)}
            disabled={saving}
            placeholder="G-XXXXXXXXXX"
          />
        </div>

        <div>
          <FieldLabel>Facebook Pixel ID</FieldLabel>
          <InputField
            type="text"
            value={settings.analytics.facebookPixelId}
            onChange={(e) => updateAnalytics('facebookPixelId', e.target.value)}
            disabled={saving}
            placeholder="123456789012345"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            id="enableTracking"
            checked={settings.analytics.enableTracking}
            onChange={(e) => updateAnalytics('enableTracking', e.target.checked)}
            disabled={saving}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <FieldLabel htmlFor="enableTracking" style={{ margin: 0, cursor: 'pointer' }}>
            Enable Tracking (Analytics & Pixels)
          </FieldLabel>
        </div>
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
          onClick={loadSettings}
          disabled={saving}
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </ActionButtons>
    </Container>
  );
};

export default SEOControl;
