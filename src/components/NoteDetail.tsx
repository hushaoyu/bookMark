import { useState } from 'react'
import { NoteItem, TaskItem } from '../types'
import TaskListDisplay from './TaskListDisplay'
import styles from '../styles/components/note-detail.module.css'

interface NoteDetailProps {
  note: NoteItem
  onEdit: (note: NoteItem) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const NoteDetail: React.FC<NoteDetailProps> = ({
  note,
  onEdit,
  onDelete,
  onClose
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(note.tasks || [])

  // 切换任务完成状态
  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '默认': '#666',
      '工作': '#2196F3',
      '学习': '#4CAF50',
      '生活': '#FF9800',
      '重要': '#F44336',
      '其他': '#9C27B0'
    }
    return colors[category] || '#666'
  }

  return (
    <div className={styles.noteDetailOverlay} onClick={onClose}>
      <div className={styles.noteDetail} onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className={styles.detailHeader}>
          <div className={styles.headerLeft}>
            {note.isPinned && <span className={styles.pinIcon}>📌</span>}
            <h2 className={styles.detailTitle}>{note.title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {/* 分类 */}
        <div className={styles.detailCategory}>
          <span 
            className={styles.categoryBadge}
            style={{ backgroundColor: getCategoryColor(note.category) }}
          >
            {note.category}
          </span>
        </div>

        {/* 内容 */}
        <div className={styles.detailContent}>
          <div className={styles.contentText}>{note.content.split('\n').map((line, index) => (
            <div key={index} className={styles.contentLine}>
              {line}
            </div>
          ))}</div>
        </div>

        {/* 任务列表 */}
        <TaskListDisplay
          tasks={tasks}
          onToggleTask={handleToggleTask}
          editable={true}
        />



        {/* 时间信息 */}
        <div className={styles.detailMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>创建时间：</span>
            <span className={styles.metaValue}>{formatDate(note.createdAt)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>更新时间：</span>
            <span className={styles.metaValue}>{formatDate(note.updatedAt)}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className={styles.detailActions}>
          <button
            onClick={() => onEdit(note)}
            className={styles.actionBtn}
          >
            编辑
          </button>
          <button
            onClick={() => {
              if (window.confirm('确定要删除这个备忘录吗？')) {
                onDelete(note.id)
              }
            }}
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoteDetail
