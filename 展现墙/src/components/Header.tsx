import React from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface HeaderProps {
  onUploadClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onUploadClick }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100"
    >
      <div className="container mx-auto px-6 py-6">
        {/* Hero Section - Album Style */}
        <div className="hero-gradient rounded-2xl p-8 flex justify-between items-center text-white mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-3">时光相册</h1>
            <p className="text-lg text-white/80">记录生活的美好，把每一个瞬间收藏起来</p>
          </div>
          <motion.button
            onClick={onUploadClick}
            className="add-btn-gradient"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-6 h-6 mr-2" />
            添加回忆
          </motion.button>
        </div>

        {/* Section Title */}
        <div className="section-title">
          <h2 className="text-3xl font-bold text-gray-800">我的回忆</h2>
          <p className="text-gray-500 mt-2">按分类浏览属于你的珍贵时光</p>
        </div>
      </div>
    </motion.header>
  )
}

export default Header