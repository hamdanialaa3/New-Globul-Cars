// src/components/Profile/TrustBadge.tsx
// Trust Badge Component - مكون عرض درجة الثقة والشارات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { TrustLevel, Badge } from '@globul-cars/services/profile/trust-score-service';
import * as S from './trust/TrustGaugeStyles';
import {
  getTrustColor,
  getLevelName,
  createTrustArcPath
} from './trust/TrustGaugeHelpers';

// ==================== COMPONENT ====================

interface TrustBadgeProps {
  trustScore: number;
  level: TrustLevel;
  badges?: Badge[];
}

const TrustBadgeComponent: React.FC<TrustBadgeProps> = ({
  trustScore,
  level,
  badges = []
}) => {
  const { language } = useLanguage();
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score on mount/change
  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(trustScore), 150);
    return () => clearTimeout(timer);
  }, [trustScore]);

  const gaugeColor = getTrustColor(level);
  const levelName = getLevelName(level, language);

  return (
    <S.TrustContainer>
      <S.GaugeContainer>
        <S.GaugeTitle>
          {language === 'bg' ? 'НИВО НА ДОВЕРИЕ' : 'TRUST LEVEL'}
        </S.GaugeTitle>
        
        <S.GaugeOuter>
          {/* ⚡ REMOVED: LED Ring effect - User requested deletion */}
          
          {/* Glass reflection */}
          <S.GlassReflection />
          
          {/* SVG Gauge - ⚡ RESIZED: 60% smaller (220 → 88) */}
          <S.GaugeSVG width="88" height="88" viewBox="0 0 88 88">
            {/* Background track - ⚡ RESIZED: radius scaled (83 → 33) */}
            <S.GaugeTrack cx="44" cy="44" r="33" />
            
            {/* Tick marks */}
            <S.GaugeTicks>
              {Array.from({ length: 28 }, (_, i) => {
                const angle = -225 + (i * 270) / 27;
                const isMajor = i % 3 === 0;
                /* ⚡ RESIZED: radius scaled proportionally */
                const innerRadius = isMajor ? 30 : 32;
                const outerRadius = 33;
                const angleRad = (angle * Math.PI) / 180;
                
                return (
                  <S.TickMark
                    key={i}
                    $isMajor={isMajor}
                    x1={44 + innerRadius * Math.cos(angleRad)}
                    y1={44 + innerRadius * Math.sin(angleRad)}
                    x2={44 + outerRadius * Math.cos(angleRad)}
                    y2={44 + outerRadius * Math.sin(angleRad)}
                  />
                );
              })}
            </S.GaugeTicks>
            
            {/* Colored progress arc */}
            <S.GaugeArc
              d={createTrustArcPath(displayScore)}
              $color={gaugeColor}
            />
          </S.GaugeSVG>
          
          {/* Numbers (0, 25, 50, 75, 100) */}
          {[0, 25, 50, 75, 100].map((value) => {
            const angle = -225 + (value * 270) / 100;
            return (
              <S.NumberLabel key={value} $angle={angle}>
                {value}
              </S.NumberLabel>
            );
          })}
          
          {/* Center digital display */}
          <S.GaugeCenter>
            <S.DigitalDisplay>
              <S.LevelLabel>
                {levelName}
              </S.LevelLabel>
              <S.ScoreDisplay $color={gaugeColor}>
                {displayScore}/100
              </S.ScoreDisplay>
            </S.DigitalDisplay>
          </S.GaugeCenter>
          
          {/* Animated needle */}
          <S.NeedleContainer $score={displayScore} />
          
          {/* Bottom label */}
          <S.TrustText>TRUST SCORE</S.TrustText>
        </S.GaugeOuter>
      </S.GaugeContainer>

      {/* Badges */}
      {badges.length > 0 ? (
        <S.BadgesContainer>
          {badges.map((badge) => (
            <S.BadgeItem key={badge.id}>
              <span className="icon">{badge.icon}</span>
              <span className="name">
                {language === 'bg' ? badge.name : badge.nameEn}
              </span>
            </S.BadgeItem>
          ))}
        </S.BadgesContainer>
      ) : (
        <S.EmptyBadges>
          {language === 'bg' 
            ? 'Няма значки. Потвърдете профила си!'
            : 'No badges yet. Verify your profile!'}
        </S.EmptyBadges>
      )}
    </S.TrustContainer>
  );
};

export default TrustBadgeComponent;
