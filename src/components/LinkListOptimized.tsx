import React, { useState, useMemo, useCallback } from 'react';
import { LinkItem } from '../types';
import styles from '../styles/components/link-list.module.css';

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

/**
 * 链接列表项组件（使用 React.memo 优化）
 */
const LinkItemComponent = React.memo<{
  link: LinkItem;
  isSelected: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSelect: () => void;
}>(({ link, isSelected, onEdit, onDelete, onToggleSelect }) => {
  return (
    <li className={styles.linkItem}>
      <div className={styles.linkCheckbox}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className={styles.linkCheckboxInput}
        />
      </div>
      <div className={styles.linkInfo}>
        <h4>
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.linkTitle}
          >
            {link.title}
          </a>
        </h4>
      </div>
      <div className={styles.linkActions}>
        <button 
          className={styles.btnEdit}
          onClick={onEdit}
        >
          编辑
        </button>
        <button 
          className={styles.btnDelete}
          onClick={onDelete}
        >
          删除
        </button>
      </div>
    </li>
  );
});

LinkItemComponent.displayName = 'LinkItemComponent';

/**
 * 标签分组组件（使用 React.memo 优化）
 */
const TagGroup = React.memo<{
  tag: string;
  tagLinks: LinkItem[];
  isExpanded: boolean;
  selectedLinks: string[];
  onToggleExpansion: () => void;
  onEditLink: (link: LinkItem) => void;
  onDeleteLink: (id: string) => void;
  onToggleSelectLink: (id: string) => void;
}>(({ 
  tag, 
  tagLinks, 
  isExpanded, 
  selectedLinks,
  onToggleExpansion,
  onEditLink,
  onDeleteLink,
  onToggleSelectLink
}) => {
  return (
    <div key={tag} className={styles.tagGroup}>
      <div className={styles.tagGroupHeader} onClick={onToggleExpansion}>
        <h3>{tag}</h3>
        <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      {isExpanded && (
        <ul>
          {tagLinks.map(link => (
            <LinkItemComponent
              key={link.id}
              link={link}
              isSelected={selectedLinks.includes(link.id)}
              onEdit={() => onEditLink(link)}
              onDelete={() => onDeleteLink(link.id)}
              onToggleSelect={() => onToggleSelectLink(link.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
});

TagGroup.displayName = 'TagGroup';

/**
 * 优化后的链接列表组件
 * 使用 useMemo 和 useCallback 提升性能
 */
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

  // 切换标签折叠状态（使用 useCallback 优化）
  const toggleTagExpansion = useCallback((tag: string) => {
    setExpandedTags(prev => ({
      ...prev,
      [tag]: !prev[tag]
    }));
  }, []);

  // 根据搜索词过滤链接（使用 useMemo 缓存）
  const filteredLinks = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return links.filter(link => {
      return (
        link.title.toLowerCase().includes(lowerSearchTerm) ||
        link.url.toLowerCase().includes(lowerSearchTerm) ||
        link.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    });
  }, [links, searchTerm]);

  // 根据排序条件对链接进行排序（使用 useMemo 缓存）
  const sortedLinks = useMemo(() => {
    return [...filteredLinks].sort((a, b) => {
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
  }, [filteredLinks, sortBy, sortOrder]);

  // 按标签分组链接（使用 useMemo 缓存）
  const linksByTag = useMemo(() => {
    return sortedLinks.reduce((groups, link) => {
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
  }, [sortedLinks]);

  // 全选状态（使用 useMemo 缓存）
  const isAllSelected = useMemo(() => {
    return links.length > 0 && selectedLinks.length === links.length;
  }, [links.length, selectedLinks.length]);

  // 批量删除按钮显示状态（使用 useMemo 缓存）
  const showBatchActions = useMemo(() => {
    return selectedLinks.length > 0;
  }, [selectedLinks.length]);

  return (
    <div className={styles.linkList}>
      <div className={styles.linkListHeader}>
        <h2>列表</h2>
        <div className={styles.headerActions}>
          {links.length > 0 && (
            <label className={styles.selectAllLabel}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
                className={styles.selectAllCheckbox}
              />
              全选
            </label>
          )}
          {showBatchActions && (
            <div className={styles.batchActions}>
              <span className={styles.selectedCount}>已选择 {selectedLinks.length} 个链接</span>
              <button 
                className={styles.btnDanger}
                onClick={onBatchDelete}
              >
                删除
              </button>
            </div>
          )}
        </div>
      </div>
      {Object.keys(linksByTag).length === 0 ? (
        <div className={styles.emptyMessage}>
          {searchTerm ? '没有找到匹配的链接' : '暂无链接，添加一个吧！'}
        </div>
      ) : (
        Object.entries(linksByTag).map(([tag, tagLinks]) => {
          const isExpanded = expandedTags[tag] !== false; // 默认展开
          
          return (
            <TagGroup
              key={tag}
              tag={tag}
              tagLinks={tagLinks}
              isExpanded={isExpanded}
              selectedLinks={selectedLinks}
              onToggleExpansion={() => toggleTagExpansion(tag)}
              onEditLink={onEditLink}
              onDeleteLink={onDeleteLink}
              onToggleSelectLink={onToggleSelectLink}
            />
          );
        })
      )}
    </div>
  );
};

export default LinkList;
