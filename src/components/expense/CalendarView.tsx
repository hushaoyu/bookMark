import React, { useState, useEffect } from 'react';
import { ExpenseItem } from '../../types/expense/expense';
import { expenseService } from '../../services/expense/expenseService';
import styles from '../../styles/components/CalendarView.module.css';

interface CalendarViewProps {
  month: string;
  onClose: () => void;
  onSelectDate: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ month, onClose, onSelectDate }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(month);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const [year, monthNum] = currentMonth.split('-').map(Number);
        const startOfMonth = new Date(year, monthNum - 1, 1).toISOString();
        const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59).toISOString();
        const fetchedExpenses = await expenseService.getExpensesByDateRange(startOfMonth, endOfMonth);
        setExpenses(fetchedExpenses);
      } catch (err) {
        console.error('Error fetching expenses:', err);
      }
    };

    fetchExpenses();
  }, [currentMonth]);

  const [year, monthNum] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const firstDayOfMonth = new Date(year, monthNum - 1, 1).getDay();

  // 计算每天的支出和收入
  const dailyData: Record<number, { expense: number; income: number; count: number }> = {};
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const day = date.getDate();
    if (!dailyData[day]) {
      dailyData[day] = { expense: 0, income: 0, count: 0 };
    }
    if (expense.type === 'expense') {
      dailyData[day].expense += expense.amount;
    } else {
      dailyData[day].income += expense.amount;
    }
    dailyData[day].count += 1;
  });

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = monthNum - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = monthNum + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleDateClick = (day: number) => {
    const selectedDate = `${currentMonth}-${String(day).padStart(2, '0')}`;
    onSelectDate(selectedDate);
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}w`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toFixed(0);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.navButton} onClick={handlePrevMonth}>◀</button>
          <span className={styles.title}>{year}年{monthNum}月</span>
          <button className={styles.navButton} onClick={handleNextMonth}>▶</button>
        </div>

        <div className={styles.weekDays}>
          {weekDays.map(day => (
            <div key={day} className={styles.weekDay}>{day}</div>
          ))}
        </div>

        <div className={styles.days}>
          {/* 空白占位 */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className={styles.dayEmpty} />
          ))}

          {/* 日期 */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const data = dailyData[day];
            const hasData = data && data.count > 0;

            return (
              <div
                key={day}
                className={`${styles.day} ${hasData ? styles.dayHasData : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <span className={styles.dayNumber}>{day}</span>
                {hasData && (
                  <div className={styles.dayInfo}>
                    {data.expense > 0 && (
                      <span className={styles.expenseAmount}>-{formatAmount(data.expense)}</span>
                    )}
                    {data.income > 0 && (
                      <span className={styles.incomeAmount}>+{formatAmount(data.income)}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <button className={styles.closeButton} onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
