// src/api/types.ts

// ===== Cafeteria Types =====
export interface CafeteriaCounter {
  id: number;
  counterName: string;
  queueCount: number;
  waitTimeText: string;
  waitTimeMinutes: number;
  serviceStatus: 'READY_TO_SERVE' | 'SHORT_WAIT' | 'MEDIUM_WAIT' | 'LONG_WAIT';
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  timestamp: string;
  locationName?: string;
  floor?: number;
}

export interface CafeteriaLatestResponse {
  timestamp: string;
  counters: {
    TwoGood?: CafeteriaCounter;
    UttarDakshin?: CafeteriaCounter;
    Tandoor?: CafeteriaCounter;
  };
}

export interface CafeteriaStatistics {
  counterName: string;
  hours: number;
  averageQueue: number;
  averageWaitMinutes: number;
  maxQueue: number;
  maxWaitMinutes: number;
  criticalCount: number;
  warningCount: number;
  totalReadings: number;
}

// ===== IAQ (Air Quality) Types =====
export interface IAQSensor {
  id: number;
  deviceId: string;
  type: string;
  value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  quality?: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'SEVERE';
  timestamp: string;
  locationId?: number;
  locationName?: string;
  floor?: number;
  zone?: string;
}

export interface IAQFloorData {
  floor: number;
  sensors: IAQSensor[];
  averages: {
    temperature: number;
    humidity: number;
    co2: number;
  };
}

// ===== Restroom Types =====
export interface RestroomData {
  id: number;
  restroomId: string;
  floor: number;
  zone: string;
  occupancyStatus: 'AVAILABLE' | 'OCCUPIED';
  cleaningStatus: 'CLEAN' | 'NEEDS_CLEANING' | 'CLEANING_IN_PROGRESS';
  usageCount: number;
  lastCleaned: string;
  timestamp: string;
}

// ===== Energy Types =====
export interface EnergyMeter {
  id: number;
  deviceId: string;
  floor: number;
  zone?: string;
  voltage: number;
  current: number;
  activePower: number;
  powerFactor: number;
  energyConsumption: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

// ===== Dashboard Overview Types =====
export interface DashboardOverview {
  cafeteria: {
    activeCounters: number;
    alerts: number;
  };
  iaq: {
    totalSensors: number;
    alerts: number;
  };
  restroom: {
    totalRestrooms: number;
    alerts: number;
  };
  energy: {
    activeMeters: number;
    alerts: number;
  };
  totalActiveAlerts: number;
}

// ===== Alert Types =====
export interface Alert {
  id: number;
  type: 'CAFETERIA' | 'IAQ' | 'RESTROOM' | 'ENERGY';
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  location: string;
  timestamp: string;
  resolved: boolean;
}

// ===== API Response Wrapper =====
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}