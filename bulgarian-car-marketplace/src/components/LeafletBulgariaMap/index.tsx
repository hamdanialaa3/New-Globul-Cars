import React, { useEffect, useRef, useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RegionCarCountService from '../../services/regionCarCountService';
// Import GeoJSON data
const bulgariaData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Благоевград",
        "nameEn": "Blagoevgrad",
        "nameAr": "بلاغويفغراد",
        "id": "blagoevgrad",
        "isSmall": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [22.5, 41.5], [22.8, 41.6], [23.0, 41.8], [23.2, 42.0],
          [23.1, 42.2], [22.9, 42.3], [22.7, 42.2], [22.5, 42.0],
          [22.3, 41.8], [22.4, 41.6], [22.5, 41.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Бургас",
        "nameEn": "Burgas",
        "nameAr": "بورغاس",
        "id": "burgas",
        "isSmall": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [27.0, 42.0], [27.3, 42.1], [27.6, 42.3], [27.8, 42.5],
          [27.7, 42.7], [27.5, 42.8], [27.2, 42.7], [27.0, 42.5],
          [26.8, 42.3], [26.9, 42.1], [27.0, 42.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Варна",
        "nameEn": "Varna",
        "nameAr": "فارنا",
        "id": "varna",
        "isSmall": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [27.5, 43.0], [27.8, 43.1], [28.1, 43.3], [28.3, 43.5],
          [28.2, 43.7], [28.0, 43.8], [27.7, 43.7], [27.5, 43.5],
          [27.3, 43.3], [27.4, 43.1], [27.5, 43.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "София-град",
        "nameEn": "Sofia",
        "nameAr": "صوفيا",
        "id": "sofia",
        "isSmall": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [23.2, 42.6], [23.5, 42.7], [23.8, 42.9], [24.0, 43.1],
          [23.9, 43.3], [23.7, 43.4], [23.4, 43.3], [23.2, 43.1],
          [23.0, 42.9], [23.1, 42.7], [23.2, 42.6]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Пловдив",
        "nameEn": "Plovdiv",
        "nameAr": "بلوفديف",
        "id": "plovdiv",
        "isSmall": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [24.5, 42.0], [24.8, 42.1], [25.1, 42.3], [25.3, 42.5],
          [25.2, 42.7], [25.0, 42.8], [24.7, 42.7], [24.5, 42.5],
          [24.3, 42.3], [24.4, 42.1], [24.5, 42.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Русе",
        "nameEn": "Ruse",
        "nameAr": "روسه",
        "id": "ruse",
        "isSmall": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [25.8, 43.8], [26.1, 43.9], [26.4, 44.1], [26.6, 44.3],
          [26.5, 44.5], [26.3, 44.6], [26.0, 44.5], [25.8, 44.3],
          [25.6, 44.1], [25.7, 43.9], [25.8, 43.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Плевен",
        "nameEn": "Pleven",
        "nameAr": "بليفين",
        "id": "pleven",
        "isSmall": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [24.0, 43.2], [24.3, 43.3], [24.6, 43.5], [24.8, 43.7],
          [24.7, 43.9], [24.5, 44.0], [24.2, 43.9], [24.0, 43.7],
          [23.8, 43.5], [23.9, 43.3], [24.0, 43.2]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Стара Загора",
        "nameEn": "Stara Zagora",
        "nameAr": "ستارا زاغورا",
        "id": "stara-zagora",
        "isSmall": false
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [25.5, 42.2], [25.8, 42.3], [26.1, 42.5], [26.3, 42.7],
          [26.2, 42.9], [26.0, 43.0], [25.7, 42.9], [25.5, 42.7],
          [25.3, 42.5], [25.4, 42.3], [25.5, 42.2]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Велико Търново",
        "nameEn": "Veliko Tarnovo",
        "nameAr": "فيليكو تارنوفو",
        "id": "veliko-tarnovo",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [25.3, 43.0], [25.6, 43.1], [25.8, 43.2], [25.7, 43.4],
          [25.5, 43.5], [25.3, 43.4], [25.2, 43.2], [25.3, 43.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Видин",
        "nameEn": "Vidin",
        "nameAr": "فيدين",
        "id": "vidin",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [22.5, 43.8], [22.8, 43.9], [23.0, 44.0], [22.9, 44.2],
          [22.7, 44.1], [22.5, 44.0], [22.5, 43.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Враца",
        "nameEn": "Vratsa",
        "nameAr": "فراتسا",
        "id": "vratsa",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [23.3, 43.1], [23.6, 43.2], [23.8, 43.4], [23.7, 43.6],
          [23.5, 43.5], [23.3, 43.3], [23.3, 43.1]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Габрово",
        "nameEn": "Gabrovo",
        "nameAr": "غابروفو",
        "id": "gabrovo",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [25.0, 42.7], [25.3, 42.8], [25.5, 43.0], [25.4, 43.2],
          [25.2, 43.1], [25.0, 42.9], [25.0, 42.7]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Добрич",
        "nameEn": "Dobrich",
        "nameAr": "دوبريتش",
        "id": "dobrich",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [27.5, 43.3], [27.8, 43.4], [28.0, 43.6], [27.9, 43.8],
          [27.7, 43.7], [27.5, 43.5], [27.5, 43.3]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Кърджали",
        "nameEn": "Kardzhali",
        "nameAr": "كارجالي",
        "id": "kardzhali",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [25.2, 41.4], [25.5, 41.5], [25.7, 41.7], [25.6, 41.9],
          [25.4, 41.8], [25.2, 41.6], [25.2, 41.4]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Кюстендил",
        "nameEn": "Kyustendil",
        "nameAr": "كيوستنديل",
        "id": "kyustendil",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [22.5, 42.2], [22.8, 42.3], [23.0, 42.5], [22.9, 42.7],
          [22.7, 42.6], [22.5, 42.4], [22.5, 42.2]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Ловеч",
        "nameEn": "Lovech",
        "nameAr": "لوفتش",
        "id": "lovech",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [24.5, 43.0], [24.8, 43.1], [25.0, 43.3], [24.9, 43.5],
          [24.7, 43.4], [24.5, 43.2], [24.5, 43.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Монтана",
        "nameEn": "Montana",
        "nameAr": "مونتانا",
        "id": "montana",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [23.0, 43.3], [23.3, 43.4], [23.5, 43.6], [23.4, 43.8],
          [23.2, 43.7], [23.0, 43.5], [23.0, 43.3]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Пазарджик",
        "nameEn": "Pazardzhik",
        "nameAr": "بازارجيك",
        "id": "pazardzhik",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [24.0, 42.0], [24.3, 42.1], [24.5, 42.3], [24.4, 42.5],
          [24.2, 42.4], [24.0, 42.2], [24.0, 42.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Перник",
        "nameEn": "Pernik",
        "nameAr": "بيرنيك",
        "id": "pernik",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [23.0, 42.4], [23.3, 42.5], [23.5, 42.7], [23.4, 42.9],
          [23.2, 42.8], [23.0, 42.6], [23.0, 42.4]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Разград",
        "nameEn": "Razgrad",
        "nameAr": "رازغراد",
        "id": "razgrad",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [26.3, 43.3], [26.6, 43.4], [26.8, 43.6], [26.7, 43.8],
          [26.5, 43.7], [26.3, 43.5], [26.3, 43.3]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Силистра",
        "nameEn": "Silistra",
        "nameAr": "سيليسترا",
        "id": "silistra",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [27.0, 43.8], [27.3, 43.9], [27.5, 44.1], [27.4, 44.2],
          [27.2, 44.1], [27.0, 44.0], [27.0, 43.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Сливен",
        "nameEn": "Sliven",
        "nameAr": "سليفن",
        "id": "sliven",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [26.2, 42.4], [26.5, 42.5], [26.7, 42.7], [26.6, 42.9],
          [26.4, 42.8], [26.2, 42.6], [26.2, 42.4]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Смолян",
        "nameEn": "Smolyan",
        "nameAr": "سمليان",
        "id": "smolyan",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [24.5, 41.4], [24.8, 41.5], [25.0, 41.7], [24.9, 41.9],
          [24.7, 41.8], [24.5, 41.6], [24.5, 41.4]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "София",
        "nameEn": "Sofia-Province",
        "nameAr": "صوفيا-المقاطعة",
        "id": "sofia-province",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [23.5, 42.5], [23.8, 42.6], [24.0, 42.8], [23.9, 43.0],
          [23.7, 42.9], [23.5, 42.7], [23.5, 42.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Търговище",
        "nameEn": "Targovishte",
        "nameAr": "تارغوفيشته",
        "id": "targovishte",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [26.0, 43.1], [26.3, 43.2], [26.5, 43.4], [26.4, 43.6],
          [26.2, 43.5], [26.0, 43.3], [26.0, 43.1]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Хасково",
        "nameEn": "Haskovo",
        "nameAr": "خاسكوفو",
        "id": "haskovo",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [25.5, 41.7], [25.8, 41.8], [26.0, 42.0], [25.9, 42.2],
          [25.7, 42.1], [25.5, 41.9], [25.5, 41.7]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Шумен",
        "nameEn": "Shumen",
        "nameAr": "شومن",
        "id": "shumen",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [26.8, 43.1], [27.1, 43.2], [27.3, 43.4], [27.2, 43.6],
          [27.0, 43.5], [26.8, 43.3], [26.8, 43.1]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Ямбол",
        "nameEn": "Yambol",
        "nameAr": "يامبول",
        "id": "yambol",
        "isSmall": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [26.3, 42.2], [26.6, 42.3], [26.8, 42.5], [26.7, 42.7],
          [26.5, 42.6], [26.3, 42.4], [26.3, 42.2]
        ]]
      }
    }
  ]
};

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletBulgariaMapProps {
  carCounts?: { [cityId: string]: number };
  onCityClick?: (cityId: string) => void;
  highlightedCity?: string;
}

const MapContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const MapTitle = styled.h2`
  font-size: 48px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
`;

const MapSubtitle = styled.p`
  font-size: 18px;
  text-align: center;
  color: #94a3b8;
  margin-bottom: 40px;
  font-weight: 500;
`;

const LeafletContainer = styled.div`
  width: 100%;
  height: 600px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  
  .leaflet-container {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  }
  
  .leaflet-tile {
    filter: hue-rotate(200deg) saturate(1.2) brightness(1.1);
  }
  
  /* Bulgaria border animation */
  .leaflet-interactive {
    animation: borderGlow 2s ease-in-out infinite;
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
  }
  
  .bulgaria-border {
    animation: borderPulse 3s ease-in-out infinite;
  }
  
  @keyframes borderGlow {
    0%, 100% {
      stroke-opacity: 0.9;
      filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
    }
    50% {
      stroke-opacity: 0.6;
      filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.8));
    }
  }
  
  @keyframes borderPulse {
    0%, 100% {
      stroke-width: 3;
      stroke-dasharray: 8, 4;
    }
    50% {
      stroke-width: 4;
      stroke-dasharray: 12, 6;
    }
  }
  
  /* Custom marker styles - Minimal dot with glowing rings */
  .custom-marker-icon {
    background: transparent !important;
    border: none !important;
  }
  
  .marker-container {
    position: relative;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  
  /* Central dot */
  .marker-dot {
    position: absolute;
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.8),
                0 0 30px rgba(59, 130, 246, 0.4);
    z-index: 3;
    transition: all 0.3s ease;
  }
  
  /* Small markers */
  .small-marker .marker-dot {
    width: 8px;
    height: 8px;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.6),
                0 0 20px rgba(59, 130, 246, 0.3);
  }
  
  .small-marker .marker-ring {
    width: 14px;
    height: 14px;
  }
  
  .small-marker .marker-count {
    font-size: 9px;
    padding: 1px 5px;
  }
  
  .marker-container:hover .marker-dot {
    transform: scale(1.3);
    box-shadow: 0 0 20px rgba(59, 130, 246, 1),
                0 0 40px rgba(59, 130, 246, 0.6);
  }
  
  /* Pulsing glowing rings */
  .marker-ring {
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid #3b82f6;
    border-radius: 50%;
    animation: markerPulse 2.5s ease-out infinite;
    opacity: 0;
  }
  
  .marker-ring.ring-delay-1 {
    animation-delay: 0.8s;
  }
  
  .marker-ring.ring-delay-2 {
    animation-delay: 1.6s;
  }
  
  /* Car count badge */
  .marker-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 4;
    border: 2px solid white;
  }
  
  @keyframes markerPulse {
    0% {
      transform: scale(0.8);
      opacity: 1;
      border-width: 3px;
    }
    50% {
      opacity: 0.6;
      border-width: 2px;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
      border-width: 1px;
    }
  }
  
  /* Custom tooltip styles */
  .car-tooltip {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
    border: 1px solid rgba(59, 130, 246, 0.3) !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
  font-family: 'Inter', sans-serif !important;
  }
  
  .car-tooltip::before {
    border-top-color: #334155 !important;
  }
`;

const Sidebar = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${props => props.$isOpen ? '0' : '-400px'};
  width: 380px;
  height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: -20px 0px 40px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  transition: right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 30px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 3px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.1);
  }
`;

const ProvinceTitle = styled.h3`
  color: #60a5fa;
  text-align: center;
  border-bottom: 2px solid rgba(96, 165, 250, 0.3);
  padding-bottom: 15px;
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 700;
`;

const CarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CarCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    transform: translateY(-2px) scale(1.02);
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
    
    &::before {
      left: 100%;
    }
  }
`;

const CarImage = styled.img`
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid rgba(59, 130, 246, 0.3);
`;

const CarInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #ffffff;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #60a5fa;
    font-weight: 500;
  }
  
  .car-details {
    margin-top: 8px;
    font-size: 12px;
    color: #94a3b8;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 40px;
`;

const StatCard = styled.div<{ $index: number }>`
  background: linear-gradient(135deg, 
    ${props => {
      const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'];
      return colors[props.$index % colors.length];
    }} 0%, 
    ${props => {
      const colors = ['#1d4ed8', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777', '#0f766e', '#ea580c'];
      return colors[props.$index % colors.length];
    }} 100%
  );
  padding: 28px;
  border-radius: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  }

  h3 {
    font-size: 36px;
    font-weight: 800;
    margin-bottom: 8px;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  p {
    font-size: 16px;
    opacity: 0.95;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
  padding: 20px;
  background: rgba(30, 41, 59, 0.9);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ShowMoreLegendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 400px;
  margin: 16px auto 0;
  padding: 14px 28px;
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  border: 2px solid #3b82f6;
  border-radius: 50px;
  color: #60a5fa;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LegendItem = styled.div<{ color: string; $isHovered: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: ${props => props.$isHovered ? 'rgba(59, 130, 246, 0.15)' : 'rgba(51, 65, 85, 0.6)'};
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid ${props => props.$isHovered ? '#3b82f6' : 'transparent'};

  &:hover {
    transform: translateY(-2px);
    background: rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
  }
  
  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.8),
                0 0 20px rgba(59, 130, 246, 0.4);
    flex-shrink: 0;
    animation: legendDotPulse 2s ease-in-out infinite;
  }
  
  &:hover .legend-dot {
    box-shadow: 0 0 15px rgba(59, 130, 246, 1),
                0 0 30px rgba(59, 130, 246, 0.6);
    transform: scale(1.2);
  }
  
  span {
    color: #e2e8f0;
    font-size: 14px;
    font-weight: 500;
  }
  
  .legend-count {
    margin-left: auto;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: bold;
  }
  
  @keyframes legendDotPulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
`;

// Mock car data generator
const generateMockCars = (count: number) => {
  const carBrands = ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Toyota', 'Honda', 'Ford', 'Opel', 'Peugeot', 'Renault'];
  const carModels = ['Golf', 'Passat', 'A4', 'C-Class', '3 Series', 'Civic', 'Focus', 'Astra', '308', 'Megane'];
  const years = ['2018', '2019', '2020', '2021', '2022', '2023'];
  const prices = ['15,000', '18,500', '22,000', '25,000', '28,500', '32,000', '35,000', '40,000'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `car-${i + 1}`,
    name: `${carBrands[i % carBrands.length]} ${carModels[i % carModels.length]}`,
    year: years[i % years.length],
    price: prices[i % prices.length],
    imageUrl: `https://via.placeholder.com/80x60/3b82f6/ffffff?text=${carBrands[i % carBrands.length].charAt(0)}`,
    mileage: `${Math.floor(Math.random() * 100000) + 10000} km`,
    fuel: ['Petrol', 'Diesel', 'Hybrid'][i % 3],
    transmission: ['Manual', 'Automatic'][i % 2]
  }));
};

