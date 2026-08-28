import { colors, fontSize, fontWeight, radius, spacing } from '../theme'

const nutrientConfig = {
  calories: { bg: colors.primaryBg, text: colors.primary, label: '千卡', unit: '' },
  protein: { bg: colors.infoBg, text: colors.info, label: '蛋白质', unit: 'g' },
  carbs: { bg: colors.warningBg, text: colors.warning, label: '碳水', unit: 'g' },
  fat: { bg: colors.dangerBg, text: colors.danger, label: '脂肪', unit: 'g' },
}

export function StatBadge({ type = 'calories', value, unit, label }) {
  const c = nutrientConfig[type] || nutrientConfig.calories
  return (
    <div style={{
      backgroundColor: c.bg, borderRadius: radius.md,
      paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minWidth: 64, flex: 1,
    }}>
      <div style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: c.text, lineHeight: '22px' }}>
        {value}<span style={{ fontSize: fontSize.sm, fontWeight: fontWeight.regular }}>{unit || c.unit}</span>
      </div>
      <div style={{ fontSize: fontSize.xs, color: c.text, opacity: 0.7, marginTop: 2 }}>{label || c.label}</div>
    </div>
  )
}
