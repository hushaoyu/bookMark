import { ExpenseCategory } from '../../types/expense/expense';

/**
 * 默认分类数据
 */
export const defaultCategories: ExpenseCategory[] = [
  // 支出分类
  { id: 'food', name: '三餐', type: 'expense', color: '#FF6B6B', icon: '🍜', order: 1 },
  { id: 'snack', name: '零食', type: 'expense', color: '#FFD166', icon: '🍪', order: 2 },
  { id: 'clothes', name: '衣服', type: 'expense', color: '#06D6A0', icon: '👔', order: 3 },
  { id: 'transport', name: '交通', type: 'expense', color: '#118AB2', icon: '🚗', order: 4 },
  { id: 'travel', name: '旅行', type: 'expense', color: '#073B4C', icon: '✈️', order: 5 },
  { id: 'child', name: '孩子', type: 'expense', color: '#EF476F', icon: '👶', order: 6 },
  { id: 'pet', name: '宠物', type: 'expense', color: '#FF9F1C', icon: '🐱', order: 7 },
  { id: 'shopping', name: '线上购物', type: 'expense', color: '#8338EC', icon: '🛒', order: 8 },
  { id: 'smoke', name: '烟酒', type: 'expense', color: '#3A86FF', icon: '🚬', order: 9 },
  { id: 'study', name: '学习', type: 'expense', color: '#38B000', icon: '📚', order: 10 },
  { id: 'daily', name: '日用品', type: 'expense', color: '#6A0572', icon: '🧺', order: 11 },
  { id: 'house', name: '住房', type: 'expense', color: '#AB83A1', icon: '🏠', order: 12 },
  { id: 'beauty', name: '美妆', type: 'expense', color: '#FC5185', icon: '💄', order: 13 },
  { id: 'medical', name: '医疗', type: 'expense', color: '#4361EE', icon: '💊', order: 14 },
  { id: 'redpacket', name: '发红包', type: 'expense', color: '#FF006E', icon: '🧧', order: 15 },
  { id: 'car', name: '汽车/加油', type: 'expense', color: '#00BBF9', icon: '⛽', order: 16 },
  { id: 'entertainment', name: '娱乐', type: 'expense', color: '#7B2CBF', icon: '🎮', order: 17 },
  { id: 'gift', name: '请客送礼', type: 'expense', color: '#F72585', icon: '🎁', order: 18 },
  { id: 'digital', name: '数码', type: 'expense', color: '#4CC9F0', icon: '📱', order: 19 },
  { id: 'sport', name: '运动', type: 'expense', color: '#457B9D', icon: '⚽', order: 20 },
  // 收入分类
  { id: 'salary', name: '工资', type: 'income', color: '#4CAF50', icon: '💼', order: 1 },
  { id: 'bonus', name: '生活费', type: 'income', color: '#8BC34A', icon: '💰', order: 2 },
  { id: 'redpacket_income', name: '红包', type: 'income', color: '#CDDC39', icon: '🧧', order: 3 },
  { id: 'food_income', name: '外卖', type: 'income', color: '#FFEB3B', icon: '🍔', order: 4 },
  { id: 'investment', name: '投股票基金', type: 'income', color: '#FFC107', icon: '📈', order: 5 },
  { id: 'other_income', name: '其它', type: 'income', color: '#FF9800', icon: '💡', order: 6 },
];
