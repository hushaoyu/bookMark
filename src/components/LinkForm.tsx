import { useState, useEffect } from 'react'
import { LinkItem } from '../types'

interface LinkFormProps {
  onAddLink: (link: Omit<LinkItem, 'id'>) => void
  onUpdateLink: (link: LinkItem) => void
  editingLink: LinkItem | null
  onCancelEdit: () => void
}

const LinkForm: React.FC<LinkFormProps> = ({
  onAddLink,
  onUpdateLink,
  editingLink,
  onCancelEdit
}) => {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // 当编辑链接变化时，更新表单数据
  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title)
      setUrl(editingLink.url)
      setTags(editingLink.tags)
    } else {
      // 重置表单
      setTitle('')
      setUrl('')
      setTags([])
      setTagInput('')
    }
  }, [editingLink])

  // 添加标签
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return

    if (editingLink) {
      // 更新现有链接
      onUpdateLink({
        id: editingLink.id,
        title,
        url,
        tags
      })
    } else {
      // 添加新链接
      onAddLink({ title, url, tags })
      // 重置表单
      setTitle('')
      setUrl('')
      setTags([])
      setTagInput('')
    }
  }

  return (
    <form className="link-form" onSubmit={handleSubmit}>
      <h2>{editingLink ? '编辑链接' : '添加新链接'}</h2>
      
      <div className="form-group">
        <label htmlFor="title">标题</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入链接标题"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="url">链接</label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="请输入链接地址"
          required
        />
      </div>

      <div className="form-group">
        <label>标签</label>
        <div className="tag-input-container">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="输入标签后按回车添加"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
          />
          <button type="button" onClick={handleAddTag}>添加</button>
        </div>
        <div className="tags-list">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {editingLink ? '更新' : '添加'}
        </button>
        {editingLink && (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            取消
          </button>
        )}
      </div>
    </form>
  )
}

export default LinkForm