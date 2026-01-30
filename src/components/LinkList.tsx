import React, { useState } from 'react';
import { LinkItem } from '../types';

interface LinkListProps {
  links: LinkItem[];
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedLinks: string[];
  onEditLink: (link: LinkItem) => void;
  onDeleteLink: (id: string) => void;
  onToggleSelectLink: (id: string) => void;
  onSelectAll: () => void;
  onBatchDelete: () => void;
}

const LinkList: React.FC<LinkListProps> = ({ 
  links, 
  searchTerm, 
  sortBy, 
  sortOrder, 
  selectedLinks, 
  onEditLink, 
  onDeleteLink, 
  onToggleSelectLink, 
  onSelectAll,
  onBatchDelete
}) => {
  // 标签折叠状态管理
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({});

  // 切换标签折叠状态
  const toggleTagExpansion = (tag: string) => {
    setExpandedTags(prev => ({
      ...prev,
      [tag]: !prev[tag]
    }));
  };
  // 根据搜索词过滤链接
  const filteredLinks = links.filter(link => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      link.title.toLowerCase().includes(lowerSearchTerm) ||
      link.url.toLowerCase().includes(lowerSearchTerm) ||
      link.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
    );
  });

  // 根据排序条件对链接进行排序
  const sortedLinks = [...filteredLinks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'url':
        comparison = a.url.localeCompare(b.url);
        break;
      case 'tags':
        comparison = a.tags.length - b.tags.length;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // 按标签分组链接
  const linksByTag = sortedLinks.reduce((groups, link) => {
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
      <div className="link-list-header">
        <h2>链接列表</h2>
        <div className="header-actions">
          {links.length > 0 && (
            <label className="select-all-label">
              <input
                type="checkbox"
                checked={selectedLinks.length === links.length && links.length > 0}
                onChange={onSelectAll}
                className="select-all-checkbox"
              />
              全选
            </label>
          )}
          {selectedLinks.length > 0 && (
            <div className="batch-actions">
              <span className="selected-count">已选择 {selectedLinks.length} 个链接</span>
              <button 
                className="btn-danger"
                onClick={onBatchDelete}
              >
                批量删除
              </button>
            </div>
          )}
        </div>
      </div>
      {Object.keys(linksByTag).length === 0 ? (
        <div className="empty-message">
          {searchTerm ? '没有找到匹配的链接' : '暂无链接，添加一个吧！'}
        </div>
      ) : (
        Object.entries(linksByTag).map(([tag, tagLinks]) => {
          const isExpanded = expandedTags[tag] !== false; // 默认展开
          
          return (
            <div key={tag} className="tag-group">
              <div className="tag-group-header" onClick={() => toggleTagExpansion(tag)}>
                <h3>{tag}</h3>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>
              {isExpanded && (
                <ul>
                  {tagLinks.map(link => (
                    <li key={link.id} className="link-item">
                      <div className="link-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedLinks.includes(link.id)}
                          onChange={() => onToggleSelectLink(link.id)}
                          className="link-checkbox-input"
                        />
                      </div>
                      <div className="link-info">
                        <h4>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="link-title"
                          >
                            {link.title}
                          </a>
                        </h4>
                        {link.tags.length > 0 && (
                          <div className="link-tags">
                            {link.tags.map((tag, index) => (
                              <span key={index} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="link-actions">
                        <button 
                          className="btn-edit"
                          onClick={() => onEditLink(link)}
                        >
                          编辑
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => onDeleteLink(link.id)}
                        >
                          删除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default LinkList