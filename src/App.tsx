import React, { useState, useEffect } from 'react'
import LinkForm from './components/LinkForm'
import LinkList from './components/LinkList'
import Modal from './components/Modal'
import { LinkItem } from './types'
import './styles/index.css'

const App: React.FC = () => {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('title') // title, url, tags
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]) // 选中的链接ID数组

  const [isModalOpen, setIsModalOpen] = useState(false)

  // 从本地存储加载链接数据
  useEffect(() => {
    const savedLinks = localStorage.getItem('links')
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks))
    }
  }, [])

  // 保存链接数据到本地存储
  useEffect(() => {
    localStorage.setItem('links', JSON.stringify(links))
  }, [links])

  // 添加新链接
  const handleAddLink = (link: Omit<LinkItem, 'id'>) => {
    const newLink: LinkItem = {
      ...link,
      id: Date.now().toString()
    }
    setLinks([...links, newLink])
  }

  // 更新链接
  const handleUpdateLink = (updatedLink: LinkItem) => {
    setLinks(links.map(link => link.id === updatedLink.id ? updatedLink : link))
    setEditingLink(null)
  }

  // 删除链接
  const handleDeleteLink = (id: string) => {
    if (window.confirm('确定要删除这个链接吗？')) {
      const updatedLinks = links.filter(link => link.id !== id)
      setLinks(updatedLinks)
      localStorage.setItem('links', JSON.stringify(updatedLinks))
    }
  }

  // 批量删除链接
  const handleBatchDelete = () => {
    if (selectedLinks.length === 0) return
    
    if (window.confirm(`确定要删除选中的 ${selectedLinks.length} 个链接吗？`)) {
      const updatedLinks = links.filter(link => !selectedLinks.includes(link.id))
      setLinks(updatedLinks)
      setSelectedLinks([])
      localStorage.setItem('links', JSON.stringify(updatedLinks))
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



  return (
    <div className="app">
      <header>
          <div className="header-content">
            <h1>链接管理器</h1>
            <div className="header-actions">
              <button className="btn-primary" onClick={handleOpenAddModal}>
                + 添加链接
              </button>

            </div>
          </div>
        </header>
      {/* 收集所有已存在的标签 */}
      {(() => {
        const allTags = new Set<string>();
        links.forEach(link => {
          link.tags.forEach(tag => allTags.add(tag));
        });
        return (
          <>
            <main>
              <div className="app-container">
                <div className="search-sort-container">
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="搜索链接..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="sort-container">
                    <select 
                      className="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="title">按标题</option>
                      <option value="url">按URL</option>
                      <option value="tags">按标签数量</option>
                    </select>
                    <button 
                      className="sort-toggle"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
                <LinkList
                  links={links}
                  onEditLink={handleEditLink}
                  onDeleteLink={handleDeleteLink}
                  onToggleSelectLink={handleToggleSelectLink}
                  onSelectAll={handleSelectAll}
                  onBatchDelete={handleBatchDelete}
                  selectedLinks={selectedLinks}
                  searchTerm={searchTerm}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </div>
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
    </div>
  )
}

export default App