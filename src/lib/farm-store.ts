import type { WeatherData } from './supabase/database.types';

export interface FarmRecord {
  id: string;
  name: string;
  state: string;
  district: string;
  locality: string;
  latitude: number;
  longitude: number;
  cropName?: string;
  cachedWeather?: WeatherData;
  userId?: string;
  createdAt: string;
}

export const DEFAULT_FARMS: FarmRecord[] = [
  {
    id: 'farm-ap-1',
    name: 'Sri Lakshmi Paddy Land',
    state: 'Andhra Pradesh',
    district: 'West Godavari',
    locality: 'Bhimavaram',
    latitude: 16.5449,
    longitude: 81.5212,
    cropName: 'Rice',
    userId: 'demo-farmer-id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'farm-tg-2',
    name: 'Kishan Cotton & Chilli Farm',
    state: 'Telangana',
    district: 'Warangal',
    locality: 'Narsampet',
    latitude: 17.9250,
    longitude: 79.8970,
    cropName: 'Chilli',
    userId: 'demo-farmer-id',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Returns current user identifier to isolate farm data per user account.
 */
export function getCurrentUserScope(userId?: string): string {
  if (userId) return userId;
  if (typeof window === 'undefined') return 'anonymous';
  try {
    const raw = localStorage.getItem('cropshield_active_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.id) return user.id;
    }
  } catch {
    // Ignore
  }
  return 'anonymous';
}

export function isDemoScope(scope: string): boolean {
  if (scope === 'demo-farmer-id') return true;
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('cropshield_active_user');
    if (raw) {
      const user = JSON.parse(raw);
      return Boolean(user?.isDemo || user?.id === 'demo-farmer-id');
    }
  } catch {
    // Ignore
  }
  return false;
}

export function getStoredFarms(userId?: string): FarmRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const scope = getCurrentUserScope(userId);
  const isDemo = isDemoScope(scope);

  try {
    const key = `cropshield_farms_${scope}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }

    // Only populate default demo farms for the demo farmer account
    if (isDemo) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_FARMS));
      return DEFAULT_FARMS;
    }

    return [];
  } catch {
    return isDemo ? DEFAULT_FARMS : [];
  }
}

export function saveStoredFarms(farms: FarmRecord[], userId?: string): void {
  if (typeof window === 'undefined') return;
  const scope = getCurrentUserScope(userId);
  try {
    const key = `cropshield_farms_${scope}`;
    localStorage.setItem(key, JSON.stringify(farms));
  } catch (err) {
    console.error('Failed to save farms to localStorage', err);
  }
}

export function getActiveFarmId(userId?: string): string | null {
  if (typeof window === 'undefined') return null;
  const scope = getCurrentUserScope(userId);
  const isDemo = isDemoScope(scope);

  try {
    const key = `cropshield_active_farm_id_${scope}`;
    const saved = localStorage.getItem(key);
    if (saved) return saved;

    const farms = getStoredFarms(scope);
    if (farms.length > 0) {
      return farms[0].id;
    }
    return isDemo ? DEFAULT_FARMS[0].id : null;
  } catch {
    return isDemo ? DEFAULT_FARMS[0].id : null;
  }
}

export function setActiveFarmId(farmId: string, userId?: string): void {
  if (typeof window === 'undefined') return;
  const scope = getCurrentUserScope(userId);
  try {
    const key = `cropshield_active_farm_id_${scope}`;
    localStorage.setItem(key, farmId);
  } catch (err) {
    console.error('Failed to set active farm id', err);
  }
}

export function getActiveFarm(userId?: string): FarmRecord | null {
  const farms = getStoredFarms(userId);
  if (farms.length === 0) return null;
  const activeId = getActiveFarmId(userId);
  return farms.find((f) => f.id === activeId) || farms[0] || null;
}
