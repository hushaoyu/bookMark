// 记账记录类型
export interface ExpenseItem {
  id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  description: string;
  paymentMethod: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 分类类型
export interface ExpenseCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  order: number;
}

// 预算类型
export interface Budget {
  id: string;
  amount: number;
  categoryId: string | null; // null表示总预算
  period: 'month' | 'year';
  startDate: string;
  endDate: string;
}

// 统计数据类型

