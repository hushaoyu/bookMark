# 分类数据更新指南

## 概述

当分类配置（`defaultCategories.ts`）更新后，需要同步更新 IndexedDB 中的分类数据。本指南提供了两种更新方式。

## 方式一：自动迁移（推荐）

当数据库版本从 1 升级到 2 时，会自动触发分类迁移：

1. **数据库版本升级**：`storageService.ts` 中的 `dbVersion` 已从 1 升级到 2
2. **自动迁移过程**：
   - 清空旧分类数据
   - 写入新的分类数据（来自 `defaultCategories.ts`）
   - 根据映射表更新所有记账记录的分类ID
   - 在控制台输出迁移结果

3. **触发方式**：
   - 刷新页面即可自动触发
   - 系统会检测到数据库版本变化并自动执行迁移

## 方式二：手动刷新

如果需要在不升级数据库版本的情况下强制更新分类数据：

```typescript
import { expenseStorageService } from './services/expense/storageService';

// 调用刷新方法
await expenseStorageService.refreshCategories();
```

### 在组件中使用示例

```typescript
import { expenseStorageService } from '../../services/expense/storageService';
import { useState } from 'react';

function CategoryUpdateButton() {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateCategories = async () => {
    setIsUpdating(true);
    try {
      await expenseStorageService.refreshCategories();
      alert('分类更新成功！');
      // 刷新页面以加载新分类
      window.location.reload();
    } catch (error) {
      console.error('分类更新失败:', error);
      alert('分类更新失败，请查看控制台');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button 
      onClick={handleUpdateCategories}
      disabled={isUpdating}
    >
      {isUpdating ? '更新中...' : '更新分类'}
    </button>
  );
}
```

## 分类映射表

在 `storageService.ts` 中定义了旧分类ID到新分类ID的映射：

```typescript
const CATEGORY_MIGRATION_MAP: Record<string, string> = {
  'snack': 'food',      // 零食 -> 餐饮
  'car': 'transport',    // 汽车/加油 -> 交通
  'gift': 'redpacket',   // 请客送礼 -> 红包
  // 其他分类保持不变
};
```

**注意**：如果你的分类ID有变化，需要更新这个映射表，确保旧数据能正确迁移到新分类。

## 验证迁移结果

迁移完成后，可以通过以下方式验证：

1. **查看控制台日志**：
   - 会显示类似 "已迁移 X 条记账记录的分类" 的日志

2. **检查分类数据**：
   ```typescript
   const categories = await expenseStorageService.getAllCategories();
   console.log('当前分类:', categories);
   ```

3. **检查记账记录**：
   ```typescript
   const expenses = await expenseStorageService.getAllExpenses();
   console.log('记账记录:', expenses);
   ```

## 注意事项

1. **备份数据**：在执行迁移前，建议先备份重要数据
2. **映射表更新**：每次修改分类ID时，都要更新 `CATEGORY_MIGRATION_MAP`
3. **测试验证**：迁移后务必验证数据完整性
4. **错误处理**：如果迁移失败，检查控制台错误信息

## 常见问题

### Q: 迁移后分类显示不正确？
A: 检查 `CATEGORY_MIGRATION_MAP` 是否包含了所有需要映射的旧分类ID

### Q: 迁移失败怎么办？
A: 查看浏览器控制台的错误信息，可能是：
- IndexedDB 权限问题
- 数据库被锁定
- 数据格式不匹配

### Q: 如何回滚？
A: 可以将 `dbVersion` 改回 1，但需要手动清理 IndexedDB 数据：
```javascript
indexedDB.deleteDatabase('expense-tracker-db');
```

## 总结

- **推荐使用自动迁移**：刷新页面即可，无需额外操作
- **手动刷新适用于**：需要在不升级版本的情况下更新分类
- **务必更新映射表**：确保旧数据能正确迁移
- **迁移后验证**：检查数据完整性
