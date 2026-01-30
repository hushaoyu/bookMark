import { useState, useEffect } from 'react'
import { LinkItem } from '../types'
import styles from '../styles/components/link-form.module.css'

interface LinkFormProps {
  onAddLink: (link: Omit<LinkItem, 'id'>) => void
  onUpdateLink: (link: LinkItem) => void
  editingLink: LinkItem | null
  onCancelEdit: () => void
  existingTags: string[]
}

const LinkForm: React.FC<LinkFormProps> = ({
  onAddLink,
  onUpdateLink,
  editingLink,
  onCancelEdit,
  existingTags
}) => {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])

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

  // 当标签输入变化时，更新推荐标签
  useEffect(() => {
    if (tagInput.trim()) {
      const filteredTags = existingTags
        .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
        .filter(tag => !tags.includes(tag))
      setTagSuggestions(filteredTags)
      setShowTagSuggestions(filteredTags.length > 0)
    } else {
      setShowTagSuggestions(false)
      setTagSuggestions([])
    }
  }, [tagInput, existingTags, tags])

  // 选择推荐标签
  const handleSelectTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setTagInput('')
    setShowTagSuggestions(false)
  }

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
    <form className={styles.linkForm} onSubmit={handleSubmit}>
      
      <div className={styles.formGroup}>
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

      <div className={styles.formGroup}>
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

      <div className={styles.formGroup}>
        <label>标签</label>
        <div className={styles.tagInputContainer}>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="输入标签后按回车添加"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
            onFocus={() => tagInput.trim() && setShowTagSuggestions(tagSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
          />
          <button type="button" onClick={handleAddTag}>添加</button>
          {/* 标签推荐列表 */}
          {showTagSuggestions && tagSuggestions.length > 0 && (
            <div className={styles.tagSuggestions}>
              {tagSuggestions.map((tag, index) => (
                <div 
                  key={index} 
                  className={styles.tagSuggestionItem}
                  onClick={() => handleSelectTag(tag)}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.tagsList}>
          {tags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
          {editingLink ? '更新' : '添加'}
        </button>
        {editingLink && (
          <button type="button" className={styles.btnSecondary} onClick={onCancelEdit}>
            取消
          </button>
        )}
      </div>
    </form>
  )
}

export default LinkForm