// CafeteriaAnalyticsDashboard.tsx - UPDATED VERSION
// ✅ Keep cafeteria occupancy original size
// ✅ Increase Today's Footfall and Avg Dwell Time to match cafeteria occupancy size
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
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Queue Trends Filters
  const [queueTrendsTimeFilter, setQueueTrendsTimeFilter] = useState<number>(5);
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
  const [customStartTime, setCustomStartTime] = useState<string>("11:00");
  const [customEndTime, setCustomEndTime] = useState<string>("14:00");

  // Location/Cafeteria selection
  const [selectedLocation] = useState<string>("Intel, RMZ Ecoworld, Bangalore");
  const [selectedCafeteria] = useState<string>("SRR 4A");
  const [activeTab, setActiveTab] = useState<string>("overview");

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
        <Card bordered={false} style={{ marginBottom: 24 }}>
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin size="large" tip="Loading queue KPIs..." />
          </div>
        </Card>
      );
    }

    // Show error state for individual components
    if (queueComparisonError || congestionRateError || queueTrendsError) {
      return (
        <Alert
          message="Unable to load queue KPIs"
          description="Please check your connection and try again"
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Button
              onClick={handleRefreshQueueData}
              type="primary"
              size="small"
            >
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
        icon: (
          <AreaChartOutlined style={{ fontSize: 24, color: COLORS.primary }} />
        ),
        title: "Overall Avg Queue",
        value: kpiData.overallAvgQueue.toFixed(1),
        unit: "people",
        color: COLORS.primary,
      },
      {
        icon: <AlertOutlined style={{ fontSize: 24, color: COLORS.warning }} />,
        title: "Peak Queue Length",
        value: kpiData.peakQueueLength.toString(),
        unit: "maximum",
        color: COLORS.warning,
      },
      {
        icon: <FireOutlined style={{ fontSize: 24, color: COLORS.error }} />,
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
          <Col key={index} xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                borderLeft: `4px solid ${card.color}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, fontWeight: 500 }}
                  >
                    {card.title}
                  </Text>
                  {card.icon}
                </div>
                <Text style={{ fontSize: 32, fontWeight: 600, lineHeight: 1 }}>
                  {card.value}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {card.unit}
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderQueueLengthTrends = () => {
    if (queueTrendsLoading) {
      return (
        <Card title="Queue Length Trends" bordered={false}>
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin tip="Loading trends..." />
          </div>
        </Card>
      );
    }

    if (queueTrendsError) {
      return (
        <Alert
          message="Unable to load queue trends"
          type="error"
          showIcon
          action={
            <Button onClick={handleRefreshQueueData} size="small">
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
            <AreaChartOutlined />
            <span>Queue Length Trends</span>
            <Badge status="processing" text="Live" />
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
                count={
                  (activeCountersCount !== 3 ? 1 : 0) +
                  (quickTimeFilter !== "all" ? 1 : 0) +
                  (queueTrendsTimeFilter !== 5 ? 1 : 0)
                }
                style={{ backgroundColor: COLORS.error, marginLeft: 4 }}
              />
            ) : null}
          </Button>
        }
        bodyStyle={{ padding: 24 }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={visibleData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis
              dataKey="time"
              stroke={COLORS.neutral}
              style={{ fontSize: 12 }}
            />
            <YAxis stroke={COLORS.neutral} style={{ fontSize: 12 }} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: COLORS.bgWhite,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 4,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            {queueTrendsCounterFilter["Healthy Station"] && (
              <Line
                type="monotone"
                dataKey="Healthy Station"
                stroke={COUNTER_COLORS["Healthy Station"]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            )}
            {queueTrendsCounterFilter["Mini Meals"] && (
              <Line
                type="monotone"
                dataKey="Mini Meals"
                stroke={COUNTER_COLORS["Mini Meals"]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            )}
            {queueTrendsCounterFilter["Two Good"] && (
              <Line
                type="monotone"
                dataKey="Two Good"
                stroke={COUNTER_COLORS["Two Good"]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: COLORS.bgLight,
            borderRadius: 4,
          }}
        >
          <Space split={<Divider type="vertical" />} size="small">
            <Text type="secondary" style={{ fontSize: 12 }}>
              Last updated:{" "}
              {queueTrendsData?.reportGeneratedAt
                ? new Date(
                    queueTrendsData.reportGeneratedAt,
                  ).toLocaleTimeString()
                : lastUpdated}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {activeCountersCount} of 3 counters | {visibleData.length} data
              points
            </Text>
          </Space>
        </div>
      </Card>
    );
  };

  const renderAvgQueueComparison = () => {
    if (queueComparisonLoading) {
      return (
        <Card title="Average Queue Comparison" bordered={false}>
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin tip="Loading..." />
          </div>
        </Card>
      );
    }

    if (queueComparisonError || !transformedQueueComparisonData.length)
      return null;

    return (
      <Card
        title={
          <Space>
            <BarChartOutlined />
            <span>Average Queue Comparison</span>
          </Space>
        }
        bordered={false}
        bodyStyle={{ padding: 24 }}
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={transformedQueueComparisonData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis
              dataKey="name"
              stroke={COLORS.neutral}
              style={{ fontSize: 12 }}
            />
            <YAxis stroke={COLORS.neutral} style={{ fontSize: 12 }} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: COLORS.bgWhite,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 4,
              }}
            />
            <Bar
              dataKey="value"
              name="Avg Queue"
              radius={[4, 4, 0, 0]}
              barSize={60}
            >
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
              padding: 12,
              backgroundColor: COLORS.bgLight,
              borderRadius: 4,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Busiest
                </Text>
                <div>
                  <Text strong>
                    {queueComparisonData.summary.busiestCounter}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Least Busy
                </Text>
                <div>
                  <Text strong>
                    {queueComparisonData.summary.leastBusyCounter}
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Card>
    );
  };

  const renderCongestionRateComparison = () => {
    if (congestionRateLoading) {
      return (
        <Card title="Congestion Rate Comparison" bordered={false}>
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin tip="Loading..." />
          </div>
        </Card>
      );
    }

    if (congestionRateError || !transformedCongestionRateData.length)
      return null;

    return (
      <Card
        title={
          <Space>
            <PercentageOutlined />
            <span>Congestion Rate Comparison</span>
          </Space>
        }
        bordered={false}
        bodyStyle={{ padding: 24 }}
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={transformedCongestionRateData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis
              dataKey="name"
              stroke={COLORS.neutral}
              style={{ fontSize: 12 }}
            />
            <YAxis
              stroke={COLORS.neutral}
              domain={[0, 100]}
              style={{ fontSize: 12 }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: COLORS.bgWhite,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 4,
              }}
              formatter={(value: any) => [
                `${value.toFixed(1)}%`,
                "Congestion Rate",
              ]}
            />
            <Bar
              dataKey="value"
              name="Congestion Rate"
              radius={[4, 4, 0, 0]}
              barSize={60}
            >
              {transformedCongestionRateData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {congestionRateData && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#fff7e6",
              borderRadius: 4,
              border: `1px solid ${COLORS.warning}`,
            }}
          >
            <Space>
              <AlertOutlined style={{ color: COLORS.warning }} />
              <Text style={{ fontSize: 13 }}>
                <strong>Recommendation:</strong>{" "}
                {congestionRateData.summary.recommendation}
              </Text>
            </Space>
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
        <Card title="Cafeteria Occupancy" bordered={false}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin tip="Loading..." />
          </div>
        </Card>
      );
    }

    if (!dashboardData?.occupancyStatus) return null;
    const occupancyData = dashboardData.occupancyStatus;
    const occupancyPercentage = Math.round(
      (occupancyData.currentOccupancy / occupancyData.capacity) * 100,
    );

    return (
      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>Cafeteria Occupancy</span>
            <Badge status="processing" text="Live" />
          </Space>
        }
        bordered={false}
        bodyStyle={{ padding: 24 }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col span={12}>
            <Statistic
              title="Current Occupancy"
              value={occupancyData.currentOccupancy}
              suffix={`/ ${occupancyData.capacity}`}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={12}>
            <Progress
              type="dashboard"
              percent={occupancyPercentage}
              strokeColor={getCongestionColor(occupancyData.congestionLevel)}
              size={140}
              format={(percent) => (
                <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                  {percent}%
                </span>
              )}
            />
          </Col>
          <Col span={24}>
            <Alert
              message={
                occupancyData.congestionLevel === "LOW"
                  ? "Low - Free Flow"
                  : occupancyData.congestionLevel === "MEDIUM"
                    ? "Medium - Moderate"
                    : "High - Congested"
              }
              type={
                occupancyData.congestionLevel === "HIGH"
                  ? "error"
                  : occupancyData.congestionLevel === "MEDIUM"
                    ? "warning"
                    : "success"
              }
              showIcon
            />
          </Col>
        </Row>
      </Card>
    );
  };

  const renderCounterStatus = () => {
    if (dashboardLoading) {
      return (
        <Card title="Live Counter Status" bordered={false}>
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin tip="Loading..." />
          </div>
        </Card>
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
        render: (value: number) => <Text strong>{value}</Text>,
      },
      {
        title: "Wait Time",
        dataIndex: "waitTime",
        key: "waitTime",
        render: (value: number) => `${value} min`,
      },
      {
        title: "Status",
        dataIndex: "congestionLevel",
        key: "congestionLevel",
        render: (level: string) => (
          <Badge
            status={
              level === "LOW"
                ? "success"
                : level === "MEDIUM"
                  ? "warning"
                  : "error"
            }
            text={level}
          />
        ),
      },
    ];

    return (
      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>Live Counter Status</span>
            <Badge status="processing" text="Live" />
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
        <Card title="Counter Efficiency" bordered={false}>
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin tip="Loading..." />
          </div>
        </Card>
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
        render: (value: number) => `${value} min`,
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
        render: (value: number) => `${value} min`,
      },
      {
        title: "Efficiency",
        dataIndex: "efficiency",
        key: "efficiency",
        render: (value: number) => (
          <Progress
            percent={value}
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
            <span>Counter Efficiency</span>
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
        <Card
          title="Today's Footfall"
          bordered={false}
          style={{ height: "100%" }}
        >
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin tip="Loading..." />
          </div>
        </Card>
      );
    }

    if (!dashboardData?.todaysVisitors) return null;
    const data = dashboardData.todaysVisitors;

    return (
      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>Today's Footfall</span>
          </Space>
        }
        bordered={false}
        style={{ height: "100%" }}
        bodyStyle={{ padding: 24 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
          }}
        >
          <Text
            style={{
              fontSize: 64,
              fontWeight: "bold",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {data.total.toLocaleString()}
          </Text>
          <div style={{ marginBottom: 8 }}>
            <Badge
              count={`${data.trend === "up" ? "+" : "-"} ${Math.abs(data.percentageChange)}%`}
              style={{
                backgroundColor:
                  data.trend === "up" ? COLORS.success : COLORS.error,
                fontSize: 16,
                padding: "4px 8px",
              }}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Since {data.sinceTime}
          </Text>
        </div>
      </Card>
    );
  };

  const renderAvgDwellTime = () => {
    if (dashboardLoading) {
      return (
        <Card
          title="Average Dwell Time"
          bordered={false}
          style={{ height: "100%" }}
        >
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin tip="Loading..." />
          </div>
        </Card>
      );
    }

    if (!dashboardData?.avgDwellTime) return null;
    const data = dashboardData.avgDwellTime;

    return (
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Avg Dwell Time</span>
          </Space>
        }
        bordered={false}
        style={{ height: "100%" }}
        bodyStyle={{ padding: 24 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
          }}
        >
          <Text
            style={{
              fontSize: 64,
              fontWeight: "bold",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {data.formatted}
          </Text>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Across 3 counters
          </Text>
        </div>
      </Card>
    );
  };
  const renderFilterDrawer = () => (
    <Drawer
      title="Queue Trends Filters"
      placement="right"
      width={400}
      onClose={() => setFilterDrawerVisible(false)}
      open={filterDrawerVisible}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {/* Time Period Filter */}
        <div>
          <Text strong style={{ display: "block", marginBottom: 12 }}>
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
            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: COLORS.bgLight,
                borderRadius: 4,
              }}
            >
              <Space>
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block", marginBottom: 4 }}
                  >
                    From
                  </Text>
                  <input
                    type="time"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    style={{
                      padding: "6px 12px",
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block", marginBottom: 4 }}
                  >
                    To
                  </Text>
                  <input
                    type="time"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    style={{
                      padding: "6px 12px",
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                  />
                </div>
              </Space>
            </div>
          )}
        </div>

        <Divider />

        {/* Data Range */}
        <div>
          <Text strong style={{ display: "block", marginBottom: 12 }}>
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

        <Divider />

        {/* Counter Selection */}
        <div>
          <Text strong style={{ display: "block", marginBottom: 12 }}>
            Counters
          </Text>
          <Space direction="vertical" style={{ width: "100%" }}>
            {Object.keys(COUNTER_COLORS).map((counter) => (
              <div
                key={counter}
                style={{
                  padding: 12,
                  borderRadius: 4,
                  backgroundColor: queueTrendsCounterFilter[counter]
                    ? `${COUNTER_COLORS[counter as keyof typeof COUNTER_COLORS]}10`
                    : COLORS.bgLight,
                  border: `1px solid ${queueTrendsCounterFilter[counter] ? COUNTER_COLORS[counter as keyof typeof COUNTER_COLORS] : COLORS.border}`,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setQueueTrendsCounterFilter((prev) => ({
                    ...prev,
                    [counter]: !prev[counter],
                  }));
                }}
              >
                <Checkbox
                  checked={queueTrendsCounterFilter[counter]}
                  style={{ marginRight: 8 }}
                />
                <div
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor:
                      COUNTER_COLORS[counter as keyof typeof COUNTER_COLORS],
                    marginRight: 8,
                  }}
                />
                <Text>{counter}</Text>
              </div>
            ))}
          </Space>
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
      </Space>
    </Drawer>
  );

  // ============================================
  // MAIN RENDER - ✅ PROGRESSIVE LOADING
  // ============================================
  // ✅ No full-page loading spinner - components load independently

  return (
    <div
      style={{ padding: 24, background: COLORS.bgLight, minHeight: "100vh" }}
    >
      {/* Header - Updated to match image */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Title level={3} style={{ margin: 0, color: COLORS.primary }}>
                  IoTIQ EDGE
                </Title>
                <Divider type="vertical" style={{ height: 20 }} />
                <Title level={4} style={{ margin: 0 }}>
                  Cafeteria Analytics
                </Title>
                <Badge status="processing" text="Live" />
              </div>
              <div
                style={{
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Text type="secondary">{selectedLocation}</Text>
                <Divider type="vertical" />
                <Text type="secondary">{selectedCafeteria}</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                onClick={handleRefreshQueueData}
                loading={
                  queueComparisonLoading ||
                  congestionRateLoading ||
                  queueTrendsLoading ||
                  dashboardLoading
                }
                icon={<ReloadOutlined />}
                size="large"
              >
                Refresh
              </Button>
              <Button
                onClick={() => setSettingsVisible(true)}
                icon={<SettingOutlined />}
                type="primary"
                size="large"
              >
                Settings
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Content - ✅ Components load progressively */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <div>
                {/* ✅ Overview tab - Three cards in correct order with Today's Footfall and Avg Dwell Time increased to match Cafeteria Occupancy size */}
                <Row gutter={[16, 16]}>
                  {/* Cafeteria Occupancy - FIRST from left - Keep original size (span 12) */}
                  <Col xs={24} lg={12}>
                    {renderOccupancyStatus()}
                  </Col>

                  {/* Today's Footfall - SECOND from left - Increased size to match (span 6) */}
                  <Col xs={24} sm={12} lg={6}>
                    {renderTodaysVisitors()}
                  </Col>

                  {/* Average Dwell Time - THIRD from left - Increased size to match (span 6) */}
                  <Col xs={24} sm={12} lg={6}>
                    {renderAvgDwellTime()}
                  </Col>
                </Row>

                {/* ✅ Live Counter Status */}
                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                  <Col span={24}>{renderCounterStatus()}</Col>
                </Row>
              </div>
            ),
          },
          {
            key: "analytics",
            label: "Analytics",
            children: (
              <Space direction="vertical" style={{ width: "100%" }} size={24}>
                {/* ✅ Queue KPIs - ONLY in analytics tab */}
                {renderQueueKPIs()}

                {/* Queue Length Trends with Filter */}
                {renderQueueLengthTrends()}

                {/* Queue Comparison Charts */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    {renderAvgQueueComparison()}
                  </Col>
                  <Col xs={24} lg={12}>
                    {renderCongestionRateComparison()}
                  </Col>
                </Row>

                {/* ✅ Counter Efficiency only */}
                <Row gutter={[16, 16]}>
                  <Col xs={24}>{renderCounterEfficiency()}</Col>
                </Row>
              </Space>
            ),
          },
        ]}
      />

      {/* Footer */}
      <div style={{ marginTop: 24, textAlign: "right" }}>
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
