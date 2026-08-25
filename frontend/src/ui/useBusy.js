// 同步忙态闩锁：双击/连点重复提交防护
// 仅靠 setState 守卫不可靠——React 状态更新是异步的，两次快速点击在组件重渲染前
// 都会读到旧值（如 adding=false），导致重复提交（重复记录/重复打卡/重复请求）。
// 本钩子在调用瞬间用 ref 同步置位，任务完成/失败后统一复位。
import { useState } from 'react'

/** 纯函数锁（不依赖 React，可直接单测） */
export function createBusyLock() {
  let locked = false
  return {
    /** 同步尝试上锁：成功返回 true，已锁定返回 false */
    tryLock() {
      if (locked) return false
      locked = true
      return true
    },
    unlock() {
      locked = false
    }
  }
}

/**
 * useBusy：返回 { busy, run }
 * - busy：忙态标志（用于按钮 disabled/文案）
 * - run(fn)：已锁定则立即返回 false 且不执行；否则同步上锁后执行 fn，
 *   无论成功失败最终释放锁（fn 抛出的异常原样向上传播，由调用方 try/catch 处理）
 */
export function useBusy() {
  // useState 惰性初始化：锁实例在组件生命周期内保持稳定（避免渲染期访问 ref）
  const [lock] = useState(() => createBusyLock())
  const [busy, setBusy] = useState(false)

  async function run(fn) {
    if (!lock.tryLock()) return false
    setBusy(true)
    try {
      await fn()
      return true
    } finally {
      lock.unlock()
      setBusy(false)
    }
  }

  return { busy, run }
}

export default useBusy
