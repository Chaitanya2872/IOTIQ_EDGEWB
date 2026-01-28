// Add this utility file: src/utils/numberFormatting.ts

/**
 * Round number to 1 decimal place
 * @param value - The number to round
 * @returns Rounded number with 1 decimal place
 */
export const roundToOneDecimal = (value: number | null | undefined): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  return Math.round(value * 10) / 10;
};

/**
 * Format number with 1 decimal place as string
 * @param value - The number to format
 * @returns Formatted string with 1 decimal place
 */
export const formatOneDecimal = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.0";
  }
  return roundToOneDecimal(value).toFixed(1);
};

/**
 * Round percentage to 2 decimal places
 * @param value - The percentage value
 * @returns Rounded percentage with 2 decimal places
 */
export const roundToTwoDecimals = (
  value: number | null | undefined,
): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
};

/**
 * Format percentage with 2 decimal places
 * @param value - The percentage value
 * @returns Formatted string with 2 decimal places and % sign
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.00%";
  }
  return `${roundToTwoDecimals(value).toFixed(2)}%`;
};

/**
 * Format large numbers with commas
 * @param value - The number to format
 * @returns Formatted string with comma separators
 */
export const formatWithCommas = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }
  return value.toLocaleString("en-US");
};

/**
 * Round all average values in an object to 1 decimal
 * @param data - Object containing numeric values
 * @returns New object with rounded values
 */
export const roundAverages = <T extends Record<string, any>>(data: T): T => {
  const result = { ...data };

  Object.keys(result).forEach((key) => {
    if (
      typeof result[key] === "number" &&
      (key.toLowerCase().includes("average") ||
        key.toLowerCase().includes("avg") ||
        key.toLowerCase().includes("efficiency") ||
        key.toLowerCase().includes("congestion"))
    ) {
      result[key] = roundToOneDecimal(result[key]);
    }
  });

  return result;
};

/**
 * Apply rounding to trend data array
 * @param trends - Array of trend objects
 * @returns Array with rounded values
 */
export const roundTrendData = (trends: any[]): any[] => {
  return trends.map((trend) => ({
    ...trend,
    average_queue_length: roundToOneDecimal(trend.average_queue_length),
    total_queue_length: roundToOneDecimal(trend.total_queue_length),
    peak_queue: roundToOneDecimal(trend.peak_queue),
    min_queue: roundToOneDecimal(trend.min_queue),
    averageQueueLength: roundToOneDecimal(trend.averageQueueLength),
    totalQueueLength: roundToOneDecimal(trend.totalQueueLength),
    maxQueueLength: roundToOneDecimal(trend.maxQueueLength),
    minQueueLength: roundToOneDecimal(trend.minQueueLength),
  }));
};

/**
 * Apply rounding to comparison data
 * @param comparisons - Array of comparison objects
 * @returns Array with rounded values
 */
export const roundComparisonData = (comparisons: any[]): any[] => {
  return comparisons.map((comp) => ({
    ...comp,
    averageTotalQueue: roundToOneDecimal(comp.averageTotalQueue),
    averageQueuePerDevice: roundToOneDecimal(comp.averageQueuePerDevice),
    maxTotalQueue: roundToOneDecimal(comp.maxTotalQueue),
    minTotalQueue: roundToOneDecimal(comp.minTotalQueue),
    efficiency: roundToOneDecimal(comp.efficiency),
    congestionRate: roundToOneDecimal(comp.congestionRate),
  }));
};

/**
 * Apply rounding to statistics object
 * @param stats - Statistics object
 * @returns Object with rounded values
 */
export const roundStatistics = (stats: any): any => {
  if (!stats) return stats;

  return {
    ...stats,
    averageTotalQueue: roundToOneDecimal(stats.averageTotalQueue),
    averageQueuePerDevice: roundToOneDecimal(stats.averageQueuePerDevice),
    maxTotalQueue: roundToOneDecimal(stats.maxTotalQueue),
    minTotalQueue: roundToOneDecimal(stats.minTotalQueue),
    efficiency: roundToOneDecimal(stats.efficiency),
    average_queue_length: roundToOneDecimal(stats.average_queue_length),
    peak_queue: roundToOneDecimal(stats.peak_queue),
    min_queue: roundToOneDecimal(stats.min_queue),
  };
};

// Export all utilities
export default {
  roundToOneDecimal,
  formatOneDecimal,
  roundToTwoDecimals,
  formatPercentage,
  formatWithCommas,
  roundAverages,
  roundTrendData,
  roundComparisonData,
  roundStatistics,
};
