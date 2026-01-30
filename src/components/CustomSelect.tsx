import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/components/custom-select.module.css';

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * 自定义下拉选择组件
 * 参考标签推荐列表的样式实现
 */
const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '请选择',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // 获取当前选中的选项标签
  const selectedOption = options.find(option => option.value === value);
  const selectedLabel = selectedOption?.label || placeholder;

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理选项选择
  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.customSelectContainer} ${className}`} ref={selectRef}>
      <div 
        className={styles.customSelect}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.selectedValue}>{selectedLabel}</span>
        <div className={`${styles.selectArrow} ${isOpen ? styles.arrowOpen : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className={styles.optionsList}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`${styles.optionItem} ${option.value === value ? styles.selectedOption : ''}`}
              onClick={() => handleSelectOption(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
