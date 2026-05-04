export interface Photo {
  id: string
  url: string
  title: string
  description?: string
  category: string
  tags: string[]
  createdAt: string
  size: number
}

export interface PhotoCategory {
  id: string
  name: string
  color: string
}

export interface PhotoFormData {
  title: string
  description: string
  category: string
  tags: string
}
