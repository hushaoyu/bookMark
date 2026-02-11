// 链接项类型定义
export interface LinkItem {
  id: string
  title: string
  url: string
  tags: string[]
}

// 备忘录项类型定义
export interface NoteItem {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
  updatedAt: string
  isPinned: boolean
  tasks?: TaskItem[]
}

// 任务项类型定义
export interface TaskItem {
  id: string
  text: string
  completed: boolean
}

// 备忘录分类类型定义
export interface NoteCategory {
  id: string
  name: string
  color: string
  icon: string
}