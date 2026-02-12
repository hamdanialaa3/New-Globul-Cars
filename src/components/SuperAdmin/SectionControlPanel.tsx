import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Eye, EyeOff, GripVertical, RefreshCw, Layers, Monitor, MessageSquare, ArrowUp, ArrowDown, Gift, Zap } from 'lucide-react';
import { sectionVisibilityService } from '@/services/section-visibility.service';
import { siteSettingsService } from '@/services/site-settings.service';
import type { HomepageSection } from '@/services/section-visibility-types';
import { serviceLogger } from '@/services/logger-service';
import { togglePromotionalOffer } from '@/hooks/usePromotionalOffer';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { getAuth, getIdTokenResult } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useAdminLang } from '@/contexts/AdminLanguageContext';

// ─── Styled Components (dark theme matching SuperAdmin) ───

const PanelContainer = styled.div`
  padding: 24px;
  color: #e2e8f0;
`;

const PanelHeader = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #ff8c61;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
`;

const CategoryLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #64748b;
  margin: 20px 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #2d3748;
`;

const SectionRow = styled.div<{ $visible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 6px;
  background: ${(p) => (p.$visible ? '#1a2332' : '#1a1a2e')};
  border: 1px solid ${(p) => (p.$visible ? '#2d3748' : '#3d2040')};
  border-radius: 8px;
  transition: all 0.15s ease;
  opacity: ${(p) => (p.$visible ? 1 : 0.6)};

  &:hover {
    border-color: #ff8c61;
  }
`;

const SectionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const GripHandle = styled.div`
  color: #475569;
  cursor: grab;
  &:hover {
    color: #ff8c61;
  }
`;

const SectionText = styled.div`
  flex: 1;
`;

const SectionLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
`;

const SectionDescription = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
`;

const SectionKey = styled.div`
  font-size: 10px;
  color: #475569;
  font-family: monospace;
  margin-top: 2px;
`;

const OrderButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-right: 8px;
`;

const ArrowButton = styled.button<{ $disabled: boolean }>`
  padding: 4px;
  background: #1e2432;
  border: 1px solid #2d3748;
  border-radius: 4px;
  color: ${p => p.$disabled ? '#475569' : '#94a3b8'};
  cursor: ${p => p.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${p => p.$disabled ? 0.3 : 1};

  &:hover {
    background: ${p => p.$disabled ? '#1e2432' : '#2d3748'};
    color: ${p => p.$disabled ? '#475569' : '#ff8c61'};
    border-color: ${p => p.$disabled ? '#2d3748' : '#ff8c61'};
  }
`;

const ToggleButton = styled.button<{ $visible: boolean; $saving: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: ${(p) => (p.$saving ? 'wait' : 'pointer')};
  transition: all 0.15s ease;
  opacity: ${(p) => (p.$saving ? 0.5 : 1)};

  ${(p) =>
    p.$visible
      ? `
    background: #166534;
    color: #bbf7d0;
    &:hover { background: #15803d; }
  `
      : `
    background: #991b1b;
    color: #fecaca;
    &:hover { background: #b91c1c; }
  `}
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 14px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 20px;
  color: #ef4444;
  font-size: 13px;
  background: #1a0a0a;
  border: 1px solid #7f1d1d;
  border-radius: 8px;
`;

const StatsBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #1e2432;
  border-radius: 8px;
  border: 1px solid #2d3748;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  font-size: 12px;
  color: #94a3b8;
  span {
    font-weight: 700;
    color: #ff8c61;
  }
`;

const SeedButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ff8c61;
  color: #0f1419;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: #ff7043;
  }
`;

// ─── Component ───

// ─── Free Offer Styled Components ───

const FreeOfferPanel = styled.div<{ $active: boolean }>`
  margin-bottom: 24px;
  padding: 20px;
  background: ${p => p.$active
    ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.15), rgba(34, 197, 94, 0.08))'
    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(185, 28, 28, 0.04))'};
  border: 2px solid ${p => p.$active ? '#16a34a' : '#374151'};
  border-radius: 12px;
  transition: all 0.3s ease;
`;

const FreeOfferHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const FreeOfferTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #ff8c61;
`;

