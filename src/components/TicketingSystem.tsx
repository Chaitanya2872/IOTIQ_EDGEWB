// CafeteriaAnalyticsDashboard.tsx - UPDATED VERSION
// ✅ Improved spacing for overview cards - more breathing room
// ✅ No decimals - rounded numbers for Today's Footfall and Avg Dwell Time

import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Space,
  Typography,
  Spin,
  Alert,
  Select,
  Button,
  Divider,
  Radio,
  Checkbox,
  message,
  Tabs,
  Drawer,
  Switch,
  Progress,
  Table,
  Tooltip,
} from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ClockCircleOutlined,
  FireOutlined,
  TeamOutlined,
  AlertOutlined,
  ReloadOutlined,
  SettingOutlined,
  FilterOutlined,
  AreaChartOutlined,
  BarChartOutlined,
  PercentageOutlined,
  UserOutlined,
  WarningOutlined,
  RiseOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import {
  useQueueComparison,
  useCongestionRate,
  useQueueTrends,
  useDashboardData,
  type QueueComparisonResponse,
  type CongestionRateResponse,
  type QueueTrendsResponse,
} from "../api/CafeteriaApiService";

import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

// ============================================
// ENTERPRISE COLOR PALETTE - Professional & Minimal
// ============================================
const COLORS = {
  primary: "#1890ff", // Primary blue
  success: "#52c41a", // Success green
  warning: "#faad14", // Warning orange
  error: "#f5222d", // Error red
  neutral: "#8c8c8c", // Neutral gray
  // Chart colors - distinct and accessible
  chart1: "#1890ff", // Blue
  chart2: "#52c41a", // Green
  chart3: "#fa8c16", // Orange
  chart4: "#722ed1", // Purple
  chart5: "#13c2c2", // Cyan
  // Background colors
  bgLight: "#fafafa",
  bgWhite: "#ffffff",
  border: "#e8e8e8",
};

const COUNTER_COLORS = {
  "Healthy Station": COLORS.success,
  "Mini Meals": COLORS.primary,
  "Two Good": COLORS.warning,
};

// ============================================
// TYPES
// ============================================
interface QueueKPIData {
  overallAvgQueue: number;
  peakQueueLength: number;
  mostCongestedCounter: string;
  congestionRate: number;
  peakHourAvgQueue: number;
  peakHourRange: string;
}

const TENANT_CODE = "intel-rmz-ecoworld";
const CAFETERIA_CODE = "srr-4a";

// ============================================
// HELPER FUNCTIONS
// ============================================
const getCongestionColor = (level: string) => {
  switch (level) {
    case "LOW":
      return COLORS.success;
    case "MEDIUM":
      return COLORS.warning;
    case "HIGH":
      return COLORS.error;
    default:
      return COLORS.neutral;
  }
};

