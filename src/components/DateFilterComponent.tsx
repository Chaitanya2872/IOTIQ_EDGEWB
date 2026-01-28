import React, { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface DateRangeFilterProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
  customStart: string;
  customEnd: string;
  onCustomChange: (start: string, end: string) => void;
}

const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "Last 90 Days", value: "last90" },
  { label: "Last 6 Months", value: "last6months" },
  { label: "Last 12 Months", value: "last12months" },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedRange,
  onRangeChange,
  customStart,
  customEnd,
  onCustomChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDateDisplay = () => {
    if (selectedRange === "custom" && customStart && customEnd) {
      const start = new Date(customStart).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const end = new Date(customEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${start} - ${end}`;
    }
    const preset = DATE_PRESETS.find((p) => p.value === selectedRange);
    return preset?.label || "Select Date Range";
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
          minWidth: 220,
        }}
      >
        <Calendar size={16} />
        <span>{formatDateDisplay()}</span>
        <ChevronDown size={16} style={{ marginLeft: "auto" }} />
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
              padding: 16,
              minWidth: 320,
              zIndex: 1000,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748B",
                  marginBottom: 8,
                }}
              >
                Quick Select
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      onRangeChange(preset.value);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background:
                        selectedRange === preset.value ? "#3B82F6" : "#F8FAFC",
                      color:
                        selectedRange === preset.value ? "#FFFFFF" : "#64748B",
                      fontSize: 12,
                      fontWeight: selectedRange === preset.value ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 12 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748B",
                  marginBottom: 8,
                }}
              >
                Custom Range
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => onCustomChange(e.target.value, customEnd)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #E2E8F0",
                    fontSize: 12,
                    outline: "none",
                  }}
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => onCustomChange(customStart, e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #E2E8F0",
                    fontSize: 12,
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => {
                    if (customStart && customEnd) {
                      onRangeChange("custom");
                      setIsOpen(false);
                    }
                  }}
                  disabled={!customStart || !customEnd}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      customStart && customEnd ? "#3B82F6" : "#E2E8F0",
                    color: customStart && customEnd ? "#FFFFFF" : "#94A3B8",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor:
                      customStart && customEnd ? "pointer" : "not-allowed",
                  }}
                >
                  Apply Custom Range
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
