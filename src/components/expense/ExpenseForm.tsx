import React, { useState, useEffect } from 'react';
import { expenseService } from '../../services/expense/expenseService';
import { ExpenseItem } from '../../types/expense/expense';
import CategorySelector from './CategorySelector';
import NumericKeyboard from './NumericKeyboard';
import DatePicker from './DatePicker';
import styles from '../../styles/components/ExpenseForm.module.css';

interface ExpenseFormProps {
  onClose: () => void;
  onSuccess: () => void;
  expense: ExpenseItem | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, onSuccess, expense }) => {
  const [type, setType] = useState<'income' | 'expense'>(expense?.type || 'expense');
  const [category, setCategory] = useState(expense?.category || 'food');
  const [amount, setAmount] = useState(expense ? expense.amount.toString() : '');
  const [description, setDescription] = useState(expense?.description || '');
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selected, setSelected] = useState(!!expense || true); // 标记是否已选择分类，默认为true因为有默认分类

  useEffect(() => {
    if (expense) {
      setType(expense.type);
      setCategory(expense.category);
      setAmount(expense.amount.toString());
      setDescription(expense.description || '');
      setDate(expense.date);
      setSelected(true);
    }
  }, [expense]);

  const handleSelectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setSelected(true);
  };

  const calculateAmount = (input: string): number => {
    // 处理包含+、-运算符的金额计算
    try {
      // 简单的数学表达式计算
      // 注意：这里使用eval可能存在安全风险，但在受控环境下使用是可接受的
      const result = eval(input);
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch (error) {
      console.error('Invalid amount calculation:', error);
      return 0;
    }
  };

  const handleSave = async () => {
    if (!amount) {
      alert('请输入有效的金额');
      return;
    }

    const calculatedAmount = calculateAmount(amount);
    if (calculatedAmount <= 0) {
      alert('请输入有效的金额');
      return;
    }

    try {
      if (expense) {
        await expenseService.updateExpense(expense.id, {
          amount: calculatedAmount,
          category,
          type,
          date,
          description,
          tags: expense.tags || [],
        });
      } else {
        await expenseService.createExpense({
          amount: calculatedAmount,
          category,
          type,
          date,
          description,
          tags: [],
          paymentMethod: '现金', // 添加默认支付方式
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert('保存失败，请重试');
    }
  };

  const handleClear = () => {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <div className={styles.typeSelector}>
          <button
            className={`${styles.typeButton} ${type === 'expense' ? styles.active : ''}`}
            onClick={() => setType('expense')}
          >
            支出
          </button>
          <button
            className={`${styles.typeButton} ${type === 'income' ? styles.active : ''}`}
            onClick={() => setType('income')}
          >
            收入
          </button>
        </div>
        <button className={styles.moreButton}>
          +
        </button>
      </div>

      <div className={styles.categorySelectorContainer}>
        <CategorySelector
          type={type}
          selectedCategory={category}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {selected && (
        <div className={styles.bottomContainer}>
          <div className={styles.inputRow}>
            <div className={styles.description}>
              <input
                type="text"
                placeholder="添加备注吧～"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.keyboardWrapper}>
            <div className={styles.keyboardHeader}>
              <div 
                className={styles.dateDisplay}
                onClick={() => setShowDatePicker(true)}
              >
                {date}
              </div>
              <div className={styles.amountDisplay}>
                <span className={type === 'expense' ? styles.expenseAmount : styles.incomeAmount}>
                  {amount || '0.00'}
                </span>
              </div>
            </div>
            <NumericKeyboard
              value={amount}
              onChange={setAmount}
              onSave={handleSave}
              onClear={handleClear}
              type={type}
            />
          </div>
        </div>
      )}

      {showDatePicker && (
        <DatePicker
          selectedDate={date}
          onSelect={setDate}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};

export default ExpenseForm;
