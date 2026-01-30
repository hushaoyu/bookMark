import React from 'react'
import Modal from './Modal'
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
  handleVerifyPassword,
  handleSetPassword,
  handleClearPassword,
  handleCloseVerify,
  handleCloseSetting
}) => {
  return (
    <>
      {/* 密码验证弹框 */}
      <Modal
        isOpen={isVerifyOpen}
        onClose={handleCloseVerify}
        title="请输入密码"
      >
        <div className={styles.passwordModalContent}>
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
            {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
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
