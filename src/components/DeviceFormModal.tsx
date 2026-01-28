import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import {
  useDeviceOperations,
  useLocations,
  useSegments,
  useCounters,
  type Device,
} from "../api/hooks/useDeviceApi";
import { Button, Input, Select, Card } from "./UIcomponents";

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export const DeviceFormModal: React.FC<{
  device?: Device | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ device, onClose, onSuccess }) => {
  const isEdit = !!device;

  const [formData, setFormData] = useState({
    deviceId: device?.deviceId || "",
    deviceName: device?.deviceName || "",
    deviceType: device?.deviceType || "",
    location: device?.location || "",
    segment: device?.segment || "",
    counterName: device?.counterName || "",
    manufacturer: device?.manufacturer || "",
    model: device?.model || "",
    serialNumber: device?.serialNumber || "",
    firmwareVersion: device?.firmwareVersion || "",
    status: device?.status || "Active",
    ipAddress: device?.ipAddress || "",
    macAddress: device?.macAddress || "",
    notes: device?.notes || "",
    active: device?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const deviceOps = useDeviceOperations();
  const locationsApi = useLocations();
  const segmentsApi = useSegments();
  const countersApi = useCounters();

  useEffect(() => {
    locationsApi.fetchLocations();
    segmentsApi.fetchSegments();
    countersApi.fetchCounters();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.deviceId.trim()) newErrors.deviceId = "Device ID is required";
    if (!formData.deviceName.trim())
      newErrors.deviceName = "Device name is required";
    if (!formData.deviceType.trim())
      newErrors.deviceType = "Device type is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.segment.trim()) newErrors.segment = "Segment is required";
    if (!formData.counterName.trim())
      newErrors.counterName = "Counter is required";

    // IP Address validation
    if (formData.ipAddress) {
      const ipRegex =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.ipAddress)) {
        newErrors.ipAddress = "Invalid IP address format";
      }
    }

    // MAC Address validation
    if (formData.macAddress) {
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!macRegex.test(formData.macAddress)) {
        newErrors.macAddress = "Invalid MAC address format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    const result = isEdit
      ? await deviceOps.updateDevice(device.id, formData)
      : await deviceOps.createDevice(formData);

    if (result) {
      onSuccess();
      onClose();
    } else if (deviceOps.error) {
      setSubmitError(deviceOps.error);
    }
  };

  return (
    <>
      <style>{fontStyle}</style>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 20,
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            maxWidth: 800,
            width: "100%",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "24px 24px 20px",
              borderBottom: "1px solid #F1F3F5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#111827",
                letterSpacing: "-0.3px",
              }}
            >
              {isEdit ? "Edit Device" : "Add New Device"}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 8,
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
              <X size={20} color="#6B7280" strokeWidth={1.5} />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", flex: 1 }}
          >
            <div
              style={{
                padding: 24,
                overflowY: "auto",
                flex: 1,
              }}
            >
              {submitError && (
                <div
                  style={{
                    padding: 12,
                    background: "#FEE2E2",
                    border: "1px solid #FECACA",
                    borderRadius: 8,
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <AlertCircle size={16} color="#EF4444" strokeWidth={1.5} />
                  <span
                    style={{ fontSize: 13, color: "#991B1B", fontWeight: 400 }}
                  >
                    {submitError}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {/* Basic Information */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#111827",
                      marginBottom: 12,
                    }}
                  >
                    Basic Information
                  </h3>
                </div>

                <Input
                  label="Device ID"
                  value={formData.deviceId}
                  onChange={(value) => handleChange("deviceId", value)}
                  placeholder="e.g., DEV001"
                  error={errors.deviceId}
                  required
                  disabled={isEdit}
                />

                <Input
                  label="Device Name"
                  value={formData.deviceName}
                  onChange={(value) => handleChange("deviceName", value)}
                  placeholder="e.g., Production Machine #1"
                  error={errors.deviceName}
                  required
                />

                <Input
                  label="Device Type"
                  value={formData.deviceType}
                  onChange={(value) => handleChange("deviceType", value)}
                  placeholder="e.g., Machine, Sensor"
                  error={errors.deviceType}
                  required
                />

                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(value) => handleChange("status", value)}
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                    { value: "Maintenance", label: "Maintenance" },
                    { value: "Offline", label: "Offline" },
                  ]}
                  required
                />

                {/* Location & Organization */}
                <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#111827",
                      marginBottom: 12,
                    }}
                  >
                    Location & Organization
                  </h3>
                </div>

                <Select
                  label="Location"
                  value={formData.location}
                  onChange={(value) => handleChange("location", value)}
                  options={
                    locationsApi.data?.map((loc) => ({
                      value: loc.locationCode,
                      label: loc.locationName,
                    })) || []
                  }
                  placeholder="Select location"
                  error={errors.location}
                  required
                />

                <Select
                  label="Segment"
                  value={formData.segment}
                  onChange={(value) => handleChange("segment", value)}
                  options={
                    segmentsApi.data?.map((seg) => ({
                      value: seg.segmentCode,
                      label: seg.segmentName,
                    })) || []
                  }
                  placeholder="Select segment"
                  error={errors.segment}
                  required
                />

                <Select
                  label="Counter"
                  value={formData.counterName}
                  onChange={(value) => handleChange("counterName", value)}
                  options={
                    countersApi.data?.map((cnt) => ({
                      value: cnt.counterCode,
                      label: cnt.counterName,
                    })) || []
                  }
                  placeholder="Select counter"
                  error={errors.counterName}
                  required
                />

                {/* Hardware Details */}
                <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#111827",
                      marginBottom: 12,
                    }}
                  >
                    Hardware Details
                  </h3>
                </div>

                <Input
                  label="Manufacturer"
                  value={formData.manufacturer}
                  onChange={(value) => handleChange("manufacturer", value)}
                  placeholder="e.g., Acme Corp"
                />

                <Input
                  label="Model"
                  value={formData.model}
                  onChange={(value) => handleChange("model", value)}
                  placeholder="e.g., PM-2000"
                />

                <Input
                  label="Serial Number"
                  value={formData.serialNumber}
                  onChange={(value) => handleChange("serialNumber", value)}
                  placeholder="e.g., SN12345"
                />

                <Input
                  label="Firmware Version"
                  value={formData.firmwareVersion}
                  onChange={(value) => handleChange("firmwareVersion", value)}
                  placeholder="e.g., v1.2.3"
                />

                {/* Network Configuration */}
                <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#111827",
                      marginBottom: 12,
                    }}
                  >
                    Network Configuration
                  </h3>
                </div>

                <Input
                  label="IP Address"
                  value={formData.ipAddress}
                  onChange={(value) => handleChange("ipAddress", value)}
                  placeholder="e.g., 192.168.1.100"
                  error={errors.ipAddress}
                />

                <Input
                  label="MAC Address"
                  value={formData.macAddress}
                  onChange={(value) => handleChange("macAddress", value)}
                  placeholder="e.g., 00:1B:44:11:3A:B7"
                  error={errors.macAddress}
                />

                {/* Notes */}
                <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
                  <label
                    style={{
                      fontSize: 13,
                      color: "#374151",
                      fontWeight: 500,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Additional notes or comments..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "#111827",
                      background: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: 8,
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                      fontWeight: 400,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#6366F1";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #F1F3F5",
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <Button onClick={onClose} variant="secondary" type="button">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                disabled={deviceOps.loading}
              >
                {deviceOps.loading
                  ? "Saving..."
                  : isEdit
                    ? "Update Device"
                    : "Add Device"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DeviceFormModal;
