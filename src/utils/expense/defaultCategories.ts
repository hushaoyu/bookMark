import { ExpenseCategory } from '../../types/expense/expense';

/**
 * 默认分类数据
 */
export const defaultCategories: ExpenseCategory[] = [
  // 支出分类
  { id: 'food', name: '餐饮', type: 'expense', color: '#FF6B6B', icon: '🍜', order: 1 },
  { id: 'transport', name: '交通', type: 'expense', color: '#118AB2', icon: '🚗', order: 2 },
  { id: 'shopping', name: '购物', type: 'expense', color: '#8338EC', icon: '🛒', order: 3 },
  { id: 'clothes', name: '服饰', type: 'expense', color: '#06D6A0', icon: '👔', order: 4 },
  { id: 'entertainment', name: '娱乐', type: 'expense', color: '#7B2CBF', icon: '🎮', order: 5 },
  { id: 'redpacket', name: '红包', type: 'expense', color: '#FF006E', icon: '🧧', order: 6 },
  { id: 'utilities', name: '水电', type: 'expense', color: '#00BBF9', icon: '💧', order: 7 },
  { id: 'smoke', name: '烟酒', type: 'expense', color: '#3A86FF', icon: '🚬', order: 8 },
  { id: 'fruit', name: '水果', type: 'expense', color: '#FFD166', icon: '🍎', order: 9 },
  { id: 'daily', name: '日用品', type: 'expense', color: '#6A0572', icon: '🧺', order: 10 },
  { id: 'beauty', name: '美容', type: 'expense', color: '#FC5185', icon: '💄', order: 11 },
  { id: 'house', name: '住房', type: 'expense', color: '#AB83A1', icon: '🏠', order: 12 },
  { id: 'communication', name: '通讯', type: 'expense', color: '#4CC9F0', icon: '📱', order: 13 },
  { id: 'vegetables', name: '蔬菜', type: 'expense', color: '#38B000', icon: '🥬', order: 14 },
  { id: 'study', name: '学习', type: 'expense', color: '#38B000', icon: '📚', order: 15 },
  { id: 'travel', name: '旅游', type: 'expense', color: '#073B4C', icon: '✈️', order: 16 },
  { id: 'sport', name: '运动', type: 'expense', color: '#457B9D', icon: '⚽', order: 17 },
  { id: 'child', name: '孩子', type: 'expense', color: '#EF476F', icon: '👶', order: 18 },
  { id: 'pet', name: '宠物', type: 'expense', color: '#FF9F1C', icon: '🐱', order: 19 },
  { id: 'home', name: '居家', type: 'expense', color: '#9D4EDD', icon: '🏡', order: 20 },
  { id: 'books', name: '书籍', type: 'expense', color: '#560BAD', icon: '📖', order: 21 },
  { id: 'repair', name: '维修', type: 'expense', color: '#3F37C9', icon: '🔧', order: 22 },
  { id: 'medical', name: '医疗', type: 'expense', color: '#4361EE', icon: '💊', order: 23 },
  { id: 'digital', name: '数码', type: 'expense', color: '#4CC9F0', icon: '💻', order: 24 },
  // 收入分类
  { id: 'salary', name: '工资', type: 'income', color: '#4CAF50', icon: '💼', order: 1 },
  { id: 'bonus', name: '生活费', type: 'income', color: '#8BC34A', icon: '💰', order: 2 },
  { id: 'redpacket_income', name: '红包', type: 'income', color: '#CDDC39', icon: '🧧', order: 3 },
  { id: 'food_income', name: '外卖', type: 'income', color: '#FFEB3B', icon: '🍔', order: 4 },
  { id: 'investment', name: '股票基金', type: 'income', color: '#FFC107', icon: '📈', order: 5 },
  { id: 'other_income', name: '其它', type: 'income', color: '#FF9800', icon: '💡', order: 6 },
];

/**
 * 获取所有支出分类
 */
export const getExpenseCategories = (): ExpenseCategory[] => {
  return defaultCategories.filter(cat => cat.type === 'expense');
};

/**
 * 获取所有收入分类
 */
export const getIncomeCategories = (): ExpenseCategory[] => {
  return defaultCategories.filter(cat => cat.type === 'income');
};

/**
 * 根据ID获取分类
 */
export const getCategoryById = (id: string): ExpenseCategory | undefined => {
  return defaultCategories.find(cat => cat.id === id);
};
