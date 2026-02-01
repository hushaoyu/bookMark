import { useState, useEffect, useCallback } from 'react'

/**
 * 更新检查状态接口
 */
interface UpdateCheckerState {
  hasUpdate: boolean
  isChecking: boolean
  error: string | null
}

/**
 * useUpdateChecker Hook
 * 用于管理 PWA 应用更新检查功能
 */
const useUpdateChecker = () => {
  const [autoCheckUpdate, setAutoCheckUpdate] = useState<boolean>(() => {
    const saved = localStorage.getItem('autoCheckUpdate')
    return saved ? JSON.parse(saved) : false
  })
  const [updateState, setUpdateState] = useState<UpdateCheckerState>({
    hasUpdate: false,
    isChecking: false,
    error: null
  })

  /**
   * 切换自动检查更新设置
   */
  const toggleAutoCheckUpdate = useCallback((enabled: boolean) => {
    setAutoCheckUpdate(enabled)
    localStorage.setItem('autoCheckUpdate', JSON.stringify(enabled))
  }, [])

  /**
   * 检查是否有新版本
   */
  const checkForUpdate = useCallback(async () => {
    setUpdateState(prev => ({ ...prev, isChecking: true, error: null }))

    try {
      // 注册 Service Worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()

        if (!registration) {
          setUpdateState({
            hasUpdate: false,
            isChecking: false,
            error: 'Service Worker 未注册'
          })
          return
        }

        // 检查是否有更新
        await registration.update()

        // 监听更新发现事件
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 有新版本可用
                setUpdateState({
                  hasUpdate: true,
                  isChecking: false,
                  error: null
                })
              }
            })
          }
        })

        // 等待一段时间检查是否有新 worker
        setTimeout(() => {
          setUpdateState(prev => ({
            ...prev,
            isChecking: false
          }))
        }, 2000)
      }
    } catch (error) {
      setUpdateState({
        hasUpdate: false,
        isChecking: false,
        error: error instanceof Error ? error.message : '检查更新失败'
      })
    }
  }, [])

  /**
   * 应用更新并重新加载页面
   */
  const applyUpdate = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          // 发送消息给等待中的 service worker，让它激活
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })

          // 监听控制权变更
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload()
          })
        }
      })
    }
  }, [])

  /**
   * 忽略更新提示
   */
  const dismissUpdate = useCallback(() => {
    setUpdateState({
      hasUpdate: false,
      isChecking: false,
      error: null
    })
  }, [])

  /**
   * 应用启动时自动检查更新
   */
  useEffect(() => {
    if (autoCheckUpdate) {
      checkForUpdate()
    }
  }, [autoCheckUpdate, checkForUpdate])

  /**
   * 监听 Service Worker 的更新
   */
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        // 当新的 service worker 接管控制权时，重新加载页面
        window.location.reload()
      }

      const handleUpdate = () => {
        setUpdateState({
          hasUpdate: true,
          isChecking: false,
          error: null
        })
      }

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
      navigator.serviceWorker.addEventListener('update', handleUpdate)

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
        navigator.serviceWorker.removeEventListener('update', handleUpdate)
      }
    }
  }, [])

  return {
    autoCheckUpdate,
    toggleAutoCheckUpdate,
    checkForUpdate,
    applyUpdate,
    dismissUpdate,
    ...updateState
  }
}

export default useUpdateChecker
