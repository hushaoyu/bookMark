import React, { useState, useEffect } from 'react'
import LinkForm from './components/LinkForm'
import LinkList from './components/LinkList'
import Modal from './components/Modal'
import Header from './components/Header'
import StatsPage from './components/StatsPage'
import PasswordModal from './components/PasswordModal'
import CustomSelect from './components/CustomSelect'
import { LinkItem } from './types'
import useLocalStorage from './hooks/useLocalStorage'
import styles from './styles/components/app.module.css'

const App: React.FC = () => {
  const [links, setLinks] = useLocalStorage<LinkItem[]>('links', [])
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<'title' | 'url' | 'tags'>('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedLinks, setSelectedLinks] = useState<string[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activePage, setActivePage] = useState<'list' | 'stats'>('list')

  // 添加新链接
  const handleAddLink = (link: Omit<LinkItem, 'id'>) => {
    const newLink: LinkItem = {
      ...link,
      id: Date.now().toString()
    }
    setLinks(prevLinks => [...prevLinks, newLink])
  }

  // 更新链接
  const handleUpdateLink = (updatedLink: LinkItem) => {
    setLinks(prevLinks => prevLinks.map(link => link.id === updatedLink.id ? updatedLink : link))
    setEditingLink(null)
  }

  // 删除链接
  const handleDeleteLink = (id: string) => {
    if (window.confirm('确定要删除这个链接吗？')) {
      setLinks(prevLinks => prevLinks.filter(link => link.id !== id))
    }
  }

  // 批量删除链接
  const handleBatchDelete = () => {
    if (selectedLinks.length === 0) return

    if (window.confirm(`确定要删除选中的 ${selectedLinks.length} 个链接吗？`)) {
      setLinks(prevLinks => prevLinks.filter(link => !selectedLinks.includes(link.id)))
      setSelectedLinks([])
    }
  }

  // 切换链接选中状态
  const handleToggleSelectLink = (id: string) => {
    setSelectedLinks(prev => {
      if (prev.includes(id)) {
        return prev.filter(linkId => linkId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedLinks.length === links.length) {
      setSelectedLinks([])
    } else {
      setSelectedLinks(links.map(link => link.id))
    }
  }

  // 开始编辑链接
  const handleEditLink = (link: LinkItem) => {
    setEditingLink(link)
    setIsModalOpen(true)
  }

  // 打开添加链接弹框
  const handleOpenAddModal = () => {
    setEditingLink(null)
    setIsModalOpen(true)
  }

  // 关闭弹框
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLink(null)
  }





  // 切换页面
  const handleSwitchPage = (page: 'list' | 'stats') => {
    setActivePage(page)
    setIsMenuOpen(false)
  }

  // 密码相关状态
  const [passwordSet, setPasswordSet] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isPasswordVerifyOpen, setIsPasswordVerifyOpen] = useState<boolean>(false)
  const [isPasswordSettingOpen, setIsPasswordSettingOpen] = useState<boolean>(false)
  const [password, setPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [passwordConfirm, setPasswordConfirm] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')

  // 检查是否设置了密码
  useEffect(() => {
    const hasPassword = localStorage.getItem('password')
    setPasswordSet(!!hasPassword)
    if (hasPassword) {
      // 如果设置了密码，打开验证弹框
      setIsPasswordVerifyOpen(true)
    } else {
      // 未设置密码，直接认证通过
      setIsAuthenticated(true)
    }
  }, [])

  // 打开密码设置弹框
  const handleOpenPasswordSetting = () => {
    setIsPasswordSettingOpen(true)
    setNewPassword('')
    setPasswordConfirm('')
    setPasswordError('')
    setIsMenuOpen(false)
  }

  // 验证密码
  const handleVerifyPassword = () => {
    const storedPassword = localStorage.getItem('password')
    if (storedPassword && storedPassword === password) {
      setIsAuthenticated(true)
      setIsPasswordVerifyOpen(false)
      setPassword('')
      setPasswordError('')
    } else {
      setPasswordError('密码错误，请重新输入')
    }
  }

  // 设置密码
  const handleSetPassword = () => {
    if (newPassword.length < 4) {
      setPasswordError('密码长度至少4位')
      return
    }

    if (newPassword !== passwordConfirm) {
      setPasswordError('两次输入的密码不一致')
      return
    }

    localStorage.setItem('password', newPassword)
    setPasswordSet(true)
    setIsPasswordSettingOpen(false)
    setNewPassword('')
    setPasswordConfirm('')
    setPasswordError('')
  }

  // 清除密码
  const handleClearPassword = () => {
    if (window.confirm('确定要清除密码吗？')) {
      localStorage.removeItem('password')
      setPasswordSet(false)
      setIsPasswordSettingOpen(false)
    }
  }

  return (
    <div className={styles.app}>
      {isAuthenticated || !passwordSet ? (
        <>
          <Header
            activePage={activePage}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            handleSwitchPage={handleSwitchPage}
            handleAddLink={handleOpenAddModal}
            handleOpenPasswordSetting={handleOpenPasswordSetting}
            passwordSet={passwordSet}
          />
          {/* 收集所有已存在的标签 */}
          {(() => {
            const allTags = new Set<string>();
            links.forEach(link => {
              link.tags.forEach(tag => allTags.add(tag));
            });
            return (
              <>
                <main>
                  {activePage === 'list' ? (
                    <div className={styles.appContainer}>
                      <div className={styles.searchSortContainer}>
                        <div className={styles.searchContainer}>
                          <input
                            type="text"
                            placeholder="搜索链接..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                          />
                        </div>
                        <div className={styles.sortContainer}>
                          <CustomSelect
                            options={[
                              { value: 'title', label: '按标题' },
                              { value: 'url', label: '按URL' },
                              { value: 'tags', label: '按标签数量' }
                            ]}
                            value={sortBy}
                            onChange={(value) => setSortBy(value as 'title' | 'url' | 'tags')}
                            placeholder="选择排序方式"
                          />
                          <button
                            className={styles.sortToggle}
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </button>
                        </div>
                      </div>
                      <LinkList
                        links={links}
                        searchTerm={searchTerm}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        selectedLinks={selectedLinks}
                        onEditLink={handleEditLink}
                        onDeleteLink={handleDeleteLink}
                        onToggleSelectLink={handleToggleSelectLink}
                        onSelectAll={handleSelectAll}
                        onBatchDelete={handleBatchDelete}
                      />
                    </div>
                  ) : (
                    <StatsPage links={links} />
                  )}
                </main>
                {/* 添加/编辑链接弹框 */}
                <Modal
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                  title={editingLink ? '编辑链接' : '添加新链接'}
                >
                  <LinkForm
                    onAddLink={(link) => {
                      handleAddLink(link)
                      handleCloseModal()
                    }}
                    onUpdateLink={(link) => {
                      handleUpdateLink(link)
                      handleCloseModal()
                    }}
                    editingLink={editingLink}
                    onCancelEdit={handleCloseModal}
                    existingTags={Array.from(allTags)}
                  />
                </Modal>
              </>
            );
          })()}
        </>
      ) : (
        <div className={styles.passwordProtected}>
          {/* 密码保护页面 */}
        </div>
      )}

      {/* 密码相关弹窗 */}
      <PasswordModal
        isVerifyOpen={isPasswordVerifyOpen}
        isSettingOpen={isPasswordSettingOpen}
        password={password}
        setPassword={setPassword}
        passwordError={passwordError}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        passwordConfirm={passwordConfirm}
        setPasswordConfirm={setPasswordConfirm}
        passwordSettingError={passwordError}
        passwordSet={passwordSet}
        handleVerifyPassword={handleVerifyPassword}
        handleSetPassword={handleSetPassword}
        handleClearPassword={handleClearPassword}
        handleCloseVerify={() => setIsPasswordVerifyOpen(false)}
        handleCloseSetting={() => setIsPasswordSettingOpen(false)}
      />
    </div>
  )
}

export default App