import React, { useEffect, useState } from 'react'
import styles from '../styles/components/updateChecker.module.css'

/**
 * UpdateChecker 组件属性接口
 */
interface UpdateCheckerProps {
  hasUpdate: boolean
  isChecking: boolean
  error: string | null
  onApplyUpdate: () => void
  onDismissUpdate: () => void
}

/**
 * UpdateChecker 组件
 * 用于显示应用更新提示
 */
const UpdateChecker: React.FC<UpdateCheckerProps> = ({
  hasUpdate,
  isChecking,
  error,
  onApplyUpdate,
  onDismissUpdate
}) => {
  const [showCloseButton, setShowCloseButton] = useState(false)

  // 检查中或错误状态，显示关闭按钮并自动消失
  useEffect(() => {
    if (isChecking || error) {
      setShowCloseButton(true)
      const timer = setTimeout(() => {
        onDismissUpdate()
      }, 3000) // 3秒后自动消失
      return () => clearTimeout(timer)
    } else {
      setShowCloseButton(false)
    }
  }, [isChecking, error, onDismissUpdate])

  // 如果没有更新且不在检查中，不显示组件
  if (!hasUpdate && !isChecking && !error) {
    return null
  }

  return (
    <div className={styles.updateChecker}>
      {isChecking && (
        <div className={`${styles.updateBanner} ${styles.checking}`}>
          <div className={styles.updateIcon}>🔄</div>
          <div className={styles.updateContent}>
            <p className={styles.updateTitle}>正在检查更新...</p>
          </div>
          {showCloseButton && (
            <button className={styles.btnClose} onClick={onDismissUpdate}>
              ✕
            </button>
          )}
        </div>
      )}

      {hasUpdate && !isChecking && (
        <div className={`${styles.updateBanner} ${styles.available}`}>
          <div className={styles.updateIcon}>🎉</div>
          <div className={styles.updateContent}>
            <p className={styles.updateTitle}>发现新版本</p>
            <p className={styles.updateMessage}>点击更新按钮以获取最新功能和修复</p>
          </div>
          <div className={styles.updateActions}>
            <button className={styles.btnUpdate} onClick={onApplyUpdate}>
              立即更新
            </button>
            <button className={styles.btnDismiss} onClick={onDismissUpdate}>
              稍后
            </button>
          </div>
        </div>
      )}

      {error && !isChecking && (
        <div className={`${styles.updateBanner} ${styles.error}`}>
          <div className={styles.updateIcon}>⚠️</div>
          <div className={styles.updateContent}>
            <p className={styles.updateTitle}>检查更新失败</p>
            <p className={styles.updateMessage}>{error}</p>
          </div>
          {showCloseButton && (
            <button className={styles.btnClose} onClick={onDismissUpdate}>
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default UpdateChecker
