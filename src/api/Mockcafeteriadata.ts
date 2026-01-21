// mockCafeteriaData.ts - Fixed TypeScript Types

import dayjs from 'dayjs';

// ============================================
// TYPES (matching component interface)
// ============================================
type CongestionLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ============================================
// CONFIGURATION
// ============================================
const COUNTERS = [
  'Bisi Oota/ Mini meals Counter',
  'Two Good Counter',
  'Healthy Station Counter',
];

const CAFETERIA_CAPACITY = 590;

// ============================================
// HELPER FUNCTIONS
// ============================================
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getCongestionLevel = (
  value: number,
  threshold: { low: number; medium: number; high: number }
): CongestionLevel => {
  if (value < threshold.low) return 'LOW';
  if (value < threshold.medium) return 'MEDIUM';
  if (value < threshold.high) return 'HIGH';
  return 'CRITICAL';
};

const getMealTimeMultiplier = (hour: number): number => {
  if (hour >= 8 && hour <= 9) return 1.8;
  if (hour >= 12 && hour <= 14) return 2.5;
  if (hour >= 18 && hour <= 19) return 2.0;
  if (hour >= 10 && hour <= 11) return 1.2;
  if (hour >= 16 && hour <= 17) return 1.3;
  return 0.3;
};

const getCounterPopularity = (counterName: string): number => {
  if (counterName.includes('Bisi Oota')) return 1.3;
  if (counterName.includes('Two Good')) return 1.0;
  if (counterName.includes('Healthy Station')) return 0.8;
  return 1.0;
};

// ============================================
// MOCK DATA GENERATORS
// ============================================

export const generateOccupancyData = () => {
  const currentHour = dayjs().hour();
  const multiplier = getMealTimeMultiplier(currentHour);
  const baseOccupancy = 80;
  const currentOccupancy = Math.floor(baseOccupancy * multiplier + randomInt(-20, 30));
  const occupancyPercentage = (currentOccupancy / CAFETERIA_CAPACITY) * 100;

  return {
    currentOccupancy: Math.min(currentOccupancy, CAFETERIA_CAPACITY),
    capacity: CAFETERIA_CAPACITY,
    congestionLevel: getCongestionLevel(occupancyPercentage, {
      low: 40,
      medium: 60,
      high: 80,
    }),
    timestamp: dayjs().toISOString(),
  };
};

export const generateFlowData = (hours: number = 24) => {
  const data = [];
  const now = dayjs();

  for (let i = hours * 12; i >= 0; i--) {
    const timestamp = now.subtract(i * 5, 'minute');
    const hour = timestamp.hour();
    const multiplier = getMealTimeMultiplier(hour);

    const baseInflow = 15;
    const baseOutflow = 12;

    const inflow = Math.floor(baseInflow * multiplier + randomInt(-5, 10));
    const outflow = Math.floor(baseOutflow * multiplier + randomInt(-5, 10));

    data.push({
      timestamp: timestamp.format('HH:mm'),
      fullTimestamp: timestamp.toISOString(),
      inflow: Math.max(0, inflow),
      outflow: Math.max(0, outflow),
      netFlow: inflow - outflow,
      hour: timestamp.hour(),
      minute: timestamp.minute(),
    });
  }

  return data;
};

export const generateHeatmapData = () => {
  const data = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const dayName = days[dayIndex];
    const isWeekend = dayIndex >= 5;

    for (let hour = 0; hour < 24; hour++) {
      const multiplier = getMealTimeMultiplier(hour);
      const baseValue = isWeekend ? 60 : 80;
      const value = Math.floor(baseValue * multiplier + randomInt(-10, 15));

      data.push({
        day: dayName,
        hour: `${hour.toString().padStart(2, '0')}:00`,
        hourNum: hour,
        dayIndex,
        value: Math.max(0, value),
        intensity: Math.min(100, value),
      });
    }
  }

  return data;
};

export const generateCounterStatus = () => {
  const currentHour = dayjs().hour();
  const multiplier = getMealTimeMultiplier(currentHour);

  return COUNTERS.map((counterName) => {
    const popularityFactor = getCounterPopularity(counterName);
    const baseQueue = 5;
    const queueLength = Math.floor(
      baseQueue * multiplier * popularityFactor + randomInt(-2, 5)
    );

    const waitingTime = Math.max(1, Math.floor(queueLength * 2 + randomInt(-1, 2)));

    return {
      counterName,
      queueLength: Math.max(0, queueLength),
      waitingTime,
      congestionLevel: getCongestionLevel(queueLength, {
        low: 3,
        medium: 7,
        high: 12,
      }),
      lastUpdated: dayjs().toISOString(),
    };
  });
};

