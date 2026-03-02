import React, { useState, useEffect, useMemo } from 'react';
import { ExpenseItem } from '../../types/expense/expense';
import { expenseService } from '../../services/expense/expenseService';
import styles from '../../styles/components/StatisticsPage.module.css';
import { defaultCategories } from '../../utils/expense/defaultCategories';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// 统计类型
type StatisticsType = 'month' | 'year';

// 收支类型
type TransactionType = 'expense' | 'income';



const StatisticsPage: React.FC = () => {
  const [statisticsType, setStatisticsType] = useState<StatisticsType>('month');
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [onSwitchPage, setOnSwitchPage] = useState<((page: 'expense' | 'list' | 'notes' | 'statistics') => void) | null>(null);
  
  // 获取父组件传递的onSwitchPage方法
  useEffect(() => {
    // 尝试从window对象获取onSwitchPage方法（在App组件中设置）
    const checkAndSetOnSwitchPage = () => {
      const globalOnSwitchPage = (window as any).__onSwitchPage;
      if (globalOnSwitchPage) {
        setOnSwitchPage(() => globalOnSwitchPage);
      }
    };
    
    // 立即检查一次
    checkAndSetOnSwitchPage();
    
    // 设置定时器检查，确保在App组件设置后能够获取到
    const interval = setInterval(checkAndSetOnSwitchPage, 100);
    
    // 3秒后清除定时器
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);
  
  // 返回记账本首页
  const handleBackToHome = () => {
    onSwitchPage?.('expense');
  };

  // 获取所有记账数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allExpenses = await expenseService.getAllExpenses();
        setExpenses(allExpenses);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      }
    };
    fetchData();
  }, []);

  // 计算月度趋势数据
  const monthlyTrendData = useMemo(() => {
    if (statisticsType === 'month') {
      // 当选择月度统计时，显示当前月份的每日数据
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const dailyData: Array<{ name: string; date: string; income: number; expense: number }> = [];
      
      // 初始化当月所有天
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        dailyData.push({
          name: `${day}`,
          date: dateStr,
          income: 0,
          expense: 0
        });
      }
      
      // 统计每天的数据
      expenses.forEach(e => {
        const eDate = new Date(e.date);
        if (eDate.getFullYear() === selectedYear && eDate.getMonth() + 1 === selectedMonth) {
          const day = eDate.getDate();
          const index = day - 1;
          if (index >= 0 && index < dailyData.length) {
            if (e.type === 'income') {
              dailyData[index].income += e.amount;
            } else {
              dailyData[index].expense += e.amount;
            }
          }
        }
      });
      
      return dailyData;
    } else {
      // 当选择年度统计时，显示最近5年的数据
      const yearlyData: Record<string, { income: number; expense: number }> = {};
      const currentYear = new Date().getFullYear();
      
      // 初始化最近5年
      for (let i = currentYear - 4; i <= currentYear; i++) {
        yearlyData[`${i}年`] = { income: 0, expense: 0 };
      }
      
      expenses.forEach(e => {
        const eDate = new Date(e.date);
        const year = eDate.getFullYear();
        if (year >= currentYear - 4 && year <= currentYear) {
          const yearKey = `${year}年`;
          if (e.type === 'income') {
            yearlyData[yearKey].income += e.amount;
          } else {
            yearlyData[yearKey].expense += e.amount;
          }
        }
      });
      
      // 转换为图表需要的格式
      return Object.entries(yearlyData)
        .sort((a, b) => {
          const numA = parseInt(a[0].replace(/[^\d]/g, ''));
          const numB = parseInt(b[0].replace(/[^\d]/g, ''));
          return numA - numB;
        })
        .map(([key, data]) => ({
          name: key,
          date: key,
          income: data.income,
          expense: data.expense,
          total: data.income + data.expense
        }));
    }
  }, [expenses, statisticsType, selectedYear, selectedMonth]);
  
  // 计算统计数据（支出笔数、最高支出、最低支出、日均支出）
  const detailedStatistics = useMemo(() => {
    const filteredExpenses = expenses.filter(e => {
      const eDate = new Date(e.date);
      if (statisticsType === 'month') {
        return eDate.getFullYear() === selectedYear && eDate.getMonth() + 1 === selectedMonth;
      } else {
        return eDate.getFullYear() === selectedYear;
      }
    });
    
    const typeExpenses = filteredExpenses.filter(e => e.type === transactionType);
    const amounts = typeExpenses.map(e => e.amount);
    
    let dailyAverage = 0;
    if (statisticsType === 'month' && amounts.length > 0) {
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      dailyAverage = amounts.reduce((sum, val) => sum + val, 0) / daysInMonth;
    } else if (statisticsType === 'year' && amounts.length > 0) {
      const daysInYear = (selectedYear % 4 === 0 && selectedYear % 100 !== 0 || selectedYear % 400 === 0) ? 366 : 365;
      dailyAverage = amounts.reduce((sum, val) => sum + val, 0) / daysInYear;
    }
    
    return {
      count: typeExpenses.length,
      maxAmount: amounts.length > 0 ? Math.max(...amounts) : 0,
      minAmount: amounts.length > 0 ? Math.min(...amounts) : 0,
      dailyAverage
    };
  }, [expenses, statisticsType, selectedYear, selectedMonth, transactionType]);
  
  // 计算分类数据（根据当前选择的收支类型）
  const categoryData = useMemo(() => {
    // 按分类统计金额
    const categoryAmounts: Record<string, number> = {};
    let total = 0;

    expenses.forEach(e => {
      const eDate = new Date(e.date);
      let isWithinDateRange = false;

      if (statisticsType === 'month') {
        isWithinDateRange = eDate.getFullYear() === selectedYear && eDate.getMonth() + 1 === selectedMonth;
      } else {
        isWithinDateRange = eDate.getFullYear() === selectedYear;
      }

      if (isWithinDateRange && e.type === transactionType) {
        if (!categoryAmounts[e.category]) {
          categoryAmounts[e.category] = 0;
        }
        categoryAmounts[e.category] += e.amount;
        total += e.amount;
      }
    });

    // 创建分类ID到中文名称的映射
    const categoryNameMap: Record<string, string> = {};
    defaultCategories.forEach(cat => {
      categoryNameMap[cat.id] = cat.name;
    });

    // 转换为图表需要的格式
    const categories = Object.entries(categoryAmounts).map(([name, value]) => {
      const percentage = total > 0 ? (value / total) * 100 : 0;
      return {
        name: categoryNameMap[name] || name,
        amount: value,
        percentage,
        value // Recharts Pie组件需要value字段
      };
    });

    // 按金额排序并取前5名
    const sortedCategories = categories
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 生成颜色
    const colorScale = sortedCategories.map((_, index) => {
      const hue = 200 - (index * 30);
      return `hsl(${hue}, 70%, 55%)`;
    });

    return {
      data: sortedCategories,
      colors: colorScale,
      total
    };
  }, [expenses, statisticsType, selectedYear, selectedMonth, transactionType]);
  




  // 格式化金额
  const formatAmount = (amount: number) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };



  return (
    <div className={styles.container}>
      {/* 返回按钮 */}
      <div className={styles.topBar}>
        {/* 收支类型切换 */}
        <div className={styles.typeTabs}>
          <button
            className={`${styles.typeTab} ${transactionType === 'expense' ? styles.typeTabActive : ''}`}
            onClick={() => setTransactionType('expense')}
          >
            支出
          </button>
          <button
            className={`${styles.typeTab} ${transactionType === 'income' ? styles.typeTabActive : ''}`}
            onClick={() => setTransactionType('income')}
          >
            收入
          </button>
        </div>
        <button className={styles.backButton} onClick={handleBackToHome}>
          返回
        </button>
      </div>

      {/* 时间筛选 */}
      <div className={styles.filterContainer}>
        <div className={styles.filterRow}>
          <div className={styles.dateSelector}>
            {statisticsType === 'month' ? (
              <>
                <select 
                  className={styles.dateSelect}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
                <select 
                  className={styles.dateSelect}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{month}月</option>
                  ))}
                </select>
              </>
            ) : (
              <select 
                className={styles.dateSelect}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            )}
          </div>
          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${statisticsType === 'month' ? styles.filterTabActive : ''}`}
              onClick={() => setStatisticsType('month')}
            >
              月
            </button>
            <button
              className={`${styles.filterTab} ${statisticsType === 'year' ? styles.filterTabActive : ''}`}
              onClick={() => setStatisticsType('year')}
            >
              年
            </button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className={styles.statisticsCards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>笔数</div>
          <div className={styles.statAmount}>{detailedStatistics.count}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>最高{transactionType === 'expense' ? '支出' : '收入'}</div>
          <div className={styles.statAmount}>¥{formatAmount(detailedStatistics.maxAmount)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>最低{transactionType === 'expense' ? '支出' : '收入'}</div>
          <div className={styles.statAmount}>¥{formatAmount(detailedStatistics.minAmount)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>日均{transactionType === 'expense' ? '支出' : '收入'}</div>
          <div className={styles.statAmount}>¥{formatAmount(detailedStatistics.dailyAverage)}</div>
        </div>
      </div>

      {/* 月度趋势图 */}
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>{transactionType === 'expense' ? '支出' : '收入'}走势</h3>
        </div>
        
        <div className={styles.lineChart}>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={monthlyTrendData} margin={{ top: 5, right: 5, left: 5, bottom: -10 }}>
              <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                  interval={statisticsType === 'month' ? 
                    (monthlyTrendData.length > 25 ? 4 : 
                     monthlyTrendData.length > 15 ? 2 : 0) : 0}
                />
              <YAxis 
                hide={true}
              />
              <Tooltip formatter={(value) => [`¥${formatAmount(value)}`, '金额']} />
              <Line
                  type="monotone"
                  dataKey={transactionType === 'income' ? 'income' : 'expense'}
                  stroke="#2196F3"
                  strokeWidth={2}
                  dot={() => null}
                />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 分类占比 */}
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>{transactionType === 'expense' ? '支出' : '收入'}占比</h3>
        </div>
        
        {categoryData.data.length > 0 ? (
          <div className={styles.pieChartContainer}>
            <div className={styles.pieChart} style={{ position: 'relative', width: '200px', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={undefined}
                    cornerRadius="50%"
                  >
                    {categoryData.data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={categoryData.colors[index % categoryData.colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`¥${formatAmount(value)}`, '金额']} />
                </PieChart>
              </ResponsiveContainer>
              {/* 中间显示总支出 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1.2
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                  总{transactionType === 'expense' ? '支出' : '收入'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                  ¥{formatAmount(categoryData.total)}
                </div>
              </div>
            </div>
            
            {/* 分类图例 */}
            <div className={styles.categoryLegend}>
              {categoryData.data.map((category, index) => (
                <div key={index} className={styles.categoryLegendItem}>
                  <span 
                    className={styles.categoryColorDot}
                    style={{ backgroundColor: categoryData.colors[index % categoryData.colors.length] }}
                  />
                  <span className={styles.categoryName}>{category.name}</span>
                  <span className={styles.categoryPercentage}>
                    {category.percentage.toFixed(1)}%
                  </span>
                  <span className={styles.categoryAmount}>
                    ¥{formatAmount(category.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📊</span>
            <p>暂无{transactionType === 'expense' ? '支出' : '收入'}数据</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
