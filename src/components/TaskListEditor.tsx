import { useState } from 'react'
import { TaskItem } from '../types'
import styles from '../styles/components/task-list.module.css'

interface TaskListEditorProps {
  tasks: TaskItem[]
  onChange: (tasks: TaskItem[]) => void
}

const TaskListEditor: React.FC<TaskListEditorProps> = ({ tasks, onChange }) => {
  const [newTaskText, setNewTaskText] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskText, setEditingTaskText] = useState('')

  // 添加新任务
  const handleAddTask = () => {
    if (!newTaskText.trim()) return

    const newTask: TaskItem = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false
    }

    onChange([...tasks, newTask])
    setNewTaskText('')
  }

  // 切换任务完成状态
  const handleToggleTask = (taskId: string) => {
    onChange(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }

  // 删除任务
  const handleDeleteTask = (taskId: string) => {
    onChange(tasks.filter(task => task.id !== taskId))
  }

  // 开始编辑任务
  const handleStartEdit = (task: TaskItem) => {
    setEditingTaskId(task.id)
    setEditingTaskText(task.text)
  }

  // 保存编辑的任务
  const handleSaveEdit = () => {
    if (!editingTaskText.trim() || !editingTaskId) return

    onChange(
      tasks.map(task =>
        task.id === editingTaskId ? { ...task, text: editingTaskText.trim() } : task
      )
    )
    setEditingTaskId(null)
    setEditingTaskText('')
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingTaskId(null)
    setEditingTaskText('')
  }

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent, action: 'add' | 'save') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (action === 'add') {
        handleAddTask()
      } else {
        handleSaveEdit()
      }
    }
  }

  return (
    <div className={styles.taskListEditor}>
      <h4 className={styles.taskListTitle}>任务列表</h4>

      {/* 任务列表 */}
      <div className={styles.taskList}>
        {tasks.length === 0 ? (
          <p className={styles.emptyText}>暂无任务，添加一个吧！</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={styles.taskItem}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task.id)}
                className={styles.taskCheckbox}
              />
              {editingTaskId === task.id ? (
                <div className={styles.editContainer}>
                  <input
                    type="text"
                    value={editingTaskText}
                    onChange={(e) => setEditingTaskText(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'save')}
                    className={styles.editInput}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className={styles.saveBtn}
                    title="保存"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className={styles.cancelBtn}
                    title="取消"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className={`${styles.taskText} ${task.completed ? styles.completed : ''}`}
                    onDoubleClick={() => handleStartEdit(task)}
                  >
                    {task.text}
                  </span>
                  <button
                    onClick={() => handleStartEdit(task)}
                    className={styles.editBtn}
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className={styles.deleteBtn}
                    title="删除"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* 添加新任务 */}
      <div className={styles.addTaskContainer}>
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, 'add')}
          placeholder="输入新任务..."
          className={styles.addTaskInput}
        />
        <button
          type="button"
          onClick={handleAddTask}
          className={styles.addTaskBtn}
          disabled={!newTaskText.trim()}
        >
          添加
        </button>
      </div>
    </div>
  )
}

export default TaskListEditor
