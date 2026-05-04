import { Photo, PhotoCategory } from '../types/photo'

const STORAGE_KEYS = {
  PHOTOS: 'photo_gallery_photos',
  CATEGORIES: 'photo_gallery_categories'
}

export const storage = {
  getPhotos: (): Photo[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PHOTOS)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  savePhotos: (photos: Photo[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos))
    } catch (error) {
      // Storage quota exceeded or unavailable
    }
  },

  getCategories: (): PhotoCategory[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
      return data ? JSON.parse(data) : getDefaultCategories()
    } catch {
      return getDefaultCategories()
    }
  },

  saveCategories: (categories: PhotoCategory[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    } catch (error) {
      // Storage quota exceeded or unavailable
    }
  }
}

const getDefaultCategories = (): PhotoCategory[] => [
  { id: '1', name: '生活日常', color: '#f43f5e' },
  { id: '2', name: '旅行风景', color: '#06b6d4' },
  { id: '3', name: '人物肖像', color: '#8b5cf6' },
  { id: '4', name: '美食记录', color: '#f59e0b' },
  { id: '5', name: '宠物萌照', color: '#10b981' }
]
