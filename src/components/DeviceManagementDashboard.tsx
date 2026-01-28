import React, { useState, useEffect, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Layers,
  Activity,
  Server,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import {
  useDevices,
  useDeviceOperations,
  type Device,
} from "../api/hooks/useDeviceApi";
import {
  StatusBadge,
  IconBadge,
  Button,
  Card,
  LoadingSpinner,
  EmptyState,
  ErrorState,
  SkeletonBlock,
} from "./UIcomponents";
import { DeviceFormModal } from "./DeviceFormModal";

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const skeletonStyles = (
  <style>{`
    @keyframes skeletonShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
  `}</style>
);

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
}> = memo(({ title, value, icon: Icon, color, trend, loading = false }) => {
  return (
    <Card hoverable padding={20}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${color}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!loading ? (
                <Icon size={20} color={color} strokeWidth={1.5} />
              ) : (
                <SkeletonBlock width={20} height={20} borderRadius={4} />
              )}
            </div>
            <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 400 }}>
              {!loading ? title : <SkeletonBlock width={100} height={12} />}
            </span>
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#111827",
              letterSpacing: "-0.5px",
            }}
          >
            {!loading ? (
              value.toLocaleString()
            ) : (
              <SkeletonBlock width={80} height={32} />
            )}
          </div>
          {!loading && trend && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: trend.isPositive ? "#10B981" : "#EF4444",
                fontWeight: 500,
              }}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last
              month
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

StatsCard.displayName = "StatsCard";

// Device Table Row Component
const DeviceTableRow: React.FC<{
  device: Device;
  onView: (device: Device) => void;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
}> = memo(({ device, onView, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <tr
      style={{
        borderBottom: "1px solid #F1F3F5",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#F9FAFB";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <td style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: device.active ? "#EEF2FF" : "#F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Server
              size={18}
              color={device.active ? "#6366F1" : "#9CA3AF"}
              strokeWidth={1.5}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#111827",
                marginBottom: 2,
              }}
            >
              {device.deviceName}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 400 }}>
              {device.deviceId}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: 13, color: "#374151", fontWeight: 400 }}>
          {device.deviceType}
        </div>
      </td>
      <td style={{ padding: "16px 20px" }}>
        <StatusBadge status={device.status} size="sm" />
      </td>
      <td style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={14} color="#9CA3AF" strokeWidth={1.5} />
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 400 }}>
            {device.location}
          </span>
        </div>
      </td>
      <td style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Layers size={14} color="#9CA3AF" strokeWidth={1.5} />
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 400 }}>
            {device.segment}
          </span>
        </div>
      </td>
      <td style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {device.status === "Active" ? (
            <Wifi size={14} color="#10B981" strokeWidth={1.5} />
          ) : (
            <WifiOff size={14} color="#EF4444" strokeWidth={1.5} />
          )}
          <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 400 }}>
            {device.ipAddress || "N/A"}
          </span>
        </div>
      </td>
      <td style={{ padding: "16px 20px", position: "relative" }}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 6,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F3F4F6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <MoreVertical size={16} color="#6B7280" strokeWidth={1.5} />
        </button>

        {isMenuOpen && (
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
              }}
              onClick={() => setIsMenuOpen(false)}
            />
            <div
              style={{
                position: "absolute",
                right: 20,
                top: "100%",
                marginTop: 4,
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                minWidth: 160,
                zIndex: 1000,
                overflow: "hidden",
              }}
            >
              {[
                {
                  icon: Eye,
                  label: "View Details",
                  onClick: () => onView(device),
                  color: "#6366F1",
                },
                {
                  icon: Edit,
                  label: "Edit",
                  onClick: () => onEdit(device),
                  color: "#F59E0B",
                },
                {
                  icon: Trash2,
                  label: "Delete",
                  onClick: () => onDelete(device),
                  color: "#EF4444",
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.onClick();
                    setIsMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#374151",
                    fontWeight: 400,
                    textAlign: "left",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <item.icon size={16} color={item.color} strokeWidth={1.5} />
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </td>
    </tr>
  );
});

DeviceTableRow.displayName = "DeviceTableRow";

