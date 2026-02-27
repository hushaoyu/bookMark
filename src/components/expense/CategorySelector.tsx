import React, { useState, useEffect } from 'react';
import { ExpenseCategory } from '../../types/expense/expense';
import { expenseStorageService } from '../../services/expense/storageService';
import styles from '../../styles/components/CategorySelector.module.css';

interface CategorySelectorProps {
  type: 'income' | 'expense';
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  type,
  selectedCategory,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  useEffect(() => {
    loadCategories();
  }, [type]);

  const loadCategories = async () => {
    try {
      const allCategories = await expenseStorageService.getAllCategories();
      const filteredCategories = allCategories
        .filter(category => category.type === type)
        .sort((a, b) => a.order - b.order);
      setCategories(filteredCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {categories.map((category) => (
          <div
            key={category.id}
            className={`${styles.categoryItem} ${selectedCategory === category.id ? styles.selected : ''}`}
            onClick={() => onSelectCategory(category.id)}
          >
            <div className={styles.icon} style={{ color: category.color }}>
              {category.icon}
            </div>
            <div className={styles.name}>{category.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
