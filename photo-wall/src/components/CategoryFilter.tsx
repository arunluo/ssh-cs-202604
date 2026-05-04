import React from 'react'
import { motion } from 'framer-motion'
import { PhotoCategory } from '../types/photo'

interface CategoryFilterProps {
  categories: PhotoCategory[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  const allCategories = [{ id: 'all', name: '全部', color: '#5568e8' }, ...categories]

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {allCategories.map((category, index) => (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          onClick={() => onCategoryChange(category.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            px-5 py-2.5 rounded-full text-base transition-all duration-300
            ${
              selectedCategory === category.id
                ? 'bg-purple-600 text-white font-bold shadow-lg'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
            }
          `}
        >
          {category.name}
        </motion.button>
      ))}
    </div>
  )
}

export default CategoryFilter