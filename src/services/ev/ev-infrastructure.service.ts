// src/services/ev/ev-infrastructure.service.ts
// EV Infrastructure Engine — Charging stations, battery SOH, EV-specific features
// Electromaps/Eldrive API integration for Bulgaria's growing EV market

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

// ─── Types ───────────────────────────────────────────────────────────

export type ConnectorType =
  | 'Type2'
  | 'CCS2'
  | 'CHAdeMO'
  | 'Type1'
  | 'CCS1'
  | 'Tesla'
  | 'SchukoCEE';

export type ChargingSpeed = 'slow' | 'fast' | 'rapid' | 'ultra_rapid';

export interface ChargingStation {
  id: string;
  name: string;
  nameBg: string;
  operator: string;
  address: string;
  addressBg: string;
  city: string;
  cityBg: string;
  latitude: number;
  longitude: number;
  connectors: ChargingConnector[];
  amenities: string[];
  isOpen24h: boolean;
  pricePerKwh: number;
  currency: 'EUR';
  rating: number;
  reviewCount: number;
  status: 'available' | 'in_use' | 'offline' | 'maintenance';
  lastUpdated: Date;
}

export interface ChargingConnector {
  type: ConnectorType;
  powerKw: number;
  speed: ChargingSpeed;
  status: 'available' | 'in_use' | 'offline';
  count: number;
}

export interface BatteryHealthReport {
  id: string;
  carId: string;
  vin: string;
  userId: string;
  batteryData: {
    originalCapacityKwh: number;
    currentCapacityKwh: number;
    stateOfHealth: number; // Percentage 0-100
    cycleCount: number;
    degradationPerYear: number;
    estimatedRangeKm: number;
    originalRangeKm: number;
    cellBalanceStatus: 'good' | 'moderate' | 'poor';
    thermalManagement: 'active_liquid' | 'active_air' | 'passive';
  };
  warranty: {
    originalYears: number;
    originalKm: number;
    remainingMonths: number;
    minSohGuarantee: number; // Usually 70%
    isUnderWarranty: boolean;
  };
  financialImpact: {
    replacementCostEur: number;
    currentValueImpact: number; // Percentage of car value affected
    estimatedResaleAdjustment: number;
  };
  recommendations: BatteryRecommendation[];
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  createdAt: Date;
}

export interface BatteryRecommendation {
  type: 'charging' | 'storage' | 'maintenance' | 'replacement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  titleBg: string;
  description: string;
  descriptionBg: string;
}

export interface EVFilter {
  minRange?: number;
  maxRange?: number;
  minBatteryKwh?: number;
  maxBatteryKwh?: number;
  connectorTypes?: ConnectorType[];
  minSoh?: number;
  fastChargingCapable?: boolean;
  vehicleToGrid?: boolean;
}

export interface RouteChargingPlan {
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  totalDistanceKm: number;
  vehicleRangeKm: number;
  stopsRequired: number;
  stops: ChargingStop[];
  totalChargingTimeMin: number;
  totalChargingCostEur: number;
  totalTripTimeMin: number;
}

export interface ChargingStop {
  station: ChargingStation;
  distanceFromPreviousKm: number;
  arrivalBatteryPercent: number;
  chargeToPercent: number;
  chargingTimeMin: number;
  chargingCostEur: number;
  connectorType: ConnectorType;
}

// ─── EV Specifications Database ──────────────────────────────────────

interface EVModelSpec {
  make: string;
  model: string;
  batteryKwh: number;
  rangeKm: number;
  fastChargePowerKw: number;
  connectorTypes: ConnectorType[];
  warrantyYears: number;
  warrantyKm: number;
  minSohGuarantee: number;
  replacementCostEur: number;
}

