// Helper function to calculate date range
export const calculateDateRange = (
  range: string,
  customStart?: string,
  customEnd?: string,
): { startTime: string; endTime: string } => {
  if (range === "custom" && customStart && customEnd) {
    return {
      startTime: new Date(customStart).toISOString(),
      endTime: new Date(customEnd).toISOString(),
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start = new Date(today);

  switch (range) {
    case "today":
      start = today;
      break;
    case "yesterday":
      start = new Date(today);
      start.setDate(start.getDate() - 1);
      break;
    case "last7":
      start = new Date(today);
      start.setDate(start.getDate() - 7);
      break;
    case "last30":
      start = new Date(today);
      start.setDate(start.getDate() - 30);
      break;
    case "last90":
      start = new Date(today);
      start.setDate(start.getDate() - 90);
      break;
    case "last6months":
      start = new Date(today);
      start.setMonth(start.getMonth() - 6);
      break;
    case "last12months":
      start = new Date(today);
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start = new Date(today);
      start.setDate(start.getDate() - 30);
  }

  return {
    startTime: start.toISOString(),
    endTime: now.toISOString(),
  };
};