export const generateCounterTrendData = (hours: number = 24) => {
  const data = [];
  const now = dayjs();

  for (let i = hours * 6; i >= 0; i--) {
    const timestamp = now.subtract(i * 10, 'minute');
    const hour = timestamp.hour();
    const multiplier = getMealTimeMultiplier(hour);

    const dataPoint: any = {
      timestamp: timestamp.format('HH:mm'),
      fullTimestamp: timestamp.toISOString(),
      hour: timestamp.hour(),
    };

    COUNTERS.forEach((counter) => {
      const popularityFactor = getCounterPopularity(counter);
      const baseQueue = 5;
      const queueLength = Math.floor(
        baseQueue * multiplier * popularityFactor + randomInt(-2, 5)
      );
      dataPoint[counter] = Math.max(0, queueLength);
    });

    data.push(dataPoint);
  }

  return data;
};

export const generateDwellTimeData = () => {
  const currentHour = dayjs().hour();
  const isPeakHour = [8, 9, 12, 13, 14, 18, 19].includes(currentHour);

  const distributions = isPeakHour
    ? [
        { timeRange: '0-5 min', baseCount: 30 },
        { timeRange: '5-10 min', baseCount: 45 },
        { timeRange: '10-15 min', baseCount: 50 },
        { timeRange: '15-20 min', baseCount: 35 },
        { timeRange: '20+ min', baseCount: 20 },
      ]
    : [
        { timeRange: '0-5 min', baseCount: 50 },
        { timeRange: '5-10 min', baseCount: 60 },
        { timeRange: '10-15 min', baseCount: 30 },
        { timeRange: '15-20 min', baseCount: 10 },
        { timeRange: '20+ min', baseCount: 5 },
      ];

  const data = distributions.map((item) => ({
    timeRange: item.timeRange,
    count: item.baseCount + randomInt(-5, 10),
    percentage: 0,
  }));

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  return data.map((item) => ({
    ...item,
    percentage: Math.round((item.count / totalCount) * 100),
  }));
};

export const generateFootfallComparison = (hours: number = 24) => {
  const data = [];
  const now = dayjs();

  for (let i = hours * 6; i >= 0; i--) {
    const timestamp = now.subtract(i * 10, 'minute');
    const hour = timestamp.hour();
    const multiplier = getMealTimeMultiplier(hour);

    const baseCafeteriaFootfall = 100;
    const cafeteriaFootfall = Math.floor(
      baseCafeteriaFootfall * multiplier + randomInt(-20, 30)
    );

    let countersFootfall: number;
    let insight: string;

    const scenario = randomInt(1, 100);

    if (scenario < 60) {
      countersFootfall = Math.floor(cafeteriaFootfall * (0.4 + Math.random() * 0.2));
      insight = 'Normal flow';
    } else if (scenario < 75 && cafeteriaFootfall > 100) {
      countersFootfall = Math.floor(cafeteriaFootfall * (0.15 + Math.random() * 0.15));
      insight = 'High congestion - People waiting / delays in cafeteria';
    } else if (scenario < 90 && cafeteriaFootfall > 50) {
      countersFootfall = Math.floor(cafeteriaFootfall * (0.7 + Math.random() * 0.2));
      insight = 'Counter hopping - Poor clarity / service issues';
    } else {
      countersFootfall = Math.floor(cafeteriaFootfall * (0.5 + Math.random() * 0.2));
      insight = cafeteriaFootfall < 30 ? 'Low traffic - Optimal service time' : 'Normal flow';
    }

    const ratio = cafeteriaFootfall > 0 ? countersFootfall / cafeteriaFootfall : 0;

    data.push({
      timestamp: timestamp.format('HH:mm'),
      fullTimestamp: timestamp.toISOString(),
      cafeteriaFootfall: Math.max(0, cafeteriaFootfall),
      countersFootfall: Math.max(0, countersFootfall),
      ratio: Math.round(ratio * 100) / 100,
      insight,
      hour: timestamp.hour(),
    });
  }

  return data;
};

export const generateHourlyTraffic = (hours: number = 24) => {
  const data = [];
  const now = dayjs();

  for (let i = hours; i >= 0; i--) {
    const timestamp = now.subtract(i, 'hour');
    const hour = timestamp.hour();
    const multiplier = getMealTimeMultiplier(hour);

    const avgFootfall = Math.floor(80 * multiplier + randomInt(-15, 20));
    const peakFootfall = Math.floor(avgFootfall * 1.3 + randomInt(5, 15));
    const totalVisitors = Math.floor(avgFootfall * 6 + randomInt(-50, 100));

    data.push({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      hourNum: hour,
      timestamp: timestamp.toISOString(),
      avgFootfall: Math.max(0, avgFootfall),
      peakFootfall: Math.max(0, peakFootfall),
      totalVisitors: Math.max(0, totalVisitors),
      multiplier: Math.round(multiplier * 10) / 10,
    });
  }

  return data;
};

