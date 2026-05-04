import { motion } from 'framer-motion'
import { Photo } from '../types/photo'

interface PhotoCardProps {
  photo: Photo
  onClick: () => void
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  return (
    <motion.div
      className="cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.15 }}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-square">
          <img
            src={photo.url}
            alt={photo.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default PhotoCard