const FreeOfferDesc = styled.p`
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 4px 0;
  line-height: 1.5;
`;

const FreeOfferStatus = styled.div<{ $active: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
  background: ${p => p.$active ? '#166534' : '#991b1b'};
  color: ${p => p.$active ? '#bbf7d0' : '#fecaca'};
`;

const FreeOfferToggle = styled.button<{ $active: boolean; $saving: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: ${p => p.$saving ? 'wait' : 'pointer'};
  opacity: ${p => p.$saving ? 0.5 : 1};
  transition: all 0.2s ease;

  ${p => p.$active ? `
    background: #dc2626;
    color: #fff;
    &:hover { background: #b91c1c; }
  ` : `
    background: #16a34a;
    color: #fff;
    &:hover { background: #15803d; }
  `}
`;

/**
 * Ensure the current Firebase Auth user is signed in and has role: 'admin'.
 */
async function ensureAdminRole(): Promise<boolean> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Admin authentication required. Please sign in.');
    }

    const token = await getIdTokenResult(user, true);
    if (token?.claims?.admin === true) {
      return true;
    }

    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const role = snap.exists() ? snap.data()?.role : null;
    if (role === 'admin') {
      return true;
    }

    throw new Error('Access denied. Admin role required.');
  } catch (err) {
    serviceLogger.error('[SectionControlPanel] ensureAdminRole failed:', { error: err });
    return false;
  }
}