export const generatePeakHoursAnalysis = () => {
  const hourlyData = generateHourlyTraffic(24);
  const sorted = [...hourlyData].sort((a, b) => b.avgFootfall - a.avgFootfall);
  const peakHours = sorted.slice(0, 3);

  return {
    peakHours: peakHours.map((h) => ({
      hour: h.hour,
      avgFootfall: h.avgFootfall,
      peakFootfall: h.peakFootfall,
      totalVisitors: h.totalVisitors,
    })),
    analysis: {
      primaryPeak: peakHours[0].hour,
      secondaryPeak: peakHours[1].hour,
      tertiaryPeak: peakHours[2].hour,
      averageFootfall: Math.round(
        hourlyData.reduce((sum, h) => sum + h.avgFootfall, 0) / hourlyData.length
      ),
      totalDailyVisitors: hourlyData.reduce((sum, h) => sum + h.totalVisitors, 0),
    },
  };
};

export const generateDashboardData = () => {
  return {
    occupancy: generateOccupancyData(),
    flow: generateFlowData(12),
    heatmap: generateHeatmapData(),
    counters: generateCounterStatus(),
    counterTrend: generateCounterTrendData(12),
    dwellTime: generateDwellTimeData(),
    footfallComparison: generateFootfallComparison(12),
    hourlyTraffic: generateHourlyTraffic(24),
    peakHours: generatePeakHoursAnalysis(),
    timestamp: dayjs().toISOString(),
    metadata: {
      capacity: CAFETERIA_CAPACITY,
      countersCount: COUNTERS.length,
      counters: COUNTERS,
      currentHour: dayjs().hour(),
      currentMeal: getCurrentMealPeriod(),
    },
  };
};

const getCurrentMealPeriod = () => {
  const hour = dayjs().hour();
  if (hour >= 7 && hour < 10) return 'Breakfast';
  if (hour >= 10 && hour < 12) return 'Brunch';
  if (hour >= 12 && hour < 15) return 'Lunch';
  if (hour >= 15 && hour < 17) return 'Afternoon Snack';
  if (hour >= 17 && hour < 20) return 'Dinner';
  return 'Off Hours';
};

export const generateSmartInsights = () => {
  const occupancy = generateOccupancyData();
  const counters = generateCounterStatus();
  const comparison = generateFootfallComparison(2);

  const insights = [];

  if (occupancy.congestionLevel === 'CRITICAL') {
    insights.push({
      type: 'warning',
      severity: 'high',
      title: 'Critical Congestion',
      message: `Cafeteria is at ${Math.round((occupancy.currentOccupancy / occupancy.capacity) * 100)}% capacity!`,
      recommendation: 'Consider directing visitors to alternative dining areas.',
      timestamp: dayjs().toISOString(),
    });
  }

  const bisiOotaCounter = counters.find(c => c.counterName.includes('Bisi Oota'));
  if (bisiOotaCounter && bisiOotaCounter.congestionLevel === 'HIGH') {
    insights.push({
      type: 'info',
      severity: 'medium',
      title: 'Bisi Oota Counter Busy',
      message: `${bisiOotaCounter.queueLength} people waiting at Bisi Oota counter (${bisiOotaCounter.waitingTime} min wait)`,
      recommendation: 'Deploy additional staff or recommend alternative counters.',
      timestamp: dayjs().toISOString(),
    });
  }

  const overcrowdedCounters = counters.filter(
    (c) => c.congestionLevel === 'HIGH' || c.congestionLevel === 'CRITICAL'
  );
  if (overcrowdedCounters.length > 0) {
    insights.push({
      type: 'info',
      severity: 'medium',
      title: 'Counter Congestion',
      message: `${overcrowdedCounters.length} counter(s) experiencing high congestion.`,
      recommendation: 'Deploy additional staff to congested counters.',
      counters: overcrowdedCounters.map((c) => c.counterName),
      timestamp: dayjs().toISOString(),
    });
  }

  const recentComparison = comparison[comparison.length - 1];
  if (recentComparison && recentComparison.insight !== 'Normal flow') {
    insights.push({
      type: 'pattern',
      severity: 'low',
      title: 'Traffic Pattern Detected',
      message: recentComparison.insight,
      recommendation: 'Monitor situation and adjust staffing as needed.',
      timestamp: dayjs().toISOString(),
    });
  }

  return insights;
};

// ============================================
// EXPORT DEFAULT
// ============================================
const mockCafeteriaData = {
  generateOccupancyData,
  generateFlowData,
  generateHeatmapData,
  generateCounterStatus,
  generateCounterTrendData,
  generateDwellTimeData,
  generateFootfallComparison,
  generateHourlyTraffic,
  generatePeakHoursAnalysis,
  generateDashboardData,
  generateSmartInsights,
  COUNTERS,
  CAFETERIA_CAPACITY,
};

export default mockCafeteriaData;