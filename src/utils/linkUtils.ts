import { LinkItem } from '../types'

/**
 * 按指定字段和顺序排序链接
 * @param links 链接数组
 * @param sortBy 排序字段：'title' | 'url' | 'tags'
 * @param sortOrder 排序顺序：'asc' | 'desc'
 * @returns 排序后的链接数组
 */
export const sortLinks = (
  links: LinkItem[],
  sortBy: 'title' | 'url' | 'tags',
  sortOrder: 'asc' | 'desc'
): LinkItem[] => {
  return [...links].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'url':
        comparison = a.url.localeCompare(b.url)
        break
      case 'tags':
        comparison = a.tags.length - b.tags.length
        break
      default:
        comparison = 0
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })
}

/**
 * 根据搜索词过滤链接
 * @param links 链接数组
 * @param searchTerm 搜索词
 * @returns 过滤后的链接数组
 */
export const filterLinks = (
  links: LinkItem[],
  searchTerm: string
): LinkItem[] => {
  if (!searchTerm) return links
  
  const term = searchTerm.toLowerCase()
  return links.filter(link => 
    link.title.toLowerCase().includes(term) ||
    link.url.toLowerCase().includes(term) ||
    link.tags.some(tag => tag.toLowerCase().includes(term))
  )
}

/**
 * 获取所有唯一标签
 * @param links 链接数组
 * @returns 唯一标签数组
 */
export const getAllTags = (links: LinkItem[]): string[] => {
  const tagSet = new Set<string>()
  links.forEach(link => {
    link.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet)
}

/**
 * 按标签分组链接
 * @param links 链接数组
 * @returns 按标签分组的对象，键为标签名，值为链接数组
 */
export const groupLinksByTag = (links: LinkItem[]): Record<string, LinkItem[]> => {
  return links.reduce((groups, link) => {
    if (link.tags.length === 0) {
      // 处理无标签的链接
      if (!groups['未分类']) {
        groups['未分类'] = []
      }
      groups['未分类'].push(link)
    } else {
      // 处理有标签的链接
      link.tags.forEach(tag => {
        if (!groups[tag]) {
          groups[tag] = []
        }
        groups[tag].push(link)
      })
    }
    return groups
  }, {} as Record<string, LinkItem[]>)
}

/**
 * 计算每个标签的链接数量
 * @param links 链接数组
 * @returns 标签数量对象，键为标签名，值为数量
 */
export const getTagCounts = (links: LinkItem[]): Record<string, number> => {
  const tagCounts = links.reduce((counts, link) => {
    if (link.tags.length === 0) {
      counts['未分类'] = (counts['未分类'] || 0) + 1
    } else {
      link.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    }
    return counts
  }, {} as Record<string, number>)
  
  // 按数量排序并返回
  return Object.fromEntries(
    Object.entries(tagCounts)
      .sort(([_, a], [__, b]) => b - a)
  )
}
