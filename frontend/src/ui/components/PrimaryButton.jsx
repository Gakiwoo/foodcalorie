import { colors, fontSize, fontWeight, radius, shadow, spacing } from '../theme'

const sizeMap = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, fontSize: fontSize.sm, height: 36 },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, fontSize: fontSize.lg, height: 44 },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl, fontSize: fontSize.xxl, height: 52 },
}

export function PrimaryButton({ children, onClick, disabled = false, fullWidth = false, size = 'md', style }) {
  const s = sizeMap[size] || sizeMap.md
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
        backgroundColor: colors.primary, borderRadius: radius.cta,
        paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal,
        height: s.height, fontSize: s.fontSize, fontWeight: fontWeight.bold,
        color: colors.textInverse, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto', boxShadow: shadow.xl,
        ...style,
      }}>
      {children}
    </button>
  )
}

export function WhiteButton({ children, onClick, disabled = false, fullWidth = false, size = 'lg', style }) {
  const s = sizeMap[size] || sizeMap.lg
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
        backgroundColor: colors.surface, borderRadius: radius.cta,
        paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal,
        height: s.height, fontSize: s.fontSize, fontWeight: fontWeight.bold,
        color: colors.primary, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto', maxWidth: fullWidth ? 'none' : 279,
        boxShadow: shadow.xl,
        ...style,
      }}>
      {children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, disabled = false, fullWidth = false, size = 'md', style }) {
  const s = sizeMap[size] || sizeMap.md
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
        backgroundColor: 'transparent', border: `1.5px solid ${colors.primary}`,
        borderRadius: radius.pill,
        paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal,
        height: s.height, fontSize: s.fontSize, fontWeight: fontWeight.semibold,
        color: colors.primary,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...style,
      }}>
      {children}
    </button>
  )
}
