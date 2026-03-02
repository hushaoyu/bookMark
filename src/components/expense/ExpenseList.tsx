import React, { useState, useEffect } from 'react';
import { ExpenseItem } from '../../types/expense/expense';
import { expenseService } from '../../services/expense/expenseService';
import { defaultCategories } from '../../utils/expense/defaultCategories';

// 从默认分类中创建categoryInfo对象
const categoryInfo = Object.fromEntries(
  defaultCategories.map(category => [category.id, category])
);
import styles from '../../styles/components/ExpenseList.module.css';

interface ExpenseListProps {
  onEditExpense: (expense: ExpenseItem) => void;
  month: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ onEditExpense, month }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
    try {
      setLoading(true);
      const [year, monthNum] = month.split('-').map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1).toISOString();
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59).toISOString();
      const fetchedExpenses = await expenseService.getExpensesByDateRange(startOfMonth, endOfMonth);
      setExpenses(fetchedExpenses);
      setError(null);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('获取账单失败，请重试');
    } finally {
      setLoading(false);
    }
  };

    fetchExpenses();
  }, [month]);

  // 格式化日期为星期几
  const formatDateWithWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日 ${weekday}`;
  };

  // 格式化时间为 HH:MM
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 按日期分组
  const groupedExpenses = expenses.reduce<Record<string, ExpenseItem[]>>((acc, expense) => {
    const date = expense.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(expense);
    return acc;
  }, {});

  // 对每天内的账单按createdAt字段排序，最新的在前
  Object.keys(groupedExpenses).forEach(date => {
    groupedExpenses[date].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // 按日期排序，最新的日期在前
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.empty}>加载中...</div>
      ) : error ? (
        <div className={styles.empty}>{error}</div>
      ) : expenses.length === 0 ? (
        <div className={styles.empty}>本月暂无账单</div>
      ) : (
        <div className={styles.list}>
          {sortedDates.map(date => {
            const dayExpenses = groupedExpenses[date];
            const dayTotalExpense = dayExpenses
              .filter(expense => expense.type === 'expense')
              .reduce((sum, expense) => sum + expense.amount, 0);
            const dayTotalIncome = dayExpenses
              .filter(expense => expense.type === 'income')
              .reduce((sum, expense) => sum + expense.amount, 0);

            return (
              <div key={date} className={styles.dayGroup}>
                <div className={styles.dayHeader}>
                  <div className={styles.dayDate}>{formatDateWithWeekday(date)}</div>
                  <div className={styles.dayTotal}>
                    <span className={styles.expenseTotal}>支:{dayTotalExpense.toFixed(2)}</span>
                    <span className={styles.incomeTotal}>收:{dayTotalIncome.toFixed(2)}</span>
                  </div>
                </div>
                <div className={styles.dayItems}>
                  {dayExpenses.map(expense => (
                    <div key={expense.id} className={styles.item} onClick={() => onEditExpense(expense)}>
                      <div className={styles.left}>
                        <div className={styles.categoryIcon}>
                          {categoryInfo[expense.category]?.icon || '📝'}
                        </div>
                        <div className={styles.info}>
                          <div className={styles.category}>{categoryInfo[expense.category]?.name || expense.category}</div>
                          {(expense.description || expense.createdAt) && (
                            <div className={styles.description}>
                              {expense.createdAt && (
                                <span className={styles.time}>{formatTime(expense.createdAt)}</span>
                              )}
                              {expense.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`${styles.amount} ${styles[expense.type as 'expense' | 'income']}`}>
                        {expense.type === 'income' ? '+' : '-'}{expense.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;