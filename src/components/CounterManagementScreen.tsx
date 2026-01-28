import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Gauge,
  RefreshCw,
} from "lucide-react";
import {
  useCounters,
  useCounterOperations,
  type Counter,
} from "../api/hooks/useDeviceApi";
import {
  StatusBadge,
  Button,
  Card,
  LoadingSpinner,
  EmptyState,
  ErrorState,
} from "./UIcomponents";
import { CounterFormModal } from "./CounterFormModal";

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export const CounterManagementScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null);

  const countersApi = useCounters();
  const counterOps = useCounterOperations();

  useEffect(() => {
    countersApi.fetchCounters();
  }, []);

  const filteredCounters = useMemo(() => {
    if (!countersApi.data) return [];
    return countersApi.data.filter(
      (counter) =>
        counter.counterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        counter.counterCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        counter.counterType?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [countersApi.data, searchTerm]);

  const handleDelete = async (counter: Counter) => {
    if (window.confirm(`Delete "${counter.counterName}"?`)) {
      await counterOps.deleteCounter(counter.id);
      countersApi.fetchCounters();
    }
  };

  const handleAddCounter = () => {
    console.log("🔵 Add Counter clicked");
    setSelectedCounter(null);
    setShowModal(true);
  };

  const handleEditCounter = (counter: Counter) => {
    console.log("🔵 Edit Counter clicked:", counter);
    setSelectedCounter(counter);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCounter(null);
  };

  const handleModalSuccess = () => {
    countersApi.fetchCounters();
  };

  const getProgressPercentage = (counter: Counter): number => {
    if (!counter.maxValue || counter.maxValue === 0) return 0;
    return (counter.currentValue / counter.maxValue) * 100;
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return "#EF4444";
    if (percentage >= 60) return "#F59E0B";
    return "#10B981";
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
              Counter Management
            </h1>
            <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 400 }}>
              Track and monitor device metrics and KPIs
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button
              onClick={() => countersApi.fetchCounters()}
              variant="secondary"
              icon={RefreshCw}
            >
              Refresh
            </Button>
            <Button onClick={handleAddCounter} variant="primary" icon={Plus}>
              Add Counter
            </Button>
          </div>
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
            placeholder="Search counters..."
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

      {/* Counters Grid */}
      {countersApi.loading ? (
        <LoadingSpinner message="Loading counters..." />
      ) : countersApi.error ? (
        <ErrorState
          message={countersApi.error}
          onRetry={() => countersApi.fetchCounters()}
        />
      ) : filteredCounters.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No counters found"
          description="Get started by adding your first counter"
          action={{ label: "Add Counter", onClick: handleAddCounter }}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: 16,
          }}
        >
          {filteredCounters.map((counter) => {
            const percentage = getProgressPercentage(counter);
            const progressColor = getProgressColor(percentage);

            return (
              <Card key={counter.id} hoverable>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `${progressColor}10`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Gauge
                        size={24}
                        color={progressColor}
                        strokeWidth={1.5}
                      />
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
                        {counter.counterName}
                      </h3>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          fontWeight: 400,
                        }}
                      >
                        {counter.counterCode}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={counter.active ? "Active" : "Inactive"}
                    size="sm"
                  />
                </div>

                {/* Counter Type Badge */}
                {counter.counterType && (
                  <div style={{ marginBottom: 12 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 500,
                        background: "#F3F4F6",
                        color: "#6B7280",
                      }}
                    >
                      {counter.counterType}
                    </span>
                  </div>
                )}

                {/* Current Value Display */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 32,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {counter.currentValue.toLocaleString()}
                    </span>
                    {counter.measurementUnit && (
                      <span
                        style={{
                          fontSize: 14,
                          color: "#6B7280",
                          fontWeight: 400,
                        }}
                      >
                        {counter.measurementUnit}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {counter.maxValue && counter.maxValue > 0 && (
                    <>
                      <div
                        style={{
                          width: "100%",
                          height: 8,
                          background: "#F3F4F6",
                          borderRadius: 4,
                          overflow: "hidden",
                          marginBottom: 6,
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            height: "100%",
                            background: progressColor,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 11,
                          color: "#6B7280",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {percentage >= 80 ? (
                            <TrendingUp size={12} color="#EF4444" />
                          ) : (
                            <TrendingDown size={12} color="#10B981" />
                          )}
                          {percentage.toFixed(1)}%
                        </span>
                        <span>
                          Max: {counter.maxValue.toLocaleString()}{" "}
                          {counter.measurementUnit}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {counter.description && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      marginBottom: 12,
                      fontWeight: 400,
                    }}
                  >
                    {counter.description}
                  </p>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <Button
                    onClick={() => handleEditCounter(counter)}
                    variant="secondary"
                    size="sm"
                    icon={Edit}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(counter)}
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    fullWidth
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Counter Form Modal */}
      {showModal && (
        <CounterFormModal
          counter={selectedCounter}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default CounterManagementScreen;
