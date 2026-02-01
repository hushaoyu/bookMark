# 性能与安全修复实施指南

本文档提供了详细的步骤，帮助你逐步应用所有安全和性能优化。

## 📋 前置准备

### 1. 安装必要的依赖

```bash
# 安装类型定义（如果还没有）
npm install --save-dev @types/react @types/react-dom

# 安装 DOMPurify（用于 XSS 防护）
npm install dompurify @types/dompurify

# 安装 lodash-es（用于防抖等功能）
npm install lodash-es @types/lodash-es

# 可选：安装虚拟滚动库
npm install react-window @types/react-window
```

### 2. 备份现有代码

在开始修改之前，建议先备份现有代码：

```bash
# 创建备份分支
git checkout -b backup-before-optimization

# 或者复制整个项目
cp -r PWA PWA-backup
```

## 🔒 第一步：安全修复（高优先级）

### 1.1 应用密码哈希

**目标文件**：`src/App.tsx`

**操作步骤**：

1. 导入安全工具函数：
```typescript
import { 
  generateSalt, 
  hashPassword, 
  verifyPassword 
} from './utils/security'
```

2. 修改 `handleVerifyPassword` 函数：
```typescript
const handleVerifyPassword = async () => {
  const storedPassword = localStorage.getItem('password')
  
  if (!storedPassword) {
    setPasswordError('未设置密码')
    return
  }
  
  const isValid = await verifyPassword(password, storedPassword)
  
  if (isValid) {
    setIsAuthenticated(true)
    setIsPasswordVerifyOpen(false)
    setPassword('')
    setPasswordError('')
  } else {
    setPasswordError('密码错误，请重新输入')
  }
}
```

3. 修改 `handleSetPassword` 函数：
```typescript
const handleSetPassword = async () => {
  if (newPassword.length < 4) {
    setPasswordError('密码长度至少4位')
    return
  }

  if (newPassword !== passwordConfirm) {
    setPasswordError('两次输入的密码不一致')
    return
  }

  try {
    const salt = generateSalt()
    const hashedPassword = await hashPassword(newPassword, salt)
    const storedPassword = `${salt}:${hashedPassword}`
    
    localStorage.setItem('password', storedPassword)
    setPasswordSet(true)
    setIsPasswordSettingOpen(false)
    setNewPassword('')
    setPasswordConfirm('')
    setPasswordError('')
  } catch (error) {
    console.error('密码设置失败:', error)
    setPasswordError('密码设置失败，请重试')
  }
}
```

### 1.2 应用输入验证

**目标文件**：`src/App.tsx`

在 `handleAddLink` 函数中添加验证：

```typescript
import { isValidUrl, isValidTitle, isValidTag, generateSecureId } from './utils/security'

const handleAddLink = (link: Omit<LinkItem, 'id'>) => {
  // 验证 URL
  if (!isValidUrl(link.url)) {
    alert('URL 格式不正确，请输入有效的 URL')
    return
  }
  
  // 验证标题
  if (!isValidTitle(link.title)) {
    alert('标题长度必须在 1-200 个字符之间')
    return
  }
  
  // 验证标签
  const invalidTags = link.tags.filter(tag => !isValidTag(tag))
  if (invalidTags.length > 0) {
    alert(`以下标签格式不正确：${invalidTags.join(', ')}`)
    return
  }
  
  const newLink: LinkItem = {
    ...link,
    id: generateSecureId()
  }
  
  setLinks(prevLinks => [...prevLinks, newLink])
}
```

### 1.3 应用 XSS 防护

**目标文件**：`src/components/NoteDetail.tsx`

1. 导入 DOMPurify：
```typescript
import DOMPurify from 'dompurify'
```

2. 修改内容渲染：
```typescript
<div className={styles.detailContent}>
  <pre 
    className={styles.contentText}
    dangerouslySetInnerHTML={{ 
      __html: DOMPurify.sanitize(note.content) 
    }}
  />
</div>
```

或者更安全的方式（如果不需要 HTML 格式）：
```typescript
<div className={styles.detailContent}>
  <pre className={styles.contentText}>
    {note.content}
  </pre>
</div>
```

## ⚡ 第二步：性能优化（中优先级）

