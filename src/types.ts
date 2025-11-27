// types.ts - TypeScript interfaces and types for IoT Sensors Dashboard

export interface CounterData {
  name: string;
  queueLength: number;
  avgWaitTime: number;
  status: 'ready' | 'busy' | 'crowded';
  color: string;
  icon: string;
}

export interface PeakHours {
  today: string;
  peakDay: string;
  totalToday: number;
  avgWaitTime: number;
}

export interface IAQSensor {
  floor: number;
  location: string;
  temperature: number;
  humidity: number;
  co2: number;
  pm25: number;
  pm10: number;
  tvoc: number;
  illuminance: number;
  pressure: number;
  ozone: number;
  occupied: boolean;
  quality: 'excellent' | 'good' | 'moderate' | 'poor' | 'unhealthy';
  lastUpdate: string;
}

export interface RestroomData {
  id: string;
  location: string;
  floor: number;
  gender: 'male' | 'female' | 'unisex';
  occupied: boolean;
  usageCount: number;
  lastCleaned: string;
  odorLevel: number;
  humidity: number;
  temperature: number;
  nh3: number;
  h2s: number;
  battery: number;
  cleaningRequired: boolean;
  status: 'excellent' | 'good' | 'needs-attention' | 'cleaning-required';
}

export interface EnergyMeter {
  id: string;
  location: string;
  floor: number;
  voltage: number;
  current: number;
  powerFactor: number;
  kwh: number;
  power: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
}

export interface FloorEnergy {
  floor: number;
  consumption: number;
  equipment: {
    hvac: number;
    lighting: number;
    servers: number;
    appliances: number;
  };
}

export interface FloorStats {
  avgTemp: string;
  avgHumidity: string;
  avgCO2: number;
  occupiedZones: number;
}

export interface RestroomStats {
  total: number;
  occupied: number;
  available: number;
  needsCleaning: number;
  totalUsage: number;
  avgOdorLevel: string;
}

export type TabType = 'cafeteria' | 'iaq' | 'restroom' | 'energy';
export type ViewMode = 'grid' | 'list';
export type TimeRange = 'today' | 'week' | 'month';
export type SelectedView = 'overview' | 'floors' | 'equipment';
