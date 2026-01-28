import React, { useState } from "react";
import { X } from "lucide-react";
import { useCounterOperations, type Counter } from "../api/hooks/useDeviceApi";
import { Button, Input, Select } from "./UIcomponents";

interface CounterFormModalProps {
  counter?: Counter | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CounterFormModal: React.FC<CounterFormModalProps> = ({
  counter,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!counter;
  const counterOps = useCounterOperations();

  const [formData, setFormData] = useState({
    counterCode: counter?.counterCode || "",
    counterName: counter?.counterName || "",
    description: counter?.description || "",
    counterType: counter?.counterType || "",
    measurementUnit: counter?.measurementUnit || "",
    currentValue: counter?.currentValue?.toString() || "0",
    maxValue: counter?.maxValue?.toString() || "",
    minValue: counter?.minValue?.toString() || "",
    active: counter?.active ?? true,
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
    if (!formData.counterCode.trim())
      newErrors.counterCode = "Counter code is required";
    if (!formData.counterName.trim())
      newErrors.counterName = "Counter name is required";
    if (!formData.currentValue || isNaN(Number(formData.currentValue))) {
      newErrors.currentValue = "Valid current value is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      ...formData,
      currentValue: parseFloat(formData.currentValue),
      maxValue: formData.maxValue ? parseFloat(formData.maxValue) : undefined,
      minValue: formData.minValue ? parseFloat(formData.minValue) : undefined,
    };

    const result = isEdit
      ? await counterOps.updateCounter(counter.id, submitData)
      : await counterOps.createCounter(submitData);

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
          maxWidth: 600,
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
            {isEdit ? "Edit Counter" : "Add New Counter"}
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
                label="Counter Code"
                value={formData.counterCode}
                onChange={(value) => handleChange("counterCode", value)}
                placeholder="e.g., CNT001"
                error={errors.counterCode}
                required
                disabled={isEdit}
              />
              <Input
                label="Counter Name"
                value={formData.counterName}
                onChange={(value) => handleChange("counterName", value)}
                placeholder="e.g., Device Count"
                error={errors.counterName}
                required
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
                label="Counter Type"
                value={formData.counterType}
                onChange={(value) => handleChange("counterType", value)}
                options={[
                  { value: "", label: "Select type..." },
                  { value: "Count", label: "Count" },
                  { value: "Percentage", label: "Percentage" },
                  { value: "Metric", label: "Metric" },
                  { value: "KPI", label: "KPI" },
                ]}
              />
              <Input
                label="Measurement Unit"
                value={formData.measurementUnit}
                onChange={(value) => handleChange("measurementUnit", value)}
                placeholder="e.g., units, %, GB"
              />
              <Input
                label="Current Value"
                value={formData.currentValue}
                onChange={(value) => handleChange("currentValue", value)}
                placeholder="e.g., 75"
                error={errors.currentValue}
                required
              />
              <Input
                label="Max Value"
                value={formData.maxValue}
                onChange={(value) => handleChange("maxValue", value)}
                placeholder="e.g., 100"
              />
              <Input
                label="Min Value"
                value={formData.minValue}
                onChange={(value) => handleChange("minValue", value)}
                placeholder="e.g., 0"
              />
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
              disabled={counterOps.loading}
            >
              {counterOps.loading
                ? "Saving..."
                : isEdit
                  ? "Update Counter"
                  : "Add Counter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CounterFormModal;
