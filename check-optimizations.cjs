/**
 * 安全与性能检查脚本
 * 
 * 运行此脚本可以检查应用是否正确应用了安全和性能优化
 * 
 * 使用方法：
 * node check-optimizations.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 开始检查安全和性能优化...\n')

// 检查结果
const results = {
  passed: [],
  failed: [],
  warnings: []
}

// 1. 检查安全工具文件是否存在
console.log('📁 检查安全工具文件...')
const securityUtilsPath = path.join(__dirname, 'src/utils/security.ts')
if (fs.existsSync(securityUtilsPath)) {
  const content = fs.readFileSync(securityUtilsPath, 'utf-8')
  
  // 检查关键函数是否存在
  const requiredFunctions = ['generateSalt', 'hashPassword', 'verifyPassword', 'isValidUrl', 'sanitizeHtml']
  const missingFunctions = requiredFunctions.filter(fn => !content.includes(fn))
  
  if (missingFunctions.length === 0) {
    results.passed.push('✅ 安全工具文件存在且包含所有必要函数')
  } else {
    results.failed.push(`❌ 安全工具文件缺少函数: ${missingFunctions.join(', ')}`)
  }
  
  // 检查是否使用 Web Crypto API
  if (content.includes('crypto.subtle')) {
    results.passed.push('✅ 使用 Web Crypto API 进行密码哈希')
  } else {
    results.warnings.push('⚠️  可能未使用 Web Crypto API')
  }
} else {
  results.failed.push('❌ 安全工具文件不存在: src/utils/security.ts')
}

// 2. 检查优化的 localStorage hook
console.log('📁 检查优化的 localStorage hook...')
const optimizedHookPath = path.join(__dirname, 'src/hooks/useLocalStorageOptimized.ts')
if (fs.existsSync(optimizedHookPath)) {
  const content = fs.readFileSync(optimizedHookPath, 'utf-8')
  
  if (content.includes('debounce') || content.includes('setTimeout')) {
    results.passed.push('✅ 优化的 localStorage hook 包含防抖机制')
  } else {
    results.warnings.push('⚠️  localStorage hook 可能未实现防抖')
  }
} else {
  results.warnings.push('⚠️  优化的 localStorage hook 不存在（可选）')
}

// 3. 检查 App.tsx 是否应用了安全优化
console.log('📁 检查 App.tsx 安全优化...')
const appPath = path.join(__dirname, 'src/App.tsx')
if (fs.existsSync(appPath)) {
  const content = fs.readFileSync(appPath, 'utf-8')
  
  // 检查是否导入安全工具
  if (content.includes('./utils/security')) {
    results.passed.push('✅ App.tsx 导入了安全工具')
  } else {
    results.warnings.push('⚠️  App.tsx 可能未导入安全工具')
  }
  
  // 检查是否使用哈希密码
  if (content.includes('hashPassword') || content.includes('verifyPassword')) {
    results.passed.push('✅ App.tsx 使用密码哈希')
  } else {
    results.warnings.push('⚠️  App.tsx 可能未使用密码哈希')
  }
  
  // 检查是否有输入验证
  if (content.includes('isValidUrl') || content.includes('isValidTitle')) {
    results.passed.push('✅ App.tsx 包含输入验证')
  } else {
    results.warnings.push('⚠️  App.tsx 可能缺少输入验证')
  }
  
  // 检查是否使用优化的 hook
  if (content.includes('useLocalStorageOptimized') || content.includes('useIncrementalStorage')) {
    results.passed.push('✅ App.tsx 使用优化的 localStorage hook')
  } else {
    results.warnings.push('⚠️  App.tsx 可能未使用优化的 localStorage hook')
  }
} else {
  results.failed.push('❌ App.tsx 不存在')
}

// 4. 检查组件优化
console.log('📁 检查组件性能优化...')
const components = [
  'src/components/LinkList.tsx',
  'src/components/NoteList.tsx',
  'src/components/NoteDetail.tsx'
]

components.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath)
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8')
    
    // 检查是否使用 React.memo
    if (content.includes('React.memo') || content.includes('memo(')) {
      results.passed.push(`✅ ${componentPath} 使用 React.memo`)
    } else {
      results.warnings.push(`⚠️  ${componentPath} 可能未使用 React.memo`)
    }
    
    // 检查是否使用 useMemo/useCallback
    if (content.includes('useMemo') || content.includes('useCallback')) {
      results.passed.push(`✅ ${componentPath} 使用性能优化 hooks`)
    } else {
      results.warnings.push(`⚠️  ${componentPath} 可能未使用性能优化 hooks`)
    }
    
    // 检查 NoteDetail 是否有 XSS 防护
    if (componentPath.includes('NoteDetail')) {
      if (content.includes('DOMPurify') || content.includes('sanitize')) {
        results.passed.push(`✅ ${componentPath} 包含 XSS 防护`)
      } else {
        results.warnings.push(`⚠️  ${componentPath} 可能缺少 XSS 防护`)
      }
    }
  }
})

// 5. 检查 Service Worker
console.log('📁 检查 Service Worker...')
const swPath = path.join(__dirname, 'service-worker.js')
if (fs.existsSync(swPath)) {
  const content = fs.readFileSync(swPath, 'utf-8')
  
  // 检查缓存策略
  if (content.includes('Cache First') || content.includes('cacheFirst')) {
    results.passed.push('✅ Service Worker 使用 Cache First 策略')
  } else {
    results.warnings.push('⚠️  Service Worker 可能未使用最佳缓存策略')
  }
  
  // 检查是否有缓存清理
  if (content.includes('deleteOldCaches') || content.includes('caches.delete')) {
    results.passed.push('✅ Service Worker 包含缓存清理逻辑')
  } else {
    results.warnings.push('⚠️  Service Worker 可能缺少缓存清理逻辑')
  }
  
  // 检查缓存版本
  if (content.match(/CACHE_NAME.*v\d+/)) {
    results.passed.push('✅ Service Worker 使用版本化缓存')
  } else {
    results.warnings.push('⚠️  Service Worker 可能未使用版本化缓存')
  }
} else {
  results.failed.push('❌ Service Worker 不存在')
}

// 6. 检查 vite.config.ts
console.log('📁 检查 Vite 配置...')
const viteConfigPath = path.join(__dirname, 'vite.config.ts')
if (fs.existsSync(viteConfigPath)) {
  const content = fs.readFileSync(viteConfigPath, 'utf-8')
  
  // 检查是否移除 console.log
  if (content.includes('drop_console') || content.includes('terser')) {
    results.passed.push('✅ Vite 配置包含生产环境优化')
  } else {
    results.warnings.push('⚠️  Vite 配置可能未移除生产环境 console.log')
  }
  
  // 检查代码分割配置
  if (content.includes('splitChunks') || content.includes('manualChunks')) {
    results.passed.push('✅ Vite 配置包含代码分割')
  } else {
    results.warnings.push('⚠️  Vite 配置可能未配置代码分割')
  }
} else {
  results.failed.push('❌ vite.config.ts 不存在')
}

// 7. 检查依赖
console.log('📁 检查依赖...')
const packageJsonPath = path.join(__dirname, 'package.json')
if (fs.existsSync(packageJsonPath)) {
  const content = fs.readFileSync(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(content)
  
  // 检查安全相关依赖
  if (packageJson.dependencies?.dompurify) {
    results.passed.push('✅ 已安装 dompurify (XSS 防护)')
  } else {
    results.warnings.push('⚠️  未安装 dompurify，建议安装以增强 XSS 防护')
  }
  
  // 检查性能相关依赖
  if (packageJson.dependencies?.['lodash-es']) {
    results.passed.push('✅ 已安装 lodash-es (工具函数)')
  } else {
    results.warnings.push('⚠️  未安装 lodash-es，建议安装以使用工具函数')
  }
  
  // 检查虚拟滚动依赖（可选）
  if (packageJson.dependencies?.['react-window']) {
    results.passed.push('✅ 已安装 react-window (虚拟滚动)')
  } else {
    results.warnings.push('⚠️  未安装 react-window（可选，用于大数据量优化）')
  }
} else {
  results.failed.push('❌ package.json 不存在')
}

// 打印结果
console.log('\n' + '='.repeat(60))
console.log('📊 检查结果汇总')
console.log('='.repeat(60) + '\n')

if (results.passed.length > 0) {
  console.log('✅ 通过的检查:')
  results.passed.forEach(item => console.log(`  ${item}`))
  console.log('')
}

if (results.warnings.length > 0) {
  console.log('⚠️  警告:')
  results.warnings.forEach(item => console.log(`  ${item}`))
  console.log('')
}

if (results.failed.length > 0) {
  console.log('❌ 失败的检查:')
  results.failed.forEach(item => console.log(`  ${item}`))
  console.log('')
}

// 统计
console.log('='.repeat(60))
console.log(`总计: ${results.passed.length} 通过, ${results.warnings.length} 警告, ${results.failed.length} 失败`)
console.log('='.repeat(60) + '\n')

// 建议
if (results.warnings.length > 0 || results.failed.length > 0) {
  console.log('💡 建议:')
  console.log('1. 查看 IMPLEMENTATION_GUIDE.md 了解详细的修复步骤')
  console.log('2. 优先修复失败的检查项')
  console.log('3. 根据需要处理警告项')
  console.log('4. 运行 npm run build 构建生产版本')
  console.log('5. 使用 npm run preview 测试生产版本')
  console.log('')
}

// 退出码
if (results.failed.length > 0) {
  console.log('❌ 存在失败的检查项，请修复后重试')
  process.exit(1)
} else if (results.warnings.length > 0) {
  console.log('⚠️  存在警告项，建议进一步优化')
  process.exit(0)
} else {
  console.log('🎉 所有检查通过！')
  process.exit(0)
}
