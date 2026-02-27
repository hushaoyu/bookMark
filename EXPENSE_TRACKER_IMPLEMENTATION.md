# 记账本功能实现大纲

## 1. 项目结构调整

### 1.1 新增目录结构
```
src/
├── components/
│   └── expense/          # 记账相关组件
│       ├── ExpenseForm.tsx        # 记账表单
│       ├── ExpenseList.tsx        # 记账列表
│       ├── ExpenseCategory.tsx    # 分类管理
│       ├── ExpenseStats.tsx       # 统计分析
│       └── ExpenseImportExport.tsx # 导入导出
├── hooks/
│   └── useIndexedDB.ts            # IndexedDB 钩子
├── services/
│   └── expenseService.ts          # 记账业务逻辑
├── stores/
│   └── expenseStore.ts            # 记账状态管理
├── types/
│   └── expense.ts                 # 记账相关类型定义
└── utils/
    └── expenseUtils.ts            # 记账工具函数
```

### 1.2 现有文件修改
- `src/App.tsx`：添加记账页面路由和状态管理
- `src/types.ts`：添加记账相关类型定义

## 2. 数据模型设计

### 2.1 核心数据结构

#### 2.1.1 记账记录 (ExpenseItem)
```typescript
interface ExpenseItem {
  id: string;          // 唯一ID
  amount: number;      // 金额
  category: string;    // 分类ID
  type: 'income' | 'expense';  // 类型：收入/支出
  date: string;        // 日期（ISO格式）
  description: string; // 描述
  tags: string[];      // 标签
  createdAt: string;   // 创建时间
  updatedAt: string;   // 更新时间
}
```

#### 2.1.2 分类 (ExpenseCategory)
```typescript
interface ExpenseCategory {
  id: string;          // 分类ID
  name: string;        // 分类名称
  type: 'income' | 'expense';  // 分类类型
  color: string;       // 分类颜色
  icon: string;        // 分类图标
  order: number;       // 排序顺序
  createdAt: string;   // 创建时间
  updatedAt: string;   // 更新时间
}
```

#### 2.1.3 统计数据 (ExpenseStats)
```typescript
interface ExpenseStats {
  period: 'day' | 'week' | 'month' | 'year'; // 统计周期
  startDate: string;   // 开始日期
  endDate: string;     // 结束日期
  totalIncome: number; // 总收入
  totalExpense: number; // 总支出
  balance: number;     // 结余
  categoryStats: CategoryStat[]; // 分类统计
  dailyStats: DailyStat[]; // 每日统计
}

interface CategoryStat {
  categoryId: string;  // 分类ID
  categoryName: string; // 分类名称
  amount: number;      // 金额
  percentage: number;  // 占比
}

interface DailyStat {
  date: string;        // 日期
  income: number;      // 收入
  expense: number;     // 支出
  balance: number;     // 结余
}
```

## 3. 存储方案 (IndexedDB)

### 3.1 数据库设计
- **数据库名称**：`expense-tracker-db`
- **版本**：1.0

### 3.2 存储对象

#### 3.2.1 `expenses` 存储
- **键路径**：`id`
- **索引**：
  - `date`：按日期索引
  - `category`：按分类索引
  - `type`：按类型索引
  - `date_type`：复合索引（日期+类型）

#### 3.2.2 `categories` 存储
- **键路径**：`id`
- **索引**：
  - `type`：按类型索引
  - `order`：按排序索引

### 3.3 存储操作封装
- **CRUD 操作**：创建、读取、更新、删除
- **批量操作**：批量添加、批量更新
- **查询操作**：按日期范围、分类、类型等条件查询
- **统计操作**：计算指定周期的收支统计

## 4. 组件设计

### 4.1 ExpenseForm 组件
- **功能**：添加/编辑记账记录
- **字段**：金额、分类、类型、日期、描述、标签
- **验证**：金额必填且为正数，分类必填
- **交互**：实时计算输入金额，提供常用金额快捷选项

### 4.2 ExpenseList 组件
- **功能**：展示记账记录列表
- **筛选**：按日期范围、分类、类型、标签筛选
- **排序**：按日期、金额、分类排序
- **分页**：虚拟滚动或分页加载
- **操作**：编辑、删除、查看详情

### 4.3 ExpenseCategory 组件
- **功能**：管理收支分类
- **操作**：添加、编辑、删除、排序分类
- **预设分类**：提供常用默认分类
- **自定义分类**：支持用户自定义分类

