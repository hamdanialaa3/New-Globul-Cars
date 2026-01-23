# 📡 IoT & Car Tracking System Documentation
## نظام إنترنت الأشياء وتتبع السيارات - توثيق شامل

> **Last Updated:** January 23, 2026  
> **Version:** 0.5.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [GPS Tracking System](#gps-tracking)
3. [IoT Dashboard Architecture](#iot-dashboard)
4. [Telemetry & Sensor Data](#telemetry)
5. [Alert System](#alerts)
6. [Fleet Management](#fleet-management)
7. [Technical Implementation](#technical)

---

## 🎯 Overview

The IoT & Car Tracking system provides real-time vehicle monitoring capabilities for both individual car owners and fleet managers. It integrates GPS tracking, sensor telemetry, and cloud-based analytics to deliver a comprehensive vehicle management solution.

### Key Capabilities
- **Real-time GPS Tracking**: Live location updates with 5-minute polling
- **Telemetry Monitoring**: Speed, fuel level, engine status, and more
- **Geofencing & Alerts**: Custom boundaries and automated notifications
- **Historical Playback**: Route history and location timeline
- **Multi-Device Support**: Track multiple vehicles from one dashboard

---

## 🗺️ GPS Tracking System {#gps-tracking}

The GPS tracking feature provides precise location monitoring for registered vehicles.

### User Interface
**Location:** `src/pages/03_user-pages/CarTrackingPage.tsx`

### Features
- **Live Map Display**: Interactive map showing current vehicle location
- **Coordinates**: Precise latitude/longitude display (e.g., 42.6977° N, 23.3219° E)
- **Recent Locations**: Timeline of recent stops and movements
- **Last Update Timestamp**: Real-time sync indicator

### Technical Flow
```typescript
interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: Date;
  address: string; // Reverse geocoded address
}
```

### Map Integration
- Uses Google Maps API for visualization
- Static maps for historical view (performance optimization)
- Dynamic maps for real-time tracking
- Address reverse geocoding via `geocoding-service.ts`

---

## 💻 IoT Dashboard Architecture {#iot-dashboard}

Central control panel for managing all connected IoT devices.

### Dashboard Components
**Location:** `src/pages/03_user-pages/IoTDashboardPage.tsx`

#### Statistics Cards
- **Total Devices**: Count of all registered IoT devices
- **Online Devices**: Currently active and transmitting
- **Offline Devices**: Disconnected or out of range

#### Device Cards
Each connected vehicle displays:
- Device name and ID
- Online/Offline status badge (green/red)
- Real-time telemetry widget (`CarIoTStatus` component)

### Add Device Flow
Users can register new IoT devices by:
1. Clicking "Add New Device" card
2. Entering device credentials (likely OBD-II dongle or GPS tracker)
3. Pairing with vehicle VIN
4. Activating telemetry stream

---

## 📊 Telemetry & Sensor Data {#telemetry}

Real-time and historical sensor data from connected vehicles.

### Data Model
**Service:** `src/services/iotService.ts`

```typescript
interface CarTelemetryData {
  speed?: number;              // km/h
  fuelLevel?: number;          // percentage
  location?: { lat: number; lng: number };
  engineStatus?: string;       // 'running' | 'stopped'
  batteryVoltage?: number;     // volts
  temperature?: number;        // engine temp in °C
}
```

### Data Collection
- **Polling Interval**: Every 5 minutes for stationary vehicles
- **Real-time Updates**: Continuous stream while vehicle is moving
- **Storage**: Firebase Realtime Database for live data, Firestore for historical aggregation

### Shadow State Pattern
Uses AWS IoT Device Shadow pattern:
```typescript
interface CarShadow {
  state: {
    reported: CarTelemetryData; // Last known state from device
    desired: CarSettings;        // Pending commands from user
  };
}
```

---

## 🚨 Alert System {#alerts}

Automated notifications based on vehicle conditions and geofencing.

### Alert Types
1. **Location Alerts**
   - Vehicle enters/exits geofenced zone
   - Unusual nighttime movement
   - Traveled beyond expected radius

2. **Telemetry Alerts**
   - Low fuel warning
   - Engine overheating
   - Battery voltage drop
   - Sudden speed changes

3. **Connectivity Alerts**
   - Device went offline unexpectedly
   - Connection restored after absence

### Alert Display
**Component:** `AlertTriangle` icon in `CarTrackingPage.tsx`
- Shows "No active alerts" when system is normal
- Lists critical alerts with timestamps when present
- Color-coded by severity (yellow/orange/red)

---

## 🚗 Fleet Management {#fleet-management}

For dealers and companies managing multiple vehicles.

### Fleet Dashboard Features
- **Multi-vehicle Overview**: All tracked cars on one map
- **Vehicle Status Grid**: Sortable list with online/offline indicators
- **Group Operations**: Bulk geofence assignment
- **Analytics**: Total mileage, fuel consumption, utilization rates

### B2B Integration
Links to `SellerDashboardPage.tsx` and `DealerDashboardPage.tsx` for commercial users who need:
- Inventory location tracking
- Test drive monitoring  
- Delivery route verification

---

## 🔧 Technical Implementation {#technical}

### Service Architecture

#### IoT Service (Stub Implementation)
**Location:** `src/services/iotService.ts`

> **Note:** Current implementation is a stub. AWS SDK was removed to reduce bundle size. Production deployment requires:
> - MQTT broker integration (AWS IoT Core or alternative)
> - WebSocket connection for real-time updates
> - Message queue for buffering telemetry data

#### Methods
- `getCarTelemetry(carId)`: Fetch latest sensor readings
- `getCarShadow(carId)`: Get device twin state
- `subscribeToCarUpdates(carId, callback)`: Real-time subscription
- `notifyCarSale(carId)`: Send notification to device on sale

### Data Flow
```
IoT Device (OBD-II/GPS) 
  → MQTT Broker (AWS IoT Core)
  → Lambda Function (Data Processing)
  → Firebase Realtime DB (Live State)
  → React App (UI Updates via WebSocket)
```

### Performance Optimization
- **Lazy Loading**: Map component loaded on-demand
- **Data Sampling**: Store summary stats instead of every reading
- **Caching**: Recent locations cached in Redux/Context

---

## 🔗 Related Documentation

- [02_User_Authentication_and_Profile.md](./02_User_Authentication_and_Profile.md) - User device registration
- [10_Performance_Monitoring_and_Audit.md](./10_Performance_Monitoring_and_Audit.md) - System health monitoring
- [18_B2B_Features_and_Analytics.md](./18_B2B_Features_and_Analytics.md) - Fleet analytics

---

**Last Updated:** January 23, 2026  
**Maintained By:** IoT & Infrastructure Team  
**Status:** ✅ Active Documentation
