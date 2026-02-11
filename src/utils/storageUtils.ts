/**
 * 存储工具函数
 */

/**
 * 计算 localStorage 中单个键值对的大小（字节）
 * @param key 键名
 * @param value 值
 * @returns 大小（字节）
 */
const calculateItemSize = (key: string, value: string): number => {
  // 计算键和值的字符串长度，每个字符占 2 字节
  return (key.length + value.length) * 2;
};

/**
 * 缓存项信息接口
 */
export interface CacheItemInfo {
  key: string;
  size: number;
  formattedSize: string;
}

/**
 * 计算 localStorage 中所有数据的总大小（字节）
 * @returns 总大小（字节）
 */
export const calculateTotalCacheSize = (): number => {
  let totalSize = 0;
  
  try {
    // 遍历 localStorage 中的所有键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += calculateItemSize(key, value);
        }
      }
    }
  } catch (error) {
    console.error('Error calculating cache size:', error);
  }
  
  return totalSize;
};

/**
 * 获取 localStorage 中所有缓存项的详细信息
 * @returns 缓存项信息数组
 */
export const getCacheItemsInfo = (): CacheItemInfo[] => {
  const items: CacheItemInfo[] = [];
  
  try {
    // 遍历 localStorage 中的所有键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          const size = calculateItemSize(key, value);
          items.push({
            key,
            size,
            formattedSize: formatBytes(size)
          });
        }
      }
    }
    
    // 按大小降序排序
    items.sort((a, b) => b.size - a.size);
  } catch (error) {
    console.error('Error getting cache items info:', error);
  }
  
  return items;
};

/**
 * 格式化字节数为易读的单位
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 清除所有 localStorage 数据
 */
export const clearAllCache = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
