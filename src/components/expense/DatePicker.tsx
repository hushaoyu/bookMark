import React, { useState } from 'react';
import styles from '../../styles/components/DatePicker.module.css';

interface DatePickerProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 获取当月天数
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 获取当月第一天是星期几
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  // 生成年份列表（前后50年）
  const years = Array.from({ length: 101 }, (_, i) => year - 50 + i);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelect(selectedDateStr);
    onClose();
  };

  const handleSelectMonth = (monthIndex: number) => {
    setCurrentDate(new Date(year, monthIndex, 1));
    setView('days');
  };

  const handleSelectYear = (selectedYear: number) => {
    setCurrentDate(new Date(selectedYear, month, 1));
    setView('months');
  };

  // 生成日历天数数组
  const calendarDays: (number | null)[] = [];
  // 填充月初空白
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // 填充当月天数
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // 检查是否是选中的日期
  const isSelectedDay = (day: number) => {
    const selected = new Date(selectedDate);
    return selected.getFullYear() === year && 
           selected.getMonth() === month && 
           selected.getDate() === day;
  };

  // 检查是否是今天
  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.navButton} onClick={handlePrevMonth}>‹</button>
          <div className={styles.title}>
            {view === 'days' && (
              <>
                <span 
                  className={styles.yearMonth}
                  onClick={() => setView('years')}
                >
                  {year}年
                </span>
                <span 
                  className={styles.yearMonth}
                  onClick={() => setView('months')}
                >
                  {months[month]}
                </span>
              </>
            )}
            {view === 'months' && (
              <span onClick={() => setView('years')}>{year}年</span>
            )}
            {view === 'years' && (
              <span>{years[0]} - {years[years.length - 1]}</span>
            )}
          </div>
          <button className={styles.navButton} onClick={handleNextMonth}>›</button>
        </div>

        {view === 'days' && (
          <>
            <div className={styles.weekDays}>
              {weekDays.map(day => (
                <div key={day} className={styles.weekDay}>{day}</div>
              ))}
            </div>
            <div className={styles.days}>
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`${styles.day} ${
                    day === null ? styles.empty : ''
                  } ${day !== null && isSelectedDay(day) ? styles.selected : ''} ${
                    day !== null && isToday(day) ? styles.today : ''
                  }`}
                  onClick={() => day !== null && handleSelectDay(day)}
                >
                  {day}
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'months' && (
          <div className={styles.months}>
            {months.map((monthName, index) => (
              <div
                key={monthName}
                className={`${styles.month} ${index === month ? styles.selected : ''}`}
                onClick={() => handleSelectMonth(index)}
              >
                {monthName}
              </div>
            ))}
          </div>
        )}

        {view === 'years' && (
          <div className={styles.years}>
            {years.map((yearNum) => (
              <div
                key={yearNum}
                className={`${styles.year} ${yearNum === year ? styles.selected : ''}`}
                onClick={() => handleSelectYear(yearNum)}
              >
                {yearNum}
              </div>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <button className={styles.todayButton} onClick={() => {
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            onSelect(todayStr);
            onClose();
          }}>
            今天
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
