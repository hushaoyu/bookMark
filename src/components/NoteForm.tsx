import { useState, useEffect, useRef } from 'react'
import { NoteItem, TaskItem } from '../types'
import CustomSelect from './CustomSelect'
import TaskListEditor from './TaskListEditor'
import { sanitizeHtml } from '../utils/security'
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
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 当编辑备忘录变化时，更新表单数据
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title)
      setContent(editingNote.content)
      setCategory(editingNote.category)
      setIsPinned(editingNote.isPinned)
      setTasks(editingNote.tasks || [])
    } else {
      // 重置表单
      setTitle('')
      setContent('')
      setCategory('默认')
      setIsPinned(false)
      setTasks([])
    }
  }, [editingNote])

  // 排版功能核心逻辑
  const handleFormat = (type: 'indent' | 'outdent' | 'bullet' | 'number') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    let newText = ''
    
    if (selectedText) {
      // 处理选中的文本
      const lines = selectedText.split('\n')
      
      switch (type) {
        case 'indent':
          newText = lines.map(line => '  ' + line).join('\n')
          break
        case 'outdent':
          newText = lines.map(line => line.replace(/^\s{1,2}/, '')).join('\n')
          break
        case 'bullet':
          newText = lines.map(line => '- ' + line).join('\n')
          break
        case 'number':
          newText = lines.map((line, index) => `${index + 1}. ${line}`).join('\n')
          break
      }
    } else {
      // 处理光标位置
      switch (type) {
        case 'indent':
          newText = '  '
          break
        case 'bullet':
          newText = '- '
          break
        case 'number':
          newText = '1. '
          break
        case 'outdent':
          // 查找当前行的开始位置
          let lineStart = start
          while (lineStart > 0 && content[lineStart - 1] !== '\n') {
            lineStart--
          }
          // 检查当前行是否有缩进
          if (content.substring(lineStart, start).match(/^\s{1,2}/)) {
            // 删除缩进
            const beforeSelection = content.substring(0, lineStart)
            const afterSelection = content.substring(start)
            setContent(beforeSelection + content.substring(lineStart + 2, start) + afterSelection)
            textarea.focus()
            textarea.setSelectionRange(lineStart, lineStart + (start - lineStart - 2))
            return
          }
          return
      }
    }
    
    // 插入新文本
    const beforeSelection = content.substring(0, start)
    const afterSelection = content.substring(end)
    setContent(beforeSelection + newText + afterSelection)
    
    // 重新聚焦并设置光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + newText.length, start + newText.length)
    }, 0)
  }

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    // 净化输入，防止XSS攻击
    const sanitizedTitle = sanitizeHtml(title)
    const sanitizedContent = sanitizeHtml(content)

    const now = new Date().toISOString()

    if (editingNote) {
      // 更新现有备忘录
      onUpdateNote({
        id: editingNote.id,
        title: sanitizedTitle,
        content: sanitizedContent,
        category,
        createdAt: editingNote.createdAt,
        updatedAt: now,
        isPinned,
        tasks
      })
    } else {
      // 添加新备忘录
      onAddNote({
        title: sanitizedTitle,
        content: sanitizedContent,
        category,
        isPinned,
        tasks
      })
      // 重置表单
      setTitle('')
      setContent('')
      setCategory('默认')
      setIsPinned(false)
      setTasks([])
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
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => handleFormat('indent')}
            title="增加缩进"
          >
            ➡️
          </button>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => handleFormat('outdent')}
            title="减少缩进"
          >
            ⬅️
          </button>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => handleFormat('bullet')}
            title="项目符号"
          >
            •
          </button>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => handleFormat('number')}
            title="编号列表"
          >
            1.
          </button>
        </div>
        <textarea
          ref={textareaRef}
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入备忘录内容"
          rows={8}
          required
        />
      </div>

      {/* 任务列表 */}
      <TaskListEditor tasks={tasks} onChange={setTasks} />



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
