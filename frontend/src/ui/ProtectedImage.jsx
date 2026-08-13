import React, { useEffect, useState } from 'react'
import { apiClient } from '../api/client'

export function ProtectedImage({ src, alt, ...imgProps }) {
  const [objectUrl, setObjectUrl] = useState(null)

  useEffect(() => {
    if (!src) {
      setObjectUrl(null)
      return undefined
    }

    let cancelled = false
    let nextObjectUrl = null
    setObjectUrl(null)
    apiClient(src, { _raw: true })
      .then((response) => {
        if (!response.ok) throw new Error('图片加载失败')
        return response.blob()
      })
      .then((blob) => {
        if (cancelled) return
        nextObjectUrl = URL.createObjectURL(blob)
        setObjectUrl(nextObjectUrl)
      })
      .catch(() => {
        if (!cancelled) setObjectUrl(null)
      })

    return () => {
      cancelled = true
      if (nextObjectUrl) URL.revokeObjectURL(nextObjectUrl)
    }
  }, [src])

  if (!objectUrl) return null
  return <img src={objectUrl} alt={alt} {...imgProps} />
}
