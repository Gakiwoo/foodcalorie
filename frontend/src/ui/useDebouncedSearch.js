// 防抖搜索钩子：输入防抖 + 请求序号守卫（丢弃过期响应）+ loading/searched 状态
// 收敛 AddFood/Search 两份逐字重复的搜索 effect。
import { useEffect, useRef, useState } from 'react'
import { toast } from './toast'

/**
 * @param {string} keyword 输入关键词
 * @param {(kw: string) => Promise<{ data: { list: any[] } }>} fetcher
 *        搜索函数（返回 http.get 结果；调用方需用 useCallback 保持引用稳定）
 * @param {number} delay 防抖毫秒，默认 350
 * @returns {{ loading, searched, results, setResults }}
 */
export function useDebouncedSearch(keyword, fetcher, delay = 350) {
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState([])
  const timer = useRef(null)
  const seq = useRef(0) // 请求序号守卫：仅最新一次请求的结果允许写入 state

  useEffect(() => {
    clearTimeout(timer.current)
    if (!keyword.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    const current = ++seq.current
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await fetcher(keyword.trim())
        if (current !== seq.current) return // 已有更新的关键词，丢弃过期响应
        setResults(r.data.list || [])
        setSearched(true)
      } catch (e) {
        if (current !== seq.current) return
        toast(e.message || '搜索失败')
      } finally {
        if (current === seq.current) setLoading(false)
      }
    }, delay)
    return () => clearTimeout(timer.current)
  }, [keyword, fetcher, delay])

  return { loading, searched, results, setResults }
}

export default useDebouncedSearch
