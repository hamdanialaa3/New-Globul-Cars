import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { 
  LayoutTemplate, 
  Settings2, 
  Save, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Globe2, 
  MonitorPlay,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { logger } from '@/services/logger-service';
import { PageBuilderConfig, PageHeroConfig, PageSectionConfig } from '@/hooks/usePageBuilder';

const Container = styled.div`
  background: #0f1419;
  border-radius: 12px;
  border: 1px solid #1e2432;
  padding: 24px;
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
  background: rgba(34, 197, 94, 0.14);
  color: #86efac;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(34, 197, 94, 0.28);
`;

const SelectWrap = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
`;

const Label = styled.label`
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 600;
`;

const Select = styled.select`
  width: 100%;
  background: #111827;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #111827;
  border: 1px solid #243041;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Input = styled.input`
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

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #0b1220;
  border: 1px solid #334155;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #6366f1;
  }
`;

const SectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SectionName = styled.span`
  color: #f8fafc;
  font-weight: 600;
  font-size: 14px;
`;

const SectionOrder = styled.span`
  color: #94a3b8;
  font-size: 12px;
`;

const ControlsGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const IconButton = styled.button<{ $active?: boolean, $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${props => props.$active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? 'rgba(34, 197, 94, 0.5)' : '#334155'};
  color: ${props => props.$active ? '#86efac' : props.$danger ? '#ef4444' : '#cbd5e1'};
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const SaveGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${props => props.$primary ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent'};
  color: ${props => props.$primary ? '#fff' : '#cbd5e1'};
  border: 1px solid ${props => props.$primary ? 'transparent' : '#334155'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$primary ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'};
    color: #fff;
    border-color: ${props => !props.$primary && '#6366f1'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 8px;
  background: ${props => props.$type === 'success' ? 'rgba(20, 83, 45, 0.5)' : 'rgba(127, 29, 29, 0.5)'};
  border: 1px solid ${props => props.$type === 'success' ? '#166534' : '#991b1b'};
  color: ${props => props.$type === 'success' ? '#86efac' : '#fca5a5'};
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PAGE_OPTIONS = [
  { id: 'home', title: 'الرئيسية (Home)' },
  { id: 'search', title: 'مستكشف السيارات (Search)' },
  { id: 'dealers', title: 'قائمة المعارض (Dealerships)' },
  { id: 'sell', title: 'بيع سيارتك (Sell Car)' },
];

const DEFAULT_CONFIGS: Record<string, PageBuilderConfig> = {
  home: {
    pageId: 'home',
    pageName: 'الرئيسية (Home)',
    hero: {
      id: 'home-hero',
      title: 'KOLI ONE',
      subtitle: 'Premium Auto Marketplace',
      backgroundColor: '#0a0f1c',
      textColor: '#ffffff',
      imageUrl: '',
      visible: true,
      align: 'center',
    },
    sections: [
      { id: 'sticky_search', label: 'Sticky Search Bar (Floating)', visible: true, order: 1, backgroundColor: 'default', category: 'main' },
      { id: 'hero', label: 'Hero Section (Main Banner)', visible: true, order: 2, backgroundColor: 'default', category: 'main' },
      { id: 'our_cars', label: 'Our Cars Showcase', visible: true, order: 2.5, backgroundColor: 'default', category: 'main' },
      { id: 'smart_recommendations', label: 'Smart Recommendations', visible: true, order: 3, backgroundColor: 'default', category: 'main' },
      { id: 'ai_analysis_banner', label: 'AI Analysis Banner', visible: true, order: 4, backgroundColor: 'default', category: 'main' },
      { id: 'hero_strips', label: 'Horizontal Hero Strips', visible: true, order: 5, backgroundColor: 'default', category: 'main' },
      { id: 'visual_search', label: 'Visual Search Teaser', visible: true, order: 6, backgroundColor: 'default', category: 'main' },
      { id: 'vehicle_classifications', label: 'Vehicle Classifications', visible: true, order: 7, backgroundColor: 'default', category: 'main' },
      { id: 'life_moments', label: 'Life Moments Browse', visible: true, order: 8, backgroundColor: 'default', category: 'main' },
      { id: 'categories', label: 'Categories Section (Mobile)', visible: false, order: 8.5, backgroundColor: 'default', category: 'main' },
      { id: 'cars_showcase', label: 'Cars Showcase', visible: true, order: 9, backgroundColor: 'default', category: 'main' },
      { id: 'popular_brands', label: 'Popular Brands', visible: true, order: 10, backgroundColor: 'default', category: 'main' },
      { id: 'most_demanded', label: 'Most Demanded Categories', visible: true, order: 11, backgroundColor: 'default', category: 'main' },
      { id: 'featured_showcase', label: 'Featured Showcase (VIP)', visible: true, order: 12, backgroundColor: 'default', category: 'main' },
      { id: 'smart_sell', label: 'Unified Smart Sell CTA', visible: true, order: 13, backgroundColor: 'default', category: 'main' },
      { id: 'dealers', label: 'Dealers Spotlight', visible: true, order: 14, backgroundColor: 'default', category: 'main' },
      { id: 'trust_stats', label: 'Trust & Stats', visible: true, order: 15, backgroundColor: 'default', category: 'main' },
      { id: 'social', label: 'Social Experience', visible: true, order: 16, backgroundColor: 'default', category: 'main' },
      { id: 'loyalty', label: 'Loyalty & Signup', visible: true, order: 17, backgroundColor: 'default', category: 'main' },
      { id: 'pricing_plans', label: 'Subscriptions & Pricing', visible: true, order: 17.5, backgroundColor: 'default', category: 'main' },
      { id: 'recent_browsing', label: 'Recent Browsing', visible: true, order: 18, backgroundColor: 'default', category: 'conditional' },
      { id: 'ai_chatbot', label: 'AI Chatbot (Floating)', visible: true, order: 19, backgroundColor: 'default', category: 'floating' },
      { id: 'draft_recovery', label: 'Draft Recovery (Floating)', visible: true, order: 20, backgroundColor: 'default', category: 'floating' }
    ],
  },
  search: {
    pageId: 'search',
    pageName: 'مستكشف السيارات (Search)',
    hero: {
      id: 'search-hero',
      title: 'Find Your Dream Car',
      subtitle: 'Thousands of premium cars across Bulgaria',
      backgroundColor: '#0f172a',
      textColor: '#ffffff',
      imageUrl: '',
      visible: true,
      align: 'center',
    },
    sections: [
      { id: 'filters-sidebar', label: 'Filters Sidebar', visible: true, order: 1, backgroundColor: 'default' },
      { id: 'results-grid', label: 'Results Grid', visible: true, order: 2, backgroundColor: 'default' },
      { id: 'ai-recommendations', label: 'AI Recommended', visible: true, order: 3, backgroundColor: 'default' },
    ],
  },
  dealers: {
    pageId: 'dealers',
    pageName: 'قائمة المعارض (Dealerships)',
    hero: {
      id: 'dealers-hero',
      title: 'Certified Dealerships',
      subtitle: 'Buy from the most trusted dealers in Bulgaria',
      backgroundColor: '#172033',
      textColor: '#ffffff',
      imageUrl: '',
      visible: true,
      align: 'center',
    },
    sections: [
      { id: 'dealers-map', label: 'Interactive Map', visible: true, order: 1, backgroundColor: 'default' },
      { id: 'dealers-list', label: 'Dealerships Directory', visible: true, order: 2, backgroundColor: 'default' },
    ],
  },
  sell: {
    pageId: 'sell',
    pageName: 'بيع سيارتك (Sell Car)',
    hero: {
      id: 'sell-hero',
      title: 'Sell Your Car Instantly',
      subtitle: 'Reach millions of active buyers with Koli One AI Valuation',
      backgroundColor: '#0a0f1c',
      textColor: '#ffffff',
      imageUrl: '',
      visible: true,
      align: 'center',
    },
    sections: [
      { id: 'ai-valuation', label: 'AI Auto-Valuation', visible: true, order: 1, backgroundColor: 'default' },
      { id: 'upload-photos', label: 'Smart Photo Uploader', visible: true, order: 2, backgroundColor: 'default' },
      { id: 'car-details', label: 'Vehicle Specifications', visible: true, order: 3, backgroundColor: 'default' },
    ],
  },
};

const PageBuilderManager: React.FC = () => {
  const [selectedPageId, setSelectedPageId] = useState<string>('home');
  const [config, setConfig] = useState<PageBuilderConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadConfig(selectedPageId);
  }, [selectedPageId]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadConfig = async (pageId: string) => {
    try {
      setLoading(true);
      const docRef = doc(db, 'app_settings', `page_builder_${pageId}`);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data() as PageBuilderConfig;
        
        // Sorting sections by their order dynamically exactly as stored
        const sortedSections = [...(data.sections || [])].sort((a, b) => a.order - b.order);
        
        setConfig({
          ...data,
          sections: sortedSections
        });
      } else {
        // Fallback to default
        setConfig(DEFAULT_CONFIGS[pageId] || DEFAULT_CONFIGS['home']);
      }
    } catch (e) {
      logger.error('Failed to load page builder config', e as Error);
      showMessage('error', 'Failed to load page configuration from cloud.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      const docRef = doc(db, 'app_settings', `page_builder_${config.pageId}`);
      
      // Enforce correct order explicitly
      const sortedSections = [...config.sections].map((sec, idx) => ({
        ...sec,
        order: idx + 1
      }));
      
      await setDoc(docRef, {
        ...config,
        sections: sortedSections,
        updatedAt: serverTimestamp()
      });

      // SYNC WITH LEGACY HOMEPAGE MECHANISM 
      // This ensures 100% backward compatibility so it instantly applies to all visitors!
      if (config.pageId === 'home') {
        const legacySectionsRef = doc(db, 'app_settings', 'homepage_sections');
        // We match keys to id
        const legacySections = sortedSections.map(sec => ({
          key: sec.id,
          label: sec.label,
          description: sec.label,
          visible: sec.visible,
          order: sec.order,
          category: sec.category || 'main'
        }));
        await setDoc(legacySectionsRef, { sections: legacySections }, { merge: true });

        const legacyFeaturedRef = doc(db, 'app_settings', 'featured_content');
        await setDoc(legacyFeaturedRef, {
          homepageHero: {
            titleEn: config.hero.title,
            titleBg: config.hero.title,
            subtitleEn: config.hero.subtitle,
            subtitleBg: config.hero.subtitle,
            ariaLabelEn: config.hero.title,
            ariaLabelBg: config.hero.title,
            trustItems: [
              { id: '1', icon: 'shield', labelEn: 'Trusted', labelBg: 'Trusted' },
              { id: '2', icon: 'search', labelEn: 'Easy Search', labelBg: 'Easy Search' }
            ]
          }
        }, { merge: true });
      }
      
      setConfig({ ...config, sections: sortedSections });
      showMessage('success', `Page layout securely published to '${config.pageName}' globally!`);
    } catch (e) {
      logger.error('Failed to save page layout', e as Error);
      showMessage('error', 'Failed to publish settings globally.');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: keyof PageHeroConfig, value: any) => {
    setConfig(prev => prev ? { ...prev, hero: { ...prev.hero, [field]: value } } : null);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!config) return;
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= config.sections.length) return;
    
    const newSections = [...config.sections];
    // Swap
    [newSections[index], newSections[newIdx]] = [newSections[newIdx], newSections[index]];
    
    // Update order values automatically based on their position in the array
    newSections.forEach((s, idx) => s.order = idx + 1);
    
    setConfig({ ...config, sections: newSections });
  };

  const toggleSectionVisibility = (index: number) => {
    if (!config) return;
    const newSections = [...config.sections];
    newSections[index].visible = !newSections[index].visible;
    setConfig({ ...config, sections: newSections });
  };

  if (loading && !config) {
    return <div style={{ color: '#fff', padding: '20px' }}>Loading Cloud Layout...</div>;
  }

  return (
    <Container>
      <Header>
        <TitleGroup>
          <Title>
            <MonitorPlay size={24} /> God Mode Page Builder
          </Title>
          <Subtitle>
            Strict and instant comprehensive control over all system heroes and specific sections across the entire platform. Every change here instantly propagates to all visitors globally (Web + Mobile). This replaces the older limited configurations.
          </Subtitle>
        </TitleGroup>
        <LiveBadge>
          <Globe2 size={14} /> Global Broadcast Active
        </LiveBadge>
      </Header>

      {message && (
        <Message $type={message.type}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : null}
          {message.text}
        </Message>
      )}

      <SelectWrap>
        <Label>Select Target Page</Label>
        <Select 
          value={selectedPageId} 
          onChange={(e) => setSelectedPageId(e.target.value)}
          disabled={saving || loading}
        >
          {PAGE_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.title}</option>
          ))}
        </Select>
      </SelectWrap>

      {config && (
        <Grid>
          {/* HERO SECTION EDITS */}
          <Card>
            <CardTitle><LayoutTemplate size={18} /> Hero Section Control</CardTitle>
            
            <FieldRow>
              <Label>Hero Title</Label>
              <Input 
                value={config.hero.title}
                onChange={e => updateHero('title', e.target.value)} 
                placeholder="Main Page Title" 
              />
            </FieldRow>

            <FieldRow>
              <Label>Hero Subtitle (Description)</Label>
              <Input 
                value={config.hero.subtitle}
                onChange={e => updateHero('subtitle', e.target.value)} 
                placeholder="Engaging subtitle" 
              />
            </FieldRow>

            <Grid style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
              <FieldRow>
                <Label>Background Color</Label>
                <Input 
                  type="color" 
                  value={config.hero.backgroundColor}
                  onChange={e => updateHero('backgroundColor', e.target.value)} 
                  style={{ padding: '2px', height: '40px', cursor: 'pointer' }}
                />
              </FieldRow>
              
              <FieldRow>
                <Label>Text Alignment</Label>
                <Select 
                  value={config.hero.align}
                  onChange={e => updateHero('align', e.target.value)}
                  style={{ padding: '8px' }}
                >
                  <option value="left">Left Array</option>
                  <option value="center">Center Centered</option>
                  <option value="right">Right Aligned</option>
                </Select>
              </FieldRow>
            </Grid>

            {/* Visibility Toggle for Hero itself */}
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Label style={{ margin: 0 }}>Show Page Hero?</Label>
               <IconButton 
                 $active={config.hero.visible} 
                 $danger={!config.hero.visible}
                 onClick={() => updateHero('visible', !config.hero.visible)}
                 title={config.hero.visible ? "Hide globally" : "Show globally"}
               >
                 {config.hero.visible ? <Eye size={16} /> : <EyeOff size={16} />}
               </IconButton>
               <span style={{ fontSize: '12px', color: config.hero.visible ? '#86efac' : '#ef4444' }}>
                 {config.hero.visible ? 'Hero is visible' : 'Hero is completely hidden'}
               </span>
            </div>
          </Card>

          {/* SECTIONS LIST */}
          <Card>
            <CardTitle><Settings2 size={18} /> Dynamic Sections Control</CardTitle>
            <SectionList>
              {config.sections.map((section, idx) => (
                <SectionItem key={section.id}>
                  <SectionInfo>
                    <SectionName>{section.label}</SectionName>
                    <SectionOrder>Rank: #{section.order} • {section.visible ? 'Visible' : 'Hidden'}</SectionOrder>
                  </SectionInfo>
                  <ControlsGroup>
                     <IconButton 
                       onClick={() => moveSection(idx, 'up')}
                       disabled={idx === 0}
                       title="Move up"
                     >
                       <ArrowUp size={16} />
                     </IconButton>
                     <IconButton 
                       onClick={() => moveSection(idx, 'down')}
                       disabled={idx === config.sections.length - 1}
                       title="Move down"
                     >
                       <ArrowDown size={16} />
                     </IconButton>
                     <IconButton 
                       $active={section.visible}
                       onClick={() => toggleSectionVisibility(idx)}
                       title="Toggle explicit visibility"
                       style={{ marginLeft: '8px' }}
                     >
                       {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                     </IconButton>
                  </ControlsGroup>
                </SectionItem>
              ))}
            </SectionList>
            
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: 1.5 }}>
              Use the arrows to reorder how the components render on the page. Use the eye to completely rip the component out of existence.
            </p>
          </Card>
        </Grid>
      )}

      <SaveGroup>
        <Button onClick={() => loadConfig(selectedPageId)} disabled={loading || saving}>
          <RefreshCw size={18} /> Reset Changes
        </Button>
        <Button $primary onClick={handleSave} disabled={loading || saving}>
          <Save size={18} /> 
          {saving ? 'Publishing Matrix...' : 'Broadcast to ALL Users'}
        </Button>
      </SaveGroup>
    </Container>
  );
};

export default PageBuilderManager;
