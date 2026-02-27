import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { webAuthnService } from '../services/webAuthnService'
import { AuthConfig, AuthPriority } from '../types'
import styles from '../styles/components/auth-settings.module.css'

interface AuthSettingsProps {
  isOpen: boolean
  onClose: () => void
  config: AuthConfig
  onConfigChange: (config: AuthConfig) => void
}

const AuthSettings: React.FC<AuthSettingsProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange
}) => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false)
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false)
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState(false)

  // 检查生物识别支持
  useEffect(() => {
    const checkBiometricSupport = async () => {
      const supported = webAuthnService.isSupported()
      setIsBiometricSupported(supported)
      
      if (supported) {
        setIsCheckingBiometric(true)
        const available = await webAuthnService.isBiometricAvailable()
        setIsBiometricAvailable(available)
        setIsCheckingBiometric(false)
      }
    }

    if (isOpen) {
      checkBiometricSupport()
    }
  }, [isOpen])

  // 更新配置
  const updateConfig = (updates: Partial<AuthConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  // 切换验证启用状态
  const handleToggleEnabled = (enabled: boolean) => {
    updateConfig({ enabled })
  }

  // 更改验证优先级
  const handlePriorityChange = (priority: AuthPriority) => {
    updateConfig({ priority })
  }

  // 注册生物识别
  const handleRegisterBiometric = async () => {
    if (!config.passwordSet) {
      setRegisterError('请先设置密码后再注册生物识别')
      return
    }

    setIsRegistering(true)
    setRegisterError('')
    setRegisterSuccess(false)

    const result = await webAuthnService.register({
      username: 'user',
      displayName: '用户'
    })

    setIsRegistering(false)

    if (result.success) {
      setRegisterSuccess(true)
      updateConfig({ biometricRegistered: true })
      setTimeout(() => setRegisterSuccess(false), 3000)
    } else {
      setRegisterError(result.error || '注册失败')
    }
  }

  // 删除生物识别
  const handleDeleteBiometric = () => {
    if (window.confirm('确定要删除生物识别吗？删除后需要重新注册')) {
      webAuthnService.clearAllCredentials()
      updateConfig({ biometricRegistered: false })
    }
  }

  // 获取优先级选项
  const getPriorityOptions = (): Array<{ value: AuthPriority; label: string; description: string }> => {
    const options: Array<{ value: AuthPriority; label: string; description: string }> = []

    // 只有在未启用验证时才显示"无需验证"选项
    if (!config.enabled) {
      options.push({ value: 'none', label: '无需验证', description: '任何人都可以访问应用' })
    }

    if (config.passwordSet) {
      options.push({
        value: 'password',
        label: '仅密码',
        description: '使用密码验证身份'
      })
    }

    if (config.biometricRegistered) {
      options.push({
        value: 'biometric',
        label: '仅生物识别',
        description: '使用指纹或面部识别'
      })
    }

    if (config.passwordSet && config.biometricRegistered) {
      options.push({
        value: 'both',
        label: '密码 + 生物识别',
        description: '优先使用生物识别，失败时使用密码'
      })
    }

    return options
  }

  const priorityOptions = getPriorityOptions()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="安全设置">
      <div className={styles.authSettingsContent}>
        {/* 启用验证开关 */}
        <div className={styles.settingSection}>
          <div className={styles.settingHeader}>
            <h3>启用验证</h3>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleToggleEnabled(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
          <p className={styles.settingDescription}>
            启用后，打开应用时需要进行身份验证
          </p>
        </div>

        {/* 验证优先级 */}
        {config.enabled && (
          <div className={styles.settingSection}>
            <h3>验证方式</h3>
            <div className={styles.priorityOptions}>
              {priorityOptions.map((option) => (
                <label
                  key={option.value}
                  className={`${styles.priorityOption} ${
                    config.priority === option.value ? styles.active : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={config.priority === option.value}
                    onChange={() => handlePriorityChange(option.value)}
                  />
                  <div className={styles.optionContent}>
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span className={styles.optionDescription}>{option.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 生物识别设置 */}
        <div className={styles.settingSection}>
          <h3>生物识别</h3>
          
          {isCheckingBiometric ? (
            <p className={styles.checkingText}>检查设备支持中...</p>
          ) : !isBiometricSupported ? (
            <p className={styles.warningText}>您的浏览器不支持生物识别功能</p>
          ) : !isBiometricAvailable ? (
            <p className={styles.warningText}>您的设备不支持生物识别或未设置</p>
          ) : (
            <>
              {config.biometricRegistered ? (
                <div className={styles.biometricRegistered}>
                  <div className={styles.statusSuccess}>
                    ✓ 已注册生物识别
                  </div>
                  <button
                    className={styles.btnDanger}
                    onClick={handleDeleteBiometric}
                  >
                    删除生物识别
                  </button>
                </div>
              ) : (
                <div className={styles.biometricNotRegistered}>
                  <p className={styles.infoText}>
                    {config.passwordSet
                      ? '注册后可使用指纹或面部识别快速登录'
                      : '请先设置密码后再注册生物识别'}
                  </p>
                  <button
                    className={styles.btnPrimary}
                    onClick={handleRegisterBiometric}
                    disabled={!config.passwordSet || isRegistering}
                  >
                    {isRegistering ? '注册中...' : '注册生物识别'}
                  </button>
                  {registerError && (
                    <div className={styles.errorMessage}>{registerError}</div>
                  )}
                  {registerSuccess && (
                    <div className={styles.successMessage}>
                      生物识别注册成功！
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>



        {/* 密码设置提示 */}
        <div className={styles.settingSection}>
          <h3>密码设置</h3>
          <p className={styles.settingDescription}>
            {config.passwordSet
              ? '已设置密码，可在密码设置中修改'
              : '未设置密码，请在密码设置中设置'}
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default AuthSettings
