import { colors, fontSize, fontWeight, spacing } from '../theme'

export function SectionHeader({ title, subtitle, action, style }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
      ...style,
    }}>
      <div>
        <div style={{
          color: colors.textPrimary,
          fontSize: fontSize.xxxl,
          fontWeight: fontWeight.bold,
          lineHeight: '22px',
        }}>{title}</div>
        {subtitle && (
          <div style={{
            color: colors.textTertiary,
            fontSize: fontSize.sm,
            marginTop: 2,
          }}>{subtitle}</div>
        )}
      </div>
      {action}
    </div>
  )
}
