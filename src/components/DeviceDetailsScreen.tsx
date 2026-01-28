import React, { useEffect, useMemo, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Server,
  MapPin,
  Layers,
  Activity,
  Wifi,
  HardDrive,
  Cpu,
  Thermometer,
  Zap,
  Calendar,
  Clock,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  useMqttData,
  useDevices,
  type Device,
} from "../api/hooks/useDeviceApi";
import {
  StatusBadge,
  IconBadge,
  Button,
  Card,
  LoadingSpinner,
  ErrorState,
} from "./UIComponents";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// Info Row Component
const InfoRow: React.FC<{
  label: string;
  value: string | React.ReactNode;
  icon?: React.ComponentType<any>;
}> = memo(({ label, value, icon: Icon }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #F1F3F5",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {Icon && <Icon size={16} color="#9CA3AF" strokeWidth={1.5} />}
        <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 400 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
});

InfoRow.displayName = "InfoRow";

// Metric Card Component
const MetricCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: { value: number; isPositive: boolean };
}> = memo(({ label, value, unit, icon: Icon, color, trend }) => {
  return (
    <Card hoverable>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${color}10`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={24} color={color} strokeWidth={1.5} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: 400,
              marginBottom: 4,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#111827",
              letterSpacing: "-0.5px",
            }}
          >
            {value}
            {unit && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "#6B7280",
                  marginLeft: 4,
                }}
              >
                {unit}
              </span>
            )}
          </div>
          {trend && (
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                color: trend.isPositive ? "#10B981" : "#EF4444",
                fontWeight: 500,
              }}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

MetricCard.displayName = "MetricCard";

// Device Details Screen Component
export const DeviceDetailsScreen: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  const devicesApi = useDevices();
  const mqttApi = useMqttData();

  useEffect(() => {
    if (deviceId) {
      devicesApi.getDeviceByDeviceId(deviceId);
      mqttApi.getDeviceWithMqttData(deviceId);
    }
  }, [deviceId]);

  const device = devicesApi.data?.[0]; // Assuming getDeviceByDeviceId returns an array

  const handleRefresh = () => {
    if (deviceId) {
      devicesApi.getDeviceByDeviceId(deviceId);
      mqttApi.getDeviceWithMqttData(deviceId);
    }
  };

  const handleBack = () => {
    navigate("/devices");
  };

  const handleEdit = () => {
    // TODO: Open edit modal
    console.log("Edit device:", device);
  };

  const handleDelete = () => {
    if (
      device &&
      window.confirm(`Are you sure you want to delete "${device.deviceName}"?`)
    ) {
      // TODO: Implement delete
      console.log("Delete device:", device);
      navigate("/devices");
    }
  };

  // Generate mock historical data for chart
  const historicalData = useMemo(() => {
    const data = [];
    for (let i = 23; i >= 0; i--) {
      data.push({
        time: `${i}h ago`,
        value: 70 + Math.random() * 30,
      });
    }
    return data;
  }, []);

  const mqttData = mqttApi.data;

  if (devicesApi.loading || !device) {
    return (
      <div style={{ padding: 24, background: "#F8F9FA", minHeight: "100vh" }}>
        <style>{fontStyle}</style>
        <LoadingSpinner message="Loading device details..." />
      </div>
    );
  }

  if (devicesApi.error) {
    return (
      <div style={{ padding: 24, background: "#F8F9FA", minHeight: "100vh" }}>
        <style>{fontStyle}</style>
        <ErrorState message={devicesApi.error} onRetry={handleRefresh} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#F8F9FA", minHeight: "100vh" }}>
      <style>{fontStyle}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Button
          onClick={handleBack}
          variant="ghost"
          icon={ArrowLeft}
          size="sm"
          style={{ marginBottom: 16 }}
        >
          Back to Devices
        </Button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: device.active ? "#EEF2FF" : "#F3F4F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Server
                size={32}
                color={device.active ? "#6366F1" : "#9CA3AF"}
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 4,
                  letterSpacing: "-0.5px",
                }}
              >
                {device.deviceName}
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{ fontSize: 14, color: "#6B7280", fontWeight: 400 }}
                >
                  {device.deviceId}
                </span>
                <StatusBadge status={device.status} />
                {device.active ? (
                  <IconBadge
                    icon={Wifi}
                    label="Connected"
                    color="#10B981"
                    size="sm"
                  />
                ) : (
                  <IconBadge
                    icon={Wifi}
                    label="Disconnected"
                    color="#EF4444"
                    size="sm"
                  />
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Button
              onClick={handleRefresh}
              variant="secondary"
              icon={RefreshCw}
              size="sm"
            >
              Refresh
            </Button>
            <Button
              onClick={handleEdit}
              variant="secondary"
              icon={Edit}
              size="sm"
            >
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              icon={Trash2}
              size="sm"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      {mqttData && (
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Real-time Metrics
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            <MetricCard
              label="Temperature"
              value={mqttData.temperature || 0}
              unit="°C"
              icon={Thermometer}
              color="#EF4444"
              trend={{ value: 2.5, isPositive: true }}
            />
            <MetricCard
              label="Power Usage"
              value={mqttData.power || 0}
              unit="W"
              icon={Zap}
              color="#F59E0B"
              trend={{ value: 1.2, isPositive: false }}
            />
            <MetricCard
              label="CPU Usage"
              value={mqttData.cpuUsage || 0}
              unit="%"
              icon={Cpu}
              color="#8B5CF6"
            />
            <MetricCard
              label="Memory Usage"
              value={mqttData.memoryUsage || 0}
              unit="%"
              icon={HardDrive}
              color="#10B981"
            />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Device Information */}
        <Card>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Device Information
          </h3>
          <div>
            <InfoRow
              label="Device Type"
              value={device.deviceType}
              icon={Server}
            />
            <InfoRow
              label="Manufacturer"
              value={device.manufacturer || "N/A"}
            />
            <InfoRow label="Model" value={device.model || "N/A"} />
            <InfoRow
              label="Serial Number"
              value={device.serialNumber || "N/A"}
            />
            <InfoRow
              label="Firmware Version"
              value={device.firmwareVersion || "N/A"}
            />
          </div>
        </Card>

        {/* Network Information */}
        <Card>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Network Information
          </h3>
          <div>
            <InfoRow
              label="IP Address"
              value={device.ipAddress || "N/A"}
              icon={Wifi}
            />
            <InfoRow label="MAC Address" value={device.macAddress || "N/A"} />
            <InfoRow label="Location" value={device.location} icon={MapPin} />
            <InfoRow label="Segment" value={device.segment} icon={Layers} />
            <InfoRow
              label="Counter"
              value={device.counterName}
              icon={Activity}
            />
          </div>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card style={{ marginTop: 24 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "#111827",
            marginBottom: 16,
          }}
        >
          Performance History (24h)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historicalData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F1F3F5"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              style={{ fontSize: 11, fontWeight: 400 }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: 11, fontWeight: 400 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "#FFF",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366F1"
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Additional Details */}
      <Card style={{ marginTop: 24 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "#111827",
            marginBottom: 16,
          }}
        >
          Additional Details
        </h3>
        <div>
          <InfoRow
            label="Created At"
            value={
              device.createdAt
                ? new Date(device.createdAt).toLocaleString()
                : "N/A"
            }
            icon={Calendar}
          />
          <InfoRow
            label="Last Updated"
            value={
              device.updatedAt
                ? new Date(device.updatedAt).toLocaleString()
                : "N/A"
            }
            icon={Clock}
          />
          <InfoRow label="Notes" value={device.notes || "No notes available"} />
        </div>
      </Card>
    </div>
  );
};

export default DeviceDetailsScreen;