const SectionControlPanel: React.FC = () => {
  const { t } = useAdminLang();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Ensure admin role on mount, THEN load sections ───
  useEffect(() => {
    let isActive = true;

    const init = async () => {
      // Step 1: Ensure Firebase Auth is signed in
      const isAdmin = await ensureAdminRole();
      if (!isAdmin) {
        if (isActive) {
          setError('Admin access required. Please sign in with an admin account.');
          setLoading(false);
        }
        return;
      }

      // Step 2: Load sections (may trigger seed if first time)
      try {
        const data = await sectionVisibilityService.getAll();
        if (isActive) setSections(data);
      } catch (e) {
        if (isActive) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (isActive) setLoading(false);
      }
    };

    init();
    return () => { isActive = false; };
  }, []);
  const [freeOfferActive, setFreeOfferActive] = useState(false);
  const [freeOfferSaving, setFreeOfferSaving] = useState(false);

  // Listen to free offer state in real-time
  useEffect(() => {
    let isActive = true;
    const ref = doc(db, 'app_settings', 'promotional_offer');
    const unsub = onSnapshot(ref, (snap) => {
      if (!isActive) return;
      if (snap.exists()) {
        setFreeOfferActive(snap.data()?.isActive ?? false);
      } else {
        setFreeOfferActive(false);
      }
    }, () => {
      if (isActive) setFreeOfferActive(false);
    });
    return () => { isActive = false; unsub(); };
  }, []);

  const getAdminEmail = (): string => {
    const auth = getAuth();
    return auth.currentUser?.email || 'unknown';
  };

  const handleFreeOfferToggle = async () => {
    setFreeOfferSaving(true);
    setError(null);
    try {
      // Try to ensure Firebase Auth — but proceed even if it fails
      await ensureAdminRole();

      const adminEmail = getAdminEmail();
      const newState = !freeOfferActive;

      // 1. Update Promotional Offer (Existing logic)
      await togglePromotionalOffer(newState, adminEmail);

      // 2. Sync with Site Settings (New logic for parity)
      try {
        const currentSettings = await siteSettingsService.getSiteSettings();
        await siteSettingsService.updateSiteSettings({
          pricing: {
            ...currentSettings.pricing,
            subscriptionMode: newState ? 'free' : 'paid'
          }
        }, adminEmail);
        serviceLogger.info('[FreeOffer] Synced with SiteSettings', { mode: newState ? 'free' : 'paid' });
      } catch (syncErr) {
        serviceLogger.warn('[FreeOffer] Failed to sync SiteSettings, but Promotional Offer applied', { error: syncErr });
        // Do not fail the whole operation if site settings sync fails (e.g. permission strictness)
      }

      // ✅ Visual feedback
      if (newState) {
        toast.success('🎉 Free Offer ACTIVATED! Go to homepage to see changes.');
      } else {
        toast.info('❌ Free Offer DEACTIVATED. Normal payment required.');
      }
      serviceLogger.info('[FreeOffer] Toggled', { newState, adminEmail });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Free offer toggle failed';
      setError(msg);
      toast.error(`Toggle failed: ${msg}`);
      serviceLogger.error('[FreeOffer] Toggle error', { error: e });
    } finally {
      setFreeOfferSaving(false);
    }
  };

  const loadSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sectionVisibilityService.getAll();
      setSections(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      serviceLogger.error('[SectionControlPanel] Load failed:', { error: e });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (section: HomepageSection) => {
    setSavingKey(section.key);
    setError(null);
    try {
      const adminEmail = getAdminEmail();
      await sectionVisibilityService.toggle(section.key, !section.visible, adminEmail);
      setSections((prev) =>
        prev.map((s) => (s.key === section.key ? { ...s, visible: !s.visible } : s))
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Toggle failed';
      setError(msg);
    } finally {
      setSavingKey(null);
    }
  };

  const handleMoveUp = async (section: HomepageSection, sectionsList: HomepageSection[]) => {
    const currentIndex = sectionsList.findIndex(s => s.key === section.key);
    if (currentIndex <= 0) return; // Already at top

    setSavingKey(section.key);
    setError(null);
    try {
      // Swap order values with previous section
      const newSections = [...sections];
      const allIndex = newSections.findIndex(s => s.key === section.key);
      const prevSection = sectionsList[currentIndex - 1];
      const prevIndex = newSections.findIndex(s => s.key === prevSection.key);

      const tempOrder = newSections[allIndex].order;
      newSections[allIndex] = { ...newSections[allIndex], order: newSections[prevIndex].order };
      newSections[prevIndex] = { ...newSections[prevIndex], order: tempOrder };

      // Update state immediately for responsive UI
      setSections(newSections.sort((a, b) => a.order - b.order));

      // Save to Firestore
      const orderedKeys = newSections.sort((a, b) => a.order - b.order).map(s => s.key);
      const adminEmail = getAdminEmail();
      await sectionVisibilityService.reorder(orderedKeys, adminEmail);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Move failed';
      setError(msg);
      await loadSections(); // Reload on error
    } finally {
      setSavingKey(null);
    }
  };

  const handleMoveDown = async (section: HomepageSection, sectionsList: HomepageSection[]) => {
    const currentIndex = sectionsList.findIndex(s => s.key === section.key);
    if (currentIndex >= sectionsList.length - 1) return; // Already at bottom

    setSavingKey(section.key);
    setError(null);
    try {
      // Swap order values with next section
      const newSections = [...sections];
      const allIndex = newSections.findIndex(s => s.key === section.key);
      const nextSection = sectionsList[currentIndex + 1];
      const nextIndex = newSections.findIndex(s => s.key === nextSection.key);

      const tempOrder = newSections[allIndex].order;
      newSections[allIndex] = { ...newSections[allIndex], order: newSections[nextIndex].order };
      newSections[nextIndex] = { ...newSections[nextIndex], order: tempOrder };

      // Update state immediately for responsive UI
      setSections(newSections.sort((a, b) => a.order - b.order));

      // Save to Firestore
      const orderedKeys = newSections.sort((a, b) => a.order - b.order).map(s => s.key);
      const adminEmail = getAdminEmail();
      await sectionVisibilityService.reorder(orderedKeys, adminEmail);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Move failed';
      setError(msg);
      await loadSections(); // Reload on error
    } finally {
      setSavingKey(null);
    }
  };

  const handleSeedDefaults = async () => {
    setLoading(true);
    try {
      const adminEmail = getAdminEmail();
      await sectionVisibilityService.seedDefaults(adminEmail);
      await loadSections();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Seed failed');
    } finally {
      setLoading(false);
    }
  };

  // Group sections by category
  const mainSections = sections.filter((s) => s.category === 'main');
  const conditionalSections = sections.filter((s) => s.category === 'conditional');
  const floatingSections = sections.filter((s) => s.category === 'floating');
  const visibleCount = sections.filter((s) => s.visible).length;

  if (loading) {
    return <LoadingState>Loading section configuration...</LoadingState>;
  }

  return (
    <PanelContainer>
      <PanelHeader>
        <Title>🎛️ {t.sections.title}</Title>
        <Subtitle>
          {t.sections.subtitle}
        </Subtitle>
      </PanelHeader>

      {error && <ErrorState>⚠️ {error}</ErrorState>}

      <StatsBar>
        <StatItem>
          {t.sections.total}: <span>{sections.length}</span>
        </StatItem>
        <StatItem>
          {t.sections.visible}: <span>{visibleCount}</span>
        </StatItem>
        <StatItem>
          {t.sections.hidden}: <span>{sections.length - visibleCount}</span>
        </StatItem>
        <SeedButton onClick={handleSeedDefaults}>
          <RefreshCw size={12} /> {t.sections.reset}
        </SeedButton>
      </StatsBar>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FREE OFFER TOGGLE — Free Offer                                */}
      {/* Controls whether plans are free (no payment) or paid           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <FreeOfferPanel $active={freeOfferActive}>
        <FreeOfferHeader>
          <FreeOfferTitle>
            <Gift size={20} />
            {t.sections.freeOffer}
            <FreeOfferStatus $active={freeOfferActive}>
              {freeOfferActive ? `✅ ${t.sections.freeOfferActive}` : `❌ ${t.sections.freeOfferInactive}`}
            </FreeOfferStatus>
          </FreeOfferTitle>
        </FreeOfferHeader>
        <FreeOfferDesc>
          🔹 <strong>{t.sections.freeOfferActive}</strong>: {t.sections.freeDescOn}
        </FreeOfferDesc>
        <FreeOfferDesc>
          🔹 <strong>{t.sections.freeOfferInactive}</strong>: {t.sections.freeDescOff}
        </FreeOfferDesc>
        <div style={{ marginTop: '12px' }}>
          <FreeOfferToggle
            $active={freeOfferActive}
            $saving={freeOfferSaving}
            onClick={handleFreeOfferToggle}
            disabled={freeOfferSaving}
          >
            {freeOfferSaving ? (
              t.sections.save
            ) : freeOfferActive ? (
              <>
                <Zap size={16} /> {t.sections.deactivateFree}
              </>
            ) : (
              <>
                <Gift size={16} /> {t.sections.activateFree}
              </>
            )}
          </FreeOfferToggle>
        </div>
      </FreeOfferPanel>

      {/* Main Sections */}
      <CategoryLabel>
        <Monitor size={12} style={{ display: 'inline', marginRight: 6 }} />
        {t.sections.mainSections} ({mainSections.length})
      </CategoryLabel>
      {mainSections.map((s, idx) => (
        <SectionRow key={s.key} $visible={s.visible}>
          <SectionInfo>
            <GripHandle>
              <GripVertical size={16} />
            </GripHandle>
            <SectionText>
              <SectionLabel>{s.label}</SectionLabel>
              <SectionDescription>{s.description}</SectionDescription>
              <SectionKey>key: {s.key} | order: {s.order}</SectionKey>
            </SectionText>
          </SectionInfo>
          <OrderButtons>
            <ArrowButton
              $disabled={idx === 0 || savingKey === s.key}
              onClick={() => handleMoveUp(s, mainSections)}
              disabled={idx === 0 || savingKey === s.key}
              title="Move up"
            >
              <ArrowUp size={12} />
            </ArrowButton>
            <ArrowButton
              $disabled={idx === mainSections.length - 1 || savingKey === s.key}
              onClick={() => handleMoveDown(s, mainSections)}
              disabled={idx === mainSections.length - 1 || savingKey === s.key}
              title="Move down"
            >
              <ArrowDown size={12} />
            </ArrowButton>
          </OrderButtons>
          <ToggleButton
            $visible={s.visible}
            $saving={savingKey === s.key}
            onClick={() => handleToggle(s)}
            disabled={savingKey === s.key}
          >
            {savingKey === s.key ? (
              t.sections.save
            ) : s.visible ? (
              <>
                <Eye size={14} /> {t.sections.visible}
              </>
            ) : (
              <>
                <EyeOff size={14} /> {t.sections.hidden}
              </>
            )}
          </ToggleButton>
        </SectionRow>
      ))}

      {/* Conditional Sections */}
      <CategoryLabel>
        <Layers size={12} style={{ display: 'inline', marginRight: 6 }} />
        {t.sections.conditionalSections} ({conditionalSections.length})
      </CategoryLabel>
      {conditionalSections.map((s, idx) => (
        <SectionRow key={s.key} $visible={s.visible}>
          <SectionInfo>
            <GripHandle>
              <GripVertical size={16} />
            </GripHandle>
            <SectionText>
              <SectionLabel>{s.label}</SectionLabel>
              <SectionDescription>{s.description}</SectionDescription>
              <SectionKey>key: {s.key} | order: {s.order}</SectionKey>
            </SectionText>
          </SectionInfo>
          <OrderButtons>
            <ArrowButton
              $disabled={idx === 0 || savingKey === s.key}
              onClick={() => handleMoveUp(s, conditionalSections)}
              disabled={idx === 0 || savingKey === s.key}
              title="Move up"
            >
              <ArrowUp size={12} />
            </ArrowButton>
            <ArrowButton
              $disabled={idx === conditionalSections.length - 1 || savingKey === s.key}
              onClick={() => handleMoveDown(s, conditionalSections)}
              disabled={idx === conditionalSections.length - 1 || savingKey === s.key}
              title="Move down"
            >
              <ArrowDown size={12} />
            </ArrowButton>
          </OrderButtons>
          <ToggleButton
            $visible={s.visible}
            $saving={savingKey === s.key}
            onClick={() => handleToggle(s)}
            disabled={savingKey === s.key}
          >
            {savingKey === s.key ? (
              t.sections.save
            ) : s.visible ? (
              <>
                <Eye size={14} /> {t.sections.visible}
              </>
            ) : (
              <>
                <EyeOff size={14} /> {t.sections.hidden}
              </>
            )}
          </ToggleButton>
        </SectionRow>
      ))}

      {/* Floating Elements */}
      <CategoryLabel>
        <MessageSquare size={12} style={{ display: 'inline', marginRight: 6 }} />
        {t.sections.floatingSections} ({floatingSections.length})
      </CategoryLabel>
      {floatingSections.map((s, idx) => (
        <SectionRow key={s.key} $visible={s.visible}>
          <SectionInfo>
            <GripHandle>
              <GripVertical size={16} />
            </GripHandle>
            <SectionText>
              <SectionLabel>{s.label}</SectionLabel>
              <SectionDescription>{s.description}</SectionDescription>
              <SectionKey>key: {s.key} | order: {s.order}</SectionKey>
            </SectionText>
          </SectionInfo>
          <OrderButtons>
            <ArrowButton
              $disabled={idx === 0 || savingKey === s.key}
              onClick={() => handleMoveUp(s, floatingSections)}
              disabled={idx === 0 || savingKey === s.key}
              title="Move up"
            >
              <ArrowUp size={12} />
            </ArrowButton>
            <ArrowButton
              $disabled={idx === floatingSections.length - 1 || savingKey === s.key}
              onClick={() => handleMoveDown(s, floatingSections)}
              disabled={idx === floatingSections.length - 1 || savingKey === s.key}
              title="Move down"
            >
              <ArrowDown size={12} />
            </ArrowButton>
          </OrderButtons>
          <ToggleButton
            $visible={s.visible}
            $saving={savingKey === s.key}
            onClick={() => handleToggle(s)}
            disabled={savingKey === s.key}
          >
            {savingKey === s.key ? (
              t.sections.save
            ) : s.visible ? (
              <>
                <Eye size={14} /> {t.sections.visible}
              </>
            ) : (
              <>
                <EyeOff size={14} /> {t.sections.hidden}
              </>
            )}
          </ToggleButton>
        </SectionRow>
      ))}
    </PanelContainer>
  );
};

export default SectionControlPanel;