const EV_MODELS: EVModelSpec[] = [
  {
    make: 'Tesla',
    model: 'Model 3',
    batteryKwh: 60,
    rangeKm: 491,
    fastChargePowerKw: 250,
    connectorTypes: ['CCS2', 'Type2'],
    warrantyYears: 8,
    warrantyKm: 192000,
    minSohGuarantee: 70,
    replacementCostEur: 12000,
  },
  {
    make: 'Tesla',
    model: 'Model Y',
    batteryKwh: 75,
    rangeKm: 533,
    fastChargePowerKw: 250,
    connectorTypes: ['CCS2', 'Type2'],
    warrantyYears: 8,
    warrantyKm: 192000,
    minSohGuarantee: 70,
    replacementCostEur: 14000,
  },
  {
    make: 'VW',
    model: 'ID.4',
    batteryKwh: 77,
    rangeKm: 520,
    fastChargePowerKw: 135,
    connectorTypes: ['CCS2', 'Type2'],
    warrantyYears: 8,
    warrantyKm: 160000,
    minSohGuarantee: 70,
    replacementCostEur: 15000,
  },
  {
    make: 'VW',
    model: 'ID.3',
    batteryKwh: 58,
    rangeKm: 420,
    fastChargePowerKw: 120,
    connectorTypes: ['CCS2', 'Type2'],
    warrantyYears: 8,
    warrantyKm: 160000,
    minSohGuarantee: 70,
    replacementCostEur: 11000,
  },
  {
    make: 'BMW',
    model: 'iX3',
    batteryKwh: 80,
    rangeKm: 460,
    fastChargePowerKw: 150,
    connectorTypes: ['CCS2', 'Type2'],
    warrantyYears: 8,
    warrantyKm: 160000,
    minSohGuarantee: 70,
    replacementCostEur: 16000,
  },
  {
    make: 'Hyundai',
    model: 'Ioniq 5',
    batteryKwh: 77,
    rangeKm: 481,
    fastChargePowerKw: 220,
    connectorTypes: ['CCS2', 'Type2'],
    warrantyYears: 8,
    warrantyKm: 160000,
    minSohGuarantee: 70,
    replacementCostEur: 13000,
  },
  {
    make: 'Kia',
    model: 'EV6',
    batteryKwh: 77,
    rangeKm: 528,
    fastChargePowerKw: 240,
    connectorTypes: ['CCS2', 'Type2'],
    warrantyYears: 7,
    warrantyKm: 150000,
    minSohGuarantee: 70,
    replacementCostEur: 13000,
  },
  {
    make: 'Renault',
    model: 'Megane E-Tech',
    batteryKwh: 60,
    rangeKm: 450,
    fastChargePowerKw: 130,
    connectorTypes: ['CCS2', 'Type2'],
    warrantyYears: 8,
    warrantyKm: 160000,
    minSohGuarantee: 70,
    replacementCostEur: 10000,
  },
  {
    make: 'Peugeot',
    model: 'e-208',
    batteryKwh: 50,
    rangeKm: 362,
    fastChargePowerKw: 100,
    connectorTypes: ['CCS2', 'Type2'],
    warrantyYears: 8,
    warrantyKm: 160000,
    minSohGuarantee: 70,
    replacementCostEur: 9000,
  },
  {
    make: 'Nissan',
    model: 'Leaf',
    batteryKwh: 40,
    rangeKm: 270,
    fastChargePowerKw: 50,
    connectorTypes: ['CHAdeMO', 'Type2'],
    warrantyYears: 8,
    warrantyKm: 160000,
    minSohGuarantee: 75,
    replacementCostEur: 8000,
  },
  {
    make: 'MG',
    model: 'MG4',
    batteryKwh: 64,
    rangeKm: 450,
    fastChargePowerKw: 135,
    connectorTypes: ['CCS2', 'Type2'],
    warrantyYears: 7,
    warrantyKm: 150000,
    minSohGuarantee: 70,
    replacementCostEur: 10000,
  },
  {
    make: 'BYD',
    model: 'Atto 3',
    batteryKwh: 60,
    rangeKm: 420,
    fastChargePowerKw: 88,
    connectorTypes: ['CCS2', 'Type2'],
    warrantyYears: 8,
    warrantyKm: 150000,
    minSohGuarantee: 70,
    replacementCostEur: 10000,
  },
];

// ─── Bulgarian Charging Networks ─────────────────────────────────────

const BULGARIAN_NETWORKS = [
  { name: 'Eldrive', stationCount: 200, avgPricePerKwh: 0.35 },
  { name: 'Electromaps', stationCount: 150, avgPricePerKwh: 0.38 },
  { name: 'EVIO', stationCount: 80, avgPricePerKwh: 0.32 },
  { name: 'CEZ', stationCount: 50, avgPricePerKwh: 0.36 },
  { name: 'Tesla Supercharger', stationCount: 15, avgPricePerKwh: 0.42 },
];

