import { ExpenseItem, Budget, ExpenseCategory } from '../../types/expense/expense';
import { expenseStorageService } from './storageService';
import { defaultCategories } from '../../utils/expense/defaultCategories';

class ExpenseService {
  // 创建记账记录
  async createExpense(data: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseItem> {
    const now = new Date().toISOString();
    const expense: ExpenseItem = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    return await expenseStorageService.addExpense(expense);
  }

  // 获取所有记账记录
  async getAllExpenses(): Promise<ExpenseItem[]> {
    const expenses = await expenseStorageService.getAllExpenses();
    // 按日期降序排序
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // 获取指定日期范围内的记账记录
  async getExpensesByDateRange(startDate: string, endDate: string): Promise<ExpenseItem[]> {
    const allExpenses = await this.getAllExpenses();
    return allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
    });
  }

  // 获取本月记账记录
  async getCurrentMonthExpenses(): Promise<ExpenseItem[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    return this.getExpensesByDateRange(startOfMonth, endOfMonth);
  }

  // 获取今日记账记录
  async getTodayExpenses(): Promise<ExpenseItem[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
    return this.getExpensesByDateRange(startOfDay, endOfDay);
  }

  // 更新记账记录
  async updateExpense(id: string, data: Partial<ExpenseItem>): Promise<ExpenseItem> {
    const expense = await expenseStorageService.getExpense(id);
    if (!expense) {
      throw new Error('Expense not found');
    }
    const updatedExpense: ExpenseItem = {
      ...expense,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return await expenseStorageService.updateExpense(updatedExpense);
  }

  // 删除记账记录
  async deleteExpense(id: string): Promise<void> {
    return await expenseStorageService.deleteExpense(id);
  }

  // 预算相关方法
  async createBudget(data: Omit<Budget, 'id'>): Promise<Budget> {
    const budget: Budget = {
      ...data,
      id: crypto.randomUUID(),
    };
    return await expenseStorageService.addBudget(budget);
  }

  async updateBudget(id: string, data: Partial<Budget>): Promise<Budget> {
    const budget = await expenseStorageService.getBudget(id);
    if (!budget) {
      throw new Error('Budget not found');
    }
    const updatedBudget: Budget = {
      ...budget,
      ...data,
    };
    return await expenseStorageService.updateBudget(updatedBudget);
  }

  async deleteBudget(id: string): Promise<void> {
    return await expenseStorageService.deleteBudget(id);
  }

  async getAllBudgets(): Promise<Budget[]> {
    return await expenseStorageService.getAllBudgets();
  }

  async getCurrentMonthBudget(): Promise<Budget | null> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    
    const budgets = await this.getAllBudgets();
    return budgets.find(budget => 
      budget.period === 'month' && 
      budget.categoryId === null && 
      budget.startDate <= startOfMonth && 
      budget.endDate >= endOfMonth
    ) || null;
  }

  // 导出数据
  async exportData(): Promise<string> {
    const expenses = await this.getAllExpenses();
    const budgets = await expenseStorageService.getAllBudgets();

    const data = {
      expenses,
      budgets,
      exportDate: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  // 分类相关方法
  async getAllCategories(): Promise<ExpenseCategory[]> {
    return defaultCategories;
  }

  // 导入数据
  async importData(json: string): Promise<void> {
    try {
      const data = JSON.parse(json);

      // 导入预算
      if (data.budgets && Array.isArray(data.budgets)) {
        for (const budget of data.budgets) {
          await expenseStorageService.addBudget(budget);
        }
      }

      // 导入记账记录
      if (data.expenses && Array.isArray(data.expenses)) {
        for (const expense of data.expenses) {
          await expenseStorageService.addExpense(expense);
        }
      }
    } catch (error) {
      throw new Error('Failed to import data');
    }
  }
}

export const expenseService = new ExpenseService();
