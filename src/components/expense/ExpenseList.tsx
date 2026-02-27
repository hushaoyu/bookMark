import React, { useState, useEffect } from 'react';
import { ExpenseItem } from '../../types/expense/expense';
import { expenseService } from '../../services/expense/expenseService';
import { expenseStorageService } from '../../services/expense/storageService';
import styles from '../../styles/components/ExpenseList.module.css';

interface ExpenseListProps {
  limit?: number;
  onEditExpense: (expense: ExpenseItem) => void;
  month: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ limit = 5, onEditExpense, month }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [categories, setCategories] = useState<Map<string, { icon: string; name: string }>>(
    new Map()
  );

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, [month]);

  const loadExpenses = async () => {
    try {
      const allExpenses = await expenseService.getAllExpenses();
      // 根据月份过滤支出记录
      const filteredExpenses = allExpenses.filter(expense => {
        const expenseMonth = expense.date.substring(0, 7); // YYYY-MM
        return expenseMonth === month;
      });
      // 按createdAt倒序排序，确保按添加顺序倒序排列
      filteredExpenses.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setExpenses(filteredExpenses);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const allCategories = await expenseStorageService.getAllCategories();
      const categoryMap = new Map<string, { icon: string; name: string }>();
      allCategories.forEach(category => {
        categoryMap.set(category.id, { icon: category.icon, name: category.name });
      });
      setCategories(categoryMap);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
    });
  };

  // 删除记账记录
  const handleDeleteExpense = async (expense: ExpenseItem, e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发编辑功能
    e.stopPropagation();
    
    // 确认删除
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        await expenseService.deleteExpense(expense.id);
        // 删除后重新加载记账记录
        loadExpenses();
      } catch (error) {
        console.error('Failed to delete expense:', error);
        alert('删除失败，请重试');
      }
    }
  };

  // 按天聚合支出记录
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const date = expense.date.substring(0, 10); // YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, ExpenseItem[]>);

  // 计算每天的支出总额
  const calculateDailyExpense = (dayExpenses: ExpenseItem[]) => {
    return dayExpenses
      .filter(expense => expense.type === 'expense')
      .reduce((total, expense) => total + expense.amount, 0);
  };

  // 计算每天的收入总额
  const calculateDailyIncome = (dayExpenses: ExpenseItem[]) => {
    return dayExpenses
      .filter(expense => expense.type === 'income')
      .reduce((total, expense) => total + expense.amount, 0);
  };

  // 获取排序后的日期列表（倒序）
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {sortedDates.length === 0 ? (
          <div className={styles.empty}>
            暂无交易记录
          </div>
        ) : (
          sortedDates.map((date) => {
            const dayExpenses = groupedExpenses[date];
            const dailyExpense = calculateDailyExpense(dayExpenses);
            
            return (
              <div key={date} className={styles.dayGroup}>
                <div className={styles.dayHeader}>
                  <div className={styles.dayDate}>{formatDate(date)}</div>
                  <div className={styles.dayTotal}>
                    {dailyExpense > 0 && <span className={styles.expenseTotal}>支出: ¥{dailyExpense.toFixed(2)}</span>}
                    {calculateDailyIncome(dayExpenses) > 0 && <span className={styles.incomeTotal}>收入: ¥{calculateDailyIncome(dayExpenses).toFixed(2)}</span>}
                  </div>
                </div>
                <div className={styles.dayItems}>
                  {dayExpenses.map((expense) => (
                    <div key={expense.id} className={styles.item} onClick={() => onEditExpense(expense)}>
                      <div className={styles.left}>
                        <div className={styles.info}>
                          <div className={styles.category}>{categories.get(expense.category)?.name || expense.category}</div>
                          {expense.description && <div className={styles.description}>{expense.description}</div>}
                        </div>
                      </div>
                      <div className={styles.itemRight}>
                        <div
                          className={`${styles.amount} ${expense.type === 'expense' ? styles.expense : styles.income}`}
                        >
                          {expense.type === 'expense' ? '-' : '+'}{expense.amount.toFixed(2)}
                        </div>
                        <button 
                          className={styles.deleteButton} 
                          onClick={(e) => handleDeleteExpense(expense, e)}
                          aria-label="删除"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
