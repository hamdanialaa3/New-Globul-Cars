// ╔════════════════════════════════════════════════════════════════════════╗
// ║               PROFESSIONAL IDENTITY STAMP - mobilebg.eu                 ║
// ║  Real-time visual verification stamp for user profiles                  ║
// ╚════════════════════════════════════════════════════════════════════════╝

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface IdentityStampProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  region?: string;
  city?: string;
  address?: string;
  numericId?: number;
  isDark?: boolean; // للتحكم بالألوان حسب الوضع
}

const StampContainer = styled.div`
  position: absolute;
  top: -145px;
  right: 25px;
  width: 350px;
  height: 350px;
  cursor: pointer;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: rotate(-8deg);
  user-select: none;
  pointer-events: none;
  opacity: 0.85;
  z-index: 1;

  &:hover {
    opacity: 1;
    transform: rotate(-8deg) scale(1.05);
  }

  &:active {
    transform: rotate(-8deg) scale(0.98);
  }

  @media (max-width: 1400px) {
    top: -116px;
    right: 40px;
    width: 320px;
    height: 320px;
  }

  @media (max-width: 1200px) {
    position: relative;
    right: 0;
    top: 0;
    width: 280px;
    height: 280px;
    margin: 20px auto;
    transform: rotate(-5deg);
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    width: 220px;
    height: 220px;
  }
`;

const StampSVG = styled.svg<{ $isDark?: boolean }>`
  width: 100%;
  height: 100%;
  filter: url(#ink-bleed-pro);
  
  /* تحسين جودة الرندر */
  shape-rendering: geometricPrecision;
  text-rendering: optimizeLegibility;
  
  /* ألوان ديناميكية حسب الوضع */
  --stamp-color: ${props => props.$isDark 
    ? 'rgba(96, 165, 250, 0.95)' /* أزرق فاتح مضيء للوضع الداكن */
    : 'rgba(28, 49, 116, 0.88)' /* نيلي غامق للوضع الفاتح */
  };
  
  --stamp-glow: ${props => props.$isDark 
    ? '0 0 20px rgba(96, 165, 250, 0.4), 0 0 40px rgba(96, 165, 250, 0.2)'
    : '0 0 15px rgba(28, 49, 116, 0.3)'
  };
`;

