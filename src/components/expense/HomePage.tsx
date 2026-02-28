import React, { useState, useEffect } from 'react';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import BudgetForm from './BudgetForm';
import MonthPicker from './MonthPicker';
import { ExpenseItem, Budget } from '../../types/expense/expense';
import { expenseService } from '../../services/expense/expenseService';
import styles from '../../styles/components/HomePage.module.css';

const HomePage: React.FC = () => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [refetch, setRefetch] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [selectedMonthForDisplay, setSelectedMonthForDisplay] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const calculateFinancialData = async () => {
      try {
        // 获取所有交易记录
        const allExpenses = await expenseService.getAllExpenses();
        
        // 计算所选月份收入和支出
        const [year, month] = selectedMonthForDisplay.split('-').map(Number);
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
  }, [selectedMonthForDisplay, refetch]);

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

  const handleMonthSelect = (month: string) => {
    setSelectedMonthForDisplay(month);
    setShowMonthPicker(false);
    setRefetch(!refetch);
  };

  // 格式化月份显示文本
  const formatMonthText = (month: string): string => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    // 计算上月
    let lastMonth = currentMonth - 1;
    let lastYear = currentYear;
    if (lastMonth < 1) {
      lastMonth = 12;
      lastYear -= 1;
    }
    const lastMonthStr = `${lastYear}-${String(lastMonth).padStart(2, '0')}`;

    if (month === currentMonthStr) {
      return '本月支出';
    } else if (month === lastMonthStr) {
      return '上月支出';
    } else {
      return `${month}支出`;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>日常账本</h1>
        <div className={styles.headerActions}>
          <button className={styles.iconButton}>🔍</button>
        </div>
      </div>

      <div className={styles.accountOverview}>
        <div className={styles.expenseSummary}>
          <div 
            className={styles.expenseSummaryLabel} 
            onClick={() => setShowMonthPicker(true)}
            style={{ cursor: 'pointer' }}
          >
            {formatMonthText(selectedMonthForDisplay)}
            <span className={styles.dropdownIcon}>▼</span>
          </div>
          <div className={styles.expenseSummaryAmount}>{monthlyExpense.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
        </div>
        <div className={styles.incomeExpense}>
          <div className={styles.income}>
            <div className={styles.incomeLabel}>本月收入</div>
            <div className={styles.incomeAmount}>{monthlyIncome.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
          </div>
          <div className={styles.balanceSummary}>
            <div className={styles.balanceSummaryLabel}>本月结余</div>
            <div className={styles.balanceSummaryAmount}>{(monthlyIncome - monthlyExpense).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
          </div>
        </div>
        
        {showMonthPicker && (
          <MonthPicker
            selectedMonth={selectedMonthForDisplay}
            onSelect={handleMonthSelect}
            onClose={() => setShowMonthPicker(false)}
          />
        )}
      </div>

      <div className={styles.budgetContainer} onClick={handleOpenBudgetForm}>
        <div className={styles.budgetHeader}>
          <span className={styles.budgetLabel}>预算</span>
          <div className={styles.budgetProgress}>
            <div className={styles.budgetProgressBar}>
              <div 
                className={styles.budgetProgressFill} 
                style={{ 
                  width: currentBudget ? `${Math.min((monthlyExpense / currentBudget.amount) * 100, 100)}%` : '0%' 
                }}
              />
            </div>
            <span className={styles.budgetProgressText}>
              {currentBudget ? `${Math.round((monthlyExpense / currentBudget.amount) * 100)}%` : '0%'}
            </span>
          </div>
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

      <ExpenseList key={refetch.toString()} onEditExpense={handleEditExpense} month={selectedMonthForDisplay} />

      <div className={styles.navigation}>
        <button className={styles.navButton}>
          <span className={styles.navIcon}>📋</span>
          <span className={styles.navText}>账单</span>
        </button>
        <button className={styles.navButton}>
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navText}>统计</span>
        </button>
        <button className={styles.addButton} onClick={handleAddExpense}>
          +
        </button>
        <button className={styles.navButton}>
          <span className={styles.navIcon}>💼</span>
          <span className={styles.navText}>资产</span>
        </button>
        <button className={styles.navButton}>
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navText}>我的</span>
        </button>
      </div>

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
