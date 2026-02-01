import React from 'react'
import styles from '../styles/components/header.module.css'

interface HeaderProps {
  activePage: 'list' | 'stats' | 'notes'
  isMenuOpen: boolean
  passwordSet: boolean
  handleAddLink: () => void
  handleOpenAddNoteModal: () => void
  setIsMenuOpen: (open: boolean) => void
  handleSwitchPage: (page: 'list' | 'stats' | 'notes') => void
  handleOpenPasswordSetting: () => void
  handleExportData: () => void
  handleImportData: () => void
}

const Header: React.FC<HeaderProps> = ({
  activePage,
  isMenuOpen,
  passwordSet,
  handleAddLink,
  handleOpenAddNoteModal,
  setIsMenuOpen,
  handleSwitchPage,
  handleOpenPasswordSetting,
  handleExportData,
  handleImportData
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.headerTitle}>
          {activePage === 'list' ? '链接管理器' : activePage === 'notes' ? '备忘录' : '统计分析'}
        </h1>
        <div className={styles.headerActions}>
          {activePage === 'list' && (
            <button className={styles.btnPrimary} onClick={handleAddLink}>
              + 添加链接
            </button>
          )}
          {activePage === 'notes' && (
            <button className={styles.btnPrimary} onClick={handleOpenAddNoteModal}>
              + 添加备忘录
            </button>
          )}
          <div className={styles.menuButtonContainer}>
            <button className={styles.menuButton} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ☰
            </button>
            {isMenuOpen && (
              <div className={styles.menuDropdown}>
                <button 
                  className={`${styles.menuItem} ${activePage === 'list' ? styles.active : ''}`}
                  onClick={() => handleSwitchPage('list')}
                >
                  链接列表
                </button>
                <button 
                  className={`${styles.menuItem} ${activePage === 'notes' ? styles.active : ''}`}
                  onClick={() => handleSwitchPage('notes')}
                >
                  备忘录
                </button>
                <button 
                  className={`${styles.menuItem} ${activePage === 'stats' ? styles.active : ''}`}
                  onClick={() => handleSwitchPage('stats')}
                >
                  统计分析
                </button>
                <button 
                  className={styles.menuItem}
                  onClick={handleOpenPasswordSetting}
                >
                  {passwordSet ? '修改密码' : '设置密码'}
                </button>
                <button 
                  className={styles.menuItem}
                  onClick={handleExportData}
                >
                  导出数据
                </button>
                <button 
                  className={styles.menuItem}
                  onClick={handleImportData}
                >
                  导入数据
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
