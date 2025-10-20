// src/components/Profile/gauge/GaugeHelpers.ts
// Gauge Helper Functions - دوال مساعدة للعداد
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

// Convert polar coordinates to cartesian
export const polarToCartesian = (
  centerX: number, 
  centerY: number, 
  radius: number, 
  angleInDegrees: number
) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

// Generate SVG arc path for gauge (270° arc)
// ⚡ RESIZED: Updated for 90% of original gauge (240px → 216px)
export const createArcPath = (percent: number) => {
  const startAngle = -225;
  const endAngle = startAngle + (270 * percent) / 100;
  const radius = 81;  // Changed from 90 to 81 (90 * 0.9)
  const centerX = 108;  // Changed from 120 to 108 (120 * 0.9)
  const centerY = 108;  // Changed from 120 to 108 (120 * 0.9)
  
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = percent > 50 ? 1 : 0;
  
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

// Get gauge color based on completion percentage
export const getGaugeColor = (percentage: number): string => {
  if (percentage < 30) return '#ef4444'; // Red
  if (percentage < 60) return '#f59e0b'; // Amber
  if (percentage < 90) return '#3b82f6'; // Blue
  return '#22c55e'; // Green
};


