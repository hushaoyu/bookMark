import React, { useState, useEffect } from 'react';
import { Budget } from '../../types/expense/expense';
import { expenseService } from '../../services/expense/expenseService';
import styles from '../../styles/components/BudgetForm.module.css';

interface BudgetFormProps {
  onClose: () => void;
  onSuccess: () => void;
  budget?: Budget | null;
  month: string; // 格式: YYYY-MM，用于加载当月支出数据
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onClose, onSuccess, budget, month }) => {
  const [totalBudget, setTotalBudget] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; budget: string }>>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categoryExpenses, setCategoryExpenses] = useState<Record<string, number>>({});

  useEffect(() => {
    // 加载分类数据和预算
    const loadCategoriesAndBudgets = async () => {
      try {
        const categoryList = await expenseService.getAllCategories();
        const expenseCategories = categoryList.filter(cat => cat.type === 'expense');

        // 加载所有预算
        const allBudgets = await expenseService.getAllBudgets();

        // 筛选全局预算（不按月份）
        const globalBudgets = allBudgets.filter(b => b.period === 'month');

        // 设置分类预算
        const categoriesWithBudget = expenseCategories.map(cat => {
          const categoryBudget = globalBudgets.find(b => b.categoryId === cat.id);
          return {
            id: cat.id,
            name: cat.name,
            budget: categoryBudget ? categoryBudget.amount.toString() : '0'
          };
        });
        setCategories(categoriesWithBudget);

        // 设置总预算
        const totalBudget = globalBudgets.find(b => b.categoryId === null);
        if (totalBudget) {
          setTotalBudget(totalBudget.amount.toString());
        }
      } catch (error) {
        console.error('Failed to load categories and budgets:', error);
      }
    };

    // 加载对应月份支出数据
    const loadMonthlyExpenses = async () => {
      try {
        // 获取所有支出数据
        const allExpenses = await expenseService.getAllExpenses();
        
        // 根据传入的月份筛选数据
        const [year, monthNum] = month.split('-').map(Number);
        const expenses = allExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === monthNum && expense.type === 'expense';
        });
        
        // 计算总支出
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalExpense(total);

        // 计算各分类支出
        const categoryMap: Record<string, number> = {};
        expenses.forEach(expense => {
          if (categoryMap[expense.category]) {
            categoryMap[expense.category] += expense.amount;
          } else {
            categoryMap[expense.category] = expense.amount;
          }
        });
        setCategoryExpenses(categoryMap);
      } catch (error) {
        console.error('Failed to load monthly expenses:', error);
      }
    };

    loadCategoriesAndBudgets();
    loadMonthlyExpenses();
  }, [budget, month]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 全局预算数据（不绑定到特定月份）
      const budgetData: Omit<Budget, 'id'> = {
        amount: parseFloat(totalBudget) || 0,
        categoryId: null, // 总预算
        period: 'month',
        startDate: new Date(2000, 0, 1).toISOString(), // 固定起始日期
        endDate: new Date(2100, 11, 31).toISOString(), // 固定结束日期
      };

      if (budget) {
        await expenseService.updateBudget(budget.id, budgetData);
      } else {
        // 检查是否已有总预算
        const allBudgets = await expenseService.getAllBudgets();
        const existingBudget = allBudgets.find(b => b.period === 'month' && b.categoryId === null);
        if (existingBudget) {
          await expenseService.updateBudget(existingBudget.id, budgetData);
        } else {
          await expenseService.createBudget(budgetData);
        }
      }

      // 处理分类预算
      for (const category of categories) {
        if (category.budget) {
          const categoryBudgetData: Omit<Budget, 'id'> = {
            amount: parseFloat(category.budget) || 0,
            categoryId: category.id,
            period: 'month',
            startDate: new Date(2000, 0, 1).toISOString(), // 固定起始日期
            endDate: new Date(2100, 11, 31).toISOString(), // 固定结束日期
          };

          // 检查是否已有该分类的预算
          const allBudgets = await expenseService.getAllBudgets();
          const existingCategoryBudget = allBudgets.find(b =>
            b.period === 'month' &&
            b.categoryId === category.id
          );

          if (existingCategoryBudget) {
            await expenseService.updateBudget(existingCategoryBudget.id, categoryBudgetData);
          } else {
            await expenseService.createBudget(categoryBudgetData);
          }
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save budget:', error);
      alert('保存预算失败');
    }
  };

  const handleCategoryBudgetChange = (id: string, value: string) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, budget: value } : cat
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>预算配置</h2>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.totalBudget}>
          <div className={styles.formGroup}>
            <label htmlFor="totalBudget">
              <div>
                本月支出: ¥{totalExpense.toFixed(2)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div style={{ width: '100px', height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min((totalExpense / parseFloat(totalBudget)) * 100, 100)}%`,
                        height: '100%',
                        backgroundColor: totalExpense > parseFloat(totalBudget) ? '#ff4444' : '#4CAF50',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {Math.round((totalExpense / parseFloat(totalBudget)) * 100)}%
                  </span>
                </div>
              </div>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                id="totalBudget"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="请输入本月总预算"
                step="0.01"
                min="0"
                style={{ paddingLeft: '60px' }}
              />
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '14px',
                color: '#666',
                pointerEvents: 'none'
              }}>
                总预算
              </span>
            </div>
          </div>
        </div>

        <div className={styles.categorySection}>
          <h3>分类预算</h3>
          <div className={styles.categoryList}>
            {categories.map((category) => {
              const categoryExpense = categoryExpenses[category.id] || 0;
              const categoryBudget = parseFloat(category.budget) || 0;
              const progress = categoryBudget > 0 ? (categoryExpense / categoryBudget) * 100 : 0;

              return (
                <div key={category.id} className={styles.categoryItem}>
                  <div className={styles.formGroup}>
                    <label htmlFor={`budget-${category.id}`}>
                      <div>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          支出：¥{categoryExpense.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '4px', backgroundColor: '#f0f0f0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(progress, 100)}%`,
                              height: '100%',
                              backgroundColor: categoryExpense > categoryBudget ? '#ff4444' : '#4CAF50',
                              borderRadius: '2px',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '10px', color: '#666' }}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        id={`budget-${category.id}`}
                        value={category.budget}
                        onChange={(e) => handleCategoryBudgetChange(category.id, e.target.value)}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        style={{ paddingLeft: '60px' }}
                      />
                      <span style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '14px',
                        color: '#666',
                        pointerEvents: 'none'
                      }}>
                        {category.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            取消
          </button>
          <button type="submit" className={styles.saveButton}>
            保存
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;