### 2.1 应用优化的 useLocalStorage

**目标文件**：`src/App.tsx`

1. 替换导入：
```typescript
import useLocalStorage from './hooks/useLocalStorageOptimized'
```

2. 使用优化后的 hook（可以指定防抖延迟）：
```typescript
const [links, setLinks] = useLocalStorage<LinkItem[]>('links', [], 500)
const [notes, setNotes] = useLocalStorage<NoteItem[]>('notes', [], 500)
```

### 2.2 应用优化的 LinkList 组件

**选项 A**：直接替换（推荐）

```bash
# 备份原文件
mv src/components/LinkList.tsx src/components/LinkList.backup.tsx

# 使用优化版本
mv src/components/LinkListOptimized.tsx src/components/LinkList.tsx
```

**选项 B**：手动应用优化

在 `src/components/LinkList.tsx` 中：

1. 添加必要的导入：
```typescript
import { useMemo, useCallback } from 'react'
```

2. 使用 `useMemo` 缓存计算结果：
```typescript
const filteredLinks = useMemo(() => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return links.filter(link => {
    return (
      link.title.toLowerCase().includes(lowerSearchTerm) ||
      link.url.toLowerCase().includes(lowerSearchTerm) ||
      link.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
    );
  });
}, [links, searchTerm]);
```

3. 使用 `useCallback` 缓存函数：
```typescript
const toggleTagExpansion = useCallback((tag: string) => {
  setExpandedTags(prev => ({
    ...prev,
    [tag]: !prev[tag]
  }));
}, []);
```

### 2.3 应用优化的 Service Worker

**目标文件**：`service-worker.js`

```bash
# 备份原文件
mv service-worker.js service-worker.backup.js

# 使用优化版本
mv service-worker-optimized.js service-worker.js
```

**重要**：更新缓存版本号以强制更新：
```javascript
const CACHE_NAME = 'link-manager-v3'; // 递增版本号
```

## 🚀 第三步：高级优化（低优先级）

### 3.1 添加代码分割

**目标文件**：`src/App.tsx`

1. 导入 React.lazy 和 Suspense：
```typescript
import React, { useState, useEffect, lazy, Suspense } from 'react'
```

2. 懒加载组件：
```typescript
const StatsPage = lazy(() => import('./components/StatsPage'))
const NoteForm = lazy(() => import('./components/NoteForm'))
const NoteList = lazy(() => import('./components/NoteList'))
const NoteDetail = lazy(() => import('./components/NoteDetail'))
```

3. 使用 Suspense 包裹懒加载的组件：
```typescript
{activePage === 'stats' ? (
  <Suspense fallback={<div>加载中...</div>}>
    <StatsPage links={links} />
  </Suspense>
) : activePage === 'notes' ? (
  <Suspense fallback={<div>加载中...</div>}>
    <NoteList
      notes={notes}
      onEditNote={handleEditNote}
      onDeleteNote={handleDeleteNote}
      onTogglePin={handleToggleNotePin}
      categories={noteCategories}
    />
  </Suspense>
) : null}
```

### 3.2 移除生产环境的 console.log

**目标文件**：`vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig as defineEsLintConfig } from 'vite-plugin-eslint'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    // 移除 console.log
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      // ... 现有配置
    })
  ]
})
```

### 3.3 添加虚拟滚动（可选）

如果数据量很大（超过 1000 条），考虑使用虚拟滚动：

```bash
npm install react-window @types/react-window
```

创建 `src/components/VirtualizedLinkList.tsx`：

```typescript
import { FixedSizeList as List } from 'react-window'
import { LinkItem } from '../types'

interface VirtualizedLinkListProps {
  links: LinkItem[]
  height: number
}

const VirtualizedLinkList: React.FC<VirtualizedLinkListProps> = ({ links, height }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {/* 渲染单个链接项 */}
      <div>{links[index].title}</div>
    </div>
  )

  return (
    <List
      height={height}
      itemCount={links.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  )
}

export default VirtualizedLinkList
```

## ✅ 第四步：测试验证

### 4.1 安全测试

1. **密码测试**：
   - 设置密码后，检查 localStorage 中是否为哈希值
   - 尝试错误密码，验证是否拒绝
   - 尝试正确密码，验证是否通过

