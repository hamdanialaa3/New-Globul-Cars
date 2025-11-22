// MapAnalytics Page - Bulgaria Provinces Visualization
// صفحة تحليل الخريطة: عرض طبقات المستخدمين والسيارات والتفاصيل لكل إقليم (28 إقليم)
// NOTE: Lightweight implementation reusing existing services without heavy queries.
// Data for cars uses RegionCarCountService (cached); user counts are mocked placeholder (TODO replace with real service).

import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@globul-cars/coreLanguageContext';
import RegionCarCountService from '@globul-cars/servicesregionCarCountService';
import { fetchCarsByCity, fetchUsersByCity, cityIdToCoordinates, CarEntity, UserEntity } from '@globul-cars/servicesmap-entities.service';
import { BULGARIAN_CITIES } from '@globul-cars/corebulgarianCities';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Analytics helper
const trackMapEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, data);
  }
};

// Styled layout
const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`; 

const Header = styled.header`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`; 

const Title = styled.h1`
  font-size: clamp(1.6rem, 2.7vw, 2.3rem);
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
`; 

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0 auto;
  max-width: 720px;
  line-height: 1.5;
`; 

const ControlsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: stretch;
  background: linear-gradient(145deg,#151a1f 0%,#101317 70%);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 0.75rem;
  border-radius: 18px;
  box-shadow: 0 4px 14px -4px rgba(0,0,0,0.4);
`; 

const ToggleButton = styled.button<{active?: boolean}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.9rem 0.55rem 0.7rem;
  border-radius: 12px;
  border: 1px solid ${({active})=> active ? 'var(--accent, #ff8f10)' : 'rgba(255,255,255,0.08)'};
  background: ${({active})=> active ? 'linear-gradient(135deg,#ff9f30,#ff8f10 60%)' : 'rgba(255,255,255,0.04)'};
  color: ${({active})=> active ? '#111' : 'var(--text-secondary)'};
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.4px;
  cursor: pointer;
  outline: none;
  min-width: 118px;
  justify-content: flex-start;
  transition: background .25s,border-color .25s,color .25s,transform .25s;
  box-shadow: ${({active})=> active ? '0 4px 10px -2px rgba(255,143,16,0.35)' : 'inset 0 0 0 0 rgba(0,0,0,0)'};
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  &:hover { background: ${({active})=> active ? 'linear-gradient(135deg,#ffa84a,#ff8f10 60%)' : 'rgba(255,255,255,0.07)'}; }
  &:active { transform: translateY(1px); }
  &:focus-visible { box-shadow: 0 0 0 2px #ff8f10, 0 0 0 5px rgba(255,143,16,0.4); }
  &[data-layer="users"][data-active="true"] { background: linear-gradient(135deg,#3b82f6,#1d4ed8 65%); color:#fff; border-color:#1d4ed8; box-shadow:0 4px 10px -2px rgba(29,78,216,0.35); }
  &[data-layer="cars"][data-active="true"] { background: linear-gradient(135deg,#f97316,#e36414 65%); color:#111; }
  &[data-layer="workshops"][data-active="true"] { background: linear-gradient(135deg,#22c55e,#16a34a 65%); color:#062; }
  &[data-layer="showrooms"][data-active="true"] { background: linear-gradient(135deg,#6366f1,#4338ca 65%); color:#fff; }
  &[data-layer="dealers"][data-active="true"] { background: linear-gradient(135deg,#ffd54a,#ff8f10 65%); color:#222; }
`; 

const MapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: clamp(480px, 70vh, 820px);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  background: #101317;
  box-shadow: var(--shadow-md);
`; 

const Legend = styled.aside`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  font-size: 0.7rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 140px;
  line-height: 1.15;
`; 

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
`; 

const UpdatedTag = styled.div`
  font-size: 0.65rem;
  opacity: 0.8;
  margin-top: 0.4rem;
`;

const DetailsPanel = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%);
  backdrop-filter: blur(12px);
  color: #fff;
  padding: ${props => props.$show ? '1.5rem 1.5rem 2rem' : '0 1.5rem'};
  border-top: 3px solid var(--accent, #ff8f10);
  max-height: ${props => props.$show ? '65vh' : '0'};
  overflow-y: auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.5);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--accent, #ff8f10);
    border-radius: 4px;
  }
