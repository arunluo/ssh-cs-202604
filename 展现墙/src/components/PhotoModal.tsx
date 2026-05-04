import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Trash2, Edit3, Save, Calendar, Tag, FileText } from 'lucide-react'
import { Photo } from '../types/photo'

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
  onDelete: (photoId: string) => void
  onUpdate: (photoId: string, updates: Partial<Photo>) => void
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: photo.title,
    description: photo.description || '',
    tags: photo.tags.join(', ')
  })

  const handleSave = () => {
    const updates = {
      title: editData.title,
      description: editData.description,
      tags: editData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }
    onUpdate(photo.id, updates)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('确定要删除这张照片吗？')) {
      onDelete(photo.id)
      onClose()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 relative min-h-[200px]">
          <img
            src={photo.url}
            alt={photo.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="w-full md:w-96 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">照片详情</h2>
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                >
                  <Save className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <input
                  type="text"
                  value={editData.tags}
                  onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="用逗号分隔"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-colors shadow-lg"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{photo.title}</h3>
                {photo.description && (
                  <p className="text-gray-600 leading-relaxed">{photo.description}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>创建于 {formatDate(photo.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>文件大小: {formatFileSize(photo.size)}</span>
                </div>

                {photo.tags.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <Tag className="w-4 h-4" />
                      <span>标签</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {photo.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-gray-700 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PhotoModal