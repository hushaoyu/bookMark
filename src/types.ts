// 链接项类型定义
export interface LinkItem {
  id: string
  title: string
  url: string
  tags: string[]
}

// 备忘录项类型定义
export interface NoteItem {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
  updatedAt: string
  isPinned: boolean
  tasks?: TaskItem[]
}

// 任务项类型定义
export interface TaskItem {
  id: string
  text: string
  completed: boolean
}

// 备忘录分类类型定义
export interface NoteCategory {
  id: string
  name: string
  color: string
  icon: string
}

// 验证优先级类型
export type AuthPriority = 'none' | 'password' | 'biometric' | 'both'

// 验证配置类型
export interface AuthConfig {
  // 是否启用验证
  enabled: boolean
  // 验证优先级
  priority: AuthPriority
  // 是否已设置密码
  passwordSet?: boolean
  // 是否已注册生物识别
  biometricRegistered: boolean
  // 最后验证时间
  lastVerifiedAt?: number
}