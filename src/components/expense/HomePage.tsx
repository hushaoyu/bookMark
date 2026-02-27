import React, { useState, useEffect } from 'react';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import BudgetForm from './BudgetForm';
import { ExpenseItem, Budget } from '../../types/expense/expense';
import { expenseService } from '../../services/expense/expenseService';
import styles from '../../styles/components/HomePage.module.css';

const HomePage: React.FC = () => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [refetch, setRefetch] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [balance, setBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  useEffect(() => {
    const calculateFinancialData = async () => {
      try {
        // 获取所有交易记录
        const allExpenses = await expenseService.getAllExpenses();
        
        // 计算总余额（收入 - 支出）
        const totalIncome = allExpenses
          .filter(expense => expense.type === 'income')
          .reduce((sum, expense) => sum + expense.amount, 0);
        
        const totalExpense = allExpenses
          .filter(expense => expense.type === 'expense')
          .reduce((sum, expense) => sum + expense.amount, 0);
        
        setBalance(totalIncome - totalExpense);
        
        // 计算当月收入和支出
        const [year, month] = currentMonth.split('-').map(Number);
        const monthlyExpenses = allExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === month;
        });
        
        const income = monthlyExpenses
          .filter(expense => expense.type === 'income')
          .reduce((sum, expense) => sum + expense.amount, 0);
        
        const expense = monthlyExpenses
          .filter(expense => expense.type === 'expense')
          .reduce((sum, expense) => sum + expense.amount, 0);
        
        setMonthlyIncome(income);
        setMonthlyExpense(expense);

        // 获取当月预算
        const budget = await expenseService.getCurrentMonthBudget();
        setCurrentBudget(budget);
      } catch (error) {
        console.error('Failed to calculate financial data:', error);
      }
    };

    calculateFinancialData();
  }, [currentMonth, refetch]);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleCloseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const handleExpenseSuccess = () => {
    setRefetch(!refetch);
  };

  const handleBudgetSuccess = () => {
    setRefetch(!refetch);
  };

  const handleOpenBudgetForm = () => {
    setShowBudgetForm(true);
  };

  const handleCloseBudgetForm = () => {
    setShowBudgetForm(false);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newMonth = month + (direction === 'next' ? 1 : -1);
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
    setRefetch(!refetch);
  };

  const handleMonthSelect = (month: string) => {
    setCurrentMonth(month);
    setShowMonthPicker(false);
    setRefetch(!refetch);
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Generate options for the last 5 years and next 5 years
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = String(month).padStart(2, '0');
        const monthYear = `${year}-${monthStr}`;
        options.push(monthYear);
      }
    }
    return options;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.dateContainer}>
          <button className={styles.monthButton} onClick={() => handleMonthChange('prev')}>
            ‹
          </button>
          <div 
            className={styles.date} 
            onClick={() => setShowMonthPicker(!showMonthPicker)}
          >
            {currentMonth}
          </div>
          <button className={styles.monthButton} onClick={() => handleMonthChange('next')}>
            ›
          </button>
          
          {showMonthPicker && (
            <div className={styles.monthPicker}>
              <div className={styles.monthPickerHeader}>
                <span>选择月份</span>
                <button 
                  className={styles.monthPickerClose} 
                  onClick={() => setShowMonthPicker(false)}
                >
                  ×
                </button>
              </div>
              <div className={styles.monthPickerContent}>
                {generateMonthOptions().map((month) => (
                  <button
                    key={month}
                    className={`${styles.monthOption} ${currentMonth === month ? styles.monthOptionActive : ''}`}
                    onClick={() => handleMonthSelect(month)}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.accountOverview}>
        <div className={styles.balance}>
          <div className={styles.balanceLabel}>账户余额</div>
          <div className={styles.balanceAmount}>¥{balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
        </div>
        <div className={styles.incomeExpense}>
          <div className={styles.income}>
            <div className={styles.incomeLabel}>本月收入</div>
            <div className={styles.incomeAmount}>¥{monthlyIncome.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
          </div>
          <div className={styles.expense}>
            <div className={styles.expenseLabel}>本月支出</div>
            <div className={styles.expenseAmount}>¥{monthlyExpense.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
          </div>
        </div>
      </div>

      <div className={styles.budgetContainer} onClick={handleOpenBudgetForm}>
        <div className={styles.budgetHeader}>
          <span className={styles.budgetLabel}>预算</span>
          <span className={styles.budgetButton}>---</span>
        </div>
        <div className={styles.budgetContent}>
          <div className={styles.budgetItem}>
            <span>剩余:</span>
            <span>{currentBudget ? `¥${(currentBudget.amount - monthlyExpense).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '---'}</span>
          </div>
          <div className={styles.budgetItem}>
            <span>总额:</span>
            <span>{currentBudget ? `¥${currentBudget.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '未设置'}</span>
          </div>
        </div>
      </div>

      <ExpenseList key={refetch.toString()} onEditExpense={handleEditExpense} month={currentMonth} />

      <button className={styles.addButton} onClick={handleAddExpense}>
        +
      </button>

      {showExpenseForm && (
        <div className={styles.formOverlay}>
          <ExpenseForm
            onClose={handleCloseForm}
            onSuccess={handleExpenseSuccess}
            expense={editingExpense}
          />
        </div>
      )}

      {showBudgetForm && (
        <div className={styles.formOverlay}>
          <BudgetForm
            onClose={handleCloseBudgetForm}
            onSuccess={handleBudgetSuccess}
            budget={currentBudget}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;
