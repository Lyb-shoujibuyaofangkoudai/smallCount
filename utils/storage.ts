
import AsyncStorage from '@react-native-async-storage/async-storage'

// 存储键前缀
const STORAGE_PREFIX = {
  DEFAULT: 'app_',
  THEME: 'theme_',
  SETTINGS: 'settings_',
}

// 存储类型枚举
export enum StorageType {
  DEFAULT = 'default',
  THEME = 'theme',
  SETTINGS = 'settings',
}

// 获取存储键前缀
function getStoragePrefix(type: StorageType) {
  switch (type) {
    case StorageType.DEFAULT:
      return STORAGE_PREFIX.DEFAULT
    case StorageType.THEME:
      return STORAGE_PREFIX.THEME
    case StorageType.SETTINGS:
      return STORAGE_PREFIX.SETTINGS
    default:
      return STORAGE_PREFIX.DEFAULT
  }
}

// 生成完整的存储键
function getStorageKey(type: StorageType, key: string) {
  return `${getStoragePrefix(type)}${key}`
}

// 基础存储操作类
export class StorageManager {
  private storageType: StorageType

  constructor(storageType: StorageType = StorageType.DEFAULT) {
    this.storageType = storageType
  }

  // 设置值
  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      let stringValue: string

      if (typeof value === 'string') {
        stringValue = value
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        stringValue = String(value)
      } else {
        // 对象类型转为JSON字符串存储
        stringValue = JSON.stringify(value)
      }

      await AsyncStorage.setItem(storageKey, stringValue)
      return true
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error)
      return false
    }
  }

  // 获取值
  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      const value = await AsyncStorage.getItem(storageKey)
      if (value === null) {
        return defaultValue
      }

      // 尝试解析JSON
      try {
        return JSON.parse(value) as T
      } catch {
        // 如果不是JSON，尝试转换类型
        if (value === 'true') return true as T
        if (value === 'false') return false as T
        if (!isNaN(Number(value)) && value !== '') return Number(value) as T
        return value as unknown as T
      }
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error)
      return defaultValue
    }
  }

  // 获取字符串
  async getString(key: string, defaultValue?: string): Promise<string | undefined> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      const value = await AsyncStorage.getItem(storageKey)
      return value ?? defaultValue
    } catch (error) {
      console.error(`Storage getString error for key "${key}":`, error)
      return defaultValue
    }
  }

  // 获取数字
  async getNumber(key: string, defaultValue?: number): Promise<number | undefined> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      const value = await AsyncStorage.getItem(storageKey)
      if (value === null) return defaultValue
      
      const numValue = Number(value)
      return isNaN(numValue) ? defaultValue : numValue
    } catch (error) {
      console.error(`Storage getNumber error for key "${key}":`, error)
      return defaultValue
    }
  }

  // 获取布尔值
  async getBoolean(key: string, defaultValue?: boolean): Promise<boolean | undefined> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      const value = await AsyncStorage.getItem(storageKey)
      if (value === null) return defaultValue
      
      if (value === 'true') return true
      if (value === 'false') return false
      return defaultValue
    } catch (error) {
      console.error(`Storage getBoolean error for key "${key}":`, error)
      return defaultValue
    }
  }

  // 检查键是否存在
  async contains(key: string): Promise<boolean> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      const value = await AsyncStorage.getItem(storageKey)
      return value !== null
    } catch (error) {
      console.error(`Storage contains error for key "${key}":`, error)
      return false
    }
  }

  // 删除键
  async remove(key: string): Promise<boolean> {
    try {
      const storageKey = getStorageKey(this.storageType, key)
      await AsyncStorage.removeItem(storageKey)
      return true
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error)
      return false
    }
  }

  // 清空所有数据
  async clear(): Promise<boolean> {
    try {
      const prefix = getStoragePrefix(this.storageType)
      const allKeys = await AsyncStorage.getAllKeys()
      const keysToRemove = allKeys.filter(key => key.startsWith(prefix))
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove)
      }
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  }

  // 获取所有键
  async getAllKeys(): Promise<string[]> {
    try {
      const prefix = getStoragePrefix(this.storageType)
      const allKeys = await AsyncStorage.getAllKeys()
      return allKeys
        .filter(key => key.startsWith(prefix))
        .map(key => key.replace(prefix, ''))
    } catch (error) {
      console.error('Storage getAllKeys error:', error)
      return []
    }
  }

  // 批量设置
  async setMultiple<T extends Record<string, any>>(data: T): Promise<boolean> {
    try {
      const promises = Object.entries(data).map(([key, value]) => 
        this.set(key, value)
      )
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Storage setMultiple error:', error)
      return false
    }
  }

  // 批量获取
  async getMultiple<T extends string[]>(keys: T): Promise<Record<T[number], any>> {
    const result = {} as Record<T[number], any>
    const promises = keys.map(async (key) => {
      result[key as T[number]] = await this.get(key)
    })
    await Promise.all(promises)
    return result
  }

  // 批量删除
  async removeMultiple(keys: string[]): Promise<boolean> {
    try {
      const promises = keys.map(key => this.remove(key))
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Storage removeMultiple error:', error)
      return false
    }
  }
}

// 导出存储管理器实例
export const defaultStorageManager = new StorageManager(StorageType.DEFAULT)
export const themeStorageManager = new StorageManager(StorageType.THEME)
export const settingsStorageManager = new StorageManager(StorageType.SETTINGS)
