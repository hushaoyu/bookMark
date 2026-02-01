/**
 * 安全工具模块
 * 提供密码哈希、输入净化、URL 验证等安全功能
 */

/**
 * 生成随机盐值
 * @returns 16字节的随机盐值（十六进制字符串）
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 使用 SHA-256 哈希密码
 * @param password 原始密码
 * @param salt 盐值
 * @returns 哈希后的密码（十六进制字符串）
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 验证密码
 * @param password 输入的密码
 * @param hashedPassword 存储的哈希密码（格式：salt:hash）
 * @returns 密码是否匹配
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const [salt, hash] = hashedPassword.split(':');
    if (!salt || !hash) return false;
    
    const computedHash = await hashPassword(password, salt);
    return computedHash === hash;
  } catch (error) {
    console.error('密码验证失败:', error);
    return false;
  }
}

/**
 * 验证 URL 格式
 * @param url 要验证的 URL
 * @returns URL 是否有效且安全
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // 检查是否为 localhost（开发环境）
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return true;
    }
    
    // 检查是否为内网 IP（可选，根据需求）
    const privateIpPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./
    ];
    
    if (privateIpPatterns.some(pattern => pattern.test(hostname))) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 净化 HTML 内容，防止 XSS 攻击
 * 注意：此函数需要 DOMPurify 库
 * 如果未安装，将返回转义后的纯文本
 * @param html 要净化的 HTML 内容
 * @returns 净化后的安全内容
 */
export function sanitizeHtml(html: string): string {
  // 简单的 HTML 转义（如果未安装 DOMPurify）
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return html.replace(/[&<>"'/]/g, char => escapeMap[char]);
}

/**
 * 验证输入长度
 * @param input 输入字符串
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @returns 是否在有效范围内
 */
export function isValidLength(
  input: string,
  minLength: number = 0,
  maxLength: number = 1000
): boolean {
  return input.length >= minLength && input.length <= maxLength;
}

/**
 * 验证标签格式
 * @param tag 标签字符串
 * @returns 标签是否有效
 */
export function isValidTag(tag: string): boolean {
  // 标签只允许字母、数字、中文和部分符号
  const tagRegex = /^[\u4e00-\u9fa5a-zA-Z0-9\-_]+$/;
  return isValidLength(tag, 1, 50) && tagRegex.test(tag);
}

/**
 * 验证标题格式
 * @param title 标题字符串
 * @returns 标题是否有效
 */
export function isValidTitle(title: string): boolean {
  return isValidLength(title, 1, 200);
}

/**
 * 验证内容格式
 * @param content 内容字符串
 * @returns 内容是否有效
 */
export function isValidContent(content: string): boolean {
  return isValidLength(content, 0, 10000);
}

/**
 * 生成安全的 ID
 * @returns 安全的唯一 ID
 */
export function generateSecureId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}
