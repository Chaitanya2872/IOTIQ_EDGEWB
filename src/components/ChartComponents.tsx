import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity, BarChart3, TrendingUp, TrendingDown } from "lucide-react";

// Chart Type Selector
interface ChartTypeSelectorProps {
  selectedType: "line" | "area" | "bar";
  onTypeChange: (type: "line" | "area" | "bar") => void;
}

export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  const types = [
    { value: "line" as const, label: "Line", icon: Activity },
    { value: "area" as const, label: "Area", icon: Activity },
    { value: "bar" as const, label: "Bar", icon: BarChart3 },
  ];

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {types.map((type) => {
        const Icon = type.icon;
        return (
          <button
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: `1px solid ${selectedType === type.value ? "#3B82F6" : "#E2E8F0"}`,
              background: selectedType === type.value ? "#3B82F615" : "#FFFFFF",
              color: selectedType === type.value ? "#3B82F6" : "#64748B",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.2s",
            }}
          >
            <Icon size={14} />
            {type.label}
          </button>
        );
      })}
    </div>
  );
};

// Dynamic Chart Component
interface DynamicChartProps {
  data: any[];
  chartType: "line" | "area" | "bar";
  dataKeys: string[];
  colors: string[];
}

export const DynamicChart: React.FC<DynamicChartProps> = ({
  data,
  chartType,
  dataKeys,
  colors,
}) => {
  const commonProps = {
    data,
    margin: { top: 5, right: 20, left: 0, bottom: 5 },
  };

  const renderChart = () => {
    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient
                  key={key}
                  id={`gradient${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={colors[index]}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={colors[index]}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              style={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis stroke="#94A3B8" style={{ fontSize: 11 }} tickLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index]}
                fill={`url(#gradient${key})`}
                strokeWidth={2.5}
              />
            ))}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              style={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis stroke="#94A3B8" style={{ fontSize: 11 }} tickLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index]}
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            ))}
          </BarChart>
        );

      case "line":
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              style={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis stroke="#94A3B8" style={{ fontSize: 11 }} tickLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index]}
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

// Footfall Summary Card
interface FootfallSummaryCardProps {
  title: string;
  value: number;
  change: number;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
}

export const FootfallSummaryCard: React.FC<FootfallSummaryCardProps> = ({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  color,
}) => {
  const isPositive = change >= 0;

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 12,
        border: "1px solid #E2E8F0",
        padding: 20,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#64748B",
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#0F172A",
              letterSpacing: "-0.5px",
            }}
          >
            {value.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={color} strokeWidth={2} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            borderRadius: 6,
            background: isPositive ? "#10B98115" : "#EF444415",
            fontSize: 12,
            fontWeight: 600,
            color: isPositive ? "#10B981" : "#EF4444",
          }}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(change).toFixed(1)}%
        </div>
        <div style={{ fontSize: 12, color: "#64748B" }}>{subtitle}</div>
      </div>
    </div>
  );
};
