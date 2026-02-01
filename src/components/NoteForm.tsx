import { useState, useEffect } from 'react'
import { NoteItem } from '../types'
import CustomSelect from './CustomSelect'
import styles from '../styles/components/note-form.module.css'

interface NoteFormProps {
  onAddNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateNote: (note: NoteItem) => void
  editingNote: NoteItem | null
  onCancelEdit: () => void
  categories: string[]
}

const NoteForm: React.FC<NoteFormProps> = ({
  onAddNote,
  onUpdateNote,
  editingNote,
  onCancelEdit,
  categories
}) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('默认')
  const [isPinned, setIsPinned] = useState(false)

  // 当编辑备忘录变化时，更新表单数据
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title)
      setContent(editingNote.content)
      setCategory(editingNote.category)
      setIsPinned(editingNote.isPinned)
    } else {
      // 重置表单
      setTitle('')
      setContent('')
      setCategory('默认')
      setIsPinned(false)
    }
  }, [editingNote])

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    const now = new Date().toISOString()

    if (editingNote) {
      // 更新现有备忘录
      onUpdateNote({
        id: editingNote.id,
        title,
        content,
        category,
        createdAt: editingNote.createdAt,
        updatedAt: now,
        isPinned
      })
    } else {
      // 添加新备忘录
      onAddNote({
        title,
        content,
        category,
        isPinned
      })
      // 重置表单
      setTitle('')
      setContent('')
      setCategory('默认')
      setIsPinned(false)
    }
  }

  return (
    <form className={styles.noteForm} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="title">标题</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入备忘录标题"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category">分类</label>
        <CustomSelect
          options={categories.map(cat => ({ value: cat, label: cat }))}
          value={category}
          onChange={setCategory}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="content">内容</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入备忘录内容"
          rows={8}
          required
        />
      </div>



      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
          />
          <span>置顶此备忘录</span>
        </label>
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
          {editingNote ? '更新' : '添加'}
        </button>
        {editingNote && (
          <button type="button" className={styles.btnSecondary} onClick={onCancelEdit}>
            取消
          </button>
        )}
      </div>
    </form>
  )
}

export default NoteForm
