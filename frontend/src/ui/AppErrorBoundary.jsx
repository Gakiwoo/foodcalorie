import React from 'react'

export default class AppErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[startup] React render failed', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="startup-error" role="alert">
        <div className="startup-error__mark" aria-hidden="true">!</div>
        <h1>食刻暂时无法启动</h1>
        <p>请检查网络后重新打开。若问题持续，请更新到最新版本。</p>
        <button type="button" onClick={() => window.location.reload()}>重新加载</button>
      </main>
    )
  }
}
