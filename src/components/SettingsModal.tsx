import React, { useState, useEffect } from 'react'
import styles from '../styles/components/settingsModal.module.css'
import { calculateTotalCacheSize, formatBytes, clearAllCache, getCacheItemsInfo, CacheItemInfo } from '../utils/storageUtils'

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
  const [cacheSize, setCacheSize] = useState<string>('0 B');
  const [cacheItems, setCacheItems] = useState<CacheItemInfo[]>([]);

  // 计算缓存大小和获取缓存项信息
  const updateCacheInfo = () => {
    const size = calculateTotalCacheSize();
    setCacheSize(formatBytes(size));
    setCacheItems(getCacheItemsInfo());
  };

  // 清除缓存
  const handleClearCache = () => {
    if (window.confirm('确定要清除所有缓存数据吗？这将删除所有链接和备忘录。')) {
      clearAllCache();
      updateCacheInfo();
      // 提示用户清除成功
      alert('缓存已清除，请刷新页面以重新加载应用。');
    }
  };

  // 当组件打开时，更新缓存信息
  useEffect(() => {
    if (isOpen) {
      updateCacheInfo();
    }
  }, [isOpen]);

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
            <h3 className={styles.settingSectionTitle}>存储设置</h3>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>缓存大小</label>
                <p className={styles.settingDescription}>
                  当前本地存储使用: {cacheSize}
                </p>
              </div>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>缓存项详情</label>
                <div className={styles.cacheItemsTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>键名</th>
                        <th>大小</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cacheItems.length > 0 ? (
                        cacheItems.map((item, index) => (
                          <tr key={index}>
                            <td>{item.key}</td>
                            <td>{item.formattedSize}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className={styles.emptyCache}>
                            无缓存数据
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>清除缓存</label>
                <p className={styles.settingDescription}>
                  清除所有本地存储的数据，包括链接和备忘录
                </p>
              </div>
              <button
                className={styles.btnDanger}
                onClick={handleClearCache}
              >
                清除缓存
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
