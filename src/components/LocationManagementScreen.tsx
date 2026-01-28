import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  Globe,
  RefreshCw,
} from "lucide-react";
import {
  useLocations,
  useLocationOperations,
  type Location,
} from "../api/hooks/useDeviceApi";
import {
  StatusBadge,
  Button,
  Card,
  LoadingSpinner,
  EmptyState,
  ErrorState,
  Input,
  Select,
} from "./UIcomponents";

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export const LocationManagementScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  const locationsApi = useLocations();
  const locationOps = useLocationOperations();

  useEffect(() => {
    locationsApi.fetchLocations();
  }, []);

  const filteredLocations = useMemo(() => {
    if (!locationsApi.data) return [];
    return locationsApi.data.filter(
      (loc) =>
        loc.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.locationCode.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [locationsApi.data, searchTerm]);

  const handleDelete = async (location: Location) => {
    if (window.confirm(`Delete "${location.locationName}"?`)) {
      await locationOps.deleteLocation(location.id);
      locationsApi.fetchLocations();
    }
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
              Location Management
            </h1>
            <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 400 }}>
              Manage physical locations across your organization
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            icon={Plus}
          >
            Add Location
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ position: "relative" }}>
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
            placeholder="Search locations..."
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
      </Card>

      {/* Locations Grid */}
      {locationsApi.loading ? (
        <LoadingSpinner message="Loading locations..." />
      ) : locationsApi.error ? (
        <ErrorState
          message={locationsApi.error}
          onRetry={() => locationsApi.fetchLocations()}
        />
      ) : filteredLocations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No locations found"
          description="Get started by adding your first location"
          action={{ label: "Add Location", onClick: () => setShowModal(true) }}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: 16,
          }}
        >
          {filteredLocations.map((location) => (
            <Card key={location.id} hoverable>
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
                    <MapPin size={24} color="#6366F1" strokeWidth={1.5} />
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
                      {location.locationName}
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        fontWeight: 400,
                      }}
                    >
                      {location.locationCode}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  status={location.active ? "Active" : "Inactive"}
                  size="sm"
                />
              </div>

              {location.address && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    marginBottom: 8,
                    fontWeight: 400,
                  }}
                >
                  {location.address}, {location.city}, {location.state}
                </p>
              )}

              {location.description && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginBottom: 12,
                    fontWeight: 400,
                  }}
                >
                  {location.description}
                </p>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <Button
                  onClick={() => {
                    setSelectedLocation(location);
                    setShowModal(true);
                  }}
                  variant="secondary"
                  size="sm"
                  icon={Edit}
                  fullWidth
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(location)}
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
    </div>
  );
};

export default LocationManagementScreen;
