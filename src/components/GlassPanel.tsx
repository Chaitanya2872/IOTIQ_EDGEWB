import React from 'react';

// Reusable glassmorphism panel to wrap existing content without changing it.
// Usage:
// <GlassPanel>
//   <YourExistingContent />
// </GlassPanel>
//
// Props:
// - style: override or extend base styles
// - className: attach additional CSS classes
// - as: choose wrapper element (default 'div')
// - padding: quick padding control (default '16px')
// - accent: 'green' | 'blue' | 'gray' to slightly tint the panel (default 'green')

export type GlassPanelProps = React.PropsWithChildren<{
  style?: React.CSSProperties;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  padding?: number | string;
  accent?: 'green' | 'blue' | 'gray';
}>;

const accentMap: Record<NonNullable<GlassPanelProps['accent']>, { border: string; shadow: string; bg: string }> = {
  green: {
    border: '1px solid rgba(28, 198, 96, 0.35)',
    shadow: '0 8px 24px rgba(28, 198, 96, 0.12)',
    bg: 'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.16) 100%)',
  },
  blue: {
    border: '1px solid rgba(59, 130, 246, 0.35)',
    shadow: '0 8px 24px rgba(59, 130, 246, 0.12)',
    bg: 'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.16) 100%)',
  },
  gray: {
    border: '1px solid rgba(148, 163, 184, 0.35)',
    shadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
    bg: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.14) 100%)',
  },
};

const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  style,
  className,
  as: Tag = 'div',
  padding = '16px',
  accent = 'green',
}) => {
  const accentTokens = accentMap[accent];
  const baseStyle: React.CSSProperties = {
    background: accentTokens.bg,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: accentTokens.border,
    borderRadius: 12,
    boxShadow: accentTokens.shadow,
    padding,
    fontFamily:
      "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
    color: '#0f172a',
  };

  return (
    <Tag className={className} style={{ ...baseStyle, ...style }}>
      {children}
    </Tag>
  );
};

export default GlassPanel;