// ============================================
// MAIN COMPONENT
// ============================================
const CafeteriaAnalyticsDashboard: React.FC = () => {
  // State
  const [lastUpdated, setLastUpdated] = useState("");
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Queue Trends Filters
  const [queueTrendsTimeFilter, setQueueTrendsTimeFilter] = useState(5);
  const [queueTrendsCounterFilter, setQueueTrendsCounterFilter] = useState<{
    [key: string]: boolean;
  }>({
    "Healthy Station": true,
    "Mini Meals": true,
    "Two Good": true,
  });
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // Time range filter
  const [quickTimeFilter, setQuickTimeFilter] = useState<
    "all" | "lunch" | "dinner" | "custom"
  >("all");
  const [customStartTime, setCustomStartTime] = useState("11:00");
  const [customEndTime, setCustomEndTime] = useState("14:00");

  // Location/Cafeteria selection
  const [selectedLocation] = useState("Intel, RMZ Ecoworld, Bangalore");
  const [selectedCafeteria] = useState("SRR 4A");
  const [activeTab, setActiveTab] = useState("overview");

  // ============================================
  // API HOOKS - NO AUTO REFRESH (0 = disabled)
  // ============================================
  const {
    data: queueComparisonData,
    loading: queueComparisonLoading,
    error: queueComparisonError,
    refetch: refetchQueueComparison,
  } = useQueueComparison(TENANT_CODE, CAFETERIA_CODE);

  const {
    data: congestionRateData,
    loading: congestionRateLoading,
    error: congestionRateError,
    refetch: refetchCongestionRate,
  } = useCongestionRate(TENANT_CODE, CAFETERIA_CODE);

  const {
    data: queueTrendsData,
    loading: queueTrendsLoading,
    error: queueTrendsError,
    refetch: refetchQueueTrends,
  } = useQueueTrends(TENANT_CODE, CAFETERIA_CODE, queueTrendsTimeFilter, 0);

  // Dashboard data for other widgets
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboardData(TENANT_CODE, CAFETERIA_CODE, "daily", 24, 0);

  // ============================================
  // DATA TRANSFORMATION
  // ============================================
  const transformedQueueComparisonData = React.useMemo(() => {
    if (!queueComparisonData) return [];
    return queueComparisonData.counters.map((counter) => ({
      name: counter.counterName,
      value: counter.averageQueueLength,
      fill:
        COUNTER_COLORS[counter.counterName as keyof typeof COUNTER_COLORS] ||
        COLORS.neutral,
    }));
  }, [queueComparisonData]);

  const transformedCongestionRateData = React.useMemo(() => {
    if (!congestionRateData) return [];
    return congestionRateData.counters.map((counter) => ({
      name: counter.counterName,
      value: counter.congestionRate,
      fill:
        COUNTER_COLORS[counter.counterName as keyof typeof COUNTER_COLORS] ||
        COLORS.neutral,
    }));
  }, [congestionRateData]);

  const transformedQueueTrendsData = React.useMemo(() => {
    if (!queueTrendsData?.trends) return [];
    return queueTrendsData.trends.map((trend) => ({
      time: trend.timestamp,
      "Healthy Station": trend.counterQueues["Healthy Station"] || 0,
      "Mini Meals": trend.counterQueues["Mini Meals"] || 0,
      "Two Good": trend.counterQueues["Two Good"] || 0,
    }));
  }, [queueTrendsData]);

  // Filter data by time range
  const filteredQueueTrendsData = React.useMemo(() => {
    if (quickTimeFilter === "all") return transformedQueueTrendsData;

    let startHour = 0,
      endHour = 24;

    if (quickTimeFilter === "lunch") {
      startHour = 11;
      endHour = 14;
    } else if (quickTimeFilter === "dinner") {
      startHour = 18;
      endHour = 21;
    } else if (quickTimeFilter === "custom") {
      const [startH, startM] = customStartTime.split(":").map(Number);
      const [endH, endM] = customEndTime.split(":").map(Number);
      startHour = startH + startM / 60;
      endHour = endH + endM / 60;
    }

    return transformedQueueTrendsData.filter((entry) => {
      const timeMatch = entry.time.match(/(\d+):(\d+)/);
      if (!timeMatch) return true;
      const hour = parseInt(timeMatch[1]) + parseInt(timeMatch[2]) / 60;
      return hour >= startHour && hour < endHour;
    });
  }, [
    transformedQueueTrendsData,
    quickTimeFilter,
    customStartTime,
    customEndTime,
  ]);

  // Calculate Queue KPIs
  const calculatedQueueKPIs = React.useMemo((): QueueKPIData | null => {
    if (!queueComparisonData || !congestionRateData || !queueTrendsData)
      return null;

    const overallAvgQueue = queueComparisonData.summary.overallAverage;
    const peakQueueLength = Math.max(
      ...queueTrendsData.trends.flatMap((trend) =>
        Object.values(trend.counterQueues),
      ),
    );
    const mostCongestedCounter =
      congestionRateData.summary.mostCongestedCounter;
    const congestionRate = congestionRateData.summary.overallCongestionRate;

    const peakTrendIndex = queueTrendsData.trends.findIndex((trend) => {
      const maxQueue = Math.max(...Object.values(trend.counterQueues));
      return maxQueue === peakQueueLength;
    });

    const peakTrend = queueTrendsData.trends[peakTrendIndex];

    const peakWindowTrends = queueTrendsData.trends.filter(
      (_, index) => Math.abs(index - peakTrendIndex) <= 4,
    );

    const peakHourAvgQueue =
      peakWindowTrends.length > 0
        ? peakWindowTrends.reduce((sum, trend) => {
            const avgQueue =
              Object.values(trend.counterQueues).reduce((a, b) => a + b, 0) /
              Object.values(trend.counterQueues).length;
            return sum + avgQueue;
          }, 0) / peakWindowTrends.length
        : overallAvgQueue;

    const peakHourRange = peakTrend
      ? `${new Date(peakTrend.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })} - ${new Date(
          new Date(peakTrend.timestamp).getTime() + 40 * 60000,
        ).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`
      : "N/A";

    return {
      overallAvgQueue,
      peakQueueLength,
      mostCongestedCounter,
      congestionRate,
      peakHourAvgQueue,
      peakHourRange,
    };
  }, [queueComparisonData, congestionRateData, queueTrendsData]);

  // ============================================
  // MANUAL REFRESH ONLY - NO AUTO REFRESH
  // ============================================
  const handleRefreshQueueData = () => {
    refetchQueueComparison();
    refetchCongestionRate();
    refetchQueueTrends();
    refetchDashboard();
    message.success("Data refreshed successfully");
  };

  useEffect(() => {
    if (queueComparisonData || congestionRateData || queueTrendsData) {
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [queueComparisonData, congestionRateData, queueTrendsData]);

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  const renderQueueKPIs = () => {
    // Show loading state for individual component
    if (queueComparisonLoading || congestionRateLoading || queueTrendsLoading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      );
    }

    // Show error state for individual components
    if (queueComparisonError || congestionRateError || queueTrendsError) {
      return (
        <Alert
          message="Failed to load queue data"
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={handleRefreshQueueData}>
              Retry
            </Button>
          }
        />
      );
    }

    const kpiData = calculatedQueueKPIs;
    if (!kpiData) return null;

    const kpiCards = [
      {
        icon: <TeamOutlined style={{ fontSize: 24, color: COLORS.primary }} />,
        title: "Overall Avg Queue",
        value: kpiData.overallAvgQueue.toFixed(1),
        unit: "people",
        color: COLORS.primary,
      },
      {
        icon: <FireOutlined style={{ fontSize: 24, color: COLORS.warning }} />,
        title: "Peak Queue Length",
        value: kpiData.peakQueueLength.toString(),
        unit: "maximum",
        color: COLORS.warning,
      },
      {
        icon: <AlertOutlined style={{ fontSize: 24, color: COLORS.error }} />,
        title: "Most Congested",
        value: kpiData.mostCongestedCounter,
        unit: `${kpiData.congestionRate.toFixed(0)}% congestion`,
        color: COLORS.error,
      },
      {
        icon: (
          <ClockCircleOutlined
            style={{ fontSize: 24, color: COLORS.success }}
          />
        ),
        title: "Peak Hour Average",
        value: kpiData.peakHourAvgQueue.toFixed(1),
        unit: kpiData.peakHourRange,
        color: COLORS.success,
      },
    ];

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              bordered={false}
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {card.title}
                </Text>
                {card.icon}
              </div>
              <div>
                <div
                  style={{ fontSize: 28, fontWeight: 600, color: "#262626" }}
                >
                  {card.value}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {card.unit}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderQueueLengthTrends = () => {
    if (queueTrendsLoading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (queueTrendsError) {
      return (
        <Alert
          message="Failed to load queue trends"
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={handleRefreshQueueData}>
              Retry
            </Button>
          }
        />
      );
    }

    if (filteredQueueTrendsData.length === 0) return null;

    const activeCountersCount = Object.values(queueTrendsCounterFilter).filter(
      Boolean,
    ).length;

    const visibleData = filteredQueueTrendsData.map((entry) => {
      const filtered: any = { time: entry.time };
      Object.keys(COUNTER_COLORS).forEach((counter) => {
        if (queueTrendsCounterFilter[counter]) {
          filtered[counter] = entry[counter];
        }
      });
      return filtered;
    });

    return (
      <Card
        title={
          <Space>
            Queue Length Trends
            {quickTimeFilter !== "all" && (
              <Badge
                count={
                  quickTimeFilter === "lunch"
                    ? "Lunch"
                    : quickTimeFilter === "dinner"
                      ? "Dinner"
                      : "Custom"
                }
                style={{ backgroundColor: COLORS.primary }}
              />
            )}
          </Space>
        }
        bordered={false}
        extra={
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterDrawerVisible(true)}
            size="small"
          >
            Filters
            {activeCountersCount !== 3 ||
            quickTimeFilter !== "all" ||
            queueTrendsTimeFilter !== 5 ? (
              <Badge
                dot
                style={{ backgroundColor: COLORS.error, marginLeft: 8 }}
              />
            ) : null}
          </Button>
        }
        bodyStyle={{ padding: 24 }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis
              dataKey="time"
              stroke={COLORS.neutral}
              style={{ fontSize: 12 }}
            />
            <YAxis
              stroke={COLORS.neutral}
              style={{ fontSize: 12 }}
              label={{
                value: "Queue Length",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12 },
              }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: COLORS.bgWhite,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 4,
              }}
            />
            <Legend />

            {/* HEALTHY STATION - LINE ONLY (NO DOTS) */}
            {queueTrendsCounterFilter["Healthy Station"] && (
              <Line
                type="monotone"
                dataKey="Healthy Station"
                stroke={COUNTER_COLORS["Healthy Station"]}
                strokeWidth={2}
                dot={false}
              />
            )}

            {/* MINI MEALS - LINE ONLY (NO DOTS) */}
            {queueTrendsCounterFilter["Mini Meals"] && (
              <Line
                type="monotone"
                dataKey="Mini Meals"
                stroke={COUNTER_COLORS["Mini Meals"]}
                strokeWidth={2}
                dot={false}
              />
            )}

            {/* TWO GOOD - LINE ONLY (NO DOTS) */}
            {queueTrendsCounterFilter["Two Good"] && (
              <Line
                type="monotone"
                dataKey="Two Good"
                stroke={COUNTER_COLORS["Two Good"]}
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Last updated:{" "}
            {queueTrendsData?.reportGeneratedAt
              ? new Date(queueTrendsData.reportGeneratedAt).toLocaleTimeString()
              : lastUpdated}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {activeCountersCount} of 3 counters | {visibleData.length} data
            points
          </Text>
        </div>
      </Card>
    );
  };

  const renderAvgQueueComparison = () => {
    if (queueComparisonLoading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (queueComparisonError || !transformedQueueComparisonData.length)
      return null;

    return (
      <Card
        title={
          <Space>
            <BarChartOutlined />
            Average Queue Comparison
          </Space>
        }
        bordered={false}
        bodyStyle={{ padding: 24 }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={transformedQueueComparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="name" stroke={COLORS.neutral} />
            <YAxis
              stroke={COLORS.neutral}
              label={{
                value: "Avg Queue Length",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <RechartsTooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {transformedQueueComparisonData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {queueComparisonData && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Busiest
              </Text>
              <div style={{ fontWeight: 600 }}>
                {queueComparisonData.summary.busiestCounter}
              </div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Least Busy
              </Text>
              <div style={{ fontWeight: 600 }}>
                {queueComparisonData.summary.leastBusyCounter}
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderCongestionRateComparison = () => {
    if (congestionRateLoading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (congestionRateError || !transformedCongestionRateData.length)
      return null;

    return (
      <Card
        title={
          <Space>
            <PercentageOutlined />
            Congestion Rate Comparison
          </Space>
        }
        bordered={false}
        bodyStyle={{ padding: 24 }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={transformedCongestionRateData}
            layout="horizontal"
            margin={{ left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis type="number" stroke={COLORS.neutral} />
            <YAxis
              type="category"
              dataKey="name"
              stroke={COLORS.neutral}
              width={120}
            />
            <RechartsTooltip
              formatter={(value: number) => [
                `${value.toFixed(1)}%`,
                "Congestion Rate",
              ]}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {transformedCongestionRateData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {congestionRateData && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Recommendation:{" "}
            </Text>
            <Text style={{ fontSize: 13 }}>
              {congestionRateData.summary.recommendation}
            </Text>
          </div>
        )}
      </Card>
    );
  };

  // ============================================
  // ADDITIONAL WIDGETS FROM DASHBOARD DATA
  // ============================================
  const renderOccupancyStatus = () => {
    if (dashboardLoading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!dashboardData?.occupancyStatus) return null;

    const occupancyData = dashboardData.occupancyStatus;
    const occupancyPercentage = Math.round(
      (occupancyData.currentOccupancy / occupancyData.capacity) * 100,
    );

    const getStatusColor = () => {
      if (occupancyPercentage > 80) return COLORS.error;
      if (occupancyPercentage > 60) return COLORS.warning;
      return COLORS.success;
    };

    const getStatusText = () => {
      if (occupancyPercentage > 80) return "High - Congested";
      if (occupancyPercentage > 60) return "Medium - Moderate Flow";
      return "Low - Free Flow";
    };

    const getStatusBgColor = () => {
      if (occupancyPercentage > 80) return "#fff1f0";
      if (occupancyPercentage > 60) return "#fffbe6";
      return "#f6ffed";
    };

    return (
      <Card
        title={
          <Space>
            <UserOutlined />
            Cafeteria Occupancy
            <Badge status="processing" text="Live" />
          </Space>
        }
        bordered={false}
        bodyStyle={{ padding: 24 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          {/* Left side - Current Occupancy */}
          <div>
            <Text
              type="secondary"
              style={{ fontSize: 13, display: "block", marginBottom: 8 }}
            >
              Current Occupancy
            </Text>
            <div style={{ fontSize: 32, fontWeight: 600, color: "#262626" }}>
              <UserOutlined style={{ marginRight: 8 }} />
              {occupancyData.currentOccupancy} / {occupancyData.capacity}
            </div>
          </div>

          {/* Right side - Donut Chart - THIN STROKE */}
          <div style={{ position: "relative", width: 110, height: 110 }}>
            <svg
              width="110"
              height="110"
              style={{ transform: "rotate(-90deg)" }}
            >
              {/* Background circle - THIN */}
              <circle
                cx="55"
                cy="55"
                r="48"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="8"
              />
              {/* Progress circle - THIN */}
              <circle
                cx="55"
                cy="55"
                r="48"
                fill="none"
                stroke={getStatusColor()}
                strokeWidth="8"
                strokeDasharray={`${(occupancyPercentage / 100) * 301.6} 301.6`}
                strokeLinecap="round"
              />
            </svg>
            {/* Centered percentage text */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#262626",
                }}
              >
                {occupancyPercentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Status Banner at bottom */}
        <div
          style={{
            width: "100%",
            padding: "10px 16px",
            backgroundColor: getStatusBgColor(),
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: getStatusColor(),
              marginRight: 10,
            }}
          />
          <Text style={{ fontSize: 13 }}>{getStatusText()}</Text>
        </div>
      </Card>
    );
  };

  const renderCounterStatus = () => {
    if (dashboardLoading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (
      !dashboardData?.counterStatus ||
      dashboardData.counterStatus.length === 0
    )
      return null;

    const columns = [
      {
        title: "Counter",
        dataIndex: "counterName",
        key: "counterName",
      },
      {
        title: "Queue Length",
        dataIndex: "queueLength",
        key: "queueLength",
        render: (value: number) => <strong>{value}</strong>,
      },
      {
        title: "Wait Time",
        dataIndex: "waitTime",
        key: "waitTime",
        render: (value: number) => `${Math.round(value)} min`,
      },
      {
        title: "Status",
        dataIndex: "congestionLevel",
        key: "congestionLevel",
        render: (level: string) => (
          <Badge
            color={getCongestionColor(level)}
            text={level}
            style={{ textTransform: "capitalize" }}
          />
        ),
      },
    ];

    return (
      <Card
        title={
          <Space>
            <TeamOutlined />
            Live Counter Status
          </Space>
        }
        bordered={false}
        bodyStyle={{ padding: 24 }}
      >
        <Table
          dataSource={dashboardData.counterStatus}
          columns={columns}
          pagination={false}
          rowKey="counterName"
        />
      </Card>
    );
  };

  const renderCounterEfficiency = () => {
    if (dashboardLoading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (
      !dashboardData?.counterEfficiency ||
      dashboardData.counterEfficiency.length === 0
    )
      return null;

    const columns = [
      {
        title: "Counter",
        dataIndex: "counterName",
        key: "counterName",
      },
      {
        title: "Avg Service Time",
        dataIndex: "avgServiceTime",
        key: "avgServiceTime",
        render: (value: number) => `${Math.round(value)} min`,
      },
      {
        title: "Total Served",
        dataIndex: "totalServed",
        key: "totalServed",
      },
      {
        title: "Avg Wait Time",
        dataIndex: "avgWaitTime",
        key: "avgWaitTime",
        render: (value: number) => `${Math.round(value)} min`,
      },
      {
        title: "Efficiency",
        dataIndex: "efficiency",
        key: "efficiency",
        render: (value: number) => (
          <Progress
            percent={Math.round(value)}
            size="small"
            strokeColor={
              value > 70
                ? COLORS.success
                : value > 40
                  ? COLORS.warning
                  : COLORS.error
            }
          />
        ),
      },
    ];

    return (
      <Card
        title={
          <Space>
            <TrophyOutlined />
            Counter Efficiency
          </Space>
        }
        bordered={false}
        bodyStyle={{ padding: 24 }}
      >
        <Table
          dataSource={dashboardData.counterEfficiency}
          columns={columns}
          pagination={false}
          rowKey="counterName"
        />
      </Card>
    );
  };

  const renderTodaysVisitors = () => {
    if (dashboardLoading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!dashboardData?.todaysVisitors) return null;

    const data = dashboardData.todaysVisitors;
    // ✅ Round off to nearest integer - no decimals
    const totalVisitors = Math.round(data.total);
    const changePercentage = Math.round(data.changePercentage);

    return (
      <Card
        title={
          <Space>
            <TeamOutlined />
            Today's Footfall
          </Space>
        }
        bordered={false}
        style={{ height: "100%" }}
        bodyStyle={{ padding: 24 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Main number container */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "#262626",
                lineHeight: 1,
              }}
            >
              {totalVisitors.toLocaleString()}
            </div>

            {/* Percentage badge positioned at bottom right of number */}
            <Badge
              count={`${changePercentage > 0 ? "+" : ""}${changePercentage}%`}
              style={{
                backgroundColor:
                  changePercentage > 0 ? COLORS.success : COLORS.error,
                position: "absolute",
                bottom: -6,
                right: -60,
                fontSize: 13,
                padding: "4px 12px",
                height: "auto",
              }}
            />
          </div>

          {/* "Since" text positioned below the main number with gap */}
          <Text type="secondary" style={{ fontSize: 14, marginTop: 8 }}>
            Since {data.sinceTime}
          </Text>
        </div>
      </Card>
    );
  };

  const renderAvgDwellTime = () => {
    if (dashboardLoading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!dashboardData?.avgDwellTime) return null;

    const data = dashboardData.avgDwellTime;

    // ✅ Extract numeric value and round it - no decimals
    const dwellTimeMatch = data.formatted.match(/(\d+\.?\d*)/);
    const dwellTimeValue = dwellTimeMatch
      ? Math.round(parseFloat(dwellTimeMatch[1]))
      : 0;
    const dwellTimeUnit = data.formatted.replace(/[\d.]/g, "").trim();

    return (
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            Avg Dwell Time
          </Space>
        }
        bordered={false}
        style={{ height: "100%" }}
        bodyStyle={{ padding: 24 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#262626",
              lineHeight: 1,
            }}
          >
            {dwellTimeValue}
            <span style={{ fontSize: 24, fontWeight: 400, marginLeft: 8 }}>
              {dwellTimeUnit}
            </span>
          </div>
          <Text type="secondary" style={{ fontSize: 14, marginTop: 8 }}>
            Across 3 counters
          </Text>
        </div>
      </Card>
    );
  };

  const renderFilterDrawer = () => (
    <Drawer
      title="Filter Queue Trends"
      placement="right"
      onClose={() => setFilterDrawerVisible(false)}
      open={filterDrawerVisible}
    >
      {/* Time Period Filter */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ marginBottom: 8, display: "block" }}>
          Time Period
        </Text>
        <Radio.Group
          value={quickTimeFilter}
          onChange={(e) => setQuickTimeFilter(e.target.value)}
          style={{ width: "100%" }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Radio value="all">All Day</Radio>
            <Radio value="lunch">Lunch (11:00 AM - 2:00 PM)</Radio>
            <Radio value="dinner">Dinner (6:00 PM - 9:00 PM)</Radio>
            <Radio value="custom">Custom Range</Radio>
          </Space>
        </Radio.Group>

        {quickTimeFilter === "custom" && (
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                From
              </Text>
              <input
                type="time"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                To
              </Text>
              <input
                type="time"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Data Range */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ marginBottom: 8, display: "block" }}>
          Data Range
        </Text>
        <Select
          value={queueTrendsTimeFilter}
          onChange={setQueueTrendsTimeFilter}
          style={{ width: "100%" }}
        >
          <Option value={1}>Last 1 hour</Option>
          <Option value={2}>Last 2 hours</Option>
          <Option value={3}>Last 3 hours</Option>
          <Option value={5}>Last 5 hours</Option>
          <Option value={8}>Last 8 hours</Option>
          <Option value={12}>Last 12 hours</Option>
          <Option value={24}>Last 24 hours</Option>
        </Select>
      </div>

      {/* Counter Selection */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ marginBottom: 8, display: "block" }}>
          Counters
        </Text>
        {Object.keys(COUNTER_COLORS).map((counter) => (
          <div key={counter} style={{ marginBottom: 8 }}>
            <Checkbox
              checked={queueTrendsCounterFilter[counter]}
              onChange={() => {
                setQueueTrendsCounterFilter((prev) => ({
                  ...prev,
                  [counter]: !prev[counter],
                }));
              }}
            >
              <div style={{ display: "inline-flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor:
                      COUNTER_COLORS[counter as keyof typeof COUNTER_COLORS],
                    borderRadius: 2,
                    marginRight: 8,
                  }}
                />
                {counter}
              </div>
            </Checkbox>
          </div>
        ))}
      </div>

      <Divider />

      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Button
          onClick={() => {
            setQuickTimeFilter("all");
            setQueueTrendsTimeFilter(5);
            setQueueTrendsCounterFilter({
              "Healthy Station": true,
              "Mini Meals": true,
              "Two Good": true,
            });
          }}
        >
          Reset
        </Button>
        <Button type="primary" onClick={() => setFilterDrawerVisible(false)}>
          Apply
        </Button>
      </Space>
    </Drawer>
  );

  // ============================================
  // MAIN RENDER - ✅ PROGRESSIVE LOADING
  // ============================================
  // ✅ No full-page loading spinner - components load independently
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bgLight }}>
      {/* Header - Updated to match image */}
      <div
        style={{
          background: COLORS.bgWhite,
          padding: "20px 32px",
          borderBottom: `1px solid ${COLORS.border}`,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {selectedLocation}
            </Title>
            <Text type="secondary">{selectedCafeteria}</Text>
          </div>
          <Space size="large">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefreshQueueData}
              size="large"
            >
              Refresh
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setSettingsVisible(true)}
              type="primary"
              size="large"
            >
              Settings
            </Button>
          </Space>
        </div>
      </div>

      {/* Content - ✅ Components load progressively */}
      <div style={{ padding: "0 32px 32px" }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "overview",
              label: "Overview",
              children: (
                <>
                  {/* ✅ Overview tab - Three cards with improved spacing */}
                  <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                    {/* Cafeteria Occupancy - FIRST from left */}
                    <Col xs={24} sm={24} md={12} lg={12}>
                      {renderOccupancyStatus()}
                    </Col>

                    {/* Today's Footfall - SECOND from left - ✅ Increased size and spacing */}
                    <Col xs={24} sm={12} md={6} lg={6}>
                      {renderTodaysVisitors()}
                    </Col>

                    {/* Average Dwell Time - THIRD from left - ✅ Increased size and spacing */}
                    <Col xs={24} sm={12} md={6} lg={6}>
                      {renderAvgDwellTime()}
                    </Col>
                  </Row>

                  {/* ✅ Live Counter Status */}
                  <Row gutter={[24, 24]}>
                    <Col span={24}>{renderCounterStatus()}</Col>
                  </Row>
                </>
              ),
            },
            {
              key: "analytics",
              label: "Analytics",
              children: (
                <>
                  {/* ✅ Queue KPIs - ONLY in analytics tab */}
                  {renderQueueKPIs()}

                  {/* Queue Length Trends with Filter */}
                  <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                    <Col span={24}>{renderQueueLengthTrends()}</Col>
                  </Row>

                  {/* Queue Comparison Charts */}
                  <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                    <Col xs={24} lg={12}>
                      {renderAvgQueueComparison()}
                    </Col>
                    <Col xs={24} lg={12}>
                      {renderCongestionRateComparison()}
                    </Col>
                  </Row>

                  {/* ✅ Counter Efficiency only */}
                  <Row gutter={[24, 24]}>
                    <Col span={24}>{renderCounterEfficiency()}</Col>
                  </Row>
                </>
              ),
            },
          ]}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          borderTop: `1px solid ${COLORS.border}`,
          background: COLORS.bgWhite,
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          Last updated: {lastUpdated} | Manual refresh only - No auto-refresh
        </Text>
      </div>

      {/* Drawers */}
      {renderFilterDrawer()}
    </div>
  );
};

export default CafeteriaAnalyticsDashboard;
