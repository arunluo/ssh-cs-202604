import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Image as ImageIcon, X } from 'lucide-react'
import { Photo, PhotoCategory, PhotoFormData } from '../types/photo'

interface UploadPageProps {
  categories: PhotoCategory[]
  onClose: () => void
  onUpload: (file: File, formData: PhotoFormData) => Promise<Photo>
}

const UploadPage: React.FC<UploadPageProps> = ({ categories, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [formData, setFormData] = useState<PhotoFormData>({
    title: '',
    description: '',
    category: categories[0]?.id || '',
    tags: ''
  })
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState<'select' | 'edit'>('select')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'edit') {
      setTimeout(() => {
        const form = document.getElementById('upload-form')
        form?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 200)
    }
  }, [step])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
        setStep('edit')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !formData.title.trim()) return

    setUploading(true)
    try {
      await onUpload(selectedFile, formData)
      onClose()
    } catch (error) {
      // Upload failed silently - user can retry
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
        setStep('edit')
      }
      reader.readAsDataURL(file)
    }
  }

  const resetAndBack = () => {
    setSelectedFile(null)
    setPreview('')
    setFormData({
      title: '',
      description: '',
      category: categories[0]?.id || '',
      tags: ''
    })
    setStep('select')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 min-h-full">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={resetAndBack}
              className="flex items-center text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">返回</span>
            </motion.button>

            <div className="text-white font-medium">
              {step === 'select' ? '选择照片' : '填写信息'}
            </div>
          </div>

          <div className="hero-gradient rounded-2xl p-5 mb-6">
            <h1 className="text-2xl font-bold text-white">添加新回忆</h1>
            <p className="text-white/80 text-sm mt-1">记录这个美好的瞬间</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-xl mx-auto">
            {step === 'select' ? (
              <motion.div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-2xl py-16 text-center cursor-pointer transition-colors hover:border-purple-400 hover:bg-purple-50/30"
                onClick={() => fileInputRef.current?.click()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <ImageIcon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  选择或拖拽照片到这里
                </h3>
                <p className="text-gray-500 text-sm">支持 JPG、PNG、GIF 格式</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </motion.div>
            ) : (
              <motion.form
                id="upload-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative mb-5">
                  <img
                    src={preview}
                    alt="预览"
                    className="w-full h-48 object-cover rounded-xl shadow-md"
                  />
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview('')
                      setStep('select')
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      回忆标题 *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-purple-400 transition-colors bg-gray-50 focus:bg-white"
                      placeholder="给这个美好时刻起个名字..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      分类
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <motion.button
                          key={category.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: category.id })}
                          className={`
                            px-3 py-1.5 rounded-full text-sm transition-all
                            ${formData.category === category.id
                              ? 'bg-purple-600 text-white font-bold'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
                          `}
                          whileTap={{ scale: 0.95 }}
                        >
                          {category.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      回忆描述
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 h-20 resize-none focus:outline-none focus:border-purple-400 transition-colors bg-gray-50 focus:bg-white text-base"
                      placeholder="记录这一刻的故事和感受..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      标签
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-purple-400 transition-colors bg-gray-50 focus:bg-white"
                      placeholder="用逗号分隔多个标签"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <motion.button
                      type="button"
                      onClick={resetAndBack}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      取消
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={!formData.title.trim() || uploading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      {uploading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>保存中...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>保存回忆</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default UploadPage