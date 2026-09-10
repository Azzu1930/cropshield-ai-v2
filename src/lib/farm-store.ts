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
    createdAt: new Date().toISOString(),
  },
];

export function getStoredFarms(): FarmRecord[] {
  if (typeof window === 'undefined') {
    return DEFAULT_FARMS;
  }
  try {
    const raw = localStorage.getItem('cropshield_farms');
    if (!raw) {
      localStorage.setItem('cropshield_farms', JSON.stringify(DEFAULT_FARMS));
      return DEFAULT_FARMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FARMS;
  } catch {
    return DEFAULT_FARMS;
  }
}

export function saveStoredFarms(farms: FarmRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cropshield_farms', JSON.stringify(farms));
  } catch (err) {
    console.error('Failed to save farms to localStorage', err);
  }
}

export function getActiveFarmId(): string {
  if (typeof window === 'undefined') return DEFAULT_FARMS[0].id;
  try {
    return localStorage.getItem('cropshield_active_farm_id') || DEFAULT_FARMS[0].id;
  } catch {
    return DEFAULT_FARMS[0].id;
  }
}

export function setActiveFarmId(farmId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cropshield_active_farm_id', farmId);
  } catch (err) {
    console.error('Failed to set active farm id', err);
  }
}

export function getActiveFarm(): FarmRecord {
  const farms = getStoredFarms();
  const activeId = getActiveFarmId();
  return farms.find((f) => f.id === activeId) || farms[0] || DEFAULT_FARMS[0];
}
