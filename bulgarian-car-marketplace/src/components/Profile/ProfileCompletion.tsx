// src/components/Profile/ProfileCompletion.tsx
// Profile Completion Widget - مؤشر اكتمال البروفايل
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import * as S from './gauge/GaugeStyles';
import { createArcPath, getGaugeColor } from './gauge/GaugeHelpers';

// ==================== COMPONENT ====================

interface ProfileCompletionProps {
  hasProfileImage: boolean;
  hasCoverImage: boolean;
  hasBio: boolean;
  hasPhone: boolean;
  hasLocation: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  hasProfileImage,
  hasCoverImage,
  hasBio,
  hasPhone,
  hasLocation,
  emailVerified,
  phoneVerified,
  idVerified
}) => {
  const { language } = useLanguage();
  const [displayPercentage, setDisplayPercentage] = useState(0);

  const items = [
    { completed: hasProfileImage, label: language === 'bg' ? 'Добави снимка' : 'Add profile photo' },
    { completed: hasCoverImage, label: language === 'bg' ? 'Добави корица' : 'Add cover image' },
    { completed: hasBio, label: language === 'bg' ? 'Напиши био' : 'Write bio' },
    { completed: hasPhone, label: language === 'bg' ? 'Добави телефон' : 'Add phone number' },
    { completed: hasLocation, label: language === 'bg' ? 'Добави локация' : 'Add location' },
    { completed: emailVerified, label: language === 'bg' ? 'Потвърди имейл' : 'Verify email' },
    { completed: phoneVerified, label: language === 'bg' ? 'Потвърди телефон' : 'Verify phone' },
    { completed: idVerified, label: language === 'bg' ? 'Потвърди самоличност' : 'Verify identity' }
  ];

  const completed = items.filter(item => item.completed).length;
  const total = items.length;
  const percentage = Math.floor((completed / total) * 100);

  // Animate percentage on mount/change
  useEffect(() => {
    const timer = setTimeout(() => setDisplayPercentage(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const gaugeColor = getGaugeColor(percentage);

  return (
    <S.CompletionContainer>
      <S.GaugeContainer>
        <S.GaugeTitle>
          {language === 'bg' ? 'ЗАВЪРШЕНОСТ' : 'COMPLETION'}
        </S.GaugeTitle>
        
        <S.GaugeOuter>
          {/* LED Ring effect */}
          <S.LEDRing $color={gaugeColor} />
          
          {/* Glass reflection effect */}
          <S.GlassReflection />
          
          {/* SVG Speedometer */}
          <S.GaugeSVG width="240" height="240" viewBox="0 0 240 240">
            {/* Background track */}
            <S.GaugeTrack cx="120" cy="120" r="90" />
            
            {/* Tick marks (28 total) */}
            <S.GaugeTicks>
              {Array.from({ length: 28 }, (_, i) => {
                const angle = -225 + (i * 270) / 27;
                const isMajor = i % 3 === 0;
                const innerRadius = isMajor ? 82 : 86;
                const outerRadius = 90;
                const angleRad = (angle * Math.PI) / 180;
                
                return (
                  <S.TickMark
                    key={i}
                    $isMajor={isMajor}
                    x1={120 + innerRadius * Math.cos(angleRad)}
                    y1={120 + innerRadius * Math.sin(angleRad)}
                    x2={120 + outerRadius * Math.cos(angleRad)}
                    y2={120 + outerRadius * Math.sin(angleRad)}
                  />
                );
              })}
            </S.GaugeTicks>
            
            {/* Progress arc */}
            <S.GaugeArc
              d={createArcPath(displayPercentage)}
              $percentage={displayPercentage}
              $color={gaugeColor}
            />
          </S.GaugeSVG>
          
          {/* Numbers (0, 25, 50, 75, 100) */}
          {[0, 25, 50, 75, 100].map((value) => {
            const angle = -225 + (value * 270) / 100;
            return (
              <S.NumberLabel key={value} $angle={angle} $value={value}>
                {value}
              </S.NumberLabel>
            );
          })}
          
          {/* Center digital display */}
          <S.GaugeCenter>
            <S.DigitalDisplay>
              <S.PercentageDisplay $color={gaugeColor}>
                {displayPercentage}
              </S.PercentageDisplay>
              <S.PercentageLabel>COMPLETE</S.PercentageLabel>
            </S.DigitalDisplay>
          </S.GaugeCenter>
          
          {/* Animated needle */}
          <S.NeedleContainer $percentage={displayPercentage} />
          
          {/* Bottom label */}
          <S.SpeedoText>PROFILE STATUS</S.SpeedoText>
        </S.GaugeOuter>
      </S.GaugeContainer>

      {/* Checklist */}
      <div style={{ marginTop: '16px' }}>
        {items.map((item, index) => (
          <S.ChecklistItem key={index} $completed={item.completed}>
            {item.completed ? (
              <CheckCircle size={14} />
            ) : (
              <Circle size={14} />
            )}
            <span>{item.label}</span>
          </S.ChecklistItem>
        ))}
      </div>
    </S.CompletionContainer>
  );
};

export default ProfileCompletion;
