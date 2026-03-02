import React, { useState } from 'react'
import styles from '../styles/components/exportModal.module.css'
import { expenseService } from '../services/expense/expenseService'

/**
 * ExportModal 组件属性接口
 */
interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  links: any[]
  notes: any[]
}

/**
 * ExportModal 组件
 * 用于选择导出的数据类型
 */
const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  links,
  notes
}) => {
  // 导出选项状态
  const [exportOptions, setExportOptions] = useState({
    links: true,
    notes: true,
    expenses: true
  })

  // 处理选项变更
  const handleOptionChange = (option: keyof typeof exportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  // 处理全选/取消全选
  const handleSelectAll = (selectAll: boolean) => {
    setExportOptions({
      links: selectAll,
      notes: selectAll,
      expenses: selectAll
    })
  }

  // 处理导出
  const handleExport = async () => {
    try {
      const exportData: any = {}

      // 导出链接数据
      if (exportOptions.links) {
        exportData.links = links
      }

      // 导出备忘录数据
      if (exportOptions.notes) {
        exportData.notes = notes
      }

      // 导出记账数据
      if (exportOptions.expenses) {
        const expenses = await expenseService.getAllExpenses()
        const categories = await expenseService.getAllCategories()
        const budgets = await expenseService.getAllBudgets()
        
        exportData.expenses = expenses
        exportData.expenseCategories = categories
        exportData.expenseBudgets = budgets
      }

      // 确保至少选择了一项
      if (Object.keys(exportData).length === 0) {
        alert('请至少选择一项要导出的数据')
        return
      }

      // 添加导出日期
      exportData.exportDate = new Date().toISOString()

      // 生成导出文件
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `personal-tool-data-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)

      // 关闭模态框
      onClose()
    } catch (error) {
      console.error('导出数据失败:', error)
      alert('导出数据失败，请重试')
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>导出数据</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.exportOptions}>
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={exportOptions.links && exportOptions.notes && exportOptions.expenses}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                全选
              </label>
            </div>

            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={exportOptions.links}
                  onChange={() => handleOptionChange('links')}
                />
                链接数据
                <span className={styles.optionDescription}>({links.length} 条记录)</span>
              </label>
            </div>

            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={exportOptions.notes}
                  onChange={() => handleOptionChange('notes')}
                />
                备忘录数据
                <span className={styles.optionDescription}>({notes.length} 条记录)</span>
              </label>
            </div>

            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={exportOptions.expenses}
                  onChange={() => handleOptionChange('expenses')}
                />
                记账本数据
              </label>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>
            取消
          </button>
          <button className={styles.btnPrimary} onClick={handleExport}>
            导出
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal