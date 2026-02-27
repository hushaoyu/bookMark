import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { webAuthnService } from '../services/webAuthnService'
import { AuthConfig } from '../types'
import styles from '../styles/components/password-modal.module.css'

interface PasswordModalProps {
  isVerifyOpen: boolean
  isSettingOpen: boolean
  passwordSet: boolean
  password: string
  setPassword: (value: string) => void
  passwordError: string
  newPassword: string
  setNewPassword: (value: string) => void
  passwordConfirm: string
  setPasswordConfirm: (value: string) => void
  passwordSettingError: string
  handleVerifyPassword: () => void
  handleSetPassword: () => void
  handleClearPassword: () => void
  handleCloseVerify: () => void
  handleCloseSetting: () => void
  authConfig?: AuthConfig
  onBiometricVerify?: () => void
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isVerifyOpen,
  isSettingOpen,
  passwordSet,
  password,
  setPassword,
  passwordError,
  newPassword,
  setNewPassword,
  passwordConfirm,
  setPasswordConfirm,
  passwordSettingError,
  handleVerifyPassword,
  handleSetPassword,
  handleClearPassword,
  handleCloseVerify,
  handleCloseSetting,
  authConfig,
  onBiometricVerify
}) => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false)
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState(false)
  const [biometricError, setBiometricError] = useState('')

  // 检查生物识别支持
  useEffect(() => {
    const checkBiometricSupport = async () => {
      const supported = webAuthnService.isSupported()
      
      if (supported) {
        const available = await webAuthnService.isBiometricAvailable()
        setIsBiometricAvailable(available)
      }
    }

    if (isVerifyOpen && authConfig?.biometricRegistered) {
      checkBiometricSupport()
    }
  }, [isVerifyOpen, authConfig?.biometricRegistered])

  // 使用生物识别验证
  const handleBiometricVerify = async () => {
    setIsVerifyingBiometric(true)
    setBiometricError('')

    const result = await webAuthnService.verify()

    setIsVerifyingBiometric(false)

    if (result.success) {
      onBiometricVerify?.()
    } else {
      setBiometricError(result.error || '生物识别验证失败')
    }
  }

  // 判断是否显示生物识别选项
  const showBiometricOption =
    isVerifyOpen &&
    authConfig?.biometricRegistered &&
    (authConfig.priority === 'biometric' || authConfig.priority === 'both')

  return (
    <>
      {/* 密码验证弹框 */}
      <Modal
        isOpen={isVerifyOpen}
        onClose={handleCloseVerify}
        title="身份验证"
      >
        <div className={styles.passwordModalContent}>
          {/* 生物识别选项 */}
          {showBiometricOption && isBiometricAvailable && (
            <div className={styles.biometricSection}>
              <button
                className={styles.biometricButton}
                onClick={handleBiometricVerify}
                disabled={isVerifyingBiometric}
              >
                <svg className={styles.biometricIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                {isVerifyingBiometric ? '验证中...' : '使用生物识别'}
              </button>
              {biometricError && (
                <div className={styles.errorMessage}>{biometricError}</div>
              )}
              <div className={styles.divider}>
                <span>或</span>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className={styles.passwordInput}
              onKeyPress={(e) => e.key === 'Enter' && handleVerifyPassword()}
              autoFocus={!showBiometricOption || !isBiometricAvailable}
            />
            {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
          </div>
          <div className={styles.modalActions}>
            <button className={styles.btnPrimary} onClick={handleVerifyPassword}>
              确认
            </button>
          </div>
        </div>
      </Modal>
      
      {/* 密码设置弹框 */}
      <Modal
        isOpen={isSettingOpen}
        onClose={handleCloseSetting}
        title={passwordSet ? '修改密码' : '设置密码'}
      >
        <div className={styles.passwordModalContent}>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">新密码</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少4位）"
                className={styles.passwordInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="passwordConfirm">确认密码</label>
              <input
                type="password"
                id="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="请再次输入密码"
                className={styles.passwordInput}
              />
            </div>
            {passwordSettingError && <div className={styles.errorMessage}>{passwordSettingError}</div>}
            <div className={styles.modalActions}>
              <button className={styles.btnPrimary} onClick={handleSetPassword}>
                保存
              </button>
              {passwordSet && (
                <button className={styles.btnDanger} onClick={handleClearPassword}>
                  清除密码
                </button>
              )}
            </div>
          </div>
      </Modal>
    </>
  )
}

export default PasswordModal
