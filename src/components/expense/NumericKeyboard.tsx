import React from 'react';
import styles from '../../styles/components/NumericKeyboard.module.css';

interface NumericKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClear: () => void;
  type: 'income' | 'expense';
}

const NumericKeyboard: React.FC<NumericKeyboardProps> = ({
  value,
  onChange,
  onSave,
  onClear,
}) => {
  const handleKeyPress = (key: string) => {
    if (key === 'delete') {
      onChange(value.slice(0, -1));
    } else if (key === '再记') {
      onClear();
    } else if (key === '保存') {
      onSave();
    } else if (['+', '-'].includes(key)) {
      // 处理运算符：如果是第一个字符且为'-'，则允许输入
      if (value === '' && key === '-') {
        onChange(key);
      } else if (value !== '') {
        // 检查最后一个字符是否是运算符
        const lastChar = value[value.length - 1];
        if (!['+', '-'].includes(lastChar)) {
          // 如果最后一个字符不是运算符，则允许添加运算符
          onChange(value + key);
        }
      }
    } else if (key === '.') {
      if (!value.includes('.')) {
        onChange(value + key);
      }
    } else {
      // 限制输入长度，最多两位小数
      const parts = value.split('.');
      if (parts.length === 2 && parts[1].length >= 2) {
        return;
      }
      onChange(value + key);
    }
  };

  const keys = [
    ['1', '2', '3', 'delete'],
    ['4', '5', '6', '-'],
    ['7', '8', '9', '+'],
    ['再记', '0', '.', '保存'],
  ];

  return (
    <div className={styles.container}>
      <div className={styles.keyboard}>
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((key) => (
              <button
                key={key}
                className={`${styles.key} ${key === 'delete' ? styles.deleteKey : key === '保存' ? styles.saveKey : ''}`}
                onClick={() => handleKeyPress(key)}
              >
                {key === 'delete' ? '⌫' : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NumericKeyboard;
