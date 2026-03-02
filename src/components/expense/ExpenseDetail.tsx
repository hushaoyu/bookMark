import React, { useRef, useEffect } from 'react';
import { ExpenseItem } from '../../types/expense/expense';
import { defaultCategories } from '../../utils/expense/defaultCategories';
import styles from '../../styles/components/ExpenseDetail.module.css';

// 从默认分类中创建categoryInfo对象
const categoryInfo = Object.fromEntries(
  defaultCategories.map(category => [category.id, category])
);

interface ExpenseDetailProps {
  expense: ExpenseItem;
  onClose: () => void;
  onEdit: (expense: ExpenseItem) => void;
  onDelete: (expenseId: string) => void;
}

const ExpenseDetail: React.FC<ExpenseDetailProps> = ({ expense, onClose, onEdit, onDelete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // 格式化日期（YYYY-MM-DD）
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 格式化日期时间（YYYY-MM-DD HH:mm）
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 处理删除确认
  const handleDelete = () => {
    if (window.confirm('确定要删除这条记账记录吗？')) {
      onDelete(expense.id);
      onClose();
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.header}>
        <div className={styles.title}>
          {expense.type === 'expense' ? '支出详情' : '收入详情'}
        </div>
        <div className={styles.headerActions}>
          <button className={styles.editButton} onClick={() => onEdit(expense)}>
            编辑
          </button>
          <button className={styles.deleteButton} onClick={handleDelete}>
            删除
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.detailSection}>
          <div className={styles.detailItem}>
            <div className={styles.detailLabel}>账单金额</div>
            <div className={`${styles.detailValue} ${styles[expense.type as 'expense' | 'income']}`}>
              {expense.type === 'income' ? '+' : '-'}{expense.amount.toFixed(2)}
            </div>
          </div>
          <div className={styles.detailItem}>
            <div className={styles.detailLabel}>分类</div>
            <div className={styles.detailValue}>
              <span className={styles.categoryIcon}>
                {categoryInfo[expense.category]?.icon || '📝'}
              </span>
              <span className={styles.categoryName}>
                {categoryInfo[expense.category]?.name || expense.category}
              </span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <div className={styles.detailLabel}>日期</div>
            <div className={styles.detailValue}>
              <div>
                <div className={styles.date}>{formatDate(expense.date)}</div>
                <div className={styles.timestamp}>记录于 {formatDateTime(expense.updatedAt)}</div>
              </div>
            </div>
          </div>
          {expense.description && (
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>备注</div>
              <div className={styles.detailValue}>{expense.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;