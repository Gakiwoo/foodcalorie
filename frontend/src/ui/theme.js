// 设计 Token：颜色、间距、圆角、阴影、字号、字重、层级
// 所有页面组件应引用此文件中的常量，禁止硬编码颜色/间距值。
// 取值来源：从现有 31 个页面组件和 common.jsx 中提取的实际使用值。

// ========== 颜色 ==========
export const colors = {
  // 品牌色（绿色系，与 common.jsx 主题绿 #34C759 一致）
  primary: '#34C759',
  primaryDark: '#22A85A',
  primaryLight: '#5DD47E',
  primaryBg: '#E8F5EC',       // 进度环轨道色 / 浅绿背景
  primaryShadow: 'rgba(52,199,89,0.35)',

  // 功能色
  success: '#34C759',
  successBg: '#E8F5EC',
  warning: '#FF9500',
  warningBg: '#FFF4E5',
  danger: '#FF3B30',
  dangerBg: '#FFE5E3',
  info: '#007AFF',
  infoBg: '#E5F0FF',

  // 中性色
  bg: '#F7F8FA',              // 页面背景（与 StatusBar 一致）
  surface: '#FFFFFF',           // 卡片/面板背景
  surfaceHover: '#F9FAFB',
  segBg: '#EEF0F2',             // 分段控件背景 / 底部导航边框
  border: '#E5E7EB',
  borderLight: '#F3F4F6',       // 缩略图占位背景

  // 文字
  textPrimary: '#1A1A1A',       // 主文字（导航/标题）
  textSecondary: '#6B7280',     // 次要文字
  textTertiary: '#9CA3AF',      // 辅助文字（时间/副标题）
  textInverse: '#FFFFFF',        // 反色文字（深色背景上）
  textDisabled: '#D1D5DB',       // 禁用文字 / 占位图标色
}

// ========== 间距 ==========
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,              // 页面左右内边距
  xxl: 24,
  xxxl: 28,            // 拍照大卡内边距
  page: 20,             // 页面左右内边距
  section: 12,          // 区块之间间距
}

// ========== 圆角 ==========
export const radius = {
  sm: 6,
  md: 10,
  lg: 12,              // 小元素/缩略图
  xl: 16,              // 卡片默认圆角（与 common.jsx Card 一致）
  xxl: 24,             // 拍照大卡
  pill: 999,            // 胶囊/圆形
  cta: 26,              // CTA 按钮
}

// ========== 阴影 ==========
export const shadow = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  md: '0 2px 12px rgba(0,0,0,0.05)',    // 卡片默认阴影（与 common.jsx Card 一致）
  lg: '0 4px 14px rgba(0,0,0,0.05)',     // 记录卡片阴影
  xl: '0 6px 16px rgba(0,0,0,0.12)',      // CTA 按钮
  primary: '0 14px 32px rgba(52,199,89,0.35)', // 拍照大卡
}

// ========== 字号 ==========
export const fontSize = {
  xs: 11,
  sm: 12,
  md: 13,              // 分段控件/查看全部
  lg: 14,              // 正文/副标题
  xl: 15,              // 列表项标题
  xxl: 16,             // 导航日期/卡路里数值
  xxxl: 17,            // 区块标题
  hero: 18,            // 导航标题
  display: 20,         // 拍照大卡标题
}

// ========== 字重 ==========
export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
}

// ========== 层级 ==========
export const zIndex = {
  base: 0,
  card: 1,
  sticky: 10,
  recordsBack: 60,
  overlay: 50,
  modal: 100,
  toast: 999,
  boot: 10000,
}

// ========== 常用复合样式 ==========

// 页面容器（与 Home.jsx line 36 一致）
export const pageContainerStyle = {
  width: '100%',
  minHeight: '100dvh',
  backgroundColor: colors.bg,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
}

// 卡片基础样式（与 common.jsx Card line 254 一致）
export const cardStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.xl,
  boxShadow: shadow.md,
  padding: spacing.lg,
}

// 记录卡片样式（与 Home.jsx line 100 一致）
export const recordCardStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: spacing.md,
  padding: spacing.md,
  backgroundColor: colors.surface,
  borderRadius: radius.xl,
  boxShadow: shadow.lg,
  cursor: 'pointer',
}

// 行布局（flex row + 居中对齐）
export const rowStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}

// 行布局 + 两端对齐
export const rowBetweenStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}

// 列布局
export const colStyle = {
  display: 'flex',
  flexDirection: 'column',
}

// 拍照大卡渐变背景
export const cameraGradient = 'linear-gradient(129deg, #34C759 0%, #22A85A 100%)'