// ─── Service ─────────────────────────────────────────────────────────

class EVInfrastructureService {
  private static instance: EVInfrastructureService;

  private constructor() {}

  static getInstance(): EVInfrastructureService {
    if (!EVInfrastructureService.instance) {
      EVInfrastructureService.instance = new EVInfrastructureService();
    }
    return EVInfrastructureService.instance;
  }

  // ─── Battery Health ───────────────────────────────────────────────

  /**
   * Generate a battery health report for an EV listing
   */
  async generateBatteryReport(params: {
    carId: string;
    vin: string;
    userId: string;
    make: string;
    model: string;
    yearOfManufacture: number;
    mileageKm: number;
    reportedSoh?: number; // Seller-reported SOH
  }): Promise<BatteryHealthReport> {
    try {
      // Find matching EV model spec
      const spec = EV_MODELS.find(
        ev =>
          ev.make.toLowerCase() === params.make.toLowerCase() &&
          ev.model.toLowerCase() === params.model.toLowerCase()
      );

      const originalCapacity = spec?.batteryKwh || 60; // Default
      const originalRange = spec?.rangeKm || 400;
      const warrantyYears = spec?.warrantyYears || 8;
      const warrantyKm = spec?.warrantyKm || 160000;
      const minSohGuarantee = spec?.minSohGuarantee || 70;
      const replacementCost = spec?.replacementCostEur || 12000;

      // Estimate SOH based on age + mileage if not provided
      const age = new Date().getFullYear() - params.yearOfManufacture;
      const estimatedSoh =
        params.reportedSoh || this.estimateSoh(age, params.mileageKm);

      const currentCapacity =
        Math.round(originalCapacity * (estimatedSoh / 100) * 10) / 10;
      const estimatedRange = Math.round(originalRange * (estimatedSoh / 100));
      const degradationPerYear =
        age > 0 ? Math.round(((100 - estimatedSoh) / age) * 10) / 10 : 0;
      const estimatedCycles = Math.round(
        params.mileageKm / (originalRange * 0.8)
      );

      // Warranty check
      const remainingMonths = Math.max(0, warrantyYears * 12 - age * 12);
      const isUnderWarranty =
        remainingMonths > 0 && params.mileageKm < warrantyKm;

      // Financial impact
      const valueImpact =
        estimatedSoh >= 90
          ? 0
          : estimatedSoh >= 80
            ? 5
            : estimatedSoh >= 70
              ? 15
              : 30;

      // Cell balance inference
      const cellBalance: 'good' | 'moderate' | 'poor' =
        estimatedSoh >= 85 ? 'good' : estimatedSoh >= 70 ? 'moderate' : 'poor';

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        estimatedSoh,
        age,
        params.mileageKm,
        cellBalance
      );

      // Score and grade
      const score = Math.round(estimatedSoh);
      const grade =
        score >= 90
          ? ('A' as const)
          : score >= 80
            ? ('B' as const)
            : score >= 70
              ? ('C' as const)
              : score >= 60
                ? ('D' as const)
                : ('F' as const);

      const report: BatteryHealthReport = {
        id: `battery_${params.carId}_${Date.now()}`,
        carId: params.carId,
        vin: params.vin,
        userId: params.userId,
        batteryData: {
          originalCapacityKwh: originalCapacity,
          currentCapacityKwh: currentCapacity,
          stateOfHealth: estimatedSoh,
          cycleCount: estimatedCycles,
          degradationPerYear,
          estimatedRangeKm: estimatedRange,
          originalRangeKm: originalRange,
          cellBalanceStatus: cellBalance,
          thermalManagement: 'active_liquid', // Default assumption
        },
        warranty: {
          originalYears: warrantyYears,
          originalKm: warrantyKm,
          remainingMonths,
          minSohGuarantee,
          isUnderWarranty,
        },
        financialImpact: {
          replacementCostEur: replacementCost,
          currentValueImpact: valueImpact,
          estimatedResaleAdjustment: -Math.round(
            replacementCost * ((100 - estimatedSoh) / 100)
          ),
        },
        recommendations,
        score,
        grade,
        createdAt: new Date(),
      };

      // Store in Firestore
      await setDoc(doc(db, 'battery_health_reports', report.id), {
        ...report,
        createdAt: serverTimestamp(),
      });

      serviceLogger.info('EV: Battery report generated', {
        carId: params.carId,
        soh: estimatedSoh,
        grade,
      });
      return report;
    } catch (error) {
      serviceLogger.error('EV: Battery report error', error as Error);
      throw error;
    }
  }

  // ─── Charging Stations ────────────────────────────────────────────

  /**
   * Find nearby charging stations
   */
  async findNearbyStations(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    connectorTypes?: ConnectorType[];
    minPowerKw?: number;
  }): Promise<ChargingStation[]> {
    try {
      // Query Firestore for stations within radius
      const q = query(
        collection(db, 'charging_stations'),
        where('status', '!=', 'offline')
      );

      const snapshot = await getDocs(q);
      const stations = snapshot.docs
        .map(d => d.data() as ChargingStation)
        .filter(station => {
          // Haversine distance filter
          const distance = this.haversineDistance(
            params.latitude,
            params.longitude,
            station.latitude,
            station.longitude
          );
          if (distance > params.radiusKm) return false;

          // Connector filter
          if (params.connectorTypes?.length) {
            const hasConnector = station.connectors.some(c =>
              params.connectorTypes!.includes(c.type)
            );
            if (!hasConnector) return false;
          }

          // Power filter
          if (params.minPowerKw) {
            const hasMinPower = station.connectors.some(
              c => c.powerKw >= params.minPowerKw!
            );
            if (!hasMinPower) return false;
          }

          return true;
        })
        .sort((a, b) => {
          const distA = this.haversineDistance(
            params.latitude,
            params.longitude,
            a.latitude,
            a.longitude
          );
          const distB = this.haversineDistance(
            params.latitude,
            params.longitude,
            b.latitude,
            b.longitude
          );
          return distA - distB;
        });

      serviceLogger.info('EV: Found nearby stations', {
        count: stations.length,
        radiusKm: params.radiusKm,
      });
      return stations;
    } catch (error) {
      serviceLogger.error('EV: Error finding stations', error as Error);
      return [];
    }
  }

  /**
   * Generate a charging plan for a route
   */
  planRouteCharging(params: {
    origin: { lat: number; lng: number; name: string };
    destination: { lat: number; lng: number; name: string };
    vehicleRangeKm: number;
    batteryCapacityKwh: number;
    currentBatteryPercent: number;
    connectorType: ConnectorType;
    chargePowerKw: number;
  }): RouteChargingPlan {
    const totalDistanceKm = this.haversineDistance(
      params.origin.lat,
      params.origin.lng,
      params.destination.lat,
      params.destination.lng
    );

    const currentRangeKm =
      params.vehicleRangeKm * (params.currentBatteryPercent / 100);

    // Calculate if charging stops are needed
    let stopsRequired = 0;
    const stops: ChargingStop[] = [];
    let totalChargingTimeMin = 0;
    let totalChargingCostEur = 0;

    if (currentRangeKm < totalDistanceKm) {
      // Need to stop — calculate how many
      const safeRange = params.vehicleRangeKm * 0.8; // Keep 20% buffer
      stopsRequired = Math.ceil((totalDistanceKm - currentRangeKm) / safeRange);

      // Estimate charging time: fast charge to 80% takes ~30min typically
      const chargePerStopKwh = params.batteryCapacityKwh * 0.6; // Charge from 20% to 80%
      const chargeTimeMin = Math.round(
        (chargePerStopKwh / params.chargePowerKw) * 60 * 1.2
      ); // 1.2x for taper
      const chargeCost = chargePerStopKwh * 0.35; // Average EUR/kWh in Bulgaria

      for (let i = 0; i < stopsRequired; i++) {
        totalChargingTimeMin += chargeTimeMin;
        totalChargingCostEur += chargeCost;
      }
    }

    const drivingTimeMin = Math.round((totalDistanceKm / 100) * 60); // ~100km/h average
    const totalTripTimeMin =
      drivingTimeMin + totalChargingTimeMin + stopsRequired * 10; // +10min per stop

    return {
      origin: params.origin,
      destination: params.destination,
      totalDistanceKm: Math.round(totalDistanceKm),
      vehicleRangeKm: params.vehicleRangeKm,
      stopsRequired,
      stops,
      totalChargingTimeMin,
      totalChargingCostEur: Math.round(totalChargingCostEur * 100) / 100,
      totalTripTimeMin,
    };
  }

  // ─── EV Market Data ───────────────────────────────────────────────

  /**
   * Get EV model specifications
   */
  getEVModelSpec(make: string, model: string): EVModelSpec | null {
    return (
      EV_MODELS.find(
        ev =>
          ev.make.toLowerCase() === make.toLowerCase() &&
          ev.model.toLowerCase() === model.toLowerCase()
      ) || null
    );
  }

  /**
   * Get all supported EV models
   */
  getSupportedModels(): EVModelSpec[] {
    return [...EV_MODELS];
  }

  /**
   * Get Bulgarian charging network summary
   */
  getNetworkSummary(): typeof BULGARIAN_NETWORKS {
    return [...BULGARIAN_NETWORKS];
  }

  /**
   * Check if a car listing is EV and enrich with EV-specific data
   */
  async enrichEVListing(
    carId: string,
    make: string,
    model: string
  ): Promise<{
    isEV: boolean;
    spec: EVModelSpec | null;
    nearbyStationCount: number;
    avgChargingCost: number;
  }> {
    const spec = this.getEVModelSpec(make, model);
    const isEV = spec !== null;

    const totalStations = BULGARIAN_NETWORKS.reduce(
      (sum, n) => sum + n.stationCount,
      0
    );
    const avgCost =
      BULGARIAN_NETWORKS.reduce((sum, n) => sum + n.avgPricePerKwh, 0) /
      BULGARIAN_NETWORKS.length;

    return {
      isEV,
      spec,
      nearbyStationCount: totalStations,
      avgChargingCost: Math.round(avgCost * 100) / 100,
    };
  }

  // ─── Private Helpers ──────────────────────────────────────────────

  private estimateSoh(ageYears: number, mileageKm: number): number {
    // Degradation model: ~2-3% per year, accelerated by high mileage
    const ageDegradation = ageYears * 2.5;
    const mileageDegradation = (mileageKm / 200000) * 20; // 20% at 200k km
    const totalDegradation = Math.min(ageDegradation + mileageDegradation, 50); // Cap at 50%

    return Math.round((100 - totalDegradation) * 10) / 10;
  }

  private generateRecommendations(
    soh: number,
    age: number,
    mileage: number,
    cellBalance: 'good' | 'moderate' | 'poor'
  ): BatteryRecommendation[] {
    const recs: BatteryRecommendation[] = [];

    if (soh < 70) {
      recs.push({
        type: 'replacement',
        priority: 'critical',
        title: 'Battery Replacement Recommended',
        titleBg: 'Препоръчва се подмяна на батерията',
        description:
          'Battery health below 70% — replacement may be needed soon',
        descriptionBg:
          'Здравето на батерията е под 70% — може скоро да е необходима подмяна',
      });
    }

    if (cellBalance === 'poor') {
      recs.push({
        type: 'maintenance',
        priority: 'high',
        title: 'Cell Balancing Service Needed',
        titleBg: 'Необходимо е балансиране на клетките',
        description:
          'Battery cells show imbalance — professional service recommended',
        descriptionBg:
          'Клетките на батерията показват дисбаланс — препоръчва се професионален сервиз',
      });
    }

    recs.push({
      type: 'charging',
      priority: 'low',
      title: 'Optimal Charging Practices',
      titleBg: 'Оптимални практики за зареждане',
      description:
        'Keep charge between 20-80% for daily use. Full charge only before long trips.',
      descriptionBg:
        'Поддържайте заряда между 20-80% за ежедневна употреба. Пълно зареждане само преди дълги пътувания.',
    });

    if (soh >= 85) {
      recs.push({
        type: 'storage',
        priority: 'low',
        title: 'Battery in Good Condition',
        titleBg: 'Батерията е в добро състояние',
        description: 'Continue regular maintenance schedule',
        descriptionBg: 'Продължете редовния график за поддръжка',
      });
    }

    return recs;
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const evInfrastructureService = EVInfrastructureService.getInstance();
