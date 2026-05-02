import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PhotoCard from './PhotoCard'
import { Photo } from '../types/photo'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
  if (photos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="empty-card text-center mt-9"
      >
        <div className="camera-icon">
          <div className="camera-lens"></div>
          <div className="camera-flash"></div>
        </div>
        <h3 className="text-3xl font-bold text-gray-800 mb-2.5">还没有照片</h3>
        <p className="text-lg text-gray-500">点击"添加回忆"，开始记录您的美好时光吧</p>

        <div className="footer-hints mt-8">
          <div className="hint-item">
            <span className="hint-dot"></span>
            <span>支持照片分类</span>
          </div>
          <div className="hint-item">
            <span className="hint-dot"></span>
            <span>记录生活瞬间</span>
          </div>
          <div className="hint-item">
            <span className="hint-dot"></span>
            <span>保存美好回忆</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="photo-masonry mt-6">
      <AnimatePresence mode="popLayout">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{
              duration: 0.5,
              delay: index * 0.06,
              type: "spring",
              stiffness: 120,
              damping: 18
            }}
            layout
            className="break-inside-avoid"
          >
            <PhotoCard
              photo={photo}
              onClick={() => onPhotoClick(photo)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default PhotoGrid