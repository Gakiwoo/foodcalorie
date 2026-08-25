import { describe, expect, it } from 'vitest'
import { createBusyLock } from './useBusy'

describe('createBusyLock 同步闩锁（双击/连点重复提交防护）', () => {
  it('首次 tryLock 成功；未解锁前重复 tryLock 全部失败', () => {
    const lock = createBusyLock()
    expect(lock.tryLock()).toBe(true)
    expect(lock.tryLock()).toBe(false)
    expect(lock.tryLock()).toBe(false)
  })

  it('unlock 后可以再次上锁（下一次提交不受影响）', () => {
    const lock = createBusyLock()
    expect(lock.tryLock()).toBe(true)
    lock.unlock()
    expect(lock.tryLock()).toBe(true)
    lock.unlock()
    expect(lock.tryLock()).toBe(true)
  })

  it('锁状态在 tryLock 调用瞬间同步生效，不依赖异步状态更新', () => {
    const lock = createBusyLock()
    // 模拟两次紧密连点：第一次上锁后立即第二次 tryLock，必须被拦截
    const first = lock.tryLock()
    const second = lock.tryLock()
    expect(first).toBe(true)
    expect(second).toBe(false)
  })

  it('多实例锁相互独立', () => {
    const a = createBusyLock()
    const b = createBusyLock()
    expect(a.tryLock()).toBe(true)
    expect(b.tryLock()).toBe(true)
  })
})
