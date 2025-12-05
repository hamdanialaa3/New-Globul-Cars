import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { BULGARIAN_CITIES } from '../constants/bulgarianCities';

interface LocationData {
  cityId?: string;
  locationData?: { cityId?: string };
}

export interface CarEntity {
  id: string;
  cityId?: string;
}

export interface UserEntity {
  id: string;
  cityId?: string;
}

function extractCityId(docData: any): string | undefined {
  if (!docData) return undefined;
  // Preferred new structure
  if (docData.locationData?.cityId) return docData.locationData.cityId;
  // Legacy fallbacks
  if (docData.cityId) return docData.cityId;
  if (docData.city) return docData.city; // legacy field name
  return undefined;
}

export async function fetchCarsByCity(maxPerCity: number = 500): Promise<CarEntity[]> {
  const carsRef = collection(db, 'cars');
  // Fetch all active cars (adjust status field name if different)
  const qAll = query(carsRef, where('status', '==', 'active'));
  const snapshot = await getDocs(qAll);
  const cars: CarEntity[] = [];
  snapshot.forEach(d => {
    const data = d.data();
    const cityId = extractCityId(data);
    cars.push({ id: d.id, cityId });
  });
  // Optional cap per city to avoid rendering explosions
  const capped: CarEntity[] = [];
  const perCityCount: Record<string, number> = {};
  for (const c of cars) {
    if (!c.cityId) continue;
    perCityCount[c.cityId] = (perCityCount[c.cityId] || 0) + 1;
    if (perCityCount[c.cityId] <= maxPerCity) capped.push(c);
  }
  return capped;
}

export async function fetchUsersByCity(maxPerCity: number = 500): Promise<UserEntity[]> {
  const usersRef = collection(db, 'users');
  // Only active / verified users if such flags exist; fallback to all
  const snapshot = await getDocs(usersRef);
  const users: UserEntity[] = [];
  snapshot.forEach(d => {
    const data = d.data();
    const cityId = extractCityId(data);
    users.push({ id: d.id, cityId });
  });
  const capped: UserEntity[] = [];
  const perCityCount: Record<string, number> = {};
  for (const u of users) {
    if (!u.cityId) continue;
    perCityCount[u.cityId] = (perCityCount[u.cityId] || 0) + 1;
    if (perCityCount[u.cityId] <= maxPerCity) capped.push(u);
  }
  return capped;
}

export function cityIdToCoordinates(cityId: string | undefined): { lat: number; lng: number } | undefined {
  if (!cityId) return undefined;
  const city = BULGARIAN_CITIES.find(c => c.id === cityId || c.cityId === cityId);
  if (!city) return undefined;
  return { lat: city.coordinates.lat, lng: city.coordinates.lng };
}

export async function getUserCountsByCity(): Promise<Record<string, number>> {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  const counts: Record<string, number> = {};
  snapshot.forEach(d => {
    const cityId = extractCityId(d.data());
    if (cityId) counts[cityId] = (counts[cityId] || 0) + 1;
  });
  return counts;
}
