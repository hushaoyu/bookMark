import { ExpenseItem, ExpenseCategory, Budget } from '../../types/expense/expense';
import { defaultCategories } from '../../utils/expense/defaultCategories';

/**
 * 旧分类ID到新分类ID的映射
 * 用于数据迁移时将旧分类映射到新分类
 */
const CATEGORY_MIGRATION_MAP: Record<string, string> = {
  // 旧分类ID -> 新分类ID
  'snack': 'food', // 零食 -> 餐饮
  'car': 'transport', // 汽车/加油 -> 交通
  'gift': 'redpacket', // 请客送礼 -> 红包
  // 其他分类保持不变
};

class ExpenseStorageService {
  private dbName = 'expense-tracker-db';
  private dbVersion = 2; // 升级版本号
  private db: IDBDatabase | null = null;

  // 初始化数据库
  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB 打开失败:', request.error);
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction;

        // 创建记账记录表
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
          expenseStore.createIndex('type', 'type');
          expenseStore.createIndex('category', 'category');
          expenseStore.createIndex('date', 'date');
          expenseStore.createIndex('createdAt', 'createdAt');
        }

        // 创建分类表
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoryStore.createIndex('type', 'type');
          categoryStore.createIndex('order', 'order');

          // 使用导入的默认分类数据
          defaultCategories.forEach(category => {
            categoryStore.put(category);
          });
        } else {
          // 更新现有分类数据
          if (transaction) {
            const categoryStore = transaction.objectStore('categories');
            const expenseStore = transaction.objectStore('expenses');

            // 1. 清空旧分类数据
            const clearRequest = categoryStore.clear();
            clearRequest.onsuccess = () => {
              // 2. 写入新的分类数据
              defaultCategories.forEach(category => {
                categoryStore.put(category);
              });
            };

            // 3. 更新所有记账记录中的分类ID
            const getAllExpensesRequest = expenseStore.getAll();
            getAllExpensesRequest.onsuccess = () => {
              const expenses = getAllExpensesRequest.result as ExpenseItem[];
              let updatedCount = 0;

              expenses.forEach(expense => {
                const newCategoryId = CATEGORY_MIGRATION_MAP[expense.category];
                if (newCategoryId) {
                  expense.category = newCategoryId;
                  expenseStore.put(expense);
                  updatedCount++;
                }
              });

              console.log(`已迁移 ${updatedCount} 条记账记录的分类`);
            };
          }
        }

        // 创建预算表
        if (!db.objectStoreNames.contains('budgets')) {
          const budgetStore = db.createObjectStore('budgets', { keyPath: 'id' });
          budgetStore.createIndex('categoryId', 'categoryId');
          budgetStore.createIndex('period', 'period');
          budgetStore.createIndex('startDate', 'startDate');
          budgetStore.createIndex('endDate', 'endDate');
        }
      };
    });
  }

  /**
   * 手动触发分类数据更新
   * 用于强制更新分类数据（不升级数据库版本）
   */
  async refreshCategories(): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['categories', 'expenses'], 'readwrite');
      const categoryStore = transaction.objectStore('categories');
      const expenseStore = transaction.objectStore('expenses');

      // 1. 清空旧分类数据
      const clearRequest = categoryStore.clear();
      clearRequest.onsuccess = () => {
        // 2. 写入新的分类数据
        defaultCategories.forEach(category => {
          categoryStore.put(category);
        });
      };

      // 3. 更新所有记账记录中的分类ID
      const getAllExpensesRequest = expenseStore.getAll();
      getAllExpensesRequest.onsuccess = () => {
        const expenses = getAllExpensesRequest.result as ExpenseItem[];
        let updatedCount = 0;

        expenses.forEach(expense => {
          const newCategoryId = CATEGORY_MIGRATION_MAP[expense.category];
          if (newCategoryId) {
            expense.category = newCategoryId;
            expenseStore.put(expense);
            updatedCount++;
          }
        });

        console.log(`已更新 ${updatedCount} 条记账记录的分类`);
      };

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        console.error('分类更新失败:', transaction.error);
        reject(new Error('Failed to refresh categories'));
      };
    });
  }

  // 通用 CRUD 操作
  async add<T>(storeName: string, item: T): Promise<T> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = () => {
        reject(new Error('Failed to add item'));
      };
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get item'));
      };
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get all items'));
      };
    });
  }

  async update<T>(storeName: string, item: T & { id: string }): Promise<T> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = () => {
        reject(new Error('Failed to update item'));
      };
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete item'));
      };
    });
  }

  // 记账记录相关操作
  async addExpense(expense: ExpenseItem): Promise<ExpenseItem> {
    return this.add('expenses', expense);
  }

  async getExpense(id: string): Promise<ExpenseItem | null> {
    return this.get<ExpenseItem>('expenses', id);
  }

  async getAllExpenses(): Promise<ExpenseItem[]> {
    return this.getAll<ExpenseItem>('expenses');
  }

  async updateExpense(expense: ExpenseItem): Promise<ExpenseItem> {
    return this.update('expenses', expense);
  }

  async deleteExpense(id: string): Promise<void> {
    return this.delete('expenses', id);
  }

  // 分类相关操作
  async addCategory(category: ExpenseCategory): Promise<ExpenseCategory> {
    return this.add('categories', category);
  }

  async getCategory(id: string): Promise<ExpenseCategory | null> {
    return this.get<ExpenseCategory>('categories', id);
  }

  async getAllCategories(): Promise<ExpenseCategory[]> {
    const categories = await this.getAll<ExpenseCategory>('categories');
    
    // 如果分类数据为空，自动重新加载默认分类
    if (categories.length === 0) {
      await this.refreshCategories();
      return this.getAll<ExpenseCategory>('categories');
    }
    
    return categories;
  }

  async updateCategory(category: ExpenseCategory): Promise<ExpenseCategory> {
    return this.update('categories', category);
  }

  async deleteCategory(id: string): Promise<void> {
    return this.delete('categories', id);
  }

  // 预算相关操作
  async addBudget(budget: Budget): Promise<Budget> {
    return this.add('budgets', budget);
  }

  async getBudget(id: string): Promise<Budget | null> {
    return this.get<Budget>('budgets', id);
  }

  async getAllBudgets(): Promise<Budget[]> {
    return this.getAll<Budget>('budgets');
  }

  async updateBudget(budget: Budget): Promise<Budget> {
    return this.update('budgets', budget);
  }

  async deleteBudget(id: string): Promise<void> {
    return this.delete('budgets', id);
  }
}

export const expenseStorageService = new ExpenseStorageService();

