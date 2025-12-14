// Brand Icon Component - Professional SVG Icons for Car Brands
// مكون أيقونة الماركة - رموز SVG احترافية لعلامات السيارات

import React from 'react';
import { Star, Circle, Car, Shield, Zap, Sparkles } from 'lucide-react';

interface BrandIconProps {
  brand: string;
  size?: number;
  className?: string;
}

const BrandIcon: React.FC<BrandIconProps> = ({ brand, size = 18, className }) => {
  const normalizedBrand = brand.toLowerCase().trim();
  
  // Professional icons for popular brands using lucide-react
  if (normalizedBrand.includes('mercedes')) {
    return <Star size={size} className={className} strokeWidth={2.5} />;
  }
  
  if (normalizedBrand === 'bmw') {
    return <Circle size={size} className={className} strokeWidth={2.5} />;
  }
  
  if (normalizedBrand === 'audi') {
    return (
      <span 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          position: 'relative'
        }}
        className={className}
      >
        <Circle size={size * 0.5} style={{ position: 'absolute', top: '10%', left: '10%' }} strokeWidth={2.5} />
        <Circle size={size * 0.5} style={{ position: 'absolute', top: '10%', right: '10%' }} strokeWidth={2.5} />
        <Circle size={size * 0.5} style={{ position: 'absolute', bottom: '10%', left: '10%' }} strokeWidth={2.5} />
        <Circle size={size * 0.5} style={{ position: 'absolute', bottom: '10%', right: '10%' }} strokeWidth={2.5} />
      </span>
    );
  }
  
  if (normalizedBrand.includes('volkswagen') || normalizedBrand === 'vw') {
    return <Sparkles size={size} className={className} strokeWidth={2.5} />;
  }
  
  if (normalizedBrand === 'porsche') {
    return <Shield size={size} className={className} strokeWidth={2.5} />;
  }
  
  if (normalizedBrand === 'ford') {
    return <Circle size={size} className={className} strokeWidth={2.5} />;
  }
  
  if (normalizedBrand === 'tesla') {
    return <Zap size={size} className={className} strokeWidth={2.5} />;
  }
  
  // Default - Car icon
  return <Car size={size} className={className} strokeWidth={2.5} />;
};

export default BrandIcon;
