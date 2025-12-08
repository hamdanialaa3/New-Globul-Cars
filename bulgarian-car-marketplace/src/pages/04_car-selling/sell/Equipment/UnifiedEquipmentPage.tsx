// Unified Equipment Page - All Features in One Place
// صفحة موحدة للمعدات - كل الميزات في مكان واحد

import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import SplitScreenLayout from '../../../../components/SplitScreenLayout';
import BrandLogoSphere from '../../../../components/BrandLogoSphere';
import { 
  Shield, Zap, AlertTriangle, Eye, Wind, Droplets, Armchair, Sun, 
  Fan, Snowflake, Radio, Bluetooth, Smartphone, Music, Wifi, Navigation,
  Sparkles, Moon, Circle, KeyRound, Car 
} from 'lucide-react';
import * as S from './UnifiedEquipmentStyles';
import { SellWorkflowLayout } from '../../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../../services/sellWorkflowStepState';
import { useEquipmentSelection } from './useEquipmentSelection';
import { logger } from '../../../../services/logger-service';
import { useUnifiedWorkflow } from '../../../../hooks/useUnifiedWorkflow';
import DeleteDraftButton from '../../../../components/SellWorkflow/DeleteDraftButton';

// Equipment Categories
const EQUIPMENT_CATEGORIES = {
  safety: [
    { id: 'abs', icon: Zap, bgLabel: 'ABS', enLabel: 'ABS' },
    { id: 'esp', icon: Shield, bgLabel: 'ESP', enLabel: 'ESP' },
    { id: 'airbags', icon: Shield, bgLabel: 'Еърбегове', enLabel: 'Airbags' },
    { id: 'parkingSensors', icon: Eye, bgLabel: 'Парк сензори', enLabel: 'Parking Sensors' },
    { id: 'rearviewCamera', icon: Eye, bgLabel: 'Камера за заден ход', enLabel: 'Rearview Camera' },
    { id: 'blindSpotMonitor', icon: AlertTriangle, bgLabel: 'Монитор мъртва зона', enLabel: 'Blind Spot Monitor' },
    { id: 'laneDeparture', icon: AlertTriangle, bgLabel: 'Асистент лента', enLabel: 'Lane Departure' },
    { id: 'collisionWarning', icon: AlertTriangle, bgLabel: 'Предупреждение за сблъсък', enLabel: 'Collision Warning' }
  ],
  comfort: [
    { id: 'ac', icon: Snowflake, bgLabel: 'Климатик', enLabel: 'Air Conditioning' },
    { id: 'climate', icon: Wind, bgLabel: 'Климат контрол', enLabel: 'Climate Control' },
    { id: 'heatedSeats', icon: Armchair, bgLabel: 'Отопляеми седалки', enLabel: 'Heated Seats' },
    { id: 'ventilatedSeats', icon: Fan, bgLabel: 'Вентилирани седалки', enLabel: 'Ventilated Seats' },
    { id: 'sunroof', icon: Sun, bgLabel: 'Панорамен покрив', enLabel: 'Sunroof' },
    { id: 'rainSensor', icon: Droplets, bgLabel: 'Сензор за дъжд', enLabel: 'Rain Sensor' },
    { id: 'cruiseControl', icon: Wind, bgLabel: 'Круиз контрол', enLabel: 'Cruise Control' },
    { id: 'parkAssist', icon: Armchair, bgLabel: 'Авто паркиране', enLabel: 'Park Assist' }
  ],
  infotainment: [
    { id: 'bluetooth', icon: Bluetooth, bgLabel: 'Bluetooth', enLabel: 'Bluetooth' },
    { id: 'navigation', icon: Navigation, bgLabel: 'Навигация', enLabel: 'Navigation' },
    { id: 'carPlay', icon: Smartphone, bgLabel: 'Apple CarPlay', enLabel: 'Apple CarPlay' },
    { id: 'androidAuto', icon: Smartphone, bgLabel: 'Android Auto', enLabel: 'Android Auto' },
    { id: 'soundSystem', icon: Music, bgLabel: 'Аудио система', enLabel: 'Sound System' },
    { id: 'radio', icon: Radio, bgLabel: 'Радио', enLabel: 'Radio' },
    { id: 'wifi', icon: Wifi, bgLabel: 'Wi-Fi хотспот', enLabel: 'Wi-Fi Hotspot' },
    { id: 'usb', icon: Smartphone, bgLabel: 'USB портове', enLabel: 'USB Ports' }
  ],
  extras: [
    { id: 'ledLights', icon: Sparkles, bgLabel: 'LED фарове', enLabel: 'LED Lights' },
    { id: 'xenon', icon: Zap, bgLabel: 'Ксенон фарове', enLabel: 'Xenon Lights' },
    { id: 'daylight', icon: Moon, bgLabel: 'Дневни светлини', enLabel: 'Daytime Running Lights' },
    { id: 'alloyWheels', icon: Circle, bgLabel: 'Алуминиеви джанти', enLabel: 'Alloy Wheels' },
    { id: 'keyless', icon: KeyRound, bgLabel: 'Безключов достъп', enLabel: 'Keyless Entry' },
    { id: 'startStop', icon: Zap, bgLabel: 'Start/Stop система', enLabel: 'Start/Stop System' },
    { id: 'sportPackage', icon: Car, bgLabel: 'Спортен пакет', enLabel: 'Sport Package' },
    { id: 'towHitch', icon: Car, bgLabel: 'Теглич', enLabel: 'Tow Hitch' }
  ]
};

