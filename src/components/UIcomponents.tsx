import React, { memo } from "react";
import type { LucideIcon } from "lucide-react";

// Skeleton loading component
export const SkeletonBlock: React.FC<{
  width?: string | number;
  height?: string | number;
  borderRadius?: number | string;
  style?: React.CSSProperties;
}> = memo(({ width = "100%", height = 12, borderRadius = 6, style }) => (
  <div
    style={{
      width,
      height,
      background:
        "linear-gradient(90deg, rgba(226,232,240,0.7) 25%, rgba(243,244,246,0.9) 50%, rgba(226,232,240,0.7) 75%)",
      borderRadius,
      animation: "skeletonShimmer 1.2s ease-in-out infinite",
      backgroundSize: "200px 100%",
      ...style,
    }}
  />
));

SkeletonBlock.displayName = "SkeletonBlock";

// Loading spinner
export const LoadingSpinner: React.FC<{ message?: string; size?: number }> =
  memo(({ message = "Loading...", size = 40 }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        gap: 12,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: "3px solid #F3F4F6",
          borderTop: "3px solid #6366F1",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes skeletonShimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
        `}
      </style>
      <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 400 }}>
        {message}
      </span>
    </div>
  ));

LoadingSpinner.displayName = "LoadingSpinner";

// Status badge
export const StatusBadge: React.FC<{
  status: string;
  size?: "sm" | "md" | "lg";
}> = memo(({ status, size = "md" }) => {
  const statusColors: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    Active: { bg: "#F0FDF4", text: "#10B981", border: "#BBF7D0" },
    Inactive: { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
    Maintenance: { bg: "#FEF3C7", text: "#F59E0B", border: "#FDE68A" },
    Offline: { bg: "#FEE2E2", text: "#EF4444", border: "#FECACA" },
    online: { bg: "#F0FDF4", text: "#10B981", border: "#BBF7D0" },
    offline: { bg: "#FEE2E2", text: "#EF4444", border: "#FECACA" },
  };

  const sizes = {
    sm: { padding: "2px 8px", fontSize: 11 },
    md: { padding: "4px 10px", fontSize: 12 },
    lg: { padding: "6px 12px", fontSize: 13 },
  };

  const colors = statusColors[status] || statusColors.Inactive;
  const sizeStyles = sizes[size];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        ...sizeStyles,
        borderRadius: 6,
        fontWeight: 500,
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        letterSpacing: "0.2px",
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: colors.text,
          marginRight: 6,
        }}
      />
      {status}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// Icon badge
export const IconBadge: React.FC<{
  icon: LucideIcon;
  label: string;
  color: string;
  size?: "sm" | "md";
}> = memo(({ icon: Icon, label, color, size = "md" }) => {
  const sizes = {
    sm: { iconSize: 14, padding: "4px 10px", fontSize: 11 },
    md: { iconSize: 16, padding: "6px 12px", fontSize: 12 },
  };

  const sizeStyle = sizes[size];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: sizeStyle.padding,
        borderRadius: 8,
        background: `${color}10`,
        border: `1px solid ${color}20`,
      }}
    >
      <Icon size={sizeStyle.iconSize} color={color} strokeWidth={1.5} />
      <span
        style={{
          fontSize: sizeStyle.fontSize,
          color: "#374151",
          fontWeight: 400,
        }}
      >
        {label}
      </span>
    </div>
  );
});

IconBadge.displayName = "IconBadge";

// Button component
export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  icon?: LucideIcon;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}> = memo(
  ({
    children,
    onClick,
    variant = "primary",
    size = "md",
    disabled = false,
    icon: Icon,
    type = "button",
    fullWidth = false,
  }) => {
    const variants = {
      primary: {
        background: "#6366F1",
        color: "#FFFFFF",
        border: "1px solid #6366F1",
        hover: { background: "#4F46E5" },
      },
      secondary: {
        background: "#F3F4F6",
        color: "#374151",
        border: "1px solid #E5E7EB",
        hover: { background: "#E5E7EB" },
      },
      danger: {
        background: "#EF4444",
        color: "#FFFFFF",
        border: "1px solid #EF4444",
        hover: { background: "#DC2626" },
      },
      ghost: {
        background: "transparent",
        color: "#6B7280",
        border: "1px solid transparent",
        hover: { background: "#F9FAFB" },
      },
    };

    const sizes = {
      sm: { padding: "6px 12px", fontSize: 12, iconSize: 14 },
      md: { padding: "8px 16px", fontSize: 13, iconSize: 16 },
      lg: { padding: "10px 20px", fontSize: 14, iconSize: 18 },
    };

    const variantStyle = variants[variant];
    const sizeStyle = sizes[size];

    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: sizeStyle.padding,
          fontSize: sizeStyle.fontSize,
          fontWeight: 500,
          borderRadius: 8,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? "100%" : "auto",
          ...variantStyle,
          ...(isHovered && !disabled ? variantStyle.hover : {}),
        }}
      >
        {Icon && <Icon size={sizeStyle.iconSize} strokeWidth={1.5} />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

// Input component
export const Input: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  type?: string;
  required?: boolean;
  icon?: LucideIcon;
}> = memo(
  ({
    value,
    onChange,
    placeholder,
    label,
    error,
    disabled = false,
    type = "text",
    required = false,
    icon: Icon,
  }) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {label && (
          <label
            style={{
              fontSize: 13,
              color: "#374151",
              fontWeight: 500,
            }}
          >
            {label}
            {required && (
              <span style={{ color: "#EF4444", marginLeft: 4 }}>*</span>
            )}
          </label>
        )}
        <div style={{ position: "relative" }}>
          {Icon && (
            <div
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <Icon size={16} color="#9CA3AF" strokeWidth={1.5} />
            </div>
          )}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            style={{
              width: "100%",
              padding: Icon ? "10px 12px 10px 40px" : "10px 12px",
              fontSize: 13,
              color: "#111827",
              background: disabled ? "#F9FAFB" : "#FFFFFF",
              border: error ? "1px solid #EF4444" : "1px solid #E5E7EB",
              borderRadius: 8,
              outline: "none",
              transition: "all 0.2s",
              fontWeight: 400,
            }}
            onFocus={(e) => {
              if (!error) e.currentTarget.style.borderColor = "#6366F1";
            }}
            onBlur={(e) => {
              if (!error) e.currentTarget.style.borderColor = "#E5E7EB";
            }}
          />
        </div>
        {error && (
          <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 400 }}>
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

// Select component
export const Select: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}> = memo(
  ({
    value,
    onChange,
    options,
    placeholder,
    label,
    error,
    disabled = false,
    required = false,
  }) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {label && (
          <label style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
            {label}
            {required && (
              <span style={{ color: "#EF4444", marginLeft: 4 }}>*</span>
            )}
          </label>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 13,
            color: value ? "#111827" : "#9CA3AF",
            background: disabled ? "#F9FAFB" : "#FFFFFF",
            border: error ? "1px solid #EF4444" : "1px solid #E5E7EB",
            borderRadius: 8,
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            fontWeight: 400,
          }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = "#6366F1";
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = "#E5E7EB";
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 400 }}>
            {error}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

// Card component
export const Card: React.FC<{
  children: React.ReactNode;
  hoverable?: boolean;
  padding?: number;
  style?: React.CSSProperties;
}> = memo(({ children, hoverable = false, padding = 20, style }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => hoverable && setIsHovered(true)}
      onMouseLeave={() => hoverable && setIsHovered(false)}
      style={{
        background: "#FFFFFF",
        border:
          isHovered && hoverable ? "1px solid #E5E7EB" : "1px solid #F1F3F5",
        borderRadius: 12,
        padding,
        transition: "all 0.2s",
        boxShadow:
          isHovered && hoverable ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

// Empty state component
export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = memo(({ icon: Icon, title, description, action }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "#F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon size={32} color="#9CA3AF" strokeWidth={1.5} />
      </div>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: "#111827",
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "#6B7280",
          fontWeight: 400,
          maxWidth: 400,
          marginBottom: action ? 24 : 0,
        }}
      >
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = "EmptyState";

// Error state component
export const ErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
}> = memo(({ message, onRetry }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "#FEE2E2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#EF4444"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: "#EF4444",
          marginBottom: 8,
        }}
      >
        Something went wrong
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "#6B7280",
          fontWeight: 400,
          maxWidth: 400,
          marginBottom: onRetry ? 24 : 0,
        }}
      >
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          Try Again
        </Button>
      )}
    </div>
  );
});

ErrorState.displayName = "ErrorState";