### 4.4 ExpenseStats 组件
- **功能**：展示收支统计数据
- **图表**：饼图（分类占比）、折线图（趋势）、柱状图（月度对比）
- **周期选择**：日、周、月、年
- **数据导出**：导出统计数据为 CSV/Excel

### 4.5 ExpenseImportExport 组件
- **功能**：导入/导出记账数据
- **格式**：CSV、JSON
- **导入**：支持从其他记账应用导入数据
- **导出**：支持按日期范围导出

## 5. 功能模块

### 5.1 核心功能
- **记账**：添加、编辑、删除记账记录
- **分类管理**：管理收支分类
- **统计分析**：按不同维度统计收支情况
- **数据导入导出**：备份和迁移数据

### 5.2 高级功能
- **预算管理**：设置月度/年度预算
- **重复记账**：设置周期性记账（如工资、房租）
- **标签管理**：自定义标签，用于更细致的分类
- **多账户**：支持管理多个账户（如现金、银行卡、支付宝）
- **货币转换**：支持多货币记账

## 6. 状态管理

### 6.1 全局状态
- **当前记账记录**：用于编辑和查看
- **分类列表**：全局分类数据
- **筛选条件**：当前应用的筛选条件
- **统计周期**：当前统计周期

### 6.2 状态管理方案
- **Context API**：轻量级状态管理
- **useReducer**：处理复杂状态逻辑
- **持久化**：状态变更自动同步到 IndexedDB

## 7. 性能优化

### 7.1 存储优化
- **批量操作**：减少数据库交互次数
- **索引使用**：合理使用索引加速查询
- **数据压缩**：对大量历史数据进行压缩存储

### 7.2 渲染优化
- **虚拟滚动**：处理长列表渲染
- **组件懒加载**：按需加载统计组件
- **缓存**：缓存统计结果，避免重复计算

### 7.3 交互优化
- **防抖**：输入时防抖，减少不必要的计算
- **节流**：滚动时节流，提升滚动性能
- **预加载**：预加载可能需要的数据

## 8. 扩展性考虑

### 8.1 模块解耦
- **存储层**：独立的存储服务，可替换为其他存储方案
- **业务逻辑**：独立的业务逻辑服务，便于扩展功能
- **UI 组件**：模块化组件，可单独使用或组合使用

### 8.2 未来扩展
- **云同步**：支持数据云同步
- **多设备**：支持多设备数据同步
- **报表生成**：生成详细的财务报表
- **智能分析**：提供消费习惯分析和建议
- **API 集成**：集成银行、支付平台等 API

## 9. 实现路径

### 9.1 第一阶段：基础功能
1. 搭建项目结构
2. 实现 IndexedDB 存储服务
3. 开发核心组件（ExpenseForm、ExpenseList）
4. 实现基础记账功能

### 9.2 第二阶段：分类和统计
1. 开发分类管理功能
2. 实现统计分析功能
3. 添加图表展示

### 9.3 第三阶段：高级功能
1. 实现数据导入导出
2. 添加预算管理
3. 开发重复记账功能

### 9.4 第四阶段：优化和扩展
1. 性能优化
2. 用户体验优化
3. 实现未来扩展功能

## 10. 技术栈

### 10.1 核心技术
- **React + TypeScript**：基础框架
- **IndexedDB**：本地存储
- **Vite**：构建工具
- **PWA**：渐进式Web应用

### 10.2 可选依赖
- **Chart.js**：图表库
- **idb**：IndexedDB 封装库
- **date-fns**：日期处理
- **uuid**：生成唯一ID
- **papaparse**：CSV 解析

## 11. 注意事项

### 11.1 数据安全
- **本地存储**：敏感数据加密存储
- **数据备份**：定期提醒用户备份数据
- **导入验证**：验证导入数据的完整性

### 11.2 兼容性
- **浏览器支持**：确保在主流浏览器中正常运行
- **离线使用**：支持完全离线使用
- **响应式设计**：适配不同屏幕尺寸

### 11.3 用户体验
- **简化操作**：减少记账操作步骤
- **快捷功能**：提供常用金额和分类快捷选项
- **实时反馈**：操作后及时反馈结果
- **错误处理**：友好的错误提示

## 12. 总结

本大纲提供了一个完整的记账本功能实现方案，采用 IndexedDB 作为存储方案，确保长期使用的数据存储需求。通过模块化设计和性能优化，保证了应用的可扩展性和用户体验。后续可以根据实际需求，逐步实现各个功能模块，为用户提供一个功能完整、体验良好的记账工具。