// Main Dashboard Component
export const DeviceManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const devicesApi = useDevices();
  const deviceOps = useDeviceOperations();

  useEffect(() => {
    devicesApi.fetchDevices();
  }, []);

  // Filter devices
  const filteredDevices = useMemo(() => {
    if (!devicesApi.data) return [];

    return devicesApi.data.filter((device) => {
      const matchesSearch =
        device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.deviceId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || device.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [devicesApi.data, searchTerm, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!devicesApi.data)
      return { total: 0, active: 0, maintenance: 0, offline: 0 };

    return {
      total: devicesApi.data.length,
      active: devicesApi.data.filter((d) => d.status === "Active").length,
      maintenance: devicesApi.data.filter((d) => d.status === "Maintenance")
        .length,
      offline: devicesApi.data.filter(
        (d) => d.status === "Offline" || d.status === "Inactive",
      ).length,
    };
  }, [devicesApi.data]);

  const handleRefresh = async () => {
    await devicesApi.fetchDevices();
  };

  const handleViewDevice = (device: Device) => {
    console.log("Navigating to device details:", device.deviceId);
    navigate(`/devices/details/${device.deviceId}`);
  };

  const handleEditDevice = (device: Device) => {
    console.log("Edit device:", device);
    setSelectedDevice(device);
    setShowAddModal(true);
  };

  const handleDelete = async (device: Device) => {
    if (
      window.confirm(`Are you sure you want to delete "${device.deviceName}"?`)
    ) {
      const result = await deviceOps.deleteDevice(device.id);
      if (result) {
        devicesApi.fetchDevices();
      }
    }
  };

  const handleAddDevice = () => {
    console.log("Add device clicked");
    setSelectedDevice(null);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setSelectedDevice(null);
  };

  const handleModalSuccess = () => {
    devicesApi.fetchDevices();
  };

  return (
    <div style={{ padding: "24px", background: "#F8F9FA", minHeight: "100vh" }}>
      <style>{fontStyle}</style>
      {skeletonStyles}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
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
              Device Management
            </h1>
            <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 400 }}>
              Monitor and manage all connected devices across your network
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button
              onClick={handleRefresh}
              variant="secondary"
              icon={RefreshCw}
              disabled={devicesApi.loading}
            >
              Refresh
            </Button>
            <Button onClick={handleAddDevice} variant="primary" icon={Plus}>
              Add Device
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatsCard
          title="Total Devices"
          value={stats.total}
          icon={Server}
          color="#6366F1"
          loading={devicesApi.loading}
        />
        <StatsCard
          title="Active Devices"
          value={stats.active}
          icon={Activity}
          color="#10B981"
          trend={{ value: 12, isPositive: true }}
          loading={devicesApi.loading}
        />
        <StatsCard
          title="Under Maintenance"
          value={stats.maintenance}
          icon={AlertCircle}
          color="#F59E0B"
          loading={devicesApi.loading}
        />
        <StatsCard
          title="Offline Devices"
          value={stats.offline}
          icon={WifiOff}
          color="#EF4444"
          trend={{ value: 5, isPositive: false }}
          loading={devicesApi.loading}
        />
      </div>

      {/* Filters and Search */}
      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {/* Search */}
          <div
            style={{ position: "relative", flex: "1 1 300px", maxWidth: 400 }}
          >
            <Search
              size={16}
              color="#9CA3AF"
              strokeWidth={1.5}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                fontSize: 13,
                color: "#111827",
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                outline: "none",
                transition: "all 0.2s",
                fontWeight: 400,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366F1";
                e.currentTarget.style.background = "#FFFFFF";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.background = "#F9FAFB";
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Filter size={16} color="#6B7280" strokeWidth={1.5} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                fontSize: 13,
                color: "#374151",
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                outline: "none",
                cursor: "pointer",
                fontWeight: 400,
              }}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Offline">Offline</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" icon={Download} size="sm">
              Export
            </Button>
            <Button variant="ghost" icon={Upload} size="sm">
              Import
            </Button>
          </div>
        </div>
      </Card>

      {/* Devices Table */}
      <Card padding={0}>
        {devicesApi.loading && !devicesApi.data ? (
          <LoadingSpinner message="Loading devices..." />
        ) : devicesApi.error ? (
          <ErrorState message={devicesApi.error} onRetry={handleRefresh} />
        ) : filteredDevices.length === 0 ? (
          <EmptyState
            icon={Server}
            title="No devices found"
            description={
              searchTerm
                ? "Try adjusting your search or filters"
                : "Get started by adding your first device"
            }
            action={
              !searchTerm
                ? {
                    label: "Add Device",
                    onClick: handleAddDevice,
                  }
                : undefined
            }
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #E5E7EB",
                    background: "#F9FAFB",
                  }}
                >
                  {[
                    "Device",
                    "Type",
                    "Status",
                    "Location",
                    "Segment",
                    "IP Address",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      style={{
                        padding: "12px 20px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#6B7280",
                        letterSpacing: "0.3px",
                        textTransform: "uppercase",
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((device) => (
                  <DeviceTableRow
                    key={device.id}
                    device={device}
                    onView={handleViewDevice}
                    onEdit={handleEditDevice}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Device Form Modal */}
      {showAddModal && (
        <DeviceFormModal
          device={selectedDevice}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default DeviceManagementDashboard;
