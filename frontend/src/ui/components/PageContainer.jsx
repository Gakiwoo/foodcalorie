import { pageContainerStyle } from '../theme'

export function PageContainer({ children, style, id = 'main-content', tabIndex = -1 }) {
  return (
    <main id={id} tabIndex={tabIndex} style={{ ...pageContainerStyle, ...style, outline: 'none' }}>
      {children}
    </main>
  )
}