type EquipmentCategory = keyof typeof EQUIPMENT_CATEGORIES;

const UnifiedEquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  
  // ✅ UNIFIED WORKFLOW: Use unified workflow (Step 3)
  const { workflowData, updateData, markStepCompleted } = useUnifiedWorkflow(3);

  const {
    selected: selectedFeatures,
    toggleFeature,
    totalSelected,
    serialize,
    setCategoryFeatures
  } = useEquipmentSelection();
  const vehicleType = searchParams.get('vt');
  const make = searchParams.get('mk');
  const model = searchParams.get('md');
  
  // Helper function to compare arrays
  const arraysEqual = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  };

  // ✅ FIX: Use ref to track if we're restoring data (prevents infinite loop)
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);

  // ✅ UNIFIED WORKFLOW: Restore saved equipment selections on mount and when navigating back
  useEffect(() => {
    // Skip if we've already restored or if there's no workflow data
    if (hasRestoredRef.current || !workflowData || Object.keys(workflowData).length === 0) {
      return;
    }

    // Mark that we're restoring to prevent auto-save
    isRestoringRef.current = true;
    hasRestoredRef.current = true;

    // Restore equipment selections from saved workflow data
    // Only restore if current selection is empty or different
    let hasChanges = false;
    
    if (workflowData.safetyEquipment && Array.isArray(workflowData.safetyEquipment)) {
      const currentSafety = selectedFeatures.safety;
      if (currentSafety.length === 0 || !arraysEqual(currentSafety, workflowData.safetyEquipment)) {
        setCategoryFeatures('safety', workflowData.safetyEquipment);
        hasChanges = true;
      }
    }
    if (workflowData.comfortEquipment && Array.isArray(workflowData.comfortEquipment)) {
      const currentComfort = selectedFeatures.comfort;
      if (currentComfort.length === 0 || !arraysEqual(currentComfort, workflowData.comfortEquipment)) {
        setCategoryFeatures('comfort', workflowData.comfortEquipment);
        hasChanges = true;
      }
    }
    if (workflowData.infotainmentEquipment && Array.isArray(workflowData.infotainmentEquipment)) {
      const currentInfotainment = selectedFeatures.infotainment;
      if (currentInfotainment.length === 0 || !arraysEqual(currentInfotainment, workflowData.infotainmentEquipment)) {
        setCategoryFeatures('infotainment', workflowData.infotainmentEquipment);
        hasChanges = true;
      }
    }
    if (workflowData.extrasEquipment && Array.isArray(workflowData.extrasEquipment)) {
      const currentExtras = selectedFeatures.extras;
      if (currentExtras.length === 0 || !arraysEqual(currentExtras, workflowData.extrasEquipment)) {
        setCategoryFeatures('extras', workflowData.extrasEquipment);
        hasChanges = true;
      }
    }

    // Reset restoring flag after a short delay to allow state updates to complete
    if (hasChanges) {
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 100);
    } else {
      isRestoringRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  
  // ✅ Auto-save equipment on every selection change (but not during restoration)
  useEffect(() => {
    // Skip auto-save if we're currently restoring data
    if (isRestoringRef.current) {
      return;
    }

    // Debounce auto-save to prevent excessive updates
    const timeoutId = setTimeout(() => {
      updateData({
        safetyEquipment: selectedFeatures.safety,
        comfortEquipment: selectedFeatures.comfort,
        infotainmentEquipment: selectedFeatures.infotainment,
        extrasEquipment: selectedFeatures.extras
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [selectedFeatures, updateData]);

  const handleContinue = (e?: React.MouseEvent) => {
    // ✅ FIX: Prevent event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      // ✅ CRITICAL: Mark step as completed
      markStepCompleted();
      SellWorkflowStepStateService.markCompleted('equipment');
      
      // ✅ CRITICAL: Serialize equipment data for next page
      const params = serialize();
      
      // ✅ NEW ROUTE: Ensure vehicleType is valid
      const validVehicleType = vehicleType || 'car';
      const targetPath = `/sell/inserat/${validVehicleType}/images?${params.toString()}`;
      
      console.log('📋 Equipment selected:', {
        safety: selectedFeatures.safety.length,
        comfort: selectedFeatures.comfort.length,
        infotainment: selectedFeatures.infotainment.length,
        extras: selectedFeatures.extras.length
      });
      
      // ✅ Navigate to next step
      navigate(targetPath);
    } catch (error) {
      logger.error('Error saving equipment data', error as Error);
      // ✅ Show user-friendly error message
      const errorMsg = language === 'bg'
        ? 'Грешка при запазване на данните. Моля опитайте отново.'
        : 'Error saving data. Please try again.';
      alert(errorMsg);
    }
  };

  useEffect(() => {
    SellWorkflowStepStateService.markPending('equipment');
  }, []);

  const categoryLabels: Record<EquipmentCategory, { bg: string; en: string }> = {
    safety: { bg: 'Безопасност', en: 'Safety' },
    comfort: { bg: 'Комфорт', en: 'Comfort' },
    infotainment: { bg: 'Инфотейнмънт', en: 'Infotainment' },
    extras: { bg: 'Екстри', en: 'Extras' }
  };

  const getCategoryIcon = (category: EquipmentCategory) => {
    switch (category) {
      case 'safety': return <S.SafetyIcon />;
      case 'comfort': return <S.ComfortIcon />;
      case 'infotainment': return <S.InfotainmentIcon />;
      case 'extras': return <S.ExtrasIcon />;
      default: return null;
    }
  };

  useEffect(() => {
    if (totalSelected > 0) {
      SellWorkflowStepStateService.markCompleted('equipment');
    } else {
      SellWorkflowStepStateService.markPending('equipment');
    }
  }, [totalSelected]);

  const leftContent = (
    <S.ContentSection>
      <S.HeaderCard>
        <S.HeaderContent>
          <S.HeaderText>
            <S.Title>
              {language === 'bg' ? 'Оборудване' : 'Equipment'}
            </S.Title>
            <S.Subtitle>
              {language === 'bg' 
                ? `Изберете всички налични функции • Избрани: ${totalSelected}` 
                : `Select all available features • Selected: ${totalSelected}`}
            </S.Subtitle>
          </S.HeaderText>
          {make && (
            <S.HeaderLogo>
              <BrandLogoSphere 
                make={make} 
                ariaLabel={language === 'bg' ? 'Лого на марката' : 'Brand logo'}
                size={106}
              />
              {model && (
                <S.ModelBadge $isVisible={true}>
                  <span>{model}</span>
                </S.ModelBadge>
              )}
            </S.HeaderLogo>
          )}
        </S.HeaderContent>
      </S.HeaderCard>

      {/* All Equipment Sections - Horizontal Grid */}
      <S.EquipmentSectionsGrid>
        {(Object.keys(EQUIPMENT_CATEGORIES) as EquipmentCategory[]).map(category => {
          const count = selectedFeatures[category].length;
          return (
            <S.EquipmentSection key={category}>
              <S.SectionHeader>
                <S.SectionHeaderLeft>
                  {getCategoryIcon(category)}
                  <S.SectionTitle>
                    {language === 'bg' ? categoryLabels[category].bg : categoryLabels[category].en}
                  </S.SectionTitle>
                </S.SectionHeaderLeft>
                {count > 0 && <S.SectionBadge>{count}</S.SectionBadge>}
              </S.SectionHeader>

              <S.FeaturesContainer>
                {EQUIPMENT_CATEGORIES[category].map((feature) => {
                  const IconComponent = feature.icon;
                  const isSelected = selectedFeatures[category].includes(feature.id);
                  
                  return (
                    <S.FeatureRow key={feature.id}>
                      <S.FeatureInfo>
                        <S.FeatureIconWrapper>
                          <IconComponent size={20} />
                        </S.FeatureIconWrapper>
                        <S.FeatureName>
                          {language === 'bg' ? feature.bgLabel : feature.enLabel}
                        </S.FeatureName>
                      </S.FeatureInfo>

                      <S.CyberToggleWrapper>
                        <S.CyberToggleCheckbox
                          type="checkbox"
                          id={`feature-${category}-${feature.id}`}
                          checked={isSelected}
                          onChange={() => toggleFeature(category, feature.id)}
                        />
                        <S.CyberToggleLabel htmlFor={`feature-${category}-${feature.id}`}>
                          <S.ToggleTrack />
                        </S.CyberToggleLabel>
                      </S.CyberToggleWrapper>
                    </S.FeatureRow>
                  );
                })}
              </S.FeaturesContainer>
            </S.EquipmentSection>
          );
        })}
      </S.EquipmentSectionsGrid>

      <S.InfoBox>
        {language === 'bg' 
          ? '💡 Всички полета са незадължителни. Изберете само наличните функции.' 
          : '💡 All fields are optional. Select only available features.'}
      </S.InfoBox>
    </S.ContentSection>
  );

  return (
    <SellWorkflowLayout currentStep="equipment">
      <SplitScreenLayout 
        leftContent={
          <>
            {leftContent}
            {/* Navigation Buttons - Full width matching HeaderCard */}
            <S.NavigationButtons>
              <div>
                <DeleteDraftButton currentStep={3} isMobile={false} />
                <S.Button type="button" $variant="secondary" onClick={() => navigate(-1)}>
                  ← {language === 'bg' ? 'Назад' : 'Back'}
                </S.Button>
              </div>
              <S.Button type="button" $variant="primary" onClick={(e) => handleContinue(e)}>
                {language === 'bg' ? 'Продължи' : 'Continue'} →
              </S.Button>
            </S.NavigationButtons>
          </>
        } 
      />
    </SellWorkflowLayout>
  );
};

export default UnifiedEquipmentPage;

