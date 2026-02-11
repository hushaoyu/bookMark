import { useState } from 'react'
import { NoteItem } from '../types'
import CustomSelect from './CustomSelect'
import styles from '../styles/components/note-list.module.css'

interface NoteListProps {
  notes: NoteItem[]
  onEditNote: (note: NoteItem) => void
  onDeleteNote: (id: string) => void
  onTogglePin: (id: string) => void
  categories: string[]
}

type SortBy = 'createdAt' | 'updatedAt' | 'title' | 'category'
type SortOrder = 'asc' | 'desc'

const NoteList: React.FC<NoteListProps> = ({
  notes,
  onEditNote,
  onDeleteNote,
  onTogglePin,
  categories
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')

  // 过滤备忘录
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === '全部' || note.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // 排序备忘录
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // 置顶的备忘录始终排在前面
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    let comparison = 0
    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'category':
        comparison = a.category.localeCompare(b.category)
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })



  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '默认': '#666',
      '工作': '#2196F3',
      '学习': '#4CAF50',
      '生活': '#FF9800',
      '娱乐': '#E91E63',
      '重要': '#F44336',
      '其他': '#9C27B0'
    }
    return colors[category] || '#666'
  }

  return (
    <div className={styles.noteListContainer}>
      {/* 搜索和筛选栏 */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="搜索备忘录..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <CustomSelect
          options={[
            { value: '全部', label: '全部分类' },
            ...categories.map(cat => ({ value: cat, label: cat }))
          ]}
          value={selectedCategory}
          onChange={setSelectedCategory}
          className={styles.categorySelect}
        />
      </div>

      {/* 排序选项 */}
      <div className={styles.sortBar}>
        <CustomSelect
          options={[
            { value: 'createdAt', label: '创建时间' },
            { value: 'updatedAt', label: '更新时间' },
            { value: 'title', label: '标题' },
            { value: 'category', label: '分类' }
          ]}
          value={sortBy}
          onChange={(value) => setSortBy(value as SortBy)}
          className={styles.sortSelect}
        />
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className={styles.sortOrderBtn}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* 备忘录列表 */}
      <div className={styles.noteList}>
        {sortedNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <p>暂无备忘录</p>
            <p className={styles.emptyHint}>点击上方"添加备忘录"按钮开始创建</p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div key={note.id} className={`${styles.noteCard} ${note.isPinned ? styles.pinned : ''}`}>
              <div className={styles.noteHeader}>
                <div className={styles.noteTitleRow}>
                  {note.isPinned && <span className={styles.pinIcon}>📌</span>}
                  <h3 className={styles.noteTitle}>{note.title}</h3>
                </div>
                <div className={styles.noteCategory} style={{ color: getCategoryColor(note.category) }}>
                  {note.category}
                </div>
              </div>



              <div className={styles.noteContent}>
                <p className={styles.notePreview}>
                  {note.content.substring(0, 100)}
                  {note.content.length > 100 ? '...' : ''}
                </p>
                {note.tasks && note.tasks.length > 0 && (
                  <div className={styles.taskPreview}>
                    <span className={styles.taskCount}>
                      ✓ {note.tasks.filter(t => t.completed).length}/{note.tasks.length} 任务
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.noteActions}>
                <button
                  onClick={() => onTogglePin(note.id)}
                  className={styles.actionBtn}
                  title={note.isPinned ? '取消置顶' : '置顶'}
                >
                  {note.isPinned ? '取消置顶' : '置顶'}
                </button>
                <button
                  onClick={() => onEditNote(note)}
                  className={styles.actionBtn}
                  title="编辑"
                >
                  编辑
                </button>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  title="删除"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NoteList
