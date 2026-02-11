import React, { useState, useEffect, lazy, Suspense } from 'react'
import Modal from './components/Modal'
import Header from './components/Header'
import StatsPage from './components/StatsPage'
import PasswordModal from './components/PasswordModal'
import CustomSelect from './components/CustomSelect'
import UpdateChecker from './components/UpdateChecker'
import SettingsModal from './components/SettingsModal'
import useUpdateChecker from './hooks/useUpdateChecker'

// 代码分割
const LinkForm = lazy(() => import('./components/LinkForm'))
const LinkList = lazy(() => import('./components/LinkList'))
const NoteForm = lazy(() => import('./components/NoteForm'))
const NoteList = lazy(() => import('./components/NoteList'))

import { LinkItem, NoteItem } from './types'
import useLocalStorage from './hooks/useIncrementalStorage'
import { 
  generateSalt, 
  hashPassword, 
  verifyPassword, 
  isValidUrl, 
  isValidTitle, 
  isValidTag, 
  generateSecureId 
} from './utils/security'
import styles from './styles/components/app.module.css'

const App: React.FC = () => {
  const [links, setLinks] = useLocalStorage<LinkItem[]>('links', [])
  const [notes, setNotes] = useLocalStorage<NoteItem[]>('notes', [])
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<'title' | 'url' | 'tags'>('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedLinks, setSelectedLinks] = useState<string[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activePage, setActivePage] = useState<'list' | 'stats' | 'notes'>('list')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 备忘录分类
  const [noteCategories] = useState<string[]>(['默认', '工作', '学习', '生活', '娱乐', '重要', '其他'])

  // 使用更新检查 hook
  const {
    autoCheckUpdate,
    toggleAutoCheckUpdate,
    checkForUpdate,
    applyUpdate,
    dismissUpdate,
    hasUpdate,
    isChecking,
    error: updateError
  } = useUpdateChecker()

  // 添加新链接
  const handleAddLink = (link: Omit<LinkItem, 'id'>) => {
    // 验证 URL
    if (!isValidUrl(link.url)) {
      alert('URL 格式不正确，请输入有效的 URL')
      return
    }
    
    // 验证标题
    if (!isValidTitle(link.title)) {
      alert('标题长度必须在 1-200 个字符之间')
      return
    }
    
    // 验证标签
    const invalidTags = link.tags.filter(tag => !isValidTag(tag))
    if (invalidTags.length > 0) {
      alert(`以下标签格式不正确：${invalidTags.join(', ')}`)
      return
    }
    
    const newLink: LinkItem = {
      ...link,
      id: generateSecureId()
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

  // 添加新备忘录
  const handleAddNote = (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const newNote: NoteItem = {
      ...note,
      id: generateSecureId(),
      createdAt: now,
      updatedAt: now
    }
    setNotes(prevNotes => [...prevNotes, newNote])
  }

  // 更新备忘录
  const handleUpdateNote = (updatedNote: NoteItem) => {
    setNotes(prevNotes => prevNotes.map(note => note.id === updatedNote.id ? updatedNote : note))
    setEditingNote(null)
  }

  // 删除备忘录
  const handleDeleteNote = (id: string) => {
    if (window.confirm('确定要删除这个备忘录吗？')) {
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
    }
  }

  // 切换备忘录置顶状态
  const handleToggleNotePin = (id: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      )
    )
  }

  // 开始编辑备忘录
  const handleEditNote = (note: NoteItem) => {
    setEditingNote(note)
    setIsNoteModalOpen(true)
  }





  // 打开添加备忘录弹框
  const handleOpenAddNoteModal = () => {
    setEditingNote(null)
    setIsNoteModalOpen(true)
  }

  // 关闭备忘录弹框
  const handleCloseNoteModal = () => {
    setIsNoteModalOpen(false)
    setEditingNote(null)
  }

  // 关闭备忘录详情
  // const handleCloseNoteDetail = () => {
  //   setIsNoteDetailOpen(false)
  //   setViewingNote(null)
  // }

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
  const handleSwitchPage = (page: 'list' | 'stats' | 'notes') => {
    setActivePage(page)
    setIsMenuOpen(false)
  }

  // 打开设置弹框
  const handleOpenSettings = () => {
    setIsSettingsOpen(true)
    setIsMenuOpen(false)
  }

  // 关闭设置弹框
  const handleCloseSettings = () => {
    setIsSettingsOpen(false)
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
  const handleVerifyPassword = async () => {
    const storedPassword = localStorage.getItem('password')
    
    if (!storedPassword) {
      setPasswordError('未设置密码')
      return
    }
    
    const isValid = await verifyPassword(password, storedPassword)
    
    if (isValid) {
      setIsAuthenticated(true)
      setIsPasswordVerifyOpen(false)
      setPassword('')
      setPasswordError('')
    } else {
      setPasswordError('密码错误，请重新输入')
    }
  }

  // 设置密码
  const handleSetPassword = async () => {
    if (newPassword.length < 4) {
      setPasswordError('密码长度至少4位')
      return
    }

    if (newPassword !== passwordConfirm) {
      setPasswordError('两次输入的密码不一致')
      return
    }

    try {
      const salt = generateSalt()
      const hashedPassword = await hashPassword(newPassword, salt)
      const storedPassword = `${salt}:${hashedPassword}`
      
      localStorage.setItem('password', storedPassword)
      setPasswordSet(true)
      setIsPasswordSettingOpen(false)
      setNewPassword('')
      setPasswordConfirm('')
      setPasswordError('')
    } catch (error) {
      console.error('密码设置失败:', error)
      setPasswordError('密码设置失败，请重试')
    }
  }

  // 清除密码
  const handleClearPassword = () => {
    if (window.confirm('确定要清除密码吗？')) {
      localStorage.removeItem('password')
      setPasswordSet(false)
      setIsPasswordSettingOpen(false)
    }
  }

  // 导出数据
  const handleExportData = () => {
    const exportData = {
      links,
      notes
    }
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `link-note-app-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 导入数据
  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files[0]) {
        const file = target.files[0]
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string)
            
            // 检查是否为完整的应用数据结构
            if (typeof importedData === 'object' && importedData !== null) {
              // 验证并导入链接数据
              if (Array.isArray(importedData.links)) {
                const isValidLinks = importedData.links.every((item: any) => 
                  typeof item === 'object' && 
                  item !== null && 
                  typeof item.id === 'string' && 
                  typeof item.title === 'string' && 
                  typeof item.url === 'string' && 
                  Array.isArray(item.tags)
                )
                if (!isValidLinks) {
                  alert('导入的数据格式不正确，请确保链接数据格式有效。')
                  return
                }
              }
              
              // 验证并导入备忘录数据
              if (Array.isArray(importedData.notes)) {
                const isValidNotes = importedData.notes.every((item: any) => 
                  typeof item === 'object' && 
                  item !== null && 
                  typeof item.id === 'string' && 
                  typeof item.title === 'string' && 
                  typeof item.content === 'string' && 
                  typeof item.category === 'string' && 
                  typeof item.createdAt === 'string' && 
                  typeof item.updatedAt === 'string' && 
                  typeof item.isPinned === 'boolean'
                )
                if (!isValidNotes) {
                  alert('导入的数据格式不正确，请确保备忘录数据格式有效。')
                  return
                }
              }
              
              if (window.confirm('确定要导入数据吗？这将覆盖当前的所有数据。')) {
                if (Array.isArray(importedData.links)) {
                  setLinks(importedData.links)
                }
                if (Array.isArray(importedData.notes)) {
                  setNotes(importedData.notes)
                }
              }
            } else if (Array.isArray(importedData)) {
              // 兼容旧格式（只有链接数据）
              const isValid = importedData.every((item: any) => 
                typeof item === 'object' && 
                item !== null && 
                typeof item.id === 'string' && 
                typeof item.title === 'string' && 
                typeof item.url === 'string' && 
                Array.isArray(item.tags)
              )
              if (isValid) {
                if (window.confirm('确定要导入链接数据吗？这将覆盖当前的所有链接。')) {
                  setLinks(importedData)
                }
              } else {
                alert('导入的数据格式不正确，请确保是有效的链接数据。')
              }
            } else {
              alert('导入的数据格式不正确，请确保是有效的 JSON 文件。')
            }
          } catch (error) {
            alert('导入失败，请确保上传的是有效的 JSON 文件。')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className={styles.app}>
      {/* 更新检查器 */}
      <UpdateChecker
        hasUpdate={hasUpdate}
        isChecking={isChecking}
        error={updateError}
        onApplyUpdate={applyUpdate}
        onDismissUpdate={dismissUpdate}
      />

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
            handleExportData={handleExportData}
            handleImportData={handleImportData}
            handleOpenAddNoteModal={handleOpenAddNoteModal}
            handleOpenSettings={handleOpenSettings}
          />
          {/* 收集所有已存在的标签 */}
          {(() => {
            const allTags = new Set<string>();
            links.forEach(link => {
              link.tags.forEach(tag => allTags.add(tag));
            });

            return (
              <Suspense fallback={<div className={styles.loading}>加载中...</div>}>
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
                    ) : activePage === 'notes' ? (
                      <div className={styles.appContainer}>
                        <NoteList
                          notes={notes}
                          onEditNote={handleEditNote}
                          onDeleteNote={handleDeleteNote}
                          onTogglePin={handleToggleNotePin}
                          categories={noteCategories}
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
                  {/* 添加/编辑备忘录弹框 */}
                  <Modal
                    isOpen={isNoteModalOpen}
                    onClose={handleCloseNoteModal}
                    title={editingNote ? '编辑备忘录' : '添加新备忘录'}
                  >
                    <NoteForm
                      onAddNote={(note) => {
                        handleAddNote(note)
                        handleCloseNoteModal()
                      }}
                      onUpdateNote={(note) => {
                        handleUpdateNote(note)
                        handleCloseNoteModal()
                      }}
                      editingNote={editingNote}
                      onCancelEdit={handleCloseNoteModal}
                      categories={noteCategories}
                    />
                  </Modal>

                </>
              </Suspense>
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

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        autoCheckUpdate={autoCheckUpdate}
        onClose={handleCloseSettings}
        onToggleAutoCheckUpdate={toggleAutoCheckUpdate}
        onCheckForUpdate={checkForUpdate}
        isChecking={isChecking}
      />
    </div>
  )
}

export default App