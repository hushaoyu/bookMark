import React, { useState, useEffect } from 'react';
import { Budget } from '../../types/expense/expense';
import { expenseService } from '../../services/expense/expenseService';
import styles from '../../styles/components/BudgetForm.module.css';

interface BudgetFormProps {
  onClose: () => void;
  onSuccess: () => void;
  budget?: Budget | null;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onClose, onSuccess, budget }) => {
  const [totalBudget, setTotalBudget] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; budget: string }>>([]);

  useEffect(() => {
    // 加载分类数据
    const loadCategories = async () => {
      try {
        const categoryList = await expenseService.getAllCategories();
        const expenseCategories = categoryList.filter(cat => cat.type === 'expense');
        setCategories(expenseCategories.map(cat => ({ id: cat.id, name: cat.name, budget: '0' })));
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    // 加载现有预算
    const loadBudget = async () => {
      if (budget) {
        setTotalBudget(budget.amount.toString());
      } else {
        try {
          const currentBudget = await expenseService.getCurrentMonthBudget();
          if (currentBudget) {
            setTotalBudget(currentBudget.amount.toString());
          }
        } catch (error) {
          console.error('Failed to load current budget:', error);
        }
      }
    };

    loadCategories();
    loadBudget();
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      
      const budgetData: Omit<Budget, 'id'> = {
        amount: parseFloat(totalBudget) || 0,
        categoryId: null, // 总预算
        period: 'month',
        startDate: startOfMonth,
        endDate: endOfMonth,
      };

      if (budget) {
        await expenseService.updateBudget(budget.id, budgetData);
      } else {
        // 检查是否已有本月预算
        const existingBudget = await expenseService.getCurrentMonthBudget();
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
            startDate: startOfMonth,
            endDate: endOfMonth,
          };

          // 检查是否已有该分类的本月预算
          const allBudgets = await expenseService.getAllBudgets();
          const existingCategoryBudget = allBudgets.find(b => 
            b.period === 'month' && 
            b.categoryId === category.id && 
            b.startDate <= startOfMonth && 
            b.endDate >= endOfMonth
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
              <span>总预算</span>
              <span>💰</span>
            </label>
            <input
              type="number"
              id="totalBudget"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="请输入本月总预算"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className={styles.categorySection}>
          <h3>分类预算</h3>
          <div className={styles.categoryList}>
            {categories.map((category) => (
              <div key={category.id} className={styles.categoryItem}>
                <div className={styles.formGroup}>
                  <label htmlFor={`budget-${category.id}`}>{category.name}</label>
                  <input
                    type="number"
                    id={`budget-${category.id}`}
                    value={category.budget}
                    onChange={(e) => handleCategoryBudgetChange(category.id, e.target.value)}
                    placeholder="0"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            ))}
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