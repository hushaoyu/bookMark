import { useState, useEffect, useRef } from 'react'

type UseLocalStorageReturn<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>,
  () => void
]

/**
 * 自定义Hook，用于处理本地存储逻辑
 * @param key 本地存储的键名
 * @param initialValue 初始值
 * @returns [value, setValue, removeValue] 数组，包含存储的值、设置值的函数和删除值的函数
 */
const useLocalStorage = <T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> => {
  const [value, setValue] = useState<T>(initialValue)
  const isLoaded = useRef(false)
  const hasValueFromStorage = useRef(false)

  // 从本地存储加载初始值
  useEffect(() => {
    try {
      const savedValue = localStorage.getItem(key)
      console.log(`Loading value for key "${key}":`, JSON.parse(savedValue || 'null'));
      
      if (savedValue) {
        setValue(JSON.parse(savedValue))
        hasValueFromStorage.current = true
      }
      isLoaded.current = true
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      isLoaded.current = true
    }
  }, [key])

  // 当值变化时，保存到本地存储
  useEffect(() => {
    // 只有在初始加载完成后才保存，避免覆盖本地存储中的值
    // 并且如果是从本地存储加载的值，第一次不保存
    if (isLoaded.current) {
      // 检查是否是从本地存储加载的值，如果是，第一次不保存
      if (hasValueFromStorage.current) {
        // 重置标志，后续的变化可以正常保存
        hasValueFromStorage.current = false
      } else {
        // 只有当不是从本地存储加载的值时，才保存
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
          console.error('Error saving to localStorage:', error)
        }
      }
    }
  }, [key, value])

  // 删除本地存储中的值
  const removeValue = () => {
    try {
      localStorage.removeItem(key)
      setValue(initialValue)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }

  return [value, setValue, removeValue]
}

export default useLocalStorage
