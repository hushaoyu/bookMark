/**
 * WebAuthn 生物识别服务
 * 支持指纹、面部识别等生物特征验证
 */

// WebAuthn 凭据存储接口
export interface WebAuthnCredential {
  id: string
  publicKey: string
  counter: number
  createdAt: number
}

// WebAuthn 注册选项
export interface RegisterOptions {
  username: string
  displayName: string
  challenge?: Uint8Array
}

// WebAuthn 验证选项
export interface VerifyOptions {
  credentialId?: string
  challenge?: Uint8Array
}

// WebAuthn 服务类
class WebAuthnService {
  private readonly CREDENTIALS_KEY = 'webauthn_credentials'
  private readonly RP_NAME = '链接管理器'

  /**
   * 检查浏览器是否支持 WebAuthn
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'credentials' in navigator &&
      typeof navigator.credentials.create === 'function' &&
      typeof navigator.credentials.get === 'function'
    )
  }

  /**
   * 检查设备是否支持生物识别
   */
  async isBiometricAvailable(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    try {
      // 尝试检查平台认证器是否可用
      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      return isAvailable
    } catch (error) {
      console.error('检查生物识别支持失败:', error)
      return false
    }
  }

  /**
   * 生成随机挑战
   */
  private generateChallenge(): Uint8Array {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return array
  }

  /**
   * 生成用户 ID
   */
  private generateUserId(): Uint8Array {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return array
  }

  /**
   * ArrayBuffer 转 Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Base64 转 ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * 保存凭据到本地存储
   */
  private saveCredential(credential: WebAuthnCredential): void {
    const credentials = this.getAllCredentials()
    credentials.push(credential)
    localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(credentials))
  }

  /**
   * 获取所有凭据
   */
  private getAllCredentials(): WebAuthnCredential[] {
    const data = localStorage.getItem(this.CREDENTIALS_KEY)
    return data ? JSON.parse(data) : []
  }

  /**
   * 获取指定凭据
   */
  private getCredential(id: string): WebAuthnCredential | null {
    const credentials = this.getAllCredentials()
    return credentials.find(c => c.id === id) || null
  }

  /**
   * 删除凭据
   */
  deleteCredential(id: string): boolean {
    const credentials = this.getAllCredentials()
    const filtered = credentials.filter(c => c.id !== id)
    if (filtered.length !== credentials.length) {
      localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(filtered))
      return true
    }
    return false
  }

  /**
   * 清除所有凭据
   */
  clearAllCredentials(): void {
    localStorage.removeItem(this.CREDENTIALS_KEY)
  }

  /**
   * 检查是否已注册凭据
   */
  hasRegisteredCredentials(): boolean {
    return this.getAllCredentials().length > 0
  }

  /**
   * 注册生物识别凭据
   */
  async register(options: RegisterOptions): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: '浏览器不支持 WebAuthn' }
    }

    try {
      const challenge = options.challenge || this.generateChallenge()
      const userId = this.generateUserId()

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: challenge.buffer as ArrayBuffer,
        rp: {
          name: this.RP_NAME,
          id: window.location.hostname
        },
        user: {
          id: userId.buffer as ArrayBuffer,
          name: options.username,
          displayName: options.displayName
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000
      }

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      })) as PublicKeyCredential

      if (!credential) {
        return { success: false, error: '创建凭据失败' }
      }

      const response = credential.response as AuthenticatorAttestationResponse

      // 获取公钥
      const publicKey = response.getPublicKey()
      if (!publicKey) {
        return { success: false, error: '无法获取公钥' }
      }

      // 保存凭据信息
      const webAuthnCredential: WebAuthnCredential = {
        id: this.arrayBufferToBase64(credential.rawId),
        publicKey: this.arrayBufferToBase64(publicKey),
        counter: 0,
        createdAt: Date.now()
      }

      this.saveCredential(webAuthnCredential)

      return { success: true }
    } catch (error: any) {
      console.error('注册生物识别失败:', error)
      
      // 处理常见错误
      if (error.name === 'NotAllowedError') {
        return { success: false, error: '用户取消操作' }
      } else if (error.name === 'SecurityError') {
        return { success: false, error: '安全错误：请确保使用 HTTPS' }
      } else if (error.name === 'NotSupportedError') {
        return { success: false, error: '设备不支持此操作' }
      }
      
      return { success: false, error: error.message || '注册失败' }
    }
  }

  /**
   * 验证生物识别
   */
  async verify(options: VerifyOptions = {}): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: '浏览器不支持 WebAuthn' }
    }

    const credentials = this.getAllCredentials()
    if (credentials.length === 0) {
      return { success: false, error: '未注册生物识别' }
    }

    try {
      const challenge = options.challenge || this.generateChallenge()
      const credentialId = options.credentialId || credentials[0].id

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge.buffer as ArrayBuffer,
        rpId: window.location.hostname,
        allowCredentials: [
          {
            id: this.base64ToArrayBuffer(credentialId),
            type: 'public-key'
          }
        ],
        userVerification: 'required',
        timeout: 60000
      }

      const assertion = (await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      })) as PublicKeyCredential

      if (!assertion) {
        return { success: false, error: '验证失败' }
      }

      // 更新计数器
      const credential = this.getCredential(credentialId)
      if (credential) {
        credential.counter += 1
        this.saveCredential(credential)
      }

      return { success: true }
    } catch (error: any) {
      console.error('生物识别验证失败:', error)
      
      if (error.name === 'NotAllowedError') {
        return { success: false, error: '用户取消操作' }
      } else if (error.name === 'SecurityError') {
        return { success: false, error: '安全错误：请确保使用 HTTPS' }
      }
      
      return { success: false, error: error.message || '验证失败' }
    }
  }

  /**
   * 获取已注册凭据列表
   */
  getRegisteredCredentials(): Array<{ id: string; createdAt: number }> {
    return this.getAllCredentials().map(c => ({
      id: c.id,
      createdAt: c.createdAt
    }))
  }
}

// 导出单例
export const webAuthnService = new WebAuthnService()