export const LeafletBulgariaMap: React.FC<LeafletBulgariaMapProps> = ({
  carCounts: propCarCounts = {},
  onCityClick,
  highlightedCity
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const geoJsonLayer = useRef<L.GeoJSON | null>(null);
  
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [provinceCars, setProvinceCars] = useState<any[]>([]);
  const [realCarCounts, setRealCarCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [showAllLegend, setShowAllLegend] = useState(false); // ✅ NEW: للتحكم في عرض المدن
  
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Use real car counts if available, otherwise use prop counts
  const carCounts = Object.keys(realCarCounts).length > 0 ? realCarCounts : propCarCounts;

  const totalCars = useMemo(() => {
    return Object.values(carCounts).reduce((sum, count) => sum + count, 0);
  }, [carCounts]);

  // Fetch real car counts from Firestore
  useEffect(() => {
    const fetchRealCarCounts = async () => {
      try {
        setIsLoadingCounts(true);
        console.log('🗺️ Loading real car counts from Firestore...');
        
        // Get all region IDs from GeoJSON
        const regionIds = bulgariaData.features.map((f: any) => f.properties.id);
        
        // Fetch real counts from Firestore
        const counts = await RegionCarCountService.getAllRegionCounts(regionIds);
        
        setRealCarCounts(counts);
        console.log('✅ Real car counts loaded:', counts);
      } catch (error) {
        console.error('❌ Error fetching real car counts:', error);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchRealCarCounts();
  }, []);

  // ✅ FIX 1: Initialize map ONCE on mount
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    try {
      // Initialize map - Fixed on Bulgaria
      mapInstance.current = L.map(mapRef.current, {
        center: [42.7, 25.4], // Center of Bulgaria
        zoom: 7,
        zoomControl: false, // Disable zoom controls
        attributionControl: false,
        dragging: false, // Disable dragging
        doubleClickZoom: false, // Disable double click zoom
        scrollWheelZoom: false, // Disable scroll zoom
        boxZoom: false, // Disable box zoom
        keyboard: false, // Disable keyboard navigation
        touchZoom: false, // Disable touch zoom
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstance.current);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup: Remove map on unmount
    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
          mapInstance.current = null;
          geoJsonLayer.current = null;
        } catch (error) {
          console.error('Error removing map:', error);
        }
      }
    };
  }, []); // ✅ Empty dependencies - create ONCE

  // ✅ FIX 2: Update map data when carCounts or language changes
  useEffect(() => {
    if (!mapInstance.current || !mapRef.current) return;

    // Remove old GeoJSON layer if exists
    if (geoJsonLayer.current) {
      try {
        mapInstance.current.removeLayer(geoJsonLayer.current);
        geoJsonLayer.current = null;
      } catch (error) {
        console.error('Error removing old layer:', error);
      }
    }

    // Style function for regions - No internal borders, only outer Bulgaria border
    const getStyle = (feature: any, isHovered: boolean = false) => {
      return {
        fillColor: isHovered ? '#fbbf24' : 'transparent',
        fillOpacity: isHovered ? 0.25 : 0,
        weight: 0, // No internal borders
        color: 'transparent',
        opacity: 0,
      };
    };

    // Add GeoJSON layer
    geoJsonLayer.current = L.geoJSON(bulgariaData as any, {
      style: (feature) => getStyle(feature),
      onEachFeature: (feature, layer) => {
        const regionId = feature.properties.id;
        const regionName = feature.properties[`name${language === 'bg' ? '' : 'En'}`];
        const count = carCounts[regionId] || 0;

        // Tooltip
        layer.bindTooltip(`
          <div style="text-align: center; font-weight: bold;">
            <div style="color: #60a5fa; font-size: 16px;">${regionName}</div>
            <div style="color: #34d399; font-size: 14px;">${count} ${language === 'bg' ? 'автомобила' : 'cars'}</div>
          </div>
        `, {
          permanent: false,
          direction: 'center',
          className: 'custom-tooltip'
        });

        // Add car icon at the center of each region
        const bounds = (layer as L.Polygon).getBounds();
        const center = bounds.getCenter();
        
        // Create minimal dot marker with glowing ring
        const isSmall = feature.properties.isSmall || false;
        const markerSize = isSmall ? 30 : 40;
        const dotSize = isSmall ? 8 : 12;
        
        const carIcon = L.divIcon({
          html: `
            <div class="marker-container ${isSmall ? 'small-marker' : ''}">
              <div class="marker-dot"></div>
              <div class="marker-ring"></div>
              <div class="marker-ring ring-delay-1"></div>
              <div class="marker-ring ring-delay-2"></div>
              ${count > 0 ? `<div class="marker-count">${count}</div>` : ''}
            </div>
          `,
          className: 'custom-marker-icon',
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize/2, markerSize/2]
        });

        // Add car marker
        const carMarker = L.marker([center.lat, center.lng], { icon: carIcon })
          .addTo(mapInstance.current!)
          .bindTooltip(`
            <div style="text-align: center; font-weight: bold;">
              <div style="color: #3b82f6; font-size: 16px;">${regionName}</div>
              <div style="color: #10b981; font-size: 14px;">${count} ${language === 'bg' ? 'автомобила' : 'cars'}</div>
            </div>
          `, {
            permanent: false,
            direction: 'top',
            className: 'car-tooltip'
          });

        // Events for car marker
        carMarker.on({
          click: () => {
            // Navigate to search page filtered by region
            if (onCityClick) {
              onCityClick(regionId);
            }
            // Navigate to cars page with region filter to show all cars in this region
            navigate(`/cars?region=${regionId}`);
          }
        });

        // Events for region
        layer.on({
          mouseover: (e) => {
            const layer = e.target;
            layer.setStyle(getStyle(feature, true));
            setHoveredRegion(regionId);
          },
          mouseout: (e) => {
            const layer = e.target;
            layer.setStyle(getStyle(feature));
            setHoveredRegion(null);
          }
        });
      }
    }).addTo(mapInstance.current);

    // Fit map to bounds
    if (geoJsonLayer.current && mapInstance.current) {
      try {
        mapInstance.current.fitBounds(geoJsonLayer.current.getBounds(), { padding: [20, 20] });
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [carCounts, language, onCityClick, navigate]); // ✅ Update data only, don't recreate map


  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    if (mapInstance.current) {
      mapInstance.current.setView([42.7, 25.4], 7);
    }
  };

  return (
    <MapContainer>
      <MapTitle>
        {language === 'bg' ? 'България - Професионална карта' : 'Bulgaria - Professional Map'}
      </MapTitle>
      <MapSubtitle>
        {language === 'bg' ? 'Интерактивна карта с автомобили по области' : 'Interactive map with cars by regions'}
      </MapSubtitle>

      <LeafletContainer ref={mapRef} />

      {/* Sidebar */}
      <Sidebar $isOpen={sidebarOpen}>
        <CloseButton onClick={handleCloseSidebar}>
          ×
        </CloseButton>
        
        <ProvinceTitle>
          {language === 'bg' ? `Автомобили в ${selectedProvince}` : `Cars in ${selectedProvince}`}
        </ProvinceTitle>
        
        <CarList>
          {provinceCars.map((car) => (
            <CarCard key={car.id}>
              <CarImage src={car.imageUrl} alt={car.name} />
              <CarInfo>
                <h4>{car.name}</h4>
                <p>{car.price} BGN</p>
                <div className="car-details">
                  {car.year} • {car.mileage} • {car.fuel} • {car.transmission}
                </div>
              </CarInfo>
            </CarCard>
          ))}
        </CarList>
      </Sidebar>

      {/* Statistics */}
      <StatsContainer>
        <StatCard $index={0}>
          <h3>{totalCars.toLocaleString()}</h3>
          <p>{language === 'bg' ? 'Общо автомобили' : 'Total Cars'}</p>
        </StatCard>
        <StatCard $index={1}>
          <h3>{Object.keys(bulgariaData.features).length}</h3>
          <p>{language === 'bg' ? 'Области' : 'Regions'}</p>
        </StatCard>
        <StatCard $index={2}>
          <h3>{Object.keys(carCounts).length}</h3>
          <p>{language === 'bg' ? 'Активни области' : 'Active Regions'}</p>
        </StatCard>
      </StatsContainer>

      {/* ✅ IMPROVED: Legend - Shows only 6 regions initially */}
      <LegendContainer>
        {bulgariaData.features
          .slice(0, showAllLegend ? bulgariaData.features.length : 6)
          .map((feature: any) => (
          <LegendItem
            key={feature.properties.id}
            color="#3b82f6"
            $isHovered={hoveredRegion === feature.properties.id}
            onClick={() => {
              // Navigate to cars page filtered by this region
              if (onCityClick) {
                onCityClick(feature.properties.id);
              }
              navigate(`/cars?region=${feature.properties.id}`);
            }}
            onMouseEnter={() => setHoveredRegion(feature.properties.id)}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <div className="legend-dot"></div>
            <span>{feature.properties[`name${language === 'bg' ? '' : 'En'}`]}</span>
            <span className="legend-count">{carCounts[feature.properties.id] || 0}</span>
          </LegendItem>
        ))}
      </LegendContainer>
      
      {/* ✅ Show More/Less Button for Legend */}
      {bulgariaData.features.length > 6 && (
        <ShowMoreLegendButton onClick={() => setShowAllLegend(!showAllLegend)}>
          {showAllLegend ? (
            <>
              ▲ {language === 'bg' ? 'Скрий' : 'Hide'}
            </>
          ) : (
            <>
              ▼ {language === 'bg' 
                ? `Покажи всички области (${bulgariaData.features.length - 6} още)` 
                : `Show All Regions (${bulgariaData.features.length - 6} more)`}
            </>
          )}
        </ShowMoreLegendButton>
      )}
    </MapContainer>
  );
};

export default LeafletBulgariaMap;
