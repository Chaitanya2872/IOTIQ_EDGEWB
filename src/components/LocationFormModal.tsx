import React, { useState } from "react";
import { X } from "lucide-react";
import {
  useLocationOperations,
  type Location,
} from "../api/hooks/useDeviceApi";
import { Button, Input, Select } from "./UIcomponents";

interface LocationFormModalProps {
  location?: Location | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const LocationFormModal: React.FC<LocationFormModalProps> = ({
  location,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!location;
  const locationOps = useLocationOperations();

  const [formData, setFormData] = useState({
    locationCode: location?.locationCode || "",
    locationName: location?.locationName || "",
    address: location?.address || "",
    city: location?.city || "",
    state: location?.state || "",
    country: location?.country || "",
    postalCode: location?.postalCode || "",
    latitude: location?.latitude?.toString() || "",
    longitude: location?.longitude?.toString() || "",
    description: location?.description || "",
    active: location?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!formData.locationCode.trim())
      newErrors.locationCode = "Location code is required";
    if (!formData.locationName.trim())
      newErrors.locationName = "Location name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude
        ? parseFloat(formData.longitude)
        : undefined,
    };

    const result = isEdit
      ? await locationOps.updateLocation(location.id, submitData)
      : await locationOps.createLocation(submitData);

    if (result) {
      onSuccess();
      onClose();
    }
  };

  return (
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
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          maxWidth: 700,
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            padding: "24px 24px 20px",
            borderBottom: "1px solid #F1F3F5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>
            {isEdit ? "Edit Location" : "Add New Location"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#F3F4F6",
              border: "none",
              cursor: "pointer",
              padding: 8,
              borderRadius: 8,
            }}
          >
            <X size={20} color="#6B7280" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", flex: 1 }}
        >
          <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Input
                label="Location Code"
                value={formData.locationCode}
                onChange={(value) => handleChange("locationCode", value)}
                placeholder="e.g., LOC001"
                error={errors.locationCode}
                required
                disabled={isEdit}
              />
              <Input
                label="Location Name"
                value={formData.locationName}
                onChange={(value) => handleChange("locationName", value)}
                placeholder="e.g., Building A"
                error={errors.locationName}
                required
              />
              <div style={{ gridColumn: "1 / -1" }}>
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(value) => handleChange("address", value)}
                  placeholder="Street address"
                />
              </div>
              <Input
                label="City"
                value={formData.city}
                onChange={(value) => handleChange("city", value)}
                placeholder="City"
              />
              <Input
                label="State/Province"
                value={formData.state}
                onChange={(value) => handleChange("state", value)}
                placeholder="State"
              />
              <Input
                label="Country"
                value={formData.country}
                onChange={(value) => handleChange("country", value)}
                placeholder="Country"
              />
              <Input
                label="Postal Code"
                value={formData.postalCode}
                onChange={(value) => handleChange("postalCode", value)}
                placeholder="ZIP/Postal code"
              />
              <Input
                label="Latitude"
                value={formData.latitude}
                onChange={(value) => handleChange("latitude", value)}
                placeholder="e.g., 40.7128"
              />
              <Input
                label="Longitude"
                value={formData.longitude}
                onChange={(value) => handleChange("longitude", value)}
                placeholder="e.g., -74.0060"
              />
              <div style={{ gridColumn: "1 / -1" }}>
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(value) => handleChange("description", value)}
                  placeholder="Brief description"
                />
              </div>
              <Select
                label="Status"
                value={formData.active ? "active" : "inactive"}
                onChange={(value) => handleChange("active", value === "active")}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                required
              />
            </div>
          </div>

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
              disabled={locationOps.loading}
            >
              {locationOps.loading
                ? "Saving..."
                : isEdit
                  ? "Update Location"
                  : "Add Location"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationFormModal;
