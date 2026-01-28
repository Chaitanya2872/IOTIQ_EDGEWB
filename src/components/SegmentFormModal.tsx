import React, { useState } from "react";
import { X } from "lucide-react";
import { useSegmentOperations, type Segment } from "../api/hooks/useDeviceApi";
import { Button, Input, Select } from "./UIcomponents";

interface SegmentFormModalProps {
  segment?: Segment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SegmentFormModal: React.FC<SegmentFormModalProps> = ({
  segment,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!segment;
  const segmentOps = useSegmentOperations();

  const [formData, setFormData] = useState({
    segmentCode: segment?.segmentCode || "",
    segmentName: segment?.segmentName || "",
    description: segment?.description || "",
    category: segment?.category || "",
    businessUnit: segment?.businessUnit || "",
    department: segment?.department || "",
    active: segment?.active ?? true,
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
    if (!formData.segmentCode.trim())
      newErrors.segmentCode = "Segment code is required";
    if (!formData.segmentName.trim())
      newErrors.segmentName = "Segment name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = isEdit
      ? await segmentOps.updateSegment(segment.id, formData)
      : await segmentOps.createSegment(formData);

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
            {isEdit ? "Edit Segment" : "Add New Segment"}
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
                label="Segment Code"
                value={formData.segmentCode}
                onChange={(value) => handleChange("segmentCode", value)}
                placeholder="e.g., SEG001"
                error={errors.segmentCode}
                required
                disabled={isEdit}
              />
              <Input
                label="Segment Name"
                value={formData.segmentName}
                onChange={(value) => handleChange("segmentName", value)}
                placeholder="e.g., Production"
                error={errors.segmentName}
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
              <Input
                label="Category"
                value={formData.category}
                onChange={(value) => handleChange("category", value)}
                placeholder="e.g., Operations"
              />
              <Input
                label="Business Unit"
                value={formData.businessUnit}
                onChange={(value) => handleChange("businessUnit", value)}
                placeholder="e.g., Manufacturing"
              />
              <Input
                label="Department"
                value={formData.department}
                onChange={(value) => handleChange("department", value)}
                placeholder="e.g., Assembly"
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
              disabled={segmentOps.loading}
            >
              {segmentOps.loading
                ? "Saving..."
                : isEdit
                  ? "Update Segment"
                  : "Add Segment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SegmentFormModal;
