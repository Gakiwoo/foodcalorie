import { colors, fontSize, fontWeight, radius, spacing } from '../theme'

export function ListItem({ icon, title, subtitle, right, onClick, style, divider = false }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: spacing.md,
        padding: spacing.md, backgroundColor: colors.surface,
        borderRadius: radius.xl, boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: divider ? `1px solid ${colors.borderLight}` : 'none',
        ...style,
      }}>
      {icon && (
        <div style={{
          width: 56, height: 56, display: 'flex', justifyContent: 'center', alignItems: 'center',
          borderRadius: radius.lg, overflow: 'hidden', flexShrink: 0,
          backgroundColor: colors.borderLight,
        }}>{icon}</div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, minWidth: 0 }}>
        <div style={{
          color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.semibold,
          lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{title}</div>
        {subtitle && (
          <div style={{ color: colors.textTertiary, fontSize: fontSize.sm, lineHeight: '16px' }}>{subtitle}</div>
        )}
      </div>
      {right && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          {right}
        </div>
      )}
    </div>
  )
}
