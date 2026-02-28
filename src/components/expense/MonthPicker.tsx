import React, { useState } from 'react';
import styles from '../../styles/components/MonthPicker.module.css';

interface MonthPickerProps {
  selectedMonth: string;
  onSelect: (month: string) => void;
  onClose: () => void;
}

const MonthPicker: React.FC<MonthPickerProps> = ({ selectedMonth, onSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedMonth));
  const [view, setView] = useState<'months' | 'years'>('months');

  const year = currentMonth.getFullYear();

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const handleSelectMonth = (monthIndex: number) => {
    const selectedMonthStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    onSelect(selectedMonthStr);
    onClose();
  };

  const handleSelectYear = (selectedYear: number) => {
    setCurrentMonth(new Date(selectedYear, currentMonth.getMonth(), 1));
    setView('months');
  };

  // 生成年份列表（前后50年）
  const years = Array.from({ length: 101 }, (_, i) => year - 50 + i);

  // 检查是否是选中的月份
  const isSelectedMonth = (monthIndex: number) => {
    const selected = new Date(selectedMonth);
    return selected.getFullYear() === year && selected.getMonth() === monthIndex;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <span 
              className={styles.year}
              onClick={() => setView('years')}
            >
              {year}年
            </span>
          </div>
        </div>

        {view === 'months' && (
          <div className={styles.months}>
            {months.map((monthName, index) => (
              <div
                key={monthName}
                className={`${styles.month} ${isSelectedMonth(index) ? styles.selected : ''}`}
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
      </div>
    </div>
  );
};

export default MonthPicker;
