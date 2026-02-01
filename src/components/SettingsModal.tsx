import React from 'react'
import styles from '../styles/components/settingsModal.module.css'

/**
 * SettingsModal 组件属性接口
 */
interface SettingsModalProps {
  isOpen: boolean
  autoCheckUpdate: boolean
  onClose: () => void
  onToggleAutoCheckUpdate: (enabled: boolean) => void
  onCheckForUpdate: () => void
  isChecking: boolean
}

/**
 * SettingsModal 组件
 * 用于显示应用设置选项
 */
const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  autoCheckUpdate,
  onClose,
  onToggleAutoCheckUpdate,
  onCheckForUpdate,
  isChecking
}) => {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>应用设置</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.settingSection}>
            <h3 className={styles.settingSectionTitle}>更新设置</h3>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>自动检查更新</label>
                <p className={styles.settingDescription}>
                  每次打开应用时自动检查是否有新版本
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={autoCheckUpdate}
                  onChange={(e) => onToggleAutoCheckUpdate(e.target.checked)}
                  className={styles.switchInput}
                />
                <span className={styles.switchSlider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>手动检查更新</label>
                <p className={styles.settingDescription}>
                  立即检查应用是否有新版本
                </p>
              </div>
              <button
                className={styles.btnCheckUpdate}
                onClick={onCheckForUpdate}
                disabled={isChecking}
              >
                {isChecking ? '检查中...' : '检查更新'}
              </button>
            </div>
          </div>

          <div className={styles.settingSection}>
            <h3 className={styles.settingSectionTitle}>关于</h3>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>版本信息</label>
                <p className={styles.settingDescription}>
                  链接管理器 PWA v1.0.0
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnPrimary} onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
