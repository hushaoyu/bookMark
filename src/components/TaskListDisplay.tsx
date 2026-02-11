import { TaskItem } from '../types'
import styles from '../styles/components/task-list-display.module.css'

interface TaskListDisplayProps {
  tasks: TaskItem[]
  onToggleTask?: (taskId: string) => void
  editable?: boolean
}

const TaskListDisplay: React.FC<TaskListDisplayProps> = ({
  tasks,
  onToggleTask,
  editable = false
}) => {
  if (!tasks || tasks.length === 0) {
    return null
  }

  const completedCount = tasks.filter(task => task.completed).length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className={styles.taskListDisplay}>
      <div className={styles.taskListHeader}>
        <h4 className={styles.taskListTitle}>任务列表</h4>
        <span className={styles.taskProgress}>
          {completedCount} / {totalCount} 已完成
        </span>
      </div>

      {/* 进度条 */}
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 任务列表 */}
      <div className={styles.taskList}>
        {tasks.map(task => (
          <div
            key={task.id}
            className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleTask?.(task.id)}
              disabled={!editable}
              className={styles.taskCheckbox}
            />
            <span className={styles.taskText}>{task.text}</span>
            {task.completed && <span className={styles.completedIcon}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskListDisplay
