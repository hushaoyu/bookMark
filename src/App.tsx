import { useState, useEffect } from 'react'
import LinkForm from './components/LinkForm'
import LinkList from './components/LinkList'
import { LinkItem } from './types'

function App() {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)

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
    setLinks(links.filter(link => link.id !== id))
  }

  // 开始编辑链接
  const handleEditLink = (link: LinkItem) => {
    setEditingLink(link)
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingLink(null)
  }

  return (
    <div className="app">
      <header>
        <h1>链接管理器</h1>
      </header>
      <main>
        <LinkForm
          onAddLink={handleAddLink}
          onUpdateLink={handleUpdateLink}
          editingLink={editingLink}
          onCancelEdit={handleCancelEdit}
        />
        <LinkList
          links={links}
          onEditLink={handleEditLink}
          onDeleteLink={handleDeleteLink}
        />
      </main>
    </div>
  )
}

export default App