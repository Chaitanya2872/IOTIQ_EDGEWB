import React, { useState, useEffect, useMemo, memo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  BarChart3,
  Users,
  Timer,
  Activity,
  Layers,
  Target,
  Grid,
  Zap,
  Calendar,
  ChevronDown,
} from "lucide-react";
import {
  useCounterQueueTrends,
  useCountersSummary,
  useCounterComparison,
  useLiveCounterStatus,
  useOccupancyTrends,
  useFootfallSummary,
  useWeeklyPeakQueue, // UPDATED: Using new hook
} from "../api/hooks/useCounterAnalytics";
import { DateRangeFilter } from "./DateFilterComponent";
import { ChartTypeSelector, DynamicChart } from "./ChartComponents";
import { calculateDateRange } from "../types/DateRangeHelpers";
import {
  roundToOneDecimal,
  formatOneDecimal,
  formatPercentage,
  roundTrendData,
  roundComparisonData,
  roundStatistics,
} from "../utils/numberFormatting";

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  body { margin: 0; padding: 0; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .enterprise-card { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  .stat-value { background: linear-gradient(135deg, #0F172A 0%, #334155 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .tab-button { transition: all 0.2s ease; }
  .tab-button:hover { transform: translateY(-1px); }
`;

const COUNTER_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];
const FOREST_GREEN_COLORS = [
  "#065F46",
  "#047857",
  "#059669",
  "#10B981",
  "#34D399",
  "#6EE7B7",
  "#A7F3D0",
  "#D1FAE5",
];

const EnterpriseCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  hover?: boolean;
}> = ({ children, delay = 0, hover = false }) => (
  <div
    className="enterprise-card"
    style={{
      background: "#FFFFFF",
      borderRadius: 12,
      border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.08)",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      animationDelay: `${delay}ms`,
      cursor: hover ? "pointer" : "default",
    }}
    onMouseEnter={(e) => {
      if (hover) {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px 0 rgba(0, 0, 0, 0.1)";
        e.currentTarget.style.borderColor = "#CBD5E1";
      }
    }}
    onMouseLeave={(e) => {
      if (hover) {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.08)";
        e.currentTarget.style.borderColor = "#E2E8F0";
      }
    }}
  >
    {children}
  </div>
);

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  delay?: number;
  subtitle?: string;
  color?: string;
  topRightValue?: string;
  bottomValue?: string;
}> = memo(
  ({
    label,
    value,
    change,
    icon: Icon,
    delay = 0,
    subtitle,
    color,
    topRightValue,
    bottomValue,
  }) => {
    const iconColor = color || "#3B82F6";
    return (
      <EnterpriseCard delay={delay} hover>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${iconColor}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={20} color={iconColor} strokeWidth={2} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#64748B",
                  letterSpacing: "0.3px",
                }}
              >
                {label}
              </div>
              {subtitle && (
                <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          {topRightValue ? (
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: iconColor,
                letterSpacing: "-0.5px",
              }}
            >
              {topRightValue}
            </div>
          ) : change !== undefined ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                color: change >= 0 ? "#10B981" : "#EF4444",
              }}
            >
              {change >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          ) : null}
        </div>
        <div
          className="stat-value"
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-1px",
            lineHeight: 1,
            marginBottom: bottomValue ? 12 : 0,
          }}
        >
          {value}
        </div>
        {bottomValue && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#64748B",
              fontWeight: 500,
            }}
          >
            <span>avg:</span>
            <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: 14 }}>
              {bottomValue}
            </span>
          </div>
        )}
      </EnterpriseCard>
    );
  },
);
MetricCard.displayName = "MetricCard";

const ChartContainer: React.FC<{
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  delay?: number;
  actions?: React.ReactNode;
}> = ({ title, subtitle, icon: Icon, children, delay = 0, actions }) => (
  <EnterpriseCard delay={delay}>
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={16} color="#FFF" strokeWidth={2} />
          </div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#0F172A",
              margin: 0,
              letterSpacing: "-0.2px",
            }}
          >
            {title}
          </h3>
        </div>
        {actions}
      </div>
      {subtitle && (
        <p
          style={{
            fontSize: 12,
            color: "#64748B",
            margin: 0,
            paddingLeft: 42,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
    {children}
  </EnterpriseCard>
);

const CounterMultiSelect: React.FC<{
  counters: any[];
  selectedCounters: string[];
  onSelectionChange: (selected: string[]) => void;
}> = ({ counters, selectedCounters, onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleCounter = (counterCode: string) => {
    if (selectedCounters.includes(counterCode))
      onSelectionChange(selectedCounters.filter((c) => c !== counterCode));
    else onSelectionChange([...selectedCounters, counterCode]);
  };
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #E2E8F0",
          background: "#FFFFFF",
          fontSize: 13,
          fontWeight: 500,
          color: "#0F172A",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 250,
        }}
      >
        <span>
          {selectedCounters.length === 0
            ? "Select Counters for Footfall"
            : `${selectedCounters.length} counter(s) selected`}
        </span>
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 1000,
            minWidth: 250,
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          {counters.map((counter) => (
            <label
              key={counter.counterCode}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 13,
                color: "#0F172A",
                borderBottom: "1px solid #F1F5F9",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FFFFFF";
              }}
            >
              <input
                type="checkbox"
                checked={selectedCounters.includes(counter.counterCode)}
                onChange={() => toggleCounter(counter.counterCode)}
                style={{ cursor: "pointer" }}
              />
              <span>{counter.counterCode}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          color: "#64748B",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <p
          key={index}
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 600,
            color: entry.color,
            marginBottom: index < payload.length - 1 ? 3 : 0,
          }}
        >
          {entry.name}:{" "}
          {typeof entry.value === "number"
            ? entry.value.toFixed(1)
            : entry.value}
        </p>
      ))}
    </div>
  );
};

const SkeletonLoader: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: 280,
      background: "#F8FAFC",
      borderRadius: 12,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
        animation: "shimmer 2s infinite",
      }}
    />
  </div>
);

const LoadingMetricCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <EnterpriseCard delay={delay}>
    <div>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "#F1F5F9",
          marginBottom: 16,
        }}
      />
      <div
        style={{
          width: 100,
          height: 12,
          borderRadius: 6,
          background: "#F1F5F9",
          marginBottom: 12,
        }}
      />
      <div
        style={{
          width: 80,
          height: 28,
          borderRadius: 8,
          background: "#F1F5F9",
        }}
      />
    </div>
  </EnterpriseCard>
);

const TabButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<any>;
}> = memo(({ label, active, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className="tab-button"
    style={{
      padding: "10px 20px",
      borderRadius: 10,
      border: "none",
      fontSize: 13,
      fontWeight: active ? 600 : 500,
      color: active ? "#FFFFFF" : "#64748B",
      background: active
        ? "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)"
        : "#F1F5F9",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      boxShadow: active ? "0 2px 8px rgba(59, 130, 246, 0.3)" : "none",
    }}
  >
    <Icon size={16} />
    {label}
  </button>
));
TabButton.displayName = "TabButton";

const CustomLegend: React.FC<{ data: any[] }> = ({ data }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "12px",
      marginTop: 20,
    }}
  >
    {data.map((entry, index) => (
      <div
        key={`legend-${index}`}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            background: FOREST_GREEN_COLORS[index % FOREST_GREEN_COLORS.length],
          }}
        />
        <span style={{ fontSize: 11, fontWeight: 500, color: "#64748B" }}>
          {entry.fullName}: {entry["Avg Queue"]}
        </span>
      </div>
    ))}
  </div>
);

export const AllCountersAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "live_monitoring" | "comparison" | "individual"
  >("live_monitoring");
  const [selectedCounter, setSelectedCounter] = useState<string>("");
  const [selectedCounters, setSelectedCounters] = useState<string[]>([]);
  const [footfallCounters, setFootfallCounters] = useState<string[]>([]);

  // UPDATED: New state for period filter and metric selection
  const [periodFilter, setPeriodFilter] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [selectedMetric, setSelectedMetric] = useState<
    "footfall" | "congestion" | "peakQueue" | "peakWaitTime"
  >("peakQueue");

  const [dateRange, setDateRange] = useState("last30");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [queueChartType, setQueueChartType] = useState<"line" | "area" | "bar">(
    "area",
  );
  const [occupancyChartType, setOccupancyChartType] = useState<
    "line" | "area" | "bar"
  >("line");

  const countersSummary = useCountersSummary();
  const counterTrends = useCounterQueueTrends();
  const counterComparison = useCounterComparison();
  const liveCounterStatus = useLiveCounterStatus();
  const occupancyTrends = useOccupancyTrends();
  const footfallSummary = useFootfallSummary();
  const weeklyPeakQueue = useWeeklyPeakQueue(); // UPDATED: New hook

  useEffect(() => {
    const fetchLiveData = () => {
      liveCounterStatus.fetchLiveStatus();
    };
    fetchLiveData();
    const intervalId = setInterval(() => {
      if (activeTab === "live_monitoring") fetchLiveData();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [activeTab]);

  useEffect(() => {
    if (
      liveCounterStatus.data?.counters &&
      liveCounterStatus.data.counters.length > 0
    ) {
      const codes = liveCounterStatus.data.counters.map((c) => c.counterCode);
      setSelectedCounters(codes);
      if (!selectedCounter) setSelectedCounter(codes[0]);
      if (codes.length > 1) {
        const now = new Date();
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        counterComparison.fetchComparison(codes, {
          filterType: "avg",
          startTime: startOfDay.toISOString(),
          endTime: now.toISOString(),
        });
      }
    }
  }, [liveCounterStatus.data]);

  // UPDATED: Enhanced useEffect for data fetching based on period filter
  useEffect(() => {
    if (selectedCounter && activeTab === "individual") {
      const { startTime, endTime } = calculateDateRange(
        dateRange,
        customStartDate,
        customEndDate,
      );

      // Fetch queue trends
      counterTrends.fetchTrends(selectedCounter, {
        interval: "1hour",
        startTime,
        endTime,
      });

      // Fetch occupancy trends
      occupancyTrends.fetchOccupancyTrends(selectedCounter, {
        interval: "1hour",
        startTime,
        endTime,
      });

      // UPDATED: Fetch peak queue data based on period filter
      const today = new Date();
      let startDate: string;
      let endDate: string = today.toISOString().split("T")[0];

      switch (periodFilter) {
        case "daily":
          // Get last 7 days for daily view
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 6);
          startDate = weekAgo.toISOString().split("T")[0];
          break;
        case "weekly":
          // Get last 4 weeks (28 days) for weekly view
          const fourWeeksAgo = new Date(today);
          fourWeeksAgo.setDate(today.getDate() - 27);
          startDate = fourWeeksAgo.toISOString().split("T")[0];
          break;
        case "monthly":
          // Get last 6 months for monthly view
          const sixMonthsAgo = new Date(today);
          sixMonthsAgo.setMonth(today.getMonth() - 5);
          startDate = sixMonthsAgo.toISOString().split("T")[0];
          break;
        default:
          const defaultWeekAgo = new Date(today);
          defaultWeekAgo.setDate(today.getDate() - 6);
          startDate = defaultWeekAgo.toISOString().split("T")[0];
      }

      weeklyPeakQueue.fetchWeeklyPeakQueue(selectedCounter, {
        startDate,
        endDate,
      });
    }
  }, [
    selectedCounter,
    activeTab,
    dateRange,
    customStartDate,
    customEndDate,
    periodFilter, // UPDATED: Important dependency
  ]);

  useEffect(() => {
    if (activeTab === "individual" && footfallCounters.length > 0) {
      footfallSummary.fetchFootfallSummary(footfallCounters);
    }
  }, [activeTab, footfallCounters]);

  // FIXED: Replace the aggregateDataByPeriod useMemo with this version

  const aggregateDataByPeriod = useMemo(() => {
    if (!weeklyPeakQueue.data?.data) return [];

    const rawData = weeklyPeakQueue.data.data;

    if (periodFilter === "daily") {
      // Daily view: Show individual days
      return rawData.map((item) => {
        const dayName =
          item.dayName.charAt(0) + item.dayName.slice(1).toLowerCase();
        return {
          period: dayName.substring(0, 3), // Mon, Tue, Wed
          fullPeriod: dayName,
          date: item.date,
          footfall: item.totalCount,
          congestion: item.peakCongestion?.weight || 0,
          peakQueue: item.peakQueue,
          peakWaitTime: item.peakWaitTime,
          congestionLevel: item.peakCongestion?.level || "Normal",
        };
      });
    } else if (periodFilter === "weekly") {
      // Weekly view: Aggregate by ISO week number
      const weeks = new Map<string, any>();

      rawData.forEach((item) => {
        const date = new Date(item.date);
        // Get ISO week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear =
          (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil(
          (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7,
        );
        const weekKey = `Week ${weekNumber}`;

        if (!weeks.has(weekKey)) {
          weeks.set(weekKey, {
            period: weekKey,
            fullPeriod: weekKey,
            footfall: 0,
            congestion: 0,
            peakQueue: 0,
            peakWaitTime: 0,
            count: 0,
            maxCongestionLevel: "Normal",
            dates: [],
          });
        }

        const week = weeks.get(weekKey)!;
        week.footfall += item.totalCount;
        week.congestion += item.peakCongestion?.weight || 0;
        week.peakQueue = Math.max(week.peakQueue, item.peakQueue);
        week.peakWaitTime = Math.max(week.peakWaitTime, item.peakWaitTime);
        week.count++;
        week.dates.push(item.date);

        // Track highest congestion level
        if (item.peakCongestion?.level === "Severe")
          week.maxCongestionLevel = "Severe";
        else if (
          item.peakCongestion?.level === "Critical" &&
          week.maxCongestionLevel !== "Severe"
        )
          week.maxCongestionLevel = "Critical";
      });

      return Array.from(weeks.values()).map((week) => ({
        ...week,
        congestion: week.congestion / week.count, // Average congestion
        congestionLevel: week.maxCongestionLevel,
        date: week.dates[0], // First date in week for reference
      }));
    } else {
      // Monthly view: Show each day in the month with date labels
      return rawData.map((item) => {
        const date = new Date(item.date);
        const dayOfMonth = date.getDate();
        const monthName = date.toLocaleString("default", { month: "short" });

        return {
          period: `${monthName} ${dayOfMonth}`, // Jan 24, Jan 25, etc.
          fullPeriod: `${monthName} ${dayOfMonth}, ${date.getFullYear()}`,
          date: item.date,
          footfall: item.totalCount,
          congestion: item.peakCongestion?.weight || 0,
          peakQueue: item.peakQueue,
          peakWaitTime: item.peakWaitTime,
          congestionLevel: item.peakCongestion?.level || "Normal",
        };
      });
    }
  }, [weeklyPeakQueue.data, periodFilter]);

  // UPDATED: Helper functions for metric selection
  const getMetricKey = () => {
    switch (selectedMetric) {
      case "footfall":
        return "footfall";
      case "congestion":
        return "congestion";
      case "peakQueue":
        return "peakQueue";
      case "peakWaitTime":
        return "peakWaitTime";
      default:
        return "peakQueue";
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case "footfall":
        return "Footfall Count";
      case "congestion":
        return "Congestion Rate";
      case "peakQueue":
        return "Peak Queue";
      case "peakWaitTime":
        return "Peak Wait Time (min)";
      default:
        return "Peak Queue";
    }
  };

  const comparisonKPIs = useMemo(() => {
    if (
      !counterComparison.data?.comparisons ||
      counterComparison.data.comparisons.length === 0
    )
      return null;
    const rounded = roundComparisonData(counterComparison.data.comparisons);
    const totalAvgQueue = rounded.reduce(
      (sum, c) => sum + c.averageTotalQueue,
      0,
    );
    const avgQueueLength = totalAvgQueue / rounded.length;
    const maxPeakQueue = Math.max(...rounded.map((c) => c.maxTotalQueue));
    const avgCongestionRate =
      rounded.reduce((sum, c) => sum + (c.congestionRate || 0), 0) /
      rounded.length;
    return {
      avgQueue: formatOneDecimal(avgQueueLength),
      peakQueue: formatOneDecimal(maxPeakQueue),
      avgCongestion: formatOneDecimal(avgCongestionRate),
      counterCount: rounded.length,
    };
  }, [counterComparison.data]);

  const individualMetrics = useMemo(() => {
    if (!counterTrends.data) return null;
    const stats = roundStatistics(counterTrends.data.statistics);
    const trends = counterTrends.data.trends;
    let peakTimeWindow = "—";
    if (trends && trends.length > 0) {
      const peak = trends.reduce((max, item) =>
        item.totalQueueLength > max.totalQueueLength ? item : max,
      );
      const peakDate = new Date(peak.timestamp);
      const startHour = peakDate.getHours();
      const endHour = (startHour + 1) % 24;
      peakTimeWindow = `${startHour.toString().padStart(2, "0")}:00 - ${endHour.toString().padStart(2, "0")}:00`;
    }
    return {
      avgTotal: formatOneDecimal(stats.averageTotalQueue),
      maxTotal: formatOneDecimal(stats.maxTotalQueue),
      peakTimeWindow,
      efficiency: formatOneDecimal(stats.efficiency),
      trend: stats.trend || "stable",
    };
  }, [counterTrends.data]);

  const comparisonChartData = useMemo(() => {
    if (!counterComparison.data?.comparisons) return [];
    const rounded = roundComparisonData(counterComparison.data.comparisons);
    return rounded.map((item) => ({
      name:
        item.counterName.length > 10
          ? item.counterName.substring(0, 10) + "..."
          : item.counterName,
      fullName: item.counterName,
      code: item.counterCode,
      "Avg Queue": item.averageTotalQueue,
      "Peak Queue": item.maxTotalQueue,
      "Congestion Rate": item.congestionRate,
    }));
  }, [counterComparison.data]);

  const trendChartData = useMemo(() => {
    if (!counterTrends.data?.trends) return [];
    const rounded = roundTrendData(counterTrends.data.trends);
    return rounded.map((item) => {
      const date = new Date(item.timestamp);
      const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      return {
        time,
        Total: item.totalQueueLength,
        Average: item.averageQueueLength,
        Max: item.maxQueueLength,
        Min: item.minQueueLength,
      };
    });
  }, [counterTrends.data]);

  const occupancyChartData = useMemo(() => {
    if (!occupancyTrends.data?.trends) return [];
    return occupancyTrends.data.trends.map((item) => {
      const date = new Date(item.timestamp);
      const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      return {
        time,
        Total: roundToOneDecimal(item.totalOccupancy),
        Average: roundToOneDecimal(item.averageOccupancy),
        Max: roundToOneDecimal(item.maxOccupancy),
        Min: roundToOneDecimal(item.minOccupancy),
      };
    });
  }, [occupancyTrends.data]);

  const handleRefresh = () => {
    liveCounterStatus.fetchLiveStatus();
    if (activeTab === "comparison" && selectedCounters.length > 1) {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      counterComparison.fetchComparison(selectedCounters, {
        filterType: "avg",
        startTime: startOfDay.toISOString(),
        endTime: now.toISOString(),
      });
    }
    if (activeTab === "individual" && selectedCounter) {
      const { startTime, endTime } = calculateDateRange(
        dateRange,
        customStartDate,
        customEndDate,
      );
      counterTrends.fetchTrends(selectedCounter, {
        interval: "1hour",
        startTime,
        endTime,
      });
      occupancyTrends.fetchOccupancyTrends(selectedCounter, {
        interval: "1hour",
        startTime,
        endTime,
      });

      // UPDATED: Refresh peak queue data based on period
      const today = new Date();
      let startDate: string;
      let endDate: string = today.toISOString().split("T")[0];

      switch (periodFilter) {
        case "daily":
          // Get last 7 days for daily view
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 6);
          startDate = sevenDaysAgo.toISOString().split("T")[0];
          break;

        case "weekly":
          // Get last 28 days for weekly view (4 weeks)
          const fourWeeksAgo = new Date(today);
          fourWeeksAgo.setDate(today.getDate() - 27);
          startDate = fourWeeksAgo.toISOString().split("T")[0];
          break;

        case "monthly":
          // Get current month data for monthly view
          const firstDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1,
          );
          startDate = firstDayOfMonth.toISOString().split("T")[0];
          break;

        default:
          const defaultWeekAgo = new Date(today);
          defaultWeekAgo.setDate(today.getDate() - 6);
          startDate = defaultWeekAgo.toISOString().split("T")[0];
      }

      weeklyPeakQueue.fetchWeeklyPeakQueue(selectedCounter, {
        startDate,
        endDate,
      });
    }
  };

  if (liveCounterStatus.error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F8F9FA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <style>{fontStyle}</style>
        <EnterpriseCard>
          <div style={{ textAlign: "center", padding: 24 }}>
            <div
              style={{
                fontSize: 48,
                marginBottom: 16,
                animation: "pulse 2s infinite",
              }}
            >
              ⚠️
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: 8,
              }}
            >
              Connection Error
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "#64748B",
                marginBottom: 24,
                fontWeight: 500,
              }}
            >
              {liveCounterStatus.error}
            </p>
            <button
              onClick={() => liveCounterStatus.fetchLiveStatus()}
              style={{
                padding: "12px 28px",
                borderRadius: 10,
                border: "none",
                background: "#3B82F6",
                color: "#FFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry Connection
            </button>
          </div>
        </EnterpriseCard>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FA", padding: "24px" }}>
      <style>{fontStyle}</style>
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#0F172A",
                  margin: 0,
                  marginBottom: 4,
                  letterSpacing: "-0.5px",
                }}
              >
                All Counters Analytics Dashboard
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                Comprehensive queue analytics across all counter locations
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <DateRangeFilter
                selectedRange={dateRange}
                onRangeChange={(range) => {
                  setDateRange(range);
                  if (activeTab === "individual" && selectedCounter) {
                    const { startTime, endTime } = calculateDateRange(
                      range,
                      customStartDate,
                      customEndDate,
                    );
                    counterTrends.fetchTrends(selectedCounter, {
                      interval: "1hour",
                      startTime,
                      endTime,
                    });
                    occupancyTrends.fetchOccupancyTrends(selectedCounter, {
                      interval: "1hour",
                      startTime,
                      endTime,
                    });
                  }
                }}
                customStart={customStartDate}
                customEnd={customEndDate}
                onCustomChange={(start, end) => {
                  setCustomStartDate(start);
                  setCustomEndDate(end);
                }}
              />
              <button
                onClick={handleRefresh}
                disabled={
                  liveCounterStatus.loading ||
                  counterComparison.loading ||
                  counterTrends.loading
                }
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#3B82F6",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    liveCounterStatus.loading ||
                    counterComparison.loading ||
                    counterTrends.loading
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s",
                  opacity:
                    liveCounterStatus.loading ||
                    counterComparison.loading ||
                    counterTrends.loading
                      ? 0.6
                      : 1,
                }}
              >
                <RefreshCw
                  size={16}
                  style={{
                    animation:
                      liveCounterStatus.loading ||
                      counterComparison.loading ||
                      counterTrends.loading
                        ? "spin 1s linear infinite"
                        : "none",
                  }}
                />
                Refresh
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <TabButton
              label="Live Monitoring"
              active={activeTab === "live_monitoring"}
              onClick={() => setActiveTab("live_monitoring")}
              icon={Grid}
            />
            <TabButton
              label="Comparison"
              active={activeTab === "comparison"}
              onClick={() => setActiveTab("comparison")}
              icon={BarChart3}
            />
            <TabButton
              label="Individual"
              active={activeTab === "individual"}
              onClick={() => setActiveTab("individual")}
              icon={Target}
            />
          </div>
        </div>

        {activeTab === "live_monitoring" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0F172A",
                    margin: 0,
                    letterSpacing: "-0.2px",
                  }}
                >
                  Live Counter Statistics
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "#10B98110",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#10B981",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#10B981",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Auto-refresh every 5s
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: 16,
                }}
              >
                {liveCounterStatus.loading && !liveCounterStatus.data ? (
                  <>
                    <LoadingMetricCard delay={0} />
                    <LoadingMetricCard delay={100} />
                    <LoadingMetricCard delay={200} />
                  </>
                ) : (
                  liveCounterStatus.data?.counters
                    .slice(0, 3)
                    .map((counter, index) => (
                      <EnterpriseCard
                        key={counter.counterCode}
                        delay={index * 100}
                        hover
                      >
                        <div
                          onClick={() => {
                            setSelectedCounter(counter.counterCode);
                            setActiveTab("individual");
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: 16,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 12,
                                  background: `${COUNTER_COLORS[index % COUNTER_COLORS.length]}15`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Target
                                  size={24}
                                  color={
                                    COUNTER_COLORS[
                                      index % COUNTER_COLORS.length
                                    ]
                                  }
                                  strokeWidth={2}
                                />
                              </div>
                              <div>
                                <h4
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: "#0F172A",
                                    margin: 0,
                                    marginBottom: 2,
                                    letterSpacing: "-0.3px",
                                  }}
                                >
                                  {counter.counterName}
                                </h4>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: "#64748B",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {counter.counterType}
                                  </span>
                                  <span style={{ color: "#CBD5E1" }}>•</span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color:
                                        COUNTER_COLORS[
                                          index % COUNTER_COLORS.length
                                        ],
                                    }}
                                  >
                                    {counter.counterCode}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div
                              style={{
                                padding: "4px 10px",
                                borderRadius: 6,
                                background:
                                  counter.status === "active"
                                    ? "#10B98115"
                                    : "#EF444415",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <div
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background:
                                    counter.status === "active"
                                      ? "#10B981"
                                      : "#EF4444",
                                  animation:
                                    counter.status === "active"
                                      ? "pulse 2s infinite"
                                      : "none",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color:
                                    counter.status === "active"
                                      ? "#10B981"
                                      : "#EF4444",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.3px",
                                }}
                              >
                                {counter.status}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, 1fr)",
                              gap: 12,
                              padding: "16px 0",
                              borderTop: "1px solid #E2E8F0",
                              borderBottom: "1px solid #E2E8F0",
                            }}
                          >
                            <div style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 4,
                                  marginBottom: 6,
                                }}
                              >
                                <Users size={14} color="#64748B" />
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "#94A3B8",
                                    textTransform: "uppercase",
                                    fontWeight: 600,
                                    letterSpacing: "0.3px",
                                  }}
                                >
                                  Occupancy
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: 24,
                                  fontWeight: 700,
                                  color:
                                    COUNTER_COLORS[
                                      index % COUNTER_COLORS.length
                                    ],
                                  letterSpacing: "-0.5px",
                                }}
                              >
                                {counter.occuopancy || 0}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 400,
                                  color: "#94A3B8",
                                  marginTop: 4,
                                }}
                              >
                                avg:{" "}
                                {formatOneDecimal(
                                  (counter.occuopancy || 0) * 0.8,
                                )}
                              </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 4,
                                  marginBottom: 6,
                                }}
                              >
                                <Clock size={14} color="#64748B" />
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "#94A3B8",
                                    textTransform: "uppercase",
                                    fontWeight: 600,
                                    letterSpacing: "0.3px",
                                  }}
                                >
                                  Wait Time
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: 24,
                                  fontWeight: 700,
                                  color: "#F59E0B",
                                  letterSpacing: "-0.5px",
                                }}
                              >
                                {formatOneDecimal(counter.estimatedWaitTime)}
                              </div>
                              <div
                                style={{
                                  fontSize: 9,
                                  color: "#94A3B8",
                                  marginTop: 2,
                                }}
                              >
                                min
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: 12,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <Layers size={14} color="#64748B" />
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#64748B",
                                  fontWeight: 500,
                                }}
                              >
                                {counter.activeDeviceCount || 0}/
                                {counter.deviceCount || 0} devices
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <Clock size={12} color="#94A3B8" />
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 500,
                                  color: "#94A3B8",
                                }}
                              >
                                {counter.lastUpdated
                                  ? new Date(
                                      counter.lastUpdated,
                                    ).toLocaleTimeString()
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </EnterpriseCard>
                    ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "comparison" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
                marginBottom: 16,
              }}
            >
              {counterComparison.loading ? (
                <>
                  <LoadingMetricCard delay={0} />
                  <LoadingMetricCard delay={100} />
                  <LoadingMetricCard delay={200} />
                  <LoadingMetricCard delay={300} />
                </>
              ) : comparisonKPIs ? (
                <>
                  <MetricCard
                    label="Total Counters"
                    subtitle="counters_compared"
                    value={comparisonKPIs.counterCount}
                    icon={Grid}
                    color="#3B82F6"
                    delay={0}
                  />
                  <MetricCard
                    label="Average Queue Length"
                    subtitle="current_day_average"
                    value={comparisonKPIs.avgQueue}
                    icon={Users}
                    color="#10B981"
                    delay={100}
                  />
                  <MetricCard
                    label="Peak Queue"
                    subtitle="current_day_peak"
                    value={comparisonKPIs.peakQueue}
                    icon={TrendingUp}
                    color="#F59E0B"
                    delay={200}
                  />
                  <MetricCard
                    label="Average Congestion Rate"
                    subtitle="current_day_congestion"
                    value={`${comparisonKPIs.avgCongestion}%`}
                    icon={Activity}
                    color="#EF4444"
                    delay={300}
                  />
                </>
              ) : (
                <>
                  <MetricCard
                    label="Total Counters"
                    subtitle="counters_compared"
                    value={selectedCounters.length}
                    icon={Grid}
                    color="#3B82F6"
                    delay={0}
                  />
                  <LoadingMetricCard delay={100} />
                  <LoadingMetricCard delay={200} />
                  <LoadingMetricCard delay={300} />
                </>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <ChartContainer
                title="Counter Performance Comparison"
                subtitle="average_and_peak_queue_lengths"
                icon={BarChart3}
                delay={400}
              >
                {counterComparison.loading ? (
                  <SkeletonLoader />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart
                      data={comparisonChartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E2E8F0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#94A3B8"
                        style={{ fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94A3B8"
                        style={{ fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                      <Legend
                        wrapperStyle={{
                          fontSize: 12,
                          fontWeight: 500,
                          paddingTop: 16,
                        }}
                      />
                      <Bar
                        dataKey="Avg Queue"
                        fill="#3B82F6"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="Peak Queue"
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                      <Line
                        type="monotone"
                        dataKey="Congestion Rate"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        yAxisId="right"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#EF4444"
                        style={{ fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </ChartContainer>
              <ChartContainer
                title="Queue Distribution"
                subtitle="average_queue_by_counter"
                icon={Activity}
                delay={500}
              >
                {counterComparison.loading ? (
                  <SkeletonLoader />
                ) : (
                  <div>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={comparisonChartData}
                          dataKey="Avg Queue"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                        >
                          {comparisonChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                FOREST_GREEN_COLORS[
                                  index % FOREST_GREEN_COLORS.length
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <CustomLegend data={comparisonChartData} />
                  </div>
                )}
              </ChartContainer>
            </div>
          </>
        )}

        {activeTab === "individual" && (
          <>
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <select
                value={selectedCounter}
                onChange={(e) => setSelectedCounter(e.target.value)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#0F172A",
                  cursor: "pointer",
                  outline: "none",
                  width: 300,
                }}
              >
                {liveCounterStatus.data?.counters.map((counter) => (
                  <option key={counter.counterCode} value={counter.counterCode}>
                    {counter.counterName} ({counter.counterCode})
                  </option>
                ))}
              </select>
              <div style={{ marginLeft: "auto" }}>
                <CounterMultiSelect
                  counters={liveCounterStatus.data?.counters || []}
                  selectedCounters={footfallCounters}
                  onSelectionChange={setFootfallCounters}
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
                marginBottom: 16,
              }}
            >
              {counterTrends.loading && !individualMetrics ? (
                <>
                  <LoadingMetricCard delay={0} />
                  <LoadingMetricCard delay={100} />
                  <LoadingMetricCard delay={200} />
                </>
              ) : (
                <>
                  <MetricCard
                    label="Average Queue Length"
                    subtitle="average_cumulative"
                    value={individualMetrics?.avgTotal || "—"}
                    icon={Users}
                    color="#3B82F6"
                    delay={0}
                  />
                  <MetricCard
                    label="Peak Queue Length"
                    subtitle="maximum_observed"
                    value={individualMetrics?.maxTotal || "—"}
                    icon={TrendingUp}
                    color="#10B981"
                    delay={100}
                  />
                  <MetricCard
                    label="Peak Hour Time Window"
                    subtitle="busiest_period"
                    value={individualMetrics?.peakTimeWindow || "—"}
                    icon={Clock}
                    color="#F59E0B"
                    delay={200}
                  />
                </>
              )}
            </div>

            {/* Two-column layout: Chart on left, Footfall Summary on right */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 400px",
                gap: 16,
                marginBottom: 16,
              }}
            >
              {/* Left: Cumulative Queue Trend Chart */}
              <ChartContainer
                title="Cumulative Queue Trend"
                subtitle="total_queue_over_time"
                icon={Activity}
                delay={500}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <ChartTypeSelector
                    selectedType={queueChartType}
                    onTypeChange={setQueueChartType}
                  />
                </div>
                {counterTrends.loading ? (
                  <SkeletonLoader />
                ) : (
                  <DynamicChart
                    data={trendChartData}
                    chartType={queueChartType}
                    dataKeys={["Total", "Max", "Min"]}
                    colors={["#3B82F6", "#10B981", "#EF4444"]}
                  />
                )}
              </ChartContainer>

              {/* Right: Footfall Summary - Always visible */}
              <EnterpriseCard delay={300}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#0F172A",
                      margin: 0,
                      letterSpacing: "-0.2px",
                    }}
                  >
                    Footfall Summary
                  </h3>
                  {footfallCounters.length === 0 && (
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>
                      Select counters above
                    </div>
                  )}
                </div>

                {footfallSummary.loading ? (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <div
                      style={{
                        display: "inline-block",
                        width: 40,
                        height: 40,
                        border: "3px solid #E2E8F0",
                        borderTopColor: "#3B82F6",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  </div>
                ) : footfallCounters.length > 0 && footfallSummary.data ? (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                          <th
                            style={{
                              textAlign: "left",
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#94A3B8",
                              padding: "12px 0",
                              paddingRight: 24,
                            }}
                          ></th>
                          <th
                            style={{
                              textAlign: "right",
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#94A3B8",
                              padding: "12px 24px 12px 0",
                            }}
                          >
                            Count
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#94A3B8",
                              padding: "12px 0",
                            }}
                          >
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "16px 0", paddingRight: 24 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#0F172A",
                                marginBottom: 2,
                              }}
                            >
                              Today
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94A3B8",
                                fontWeight: 400,
                              }}
                            >
                              {footfallSummary.data.today?.date || "No data"}
                            </div>
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontSize: 15,
                              fontWeight: 600,
                              color: "#0F172A",
                              padding: "16px 24px 16px 0",
                            }}
                          >
                            {footfallSummary.data.today?.count || 0}
                          </td>
                          <td
                            style={{ textAlign: "right", padding: "16px 0" }}
                          ></td>
                        </tr>
                        {footfallSummary.data.yesterday && (
                          <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                            <td style={{ padding: "16px 0", paddingRight: 24 }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: "#0F172A",
                                  marginBottom: 2,
                                }}
                              >
                                Yesterday
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#94A3B8",
                                  fontWeight: 400,
                                }}
                              >
                                {footfallSummary.data.yesterday.date}
                              </div>
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                fontSize: 15,
                                fontWeight: 600,
                                color: "#0F172A",
                                padding: "16px 24px 16px 0",
                              }}
                            >
                              {footfallSummary.data.yesterday.count}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "16px 0",
                              }}
                            >
                              {footfallSummary.data.yesterday.percentage !==
                                null && (
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color:
                                      footfallSummary.data.yesterday
                                        .percentage >= 0
                                        ? "#10B981"
                                        : "#EF4444",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 4,
                                  }}
                                >
                                  {footfallSummary.data.yesterday.percentage >=
                                  0 ? (
                                    <TrendingUp size={14} />
                                  ) : (
                                    <TrendingDown size={14} />
                                  )}
                                  {formatPercentage(
                                    Math.abs(
                                      footfallSummary.data.yesterday.percentage,
                                    ),
                                  )}
                                </span>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "#94A3B8",
                      fontSize: 13,
                    }}
                  >
                    {footfallCounters.length === 0
                      ? "Select counters from the dropdown to view footfall data"
                      : "No footfall data available for selected counters"}
                  </div>
                )}
              </EnterpriseCard>
            </div>

            {/* UPDATED: Historical Data Analysis Chart with Period Filter and Metric Toggles */}
            <div style={{ marginBottom: 16 }}>
              <ChartContainer
                title="Historical Data Analysis"
                subtitle={`${periodFilter.charAt(0).toUpperCase() + periodFilter.slice(1)} view - ${getMetricLabel()}`}
                icon={BarChart3}
                delay={400}
                actions={
                  <div
                    style={{ display: "flex", gap: 12, alignItems: "center" }}
                  >
                    {/* Period Dropdown */}
                    <select
                      value={periodFilter}
                      onChange={(e) => setPeriodFilter(e.target.value as any)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #E2E8F0",
                        background: "#FFFFFF",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#0F172A",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>

                    {/* Metric Toggle Buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        borderLeft: "1px solid #E2E8F0",
                        paddingLeft: 12,
                      }}
                    >
                      <button
                        onClick={() => setSelectedMetric("footfall")}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "none",
                          fontSize: 10,
                          fontWeight: selectedMetric === "footfall" ? 600 : 500,
                          color:
                            selectedMetric === "footfall"
                              ? "#FFFFFF"
                              : "#64748B",
                          background:
                            selectedMetric === "footfall"
                              ? "#3B82F6"
                              : "#F1F5F9",
                          cursor: "pointer",
                        }}
                      >
                        By Footfall
                      </button>
                      <button
                        onClick={() => setSelectedMetric("congestion")}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "none",
                          fontSize: 10,
                          fontWeight:
                            selectedMetric === "congestion" ? 600 : 500,
                          color:
                            selectedMetric === "congestion"
                              ? "#FFFFFF"
                              : "#64748B",
                          background:
                            selectedMetric === "congestion"
                              ? "#EF4444"
                              : "#F1F5F9",
                          cursor: "pointer",
                        }}
                      >
                        By Congestion Rate
                      </button>
                      <button
                        onClick={() => setSelectedMetric("peakQueue")}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "none",
                          fontSize: 10,
                          fontWeight:
                            selectedMetric === "peakQueue" ? 600 : 500,
                          color:
                            selectedMetric === "peakQueue"
                              ? "#FFFFFF"
                              : "#64748B",
                          background:
                            selectedMetric === "peakQueue"
                              ? "#10B981"
                              : "#F1F5F9",
                          cursor: "pointer",
                        }}
                      >
                        By Peak Queue
                      </button>
                      <button
                        onClick={() => setSelectedMetric("peakWaitTime")}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "none",
                          fontSize: 10,
                          fontWeight:
                            selectedMetric === "peakWaitTime" ? 600 : 500,
                          color:
                            selectedMetric === "peakWaitTime"
                              ? "#FFFFFF"
                              : "#64748B",
                          background:
                            selectedMetric === "peakWaitTime"
                              ? "#F59E0B"
                              : "#F1F5F9",
                          cursor: "pointer",
                        }}
                      >
                        By Peak Wait Time
                      </button>
                    </div>
                  </div>
                }
              >
                {weeklyPeakQueue.loading ? (
                  <SkeletonLoader />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={aggregateDataByPeriod}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="metricGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#1e4620"
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="100%"
                            stopColor="#0f3818"
                            stopOpacity={0.7}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E2E8F0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="period"
                        stroke="#94A3B8"
                        style={{ fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                        label={{
                          value:
                            periodFilter === "daily"
                              ? "Day"
                              : periodFilter === "weekly"
                                ? "Week"
                                : "Month",
                          position: "insideBottom",
                          offset: -5,
                          style: {
                            fontSize: 12,
                            fill: "#64748B",
                            fontWeight: 500,
                          },
                        }}
                      />
                      <YAxis
                        stroke="#94A3B8"
                        style={{ fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                        label={{
                          value: getMetricLabel(),
                          angle: -90,
                          position: "insideLeft",
                          style: {
                            fontSize: 12,
                            fill: "#64748B",
                            fontWeight: 500,
                          },
                        }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length)
                            return null;

                          const data = payload[0].payload;
                          const congestionColor =
                            data.congestionLevel === "Severe"
                              ? "#EF4444"
                              : data.congestionLevel === "Critical"
                                ? "#F59E0B"
                                : "#10B981";

                          return (
                            <div
                              style={{
                                background: "#FFFFFF",
                                border: "1px solid #E2E8F0",
                                borderRadius: 10,
                                padding: "10px 14px",
                                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "#64748B",
                                  marginBottom: 6,
                                }}
                              >
                                {data.fullPeriod}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#1e4620",
                                  marginBottom: 3,
                                }}
                              >
                                {getMetricLabel()}:{" "}
                                {typeof data[getMetricKey()] === "number"
                                  ? data[getMetricKey()].toFixed(1)
                                  : data[getMetricKey()]}
                              </p>
                              {data.date && (
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 10,
                                    color: "#94A3B8",
                                    marginBottom: 6,
                                  }}
                                >
                                  {data.date}
                                </p>
                              )}
                              <div
                                style={{
                                  marginTop: 6,
                                  paddingTop: 6,
                                  borderTop: "1px solid #E2E8F0",
                                }}
                              >
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 10,
                                    color: "#64748B",
                                    marginBottom: 2,
                                  }}
                                >
                                  Footfall: {data.footfall}
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 10,
                                    color: "#64748B",
                                    marginBottom: 2,
                                  }}
                                >
                                  Peak Queue: {data.peakQueue}
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 10,
                                    color: "#64748B",
                                    marginBottom: 6,
                                  }}
                                >
                                  Wait Time: {data.peakWaitTime.toFixed(1)} min
                                </p>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      background: congestionColor,
                                    }}
                                  />
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color: congestionColor,
                                    }}
                                  >
                                    {data.congestionLevel}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                        cursor={{ fill: "rgba(30, 70, 32, 0.1)" }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: 12,
                          fontWeight: 500,
                          paddingTop: 16,
                        }}
                      />
                      <Bar
                        dataKey={getMetricKey()}
                        name={getMetricLabel()}
                        fill="url(#metricGradient)"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllCountersAnalyticsDashboard;
