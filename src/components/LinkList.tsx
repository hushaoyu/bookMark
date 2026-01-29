import React from 'react'
import { LinkItem } from '../types'

interface LinkListProps {
  links: LinkItem[]
  onEditLink: (link: LinkItem) => void
  onDeleteLink: (id: string) => void
}

const LinkList: React.FC<LinkListProps> = ({ links, onEditLink, onDeleteLink }) => {
  // 按标签分组链接
  const groupedLinks = links.reduce((groups, link) => {
    // 如果链接没有标签，放入"未分类"组
    if (link.tags.length === 0) {
      if (!groups['未分类']) {
        groups['未分类'] = []
      }
      groups['未分类'].push(link)
    } else {
      // 为每个标签创建分组
      link.tags.forEach(tag => {
        if (!groups[tag]) {
          groups[tag] = []
        }
        // 确保每个链接在每个标签组中只出现一次
        if (!groups[tag].some(l => l.id === link.id)) {
          groups[tag].push(link)
        }
      })
    }
    return groups
  }, {} as Record<string, LinkItem[]>)

  return (
    <div className="link-list">
      <h2>链接列表</h2>
      {links.length === 0 ? (
        <p className="empty-message">暂无链接，请添加新链接</p>
      ) : (
        Object.entries(groupedLinks).map(([tag, tagLinks]) => (
          <div key={tag} className="tag-group">
            <h3>{tag}</h3>
            <ul>
              {tagLinks.map(link => (
                <li key={link.id} className="link-item">
                  <div className="link-info">
                    <h4>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.title}
                      </a>
                    </h4>
                    {link.tags.length > 0 && (
                      <div className="link-tags">
                        {link.tags.map((t, index) => (
                          <span key={index} className="tag">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="link-actions">
                    <button className="btn-edit" onClick={() => onEditLink(link)}>
                      编辑
                    </button>
                    <button className="btn-delete" onClick={() => onDeleteLink(link.id)}>
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}

export default LinkList