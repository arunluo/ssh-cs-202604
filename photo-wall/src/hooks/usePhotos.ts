import { useState, useEffect, useCallback } from 'react'
import { Photo, PhotoCategory, PhotoFormData } from '../types/photo'
import { storage } from '../utils/storage'

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [categories, setCategories] = useState<PhotoCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      setPhotos(storage.getPhotos())
      setCategories(storage.getCategories())
      setLoading(false)
    }
    loadData()
  }, [])

  const addPhoto = useCallback((file: File, formData: PhotoFormData) => {
    return new Promise<Photo>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newPhoto: Photo = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          url: e.target?.result as string,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          createdAt: new Date().toISOString(),
          size: file.size
        }

        const updatedPhotos = [newPhoto, ...photos]
        setPhotos(updatedPhotos)
        storage.savePhotos(updatedPhotos)
        resolve(newPhoto)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }, [photos])

  const deletePhoto = useCallback((photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId)
    setPhotos(updatedPhotos)
    storage.savePhotos(updatedPhotos)
  }, [photos])

  const updatePhoto = useCallback((photoId: string, updates: Partial<Photo>) => {
    const updatedPhotos = photos.map(photo =>
      photo.id === photoId ? { ...photo, ...updates } : photo
    )
    setPhotos(updatedPhotos)
    storage.savePhotos(updatedPhotos)
  }, [photos])

  const addCategory = useCallback((category: Omit<PhotoCategory, 'id'>) => {
    const newCategory: PhotoCategory = {
      ...category,
      id: Date.now().toString()
    }
    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    storage.saveCategories(updatedCategories)
  }, [categories])

  const getPhotosByCategory = useCallback((categoryId: string) => {
    return photos.filter(photo => photo.category === categoryId)
  }, [photos])

  return {
    photos,
    categories,
    loading,
    addPhoto,
    deletePhoto,
    updatePhoto,
    addCategory,
    getPhotosByCategory
  }
}
