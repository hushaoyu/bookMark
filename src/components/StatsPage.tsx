import React from 'react'
import { LinkItem } from '../types'
import styles from '../styles/components/stats.module.css'

interface StatsPageProps {
  links: LinkItem[]
}

const StatsPage: React.FC<StatsPageProps> = ({ links }) => {
  // 计算标签链接数
  const getTagCounts = () => {
    const tagCounts = new Map<string, number>()
    links.forEach(link => {
      if (link.tags.length === 0) {
        tagCounts.set('未分类', (tagCounts.get('未分类') || 0) + 1)
      } else {
        link.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        })
      }
    })
    return Array.from(tagCounts.entries())
      .sort(([_, a], [__, b]) => b - a)
  }

  const tagCounts = getTagCounts()

  return (
    <div className={styles.statsContainer}>
      <h2>统计分析</h2>
      <div className={styles.statsContent}>
        <div className={styles.statCard}>
          <h3>总链接数</h3>
          <p className={styles.statValue}>{links.length}</p>
        </div>
        <div className={styles.tagsStats}>
          <h3>标签链接数统计</h3>
          <div className={styles.tagsStatsList}>
            {tagCounts.map(([tag, count]) => (
              <div key={tag} className={styles.tagStatItem}>
                <span className={styles.tagStatName}>{tag}</span>
                <span className={styles.tagStatCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsPage
