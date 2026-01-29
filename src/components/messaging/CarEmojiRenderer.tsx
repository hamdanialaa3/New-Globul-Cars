/**
 * 🎨 CarEmojiRenderer
 * عارض رموز السيارات
 * 
 * @description Renders car emoji icons in messages
 * يعرض رموز السيارات في الرسائل
 */

import React from 'react';
import styled from 'styled-components';
import {
  Car, Truck, Bus, Bike, Fuel, Zap, Wrench, Settings,
  ShieldCheck, AlertTriangle, ThumbsUp, ThumbsDown, Heart,
  Star, DollarSign, TrendingUp, TrendingDown, Clock,
  Calendar, MapPin, Navigation, Key, Award, CheckCircle, XCircle
} from 'lucide-react';

// Map emoji labels to Lucide icons
const emojiIconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  'Car': Car,
  'Truck': Truck,
  'Bus': Bus,
  'Motorcycle': Bike,
  'Fuel': Fuel,
  'Electric': Zap,
  'Repair': Wrench,
  'Settings': Settings,
  'Insurance': ShieldCheck,
  'Warning': AlertTriangle,
  'Like': ThumbsUp,
  'Dislike': ThumbsDown,
  'Love': Heart,
  'Star': Star,
  'Price': DollarSign,
  'Up': TrendingUp,
  'Down': TrendingDown,
  'Time': Clock,
  'Date': Calendar,
  'Location': MapPin,
  'Navigation': Navigation,
  'Key': Key,
  'Award': Award,
  'Confirm': CheckCircle,
  'Cancel': XCircle,
};

const EmojiIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin: 0 2px;
  vertical-align: middle;
  
  svg {
    width: 18px;
    height: 18px;
    color: inherit;
  }
`;

interface CarEmojiRendererProps {
  text: string;
}

/**
 * Renders text with car emoji icons
 * Pattern: [EmojiName] gets replaced with icon
 */
export const CarEmojiRenderer: React.FC<CarEmojiRendererProps> = ({ text }) => {
  // Split text by emoji pattern [EmojiName]
  const parts = text.split(/(\[[^\]]+\])/g);
  
  return (
    <>
      {parts.map((part, index) => {
        // Check if this is an emoji [Name]
        const match = part.match(/^\[([^\]]+)\]$/);
        
        if (match) {
          const emojiName = match[1];
          const IconComponent = emojiIconMap[emojiName];
          
          if (IconComponent) {
            return (
              <EmojiIcon key={index} title={emojiName}>
                <IconComponent size={18} />
              </EmojiIcon>
            );
          }
        }
        
        // Regular text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};

export default CarEmojiRenderer;