const IdentityStamp: React.FC<IdentityStampProps> = ({
  firstName = 'FIRST NAME',
  lastName = 'LAST NAME',
  email = 'EMAIL@EXAMPLE.COM',
  phone = '+359 00 000 000',
  region = 'REGION',
  city = 'CITY',
  address = 'ADDRESS',
  numericId = 0,
  isDark = false
}) => {
  const stampRef = useRef<HTMLDivElement>(null);

  // تأثير البصمة عند تحديث البيانات
  useEffect(() => {
    if (stampRef.current) {
      stampRef.current.style.transform = 'rotate(-5deg) scale(1.1)';
      const timer = setTimeout(() => {
        if (stampRef.current) {
          stampRef.current.style.transform = 'rotate(-5deg) scale(1)';
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [firstName, lastName, email, phone, region, city, address, numericId]);

  // تنسيق رقم المستخدم (6 خانات)
  const formattedId = numericId.toString().padStart(6, '0').slice(-6);

  // تنسيق النصوص - حلقتان فقط للوضوح
  // الحلقة الخارجية: الاسم + الإيميل + الهاتف
  const outerRingText = `${firstName.toUpperCase()} ${lastName.toUpperCase()} ● ${email.toUpperCase()} ● ${phone}`;
  
  // الحلقة الداخلية: العنوان الكامل
  const innerRingText = `${city.toUpperCase()} ● ${region.toUpperCase()} ● ${address.toUpperCase()}`;

  return (
    <>
      {/* فلتر الحبر الاحترافي */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="ink-bleed-pro">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0.6 0.8 1" />
          </feComponentTransfer>
          <feGaussianBlur stdDeviation="0.2" />
        </filter>
      </svg>

      <StampContainer ref={stampRef}>
        <StampSVG viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" $isDark={isDark}>
          {/* الإطار الخارجي المزخرف - جودة عالية */}
          <circle cx="400" cy="400" r="390" fill="none" stroke="var(--stamp-color)" strokeWidth="3" strokeDasharray="6 10" 
            style={{ filter: 'drop-shadow(var(--stamp-glow))' }} />
          <circle cx="400" cy="400" r="372" fill="none" stroke="var(--stamp-color)" strokeWidth="8" 
            style={{ filter: 'drop-shadow(var(--stamp-glow))' }} />
          
          {/* ★★★ الحلقة الخارجية: الاسم + الإيميل + الهاتف ★★★ */}
          <path id="pathOuter" d="M 80,400 A 320,320 0 1,1 720,400 A 320,320 0 1,1 80,400" fill="none" />
          <text fontFamily="'Arial Black', 'Exo 2', sans-serif" fontWeight="900" fontSize="44" fill="var(--stamp-color)" letterSpacing="2">
            <textPath xlinkHref="#pathOuter" startOffset="50%" textAnchor="middle">
              {outerRingText}
            </textPath>
          </text>

          {/* فاصل دائري سميك */}
          <circle cx="400" cy="400" r="290" fill="none" stroke="var(--stamp-color)" strokeWidth="5" 
            style={{ opacity: 0.8 }} />

          {/* ★★★ الحلقة الداخلية: العنوان الكامل ★★★ */}
          <path id="pathInner" d="M 140,400 A 260,260 0 1,0 660,400 A 260,260 0 1,0 140,400" fill="none" />
          <text fontFamily="'Arial Black', 'Exo 2', sans-serif" fontWeight="900" fontSize="38" fill="var(--stamp-color)" letterSpacing="2">
            <textPath xlinkHref="#pathInner" startOffset="50%" textAnchor="middle">
              {innerRingText}
            </textPath>
          </text>

          {/* فاصل دائري منقط */}
          <circle cx="400" cy="400" r="210" fill="none" stroke="var(--stamp-color)" strokeWidth="3" strokeDasharray="8 6" />

          {/* ★★★ المركز: mobilebg.eu + الرقم ★★★ */}
          <g transform="translate(400, 400)">
            {/* مستطيل مركزي محسّن */}
            <rect x="-160" y="-95" width="320" height="190" fill="none" stroke="var(--stamp-color)" strokeWidth="8" rx="6" 
              style={{ filter: 'drop-shadow(var(--stamp-glow))' }} />
            <rect x="-150" y="-85" width="300" height="170" fill="none" stroke="var(--stamp-color)" strokeWidth="2" rx="4" 
              style={{ opacity: 0.6 }} />
            
            {/* رقم المستخدم - أكبر وأوضح */}
            <text y="-10" fontFamily="'Impact', 'Arial Black', sans-serif" fontWeight="900" fontSize="70" fill="var(--stamp-color)" textAnchor="middle" letterSpacing="6">
              {formattedId}
            </text>
            
            {/* خط فاصل مزخرف */}
            <line x1="-130" y1="30" x2="130" y2="30" stroke="var(--stamp-color)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="-130" cy="30" r="3" fill="var(--stamp-color)" />
            <circle cx="130" cy="30" r="3" fill="var(--stamp-color)" />
            
            {/* الدومين - واضح وبارز */}
            <text y="70" fontFamily="'Arial Black', 'Exo 2', sans-serif" fontWeight="900" fontSize="34" fill="var(--stamp-color)" textAnchor="middle" letterSpacing="2">
              mobilebg.eu
            </text>
          </g>

          {/* نجوم التوثيق الاحترافية - أكبر حجماً */}
          <text x="100" y="416" fontSize="48" fill="var(--stamp-color)" style={{ filter: 'drop-shadow(var(--stamp-glow))' }}>★</text>
          <text x="652" y="416" fontSize="48" fill="var(--stamp-color)" style={{ filter: 'drop-shadow(var(--stamp-glow))' }}>★</text>
          <text x="400" y="70" fontSize="42" fill="var(--stamp-color)" textAnchor="middle">★</text>
          <text x="400" y="740" fontSize="42" fill="var(--stamp-color)" textAnchor="middle">★</text>
        </StampSVG>
      </StampContainer>
    </>
  );
};

export default IdentityStamp;