`;

const DetailsPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
`;

const DetailsPanelTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent, #ff8f10);
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`;

const DetailsContent = styled.div`
  display: grid;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  &:last-child { border-bottom: none; }
`;

const DetailLabel = styled.span`
  font-weight: 500;
  opacity: 0.8;
`;

const DetailValue = styled.span`
  font-weight: 600;
  color: var(--accent, #ff8f10);
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ItemCard = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255,255,255,0.08);
    border-color: var(--accent, #ff8f10);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255,143,16,0.2);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--accent, #ff8f10);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const CardTitle = styled.h4`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  flex: 1;
`;

const CardBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(255,143,16,0.2);
  color: var(--accent, #ff8f10);
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
`;

const CardField = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardLabel = styled.span`
  opacity: 0.7;
`;

const CardValue = styled.span`
  font-weight: 600;
  color: var(--accent, #ff8f10);
`;

const CardFooter = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  gap: 0.5rem;
`;

const CardButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--accent, #ff8f10);
  background: transparent;
  color: var(--accent, #ff8f10);
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--accent, #ff8f10);
    color: #000;
  }
  
  &.primary {
    background: var(--accent, #ff8f10);
    color: #000;
    &:hover {
      background: #ff9f30;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  opacity: 0.6;
  font-size: 0.9rem;
`;

interface RegionDataPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  cars: number;
  users: number;
  workshops: number;
  showrooms: number;
  dealers: number;
}

// Helper: Extract region IDs (here using city IDs; assumption they align with provinces list)
const REGION_IDS = BULGARIAN_CITIES.map(c => c.id); // 28 expected

const MapAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  // طبقة واحدة نشطة فقط: cars | users | workshops | showrooms | dealers
  const [activeLayer, setActiveLayer] = useState<'cars'|'users'|'workshops'|'showrooms'|'dealers'>('cars');
  const [loadingLayer, setLoadingLayer] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RegionDataPoint[]>([]); // بيانات طبقات الأماكن وتجميع السيارات/المستخدمين (للاحتياج)
  const [carsEntities, setCarsEntities] = useState<CarEntity[]>([]);
  const [usersEntities, setUsersEntities] = useState<UserEntity[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());
  const mapRef = React.useRef<L.Map | null>(null);
  const [selectedItems, setSelectedItems] = useState<Array<{
    type: 'car' | 'user' | 'workshop' | 'showroom' | 'dealer';
    data: any;
    cityName: string;
    cityId?: string;
  }>>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Track page view
  useEffect(() => {
    trackMapEvent('map_page_view', { timestamp: Date.now() });
  }, []);

  // Fetch car counts, user counts, and Google Places data
  // تحميل أساسي (سيارات + مستخدمون فقط)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { getUserCountsByCity } = await import('@globul-cars/servicesmap-entities.service');
        const [carCounts, userCounts] = await Promise.all([
          RegionCarCountService.getAllRegionCounts(REGION_IDS),
          getUserCountsByCity()
        ]);
        const basePoints: RegionDataPoint[] = BULGARIAN_CITIES.map(city => {
          const cars = carCounts[city.id] ?? 0;
          const users = userCounts[city.id] ?? 0;
          return {
            id: city.id,
            name: language === 'bg' ? city.nameBg : city.nameEn,
            lat: city.coordinates.lat,
            lng: city.coordinates.lng,
            cars,
            users,
            workshops: -1,
            showrooms: -1,
            dealers: -1
          };
        });
        setData(basePoints);
        setUpdatedAt(Date.now());
      } catch (e) {
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [language]);

  // جلب السيارات/المستخدمين ككيانات فردية عند تفعيل الطبقة
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (activeLayer === 'cars') {
        setLoadingLayer('cars');
        try {
          const cars = await fetchCarsByCity(600);
          if (!cancelled) setCarsEntities(cars);
        } finally { if (!cancelled) setLoadingLayer(null); }
      } else if (activeLayer === 'users') {
        setLoadingLayer('users');
        try {
          const users = await fetchUsersByCity(600);
          if (!cancelled) setUsersEntities(users);
        } finally { if (!cancelled) setLoadingLayer(null); }
      }
    })();
    return () => { cancelled = true; };
  }, [activeLayer]);

  // تحميل كسول لطبقة Places عند التفعيل الأول
  const ensureLayerData = async (layer: 'workshops'|'showrooms'|'dealers') => {
    if (loadingLayer) return;
    // تحقق إن كانت البيانات محملة
    const needFetch = data.some(d => d[layer] === -1);
    if (!needFetch) return;
    setLoadingLayer(layer);
    try {
      const googleMapsService = (await import('@globul-cars/servicesgoogle-maps-enhanced.service')).default;
      const dayKey = new Date().toISOString().slice(0,10);
      const cacheKeyAll = `places_cache_${dayKey}`;
      const allCacheRaw = localStorage.getItem(cacheKeyAll);
      let allCache: Record<string,{workshops:number;showrooms:number;dealers:number}> = allCacheRaw ? JSON.parse(allCacheRaw) : {};
      let progress = 0;
      const concurrency = 4; // عدد المدن المتوازية
      const queue = [...data];
      const results: RegionDataPoint[] = [];
      const workers: Promise<void>[] = [];
      const runWorker = async () => {
        while (queue.length) {
          const p = queue.shift()!;
          if (p[layer] !== -1) { results.push(p); continue; }
          let workshops = p.workshops, showrooms = p.showrooms, dealers = p.dealers;
          const perCityKey = p.id;
          if (allCache[perCityKey]) {
            ({workshops, showrooms, dealers} = allCache[perCityKey]);
          } else {
            const [w,s,d] = await Promise.all([
              googleMapsService.getPlacesCountByType({lat:p.lat,lng:p.lng}, 'car_repair', 10000, 1),
              googleMapsService.getPlacesCountByType({lat:p.lat,lng:p.lng}, 'car_showroom', 10000, 1),
              googleMapsService.getPlacesCountByType({lat:p.lat,lng:p.lng}, 'car_dealer', 10000, 1)
            ]);
            workshops = w; showrooms = s; dealers = d;
            allCache[perCityKey] = {workshops, showrooms, dealers};
            localStorage.setItem(cacheKeyAll, JSON.stringify(allCache));
          }
          results.push({...p, workshops, showrooms, dealers });
          progress += 1;
          if (progress % 3 === 0) {
            setData(prev => results.concat(queue.map(q=>q))); // تحديث جزئي
          }
        }
      };
      for (let i=0;i<concurrency;i++) workers.push(runWorker());
      await Promise.all(workers);
      setData(results);
      setUpdatedAt(Date.now());
    } finally {
      setLoadingLayer(null);
    }
  };

  // Initialize map once
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map('bulgaria-analytics-map', {
      center: [42.6977, 23.3219], // Sofia
      zoom: 7,
      minZoom: 7,
      maxZoom: 12,
      maxBounds: [
        [41.2, 22.3],  // Southwest corner of Bulgaria
        [44.2, 28.6]   // Northeast corner of Bulgaria
      ],
      maxBoundsViscosity: 0.9,
      zoomControl: true,
      attributionControl: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
    mapRef.current = map;
  }, []);

  // Render dynamic overlays
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // إزالة الطبقة السابقة
    // @ts-ignore
    if (map._analyticsLayer) { map.removeLayer(map._analyticsLayer); }
    const layerGroup = L.layerGroup();

    // وظائف مساعدة
    const jitter = (id: string, base: number) => {
      let h = 0; for (let i=0;i<id.length;i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
      const sign = ((h >> 1) & 1) ? 1 : -1;
      return base + sign * ((h % 7) * 0.0009); // انحراف صغير ثابت
    };

    if (activeLayer === 'cars') {
      carsEntities.forEach(car => {
        const coord = cityIdToCoordinates(car.cityId);
        if (!coord) return;
        const cityData = BULGARIAN_CITIES.find(c => c.id === car.cityId || c.cityId === car.cityId);
        const cityName = cityData ? (language === 'bg' ? cityData.nameBg : cityData.nameEn) : car.cityId;
        const marker = L.circleMarker([jitter(car.id, coord.lat), jitter(car.id+'b', coord.lng)], {
          radius: 5,
          color: '#e36414',
          weight: 1,
          opacity: 0.85,
          fillOpacity: 0.6,
          fillColor: '#ff8f10',
          className: 'fade-in-marker'
        });
        marker.on('click', () => {
          const sameCityCars = carsEntities.filter(c => c.cityId === car.cityId).map(c => ({
            type: 'car' as const,
            data: c,
            cityName,
            cityId: car.cityId
          }));
          setSelectedItems(sameCityCars);
          setSelectedCity(cityName);
        });
        if (showDetails) marker.bindTooltip(`${t('mapPage.layerCars')} • ${cityName}`, { direction: 'top' });
        layerGroup.addLayer(marker);
      });
    } else if (activeLayer === 'users') {
      usersEntities.forEach(user => {
        const coord = cityIdToCoordinates(user.cityId);
        if (!coord) return;
        const cityData = BULGARIAN_CITIES.find(c => c.id === user.cityId || c.cityId === user.cityId);
        const cityName = cityData ? (language === 'bg' ? cityData.nameBg : cityData.nameEn) : user.cityId;
        const marker = L.circleMarker([jitter(user.id, coord.lat), jitter(user.id+'b', coord.lng)], {
          radius: 5,
          color: '#1d4ed8',
          weight: 1,
          opacity: 0.85,
          fillOpacity: 0.6,
          fillColor: '#3b82f6',
          className: 'fade-in-marker'
        });
        marker.on('click', () => {
          const sameCityUsers = usersEntities.filter(u => u.cityId === user.cityId).map(u => ({
            type: 'user' as const,
            data: u,
            cityName,
            cityId: user.cityId
          }));
          setSelectedItems(sameCityUsers);
          setSelectedCity(cityName);
        });
        if (showDetails) marker.bindTooltip(`${t('mapPage.layerUsers')} • ${cityName}`, { direction: 'top' });
        layerGroup.addLayer(marker);
      });
    } else {
      // طبقات مجمعة (Places أو counts)
      data.forEach(point => {
        let value = 0; let color = '#e36414'; let itemType: 'workshop' | 'showroom' | 'dealer' = 'workshop';
        if (activeLayer === 'workshops') { value = point.workshops; color = '#16a34a'; itemType = 'workshop'; }
        if (activeLayer === 'showrooms') { value = point.showrooms; color = '#6366f1'; itemType = 'showroom'; }
        if (activeLayer === 'dealers') { value = point.dealers; color = '#ff8f10'; itemType = 'dealer'; }
        if (value < 0) value = 0; // لم يتم التحميل بعد
        const radius = Math.min(46, Math.max(10, Math.sqrt(value || 1) * 2.8));
        const circle = L.circleMarker([point.lat, point.lng], {
          radius,
          color,
          weight: 1,
          opacity: 0.9,
          fillOpacity: 0.4,
          fillColor: color,
          className: 'fade-in-marker'
        });
        circle.on('click', () => {
          setSelectedCity(point.name);
          setSelectedItems([{ 
            type: itemType, 
            data: { 
              ...point, 
              count: value, 
              coords: {lat: point.lat, lng: point.lng} 
            }, 
            cityName: point.name 
          }]);
        });
        if (showDetails) circle.bindTooltip(`${point.name}: ${value}`, { direction: 'top' });
        layerGroup.addLayer(circle);
      });
    }
    layerGroup.addTo(map);
    // @ts-ignore
    map._analyticsLayer = layerGroup;
  }, [activeLayer, carsEntities, usersEntities, data, showDetails, t]);

  const updatedTimeStr = useMemo(() => new Date(updatedAt).toLocaleTimeString(), [updatedAt]);

  return (
    <PageContainer>
      <Header>
        <Title>{t('mapPage.title')}</Title>
        <Subtitle>{t('mapPage.subtitle')}</Subtitle>
      </Header>
      <ControlsBar role="radiogroup" aria-label="Map layer selection">
        {(['cars','users','workshops','showrooms','dealers'] as const).map(layer => (
          <ToggleButton
            key={layer}
            data-layer={layer}
            data-active={activeLayer===layer}
            active={activeLayer===layer}
            aria-pressed={activeLayer===layer}
            role="radio"
            aria-checked={activeLayer===layer}
            onClick={async () => {
              if (activeLayer === layer) return;
              const startTime = performance.now();
              setActiveLayer(layer);
              trackMapEvent('map_layer_toggle', { layer, previous: activeLayer });
              if (['workshops','showrooms','dealers'].includes(layer)) {
                await ensureLayerData(layer as 'workshops'|'showrooms'|'dealers');
                const duration = performance.now() - startTime;
                trackMapEvent('map_layer_load', { layer, duration_ms: Math.round(duration) });
              }
            }}>
            {layer==='cars' && t('mapPage.layerCars')}
            {layer==='users' && t('mapPage.layerUsers')}
            {layer==='workshops' && (<>{t('mapPage.layerWorkshops')}{loadingLayer==='workshops' && ' …'}</>)}
            {layer==='showrooms' && (<>{t('mapPage.layerShowrooms')}{loadingLayer==='showrooms' && ' …'}</>)}
            {layer==='dealers' && (<>{t('mapPage.layerDealers')}{loadingLayer==='dealers' && ' …'}</>)}
          </ToggleButton>
        ))}
        <ToggleButton
          data-layer="details"
            data-active={showDetails}
            active={showDetails}
            aria-pressed={showDetails}
            onClick={() => setShowDetails(v => !v)}>
            {t('mapPage.toggleDetails')}
        </ToggleButton>
        {loading && <span style={{ fontSize: '0.65rem', opacity: 0.6 }} aria-live="polite">{t('mapPage.loading')}</span>}
      </ControlsBar>
      <MapWrapper>
        <div id="bulgaria-analytics-map" style={{ width: '100%', height: '100%' }} />
        <Legend>
          <strong style={{ fontSize: '0.75rem' }}>{t('mapPage.legendTitle')}</strong>
          {activeLayer==='cars' && <LegendItem><span style={{ width: 12, height: 12, background: '#e36414', borderRadius: 4 }} /> {t('mapPage.layerCars')} ({carsEntities.length})</LegendItem>}
          {activeLayer==='users' && <LegendItem><span style={{ width: 12, height: 12, background: '#1d4ed8', borderRadius: 4 }} /> {t('mapPage.layerUsers')} ({usersEntities.length})</LegendItem>}
          {activeLayer==='workshops' && <LegendItem><span style={{ width: 12, height: 12, background: '#16a34a', borderRadius: 4 }} /> {t('mapPage.layerWorkshops')}</LegendItem>}
          {activeLayer==='showrooms' && <LegendItem><span style={{ width: 12, height: 12, background: '#6366f1', borderRadius: 4 }} /> {t('mapPage.layerShowrooms')}</LegendItem>}
          {activeLayer==='dealers' && <LegendItem><span style={{ width: 12, height: 12, background: '#ff8f10', borderRadius: 4 }} /> {t('mapPage.layerDealers')}</LegendItem>}
          <UpdatedTag>{t('mapPage.lastUpdated')}: {updatedTimeStr}</UpdatedTag>
        </Legend>
        
        <DetailsPanel $show={selectedItems.length > 0}>
          {selectedItems.length > 0 && (
            <>
              <DetailsPanelHeader>
                <DetailsPanelTitle>
                  {selectedCity} • {selectedItems.length} {selectedItems.length === 1 ? t('mapPage.item') : t('mapPage.items')}
                </DetailsPanelTitle>
                <CloseButton onClick={() => { setSelectedItems([]); setSelectedCity(null); }}>×</CloseButton>
              </DetailsPanelHeader>
              
              <ItemsGrid>
                {selectedItems.map((item, idx) => {
                  if (item.type === 'car') {
                    return (
                      <ItemCard key={idx} onClick={() => navigate(`/car/${item.data.id}`)}>
                        <CardHeader>
                          <CardIcon>🚗</CardIcon>
                          <CardTitle>{t('mapPage.carItem')}</CardTitle>
                          <CardBadge>ID: {item.data.id.slice(0, 8)}</CardBadge>
                        </CardHeader>
                        <CardBody>
                          <CardField>
                            <CardLabel>{t('mapPage.city')}:</CardLabel>
                            <CardValue>{item.cityName}</CardValue>
                          </CardField>
                          <CardField>
                            <CardLabel>{t('mapPage.location')}:</CardLabel>
                            <CardValue>
                              {cityIdToCoordinates(item.data.cityId)?.lat.toFixed(3)}, {cityIdToCoordinates(item.data.cityId)?.lng.toFixed(3)}
                            </CardValue>
                          </CardField>
                        </CardBody>
                        <CardFooter>
                          <CardButton className="primary">{language === 'bg' ? 'Виж детайли' : 'View Details'}</CardButton>
                        </CardFooter>
                      </ItemCard>
                    );
                  }
                  
                  if (item.type === 'user') {
                    return (
                      <ItemCard key={idx} onClick={() => navigate(`/profile/${item.data.id}`)}>
                        <CardHeader>
                          <CardIcon>👤</CardIcon>
                          <CardTitle>{t('mapPage.userItem')}</CardTitle>
                          <CardBadge>ID: {item.data.id.slice(0, 8)}</CardBadge>
                        </CardHeader>
                        <CardBody>
                          <CardField>
                            <CardLabel>{t('mapPage.city')}:</CardLabel>
                            <CardValue>{item.cityName}</CardValue>
                          </CardField>
                          <CardField>
                            <CardLabel>{t('mapPage.location')}:</CardLabel>
                            <CardValue>
                              {cityIdToCoordinates(item.data.cityId)?.lat.toFixed(3)}, {cityIdToCoordinates(item.data.cityId)?.lng.toFixed(3)}
                            </CardValue>
                          </CardField>
                        </CardBody>
                        <CardFooter>
                          <CardButton className="primary">{language === 'bg' ? 'Виж профил' : 'View Profile'}</CardButton>
                        </CardFooter>
                      </ItemCard>
                    );
                  }
                  
                  if (item.type === 'workshop' || item.type === 'showroom' || item.type === 'dealer') {
                    const icon = item.type === 'workshop' ? '🔧' : item.type === 'showroom' ? '🏢' : '🤝';
                    const typeLabel = item.type === 'workshop' ? t('mapPage.workshopItem') : 
                                     item.type === 'showroom' ? t('mapPage.showroomItem') : 
                                     t('mapPage.dealerItem');
                    return (
                      <ItemCard key={idx}>
                        <CardHeader>
                          <CardIcon>{icon}</CardIcon>
                          <CardTitle>{typeLabel}</CardTitle>
                          <CardBadge>{item.data.count || 0} {language === 'bg' ? 'места' : 'places'}</CardBadge>
                        </CardHeader>
                        <CardBody>
                          <CardField>
                            <CardLabel>{t('mapPage.city')}:</CardLabel>
                            <CardValue>{item.cityName}</CardValue>
                          </CardField>
                          <CardField>
                            <CardLabel>{t('mapPage.count')}:</CardLabel>
                            <CardValue>{item.data.count || 0}</CardValue>
                          </CardField>
                          <CardField>
                            <CardLabel>{t('mapPage.location')}:</CardLabel>
                            <CardValue>
                              {item.data.coords?.lat.toFixed(3)}, {item.data.coords?.lng.toFixed(3)}
                            </CardValue>
                          </CardField>
                        </CardBody>
                        <CardFooter>
                          <CardButton onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://www.google.com/maps/search/${item.type}/@${item.data.coords?.lat},${item.data.coords?.lng},14z`, '_blank');
                          }}>
                            {language === 'bg' ? 'Отвори в Google Maps' : 'Open in Google Maps'}
                          </CardButton>
                        </CardFooter>
                      </ItemCard>
                    );
                  }
                  
                  return null;
                })}
              </ItemsGrid>
            </>
          )}
        </DetailsPanel>
      </MapWrapper>
      {/* TODO: analytics events (mapPage_view, mapPage_toggle_layer) */}
    </PageContainer>
  );
};

export default MapAnalyticsPage;