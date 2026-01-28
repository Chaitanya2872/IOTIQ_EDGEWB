import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Building2,
  Users,
  Package,
} from "lucide-react";
import {
  useSegments,
  useSegmentOperations,
  type Segment,
} from "../api/hooks/useDeviceApi";
import {
  StatusBadge,
  Button,
  Card,
  LoadingSpinner,
  EmptyState,
  ErrorState,
} from "./UIcomponents";
import { SegmentFormModal } from "./SegmentFormModal";

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export const SegmentManagementScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const segmentsApi = useSegments();
  const segmentOps = useSegmentOperations();

  useEffect(() => {
    segmentsApi.fetchSegments();
  }, []);

  const filteredSegments = useMemo(() => {
    if (!segmentsApi.data) return [];
    return segmentsApi.data.filter((seg) => {
      const matchesSearch =
        seg.segmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seg.segmentCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && seg.active) ||
        (statusFilter === "inactive" && !seg.active);
      return matchesSearch && matchesStatus;
    });
  }, [segmentsApi.data, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!segmentsApi.data) return { total: 0, active: 0, inactive: 0 };
    return {
      total: segmentsApi.data.length,
      active: segmentsApi.data.filter((s) => s.active).length,
      inactive: segmentsApi.data.filter((s) => !s.active).length,
    };
  }, [segmentsApi.data]);

  const handleDelete = async (segment: Segment) => {
    if (window.confirm(`Delete "${segment.segmentName}"?`)) {
      await segmentOps.deleteSegment(segment.id);
      segmentsApi.fetchSegments();
    }
  };

  const handleAddSegment = () => {
    console.log("🔵 Add Segment clicked");
    setSelectedSegment(null);
    setShowModal(true);
  };

  const handleEditSegment = (segment: Segment) => {
    console.log("🔵 Edit Segment clicked:", segment);
    setSelectedSegment(segment);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSegment(null);
  };

  const handleModalSuccess = () => {
    segmentsApi.fetchSegments();
  };

  return (
    <div style={{ padding: "24px", background: "#F8F9FA", minHeight: "100vh" }}>
      <style>{fontStyle}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
              Segment Management
            </h1>
            <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 400 }}>
              Organize devices by business segments and departments
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button
              onClick={() => segmentsApi.fetchSegments()}
              variant="secondary"
              icon={RefreshCw}
            >
              Refresh
            </Button>
            <Button onClick={handleAddSegment} variant="primary" icon={Plus}>
              Add Segment
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Card hoverable>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#EEF2FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Layers size={24} color="#6366F1" strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 400 }}>
                Total Segments
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: "#111827" }}>
                {stats.total}
              </div>
            </div>
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#F0FDF4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Package size={24} color="#10B981" strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 400 }}>
                Active
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: "#111827" }}>
                {stats.active}
              </div>
            </div>
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={24} color="#F59E0B" strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 400 }}>
                Inactive
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: "#111827" }}>
                {stats.inactive}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
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
              }}
            />
            <input
              type="text"
              placeholder="Search segments..."
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
                fontWeight: 400,
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              fontSize: 13,
              color: "#374151",
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Segments Grid */}
      {segmentsApi.loading ? (
        <LoadingSpinner message="Loading segments..." />
      ) : segmentsApi.error ? (
        <ErrorState
          message={segmentsApi.error}
          onRetry={() => segmentsApi.fetchSegments()}
        />
      ) : filteredSegments.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No segments found"
          description="Get started by adding your first segment"
          action={{ label: "Add Segment", onClick: handleAddSegment }}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: 16,
          }}
        >
          {filteredSegments.map((segment) => (
            <Card key={segment.id} hoverable>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "#EEF2FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Layers size={24} color="#6366F1" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {segment.segmentName}
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        fontWeight: 400,
                      }}
                    >
                      {segment.segmentCode}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  status={segment.active ? "Active" : "Inactive"}
                  size="sm"
                />
              </div>

              {segment.description && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    marginBottom: 12,
                    fontWeight: 400,
                  }}
                >
                  {segment.description}
                </p>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {segment.category && (
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        fontWeight: 500,
                        marginBottom: 2,
                      }}
                    >
                      CATEGORY
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        fontWeight: 400,
                      }}
                    >
                      {segment.category}
                    </div>
                  </div>
                )}
                {segment.businessUnit && (
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        fontWeight: 500,
                        marginBottom: 2,
                      }}
                    >
                      BUSINESS UNIT
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        fontWeight: 400,
                      }}
                    >
                      {segment.businessUnit}
                    </div>
                  </div>
                )}
                {segment.department && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        fontWeight: 500,
                        marginBottom: 2,
                      }}
                    >
                      DEPARTMENT
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        fontWeight: 400,
                      }}
                    >
                      {segment.department}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  onClick={() => handleEditSegment(segment)}
                  variant="secondary"
                  size="sm"
                  icon={Edit}
                  fullWidth
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(segment)}
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  fullWidth
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Segment Form Modal */}
      {showModal && (
        <SegmentFormModal
          segment={selectedSegment}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default SegmentManagementScreen;
