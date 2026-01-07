// src/api/index.ts

// Export configuration
export { apiClient, BASE_URL } from './config';

// Export types
export * from './types';

// Export API services
export { cafeteriaApi } from './cafeteriaApi';
export { iaqApi } from './iaqApi';
export { dashboardApi } from './dashboardApi';
export { restroomApi } from './Restroomapi';
export type { OdorSensorData, RestroomData } from './Restroomapi';

// Export hooks
export { useCafeteriaData, useCounterData } from './hooks/useCafeteriaData';
export { useIAQData, useDeviceIAQData } from './hooks/useIAQData';
export { useDashboardData } from './hooks/useDashboarddata';
export { useRestroomData } from './hooks/useRestroomData';