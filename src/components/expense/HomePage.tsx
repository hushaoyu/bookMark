import React, { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ExpenseDetail from './ExpenseDetail';
import BudgetForm from './BudgetForm';
import MonthPicker from './MonthPicker';
import CalendarView from './CalendarView';
import { ExpenseItem, Budget } from '../../types/expense/expense';
import { expenseService } from '../../services/expense/expenseService';
import styles from '../../styles/components/HomePage.module.css';

interface HomePageProps {
  onSwitchPage?: (page: 'expense' | 'list' | 'notes' | 'statistics') => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSwitchPage }) => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
  const [refetch, setRefetch] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
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

        // 获取全局预算
        const allBudgets = await expenseService.getAllBudgets();
        const budget = allBudgets.find(b => b.period === 'month' && b.categoryId === null);
        setCurrentBudget(budget || null);
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
    setSelectedExpense(expense);
    setShowExpenseDetail(true);
  };

  const handleCloseExpenseDetail = () => {
    setShowExpenseDetail(false);
    setSelectedExpense(null);
  };

  const handleEditFromDetail = (expense: ExpenseItem) => {
    setShowExpenseDetail(false);
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await expenseService.deleteExpense(expenseId);
      setRefetch(!refetch); // 触发重新获取数据
    } catch (error) {
      console.error('删除记账记录失败:', error);
    }
  };

  const handleCloseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const handleExpenseSuccess = () => {
    setRefetch(!refetch);
  };

  const handleBudgetSuccess = async () => {
    // 预算设置成功后，重新获取全局预算
    const allBudgets = await expenseService.getAllBudgets();
    const budget = allBudgets.find(b => b.period === 'month' && b.categoryId === null);
    setCurrentBudget(budget || null);
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

  const handleCalendarSelectDate = (_date: string) => {
    // 可以在这里处理日期选择，比如筛选该日期的账单
    setShowCalendar(false);
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
          <button 
            className={styles.iconButton} 
            onClick={() => setShowCalendar(true)}
            title="查看日历"
          >
            📅
          </button>
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
                  width: currentBudget ? `${Math.min((monthlyExpense / currentBudget.amount) * 100, 100)}%` : '0%',
                  backgroundColor: currentBudget && monthlyExpense > currentBudget.amount ? '#ff4444' : '#4CAF50'
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
        <button 
          className={styles.navButton}
          onClick={() => onSwitchPage?.('statistics')}
        >
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
            month={selectedMonthForDisplay}
          />
        </div>
      )}

      {showCalendar && (
        <CalendarView
          month={selectedMonthForDisplay}
          onClose={() => setShowCalendar(false)}
          onSelectDate={handleCalendarSelectDate}
        />
      )}

      {showExpenseDetail && selectedExpense && (
        <div className={styles.detailOverlay}>
          <ExpenseDetail
            expense={selectedExpense}
            onClose={handleCloseExpenseDetail}
            onEdit={handleEditFromDetail}
            onDelete={handleDeleteExpense}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;