2. **XSS 测试**：
   - 在备忘录中输入 `<script>alert('XSS')</script>`
   - 验证脚本是否被正确转义或净化

3. **URL 测试**：
   - 尝试输入 `javascript:alert('XSS')`
   - 验证是否被拒绝

### 4.2 性能测试

1. **localStorage 测试**：
   - 快速输入多个链接
   - 打开浏览器开发者工具 → Application → Local Storage
   - 观察写入频率是否降低

2. **渲染性能测试**：
   - 创建 100+ 条链接数据
   - 搜索和排序，观察是否流畅
   - 使用 React DevTools Profiler 检查渲染次数

3. **Service Worker 测试**：
   - 打开开发者工具 → Application → Service Workers
   - 检查缓存策略是否正确
   - 测试离线模式

### 4.3 构建测试

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 检查构建输出
ls -lh dist/
```

## 📊 第五步：性能监控

### 5.1 添加性能监控

创建 `src/utils/performance.ts`：

```typescript
/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map()

  static startMark(name: string) {
    this.marks.set(name, performance.now())
  }

  static endMark(name: string) {
    const start = this.marks.get(name)
    if (start) {
      const duration = performance.now() - start
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
      this.marks.delete(name)
      return duration
    }
    return 0
  }

  static measureRender(componentName: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value
      descriptor.value = function (...args: any[]) {
        const start = performance.now()
        const result = originalMethod.apply(this, args)
        const end = performance.now()
        console.log(`[Render] ${componentName}.${propertyKey}: ${(end - start).toFixed(2)}ms`)
        return result
      }
    }
  }
}
```

## 🔄 第六步：迁移现有数据

如果已有用户数据，需要迁移密码格式：

```typescript
/**
 * 迁移旧密码到新格式
 */
async function migratePassword() {
  const oldPassword = localStorage.getItem('password')
  
  // 检查是否已经是新格式（包含冒号）
  if (oldPassword && oldPassword.includes(':')) {
    console.log('密码已经是新格式，无需迁移')
    return
  }
  
  // 如果是旧格式（明文），迁移到新格式
  if (oldPassword) {
    try {
      const salt = generateSalt()
      const hashedPassword = await hashPassword(oldPassword, salt)
      const newPassword = `${salt}:${hashedPassword}`
      localStorage.setItem('password', newPassword)
      console.log('密码迁移成功')
    } catch (error) {
      console.error('密码迁移失败:', error)
    }
  }
}
```

## 📝 第七步：文档更新

更新 `README.md`，添加安全和性能说明：

```markdown
## 安全特性

- 密码使用 SHA-256 哈希存储
- 所有用户输入经过验证和净化
- URL 格式验证，防止恶意链接
- XSS 攻击防护

## 性能优化

- localStorage 操作防抖
- React 组件使用 useMemo 和 useCallback 优化
- Service Worker 使用最佳缓存策略
- 代码分割，减少初始加载时间
- 生产环境自动移除 console.log
```

## 🎯 完成检查清单

- [ ] 密码已使用哈希存储
- [ ] 所有用户输入已验证
- [ ] XSS 防护已应用
- [ ] URL 验证已添加
- [ ] useLocalStorage 已优化
- [ ] LinkList 组件已优化
- [ ] Service Worker 已更新
- [ ] 代码分割已实现
- [ ] console.log 已移除
- [ ] 所有测试通过
- [ ] 文档已更新

## 🆘 常见问题

### Q: 密码迁移后用户无法登录怎么办？
A: 提供密码重置功能，让用户重新设置密码。

### Q: 性能优化后反而变慢了？
A: 检查是否过度使用 useMemo/useCallback，只在必要时使用。

### Q: Service Worker 更新不生效？
A: 清除缓存或递增 CACHE_NAME 版本号。

### Q: 构建后文件太大？
A: 检查是否正确应用了代码分割，考虑使用 CDN 加载依赖。

## 📚 参考资源

- [React 性能优化官方文档](https://react.dev/learn/render-and-commit)
- [Web Crypto API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Service Worker 最佳实践](https://web.dev/service-worker-lifecycle/)
- [PWA 性能优化](https://web.dev/fast/)
