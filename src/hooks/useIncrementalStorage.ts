import { useState, useEffect, useRef, useCallback } from 'react'

type UseIncrementalStorageReturn<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>,
  () => void
]

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * 增量更新的自定义Hook，用于处理本地存储逻辑
 * 仅保存修改的部分，减少存储操作
 * @param key 本地存储的键名
 * @param initialValue 初始值
 * @param debounceDelay 防抖延迟时间（毫秒），默认 300ms
 * @returns [value, setValue, removeValue] 数组，包含存储的值、设置值的函数和删除值的函数
 */
const useIncrementalStorage = <T>(
  key: string,
  initialValue: T,
  debounceDelay: number = 300
): UseIncrementalStorageReturn<T> => {
  const [value, setValue] = useState<T>(initialValue)
  const isLoaded = useRef(false)
  const hasValueFromStorage = useRef(false)
  const previousValueRef = useRef<T>(initialValue)

  // 从本地存储加载初始值
  useEffect(() => {
    try {
      const savedValue = localStorage.getItem(key)
      
      if (savedValue) {
        const parsedValue = JSON.parse(savedValue)
        setValue(parsedValue)
        previousValueRef.current = parsedValue
        hasValueFromStorage.current = true
      }
      isLoaded.current = true
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      isLoaded.current = true
    }
  }, [key])

  // 创建防抖的保存函数
  const saveToStorage = useCallback(
    debounce((newValue: T) => {
      try {
        // 对于对象和数组，检查是否有变化
        const hasChanged = JSON.stringify(newValue) !== JSON.stringify(previousValueRef.current)
        
        if (hasChanged) {
          localStorage.setItem(key, JSON.stringify(newValue))
          previousValueRef.current = newValue
        }
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }, debounceDelay),
    [key, debounceDelay]
  )

  // 当值变化时，使用防抖保存到本地存储
  useEffect(() => {
    // 只有在初始加载完成后才保存
    if (isLoaded.current) {
      // 检查是否是从本地存储加载的值，如果是，第一次不保存
      if (hasValueFromStorage.current) {
        // 重置标志，后续的变化可以正常保存
        hasValueFromStorage.current = false
      } else {
        // 使用防抖保存
        saveToStorage(value)
      }
    }
  }, [key, value, saveToStorage])

  // 删除本地存储中的值
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setValue(initialValue)
      previousValueRef.current = initialValue
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }, [key, initialValue])

  return [value, setValue, removeValue]
}

export default useIncrementalStorage
