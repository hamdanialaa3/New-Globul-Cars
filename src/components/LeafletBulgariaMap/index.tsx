import { logger } from '../../services/logger-service';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RegionCarCountService from '../../services/regionCarCountService';

// Import modular styles
import {
  MapContainer,
  MapTitle,
  MapSubtitle,
  LeafletContainer,
  StatsContainer,
  StatCard,
  Sidebar,
  CloseButton,
  ProvinceTitle,
  CarList,
  CarCard,
  CarImage,
  CarInfo,
  LegendContainer,
  LegendItem,
  ShowMoreLegendButton,
} from './LeafletBulgariaMap.styles';

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
        logger.info('🗺️ Loading real car counts from Firestore...');
        
        // Get all region IDs from GeoJSON
        const regionIds = bulgariaData.features.map((f: any) => f.properties.id);
        
        // Fetch real counts from Firestore
        const counts = await RegionCarCountService.getAllRegionCounts(regionIds);
        
        setRealCarCounts(counts);
        logger.info('✅ Real car counts loaded:', counts);
      } catch (error) {
        logger.error('❌ Error fetching real car counts:', error);
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
      logger.error('Error initializing map:', error);
    }

    // Cleanup: Remove map on unmount
    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
          mapInstance.current = null;
          geoJsonLayer.current = null;
        } catch (error) {
          logger.error('Error removing map:', error);
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
        logger.error('Error removing old layer:', error);
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
        logger.error('Error fitting bounds:', error);
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
