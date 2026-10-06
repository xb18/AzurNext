/**
 * @fileoverview 版本更新状态与检查 Hook。
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import type { UpdateStatus } from '../api/types'
import { notifyDesktop } from '../desktop/alasDesktop'
import { useConnection } from './context'

export function useUpdater() {
  const connection = useConnection()
  const [data, setData] = useState<UpdateStatus>()
  const [error, setError] = useState('')
  const [generation, setGeneration] = useState(0)
  const notifiedHeadRef = useRef<string | null>(null)
  const refresh = useCallback(() => setGeneration(value => value + 1), [])
  useEffect(() => {
    if (connection !== 'ready') return
    let active = true
    let timer: ReturnType<typeof setTimeout>
    async function poll() {
      try {
        const value = await api.request('updater.status', {})
        if (active) {
          setData(value)
          setError('')
          const headKey = value.upstreamHead || 'available'
          if (value.available && notifiedHeadRef.current !== headKey) {
            notifiedHeadRef.current = headKey
            notifyDesktop('发现新版本', '检测到新的版本更新，请前往更新管理页面查看。')
          }
        }
      } catch (error) {if (active) setError((error as Error).message)}
      if (active) timer = setTimeout(poll, 3000)
    }
    void poll()
    return () => {active = false; clearTimeout(timer)}
  }, [connection, generation])
  return {data, error, refresh}
}

export type UpdaterState = ReturnType<typeof useUpdater>
