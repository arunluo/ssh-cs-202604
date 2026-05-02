import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import PhotoCard from './components/PhotoCard'
import UploadPage from './components/UploadPage'
import CategoryFilter from './components/CategoryFilter'
import PhotoModal from './components/PhotoModal'
import { usePhotos } from './hooks/usePhotos'
import { Photo } from './types/photo'

function App() {
  const { photos, categories, loading, addPhoto, deletePhoto, updatePhoto } = usePhotos()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showUploadPage, setShowUploadPage] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter(photo => photo.category === selectedCategory)

  if (loading) {
    return (
      <div className="bg min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="bg-decoration-1"></div>
        <div className="bg-decoration-2"></div>
        <div className="green-ball"></div>
        <div className="container mx-auto relative z-10">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p className="text-gray-600 font-medium text-lg">正在加载美好回忆...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/wp8733006.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
      <div className="bg-decoration-1"></div>
      <div className="bg-decoration-2"></div>
      <div className="green-ball"></div>

      <div className="relative z-10">
        <Header onUploadClick={() => setShowUploadPage(true)} />

        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.02
                }}
              >
                <PhotoCard
                  photo={photo}
                  onClick={() => setSelectedPhoto(photo)}
                />
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showUploadPage && (
          <UploadPage
            categories={categories}
            onClose={() => setShowUploadPage(false)}
            onUpload={addPhoto}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPhoto && (
          <PhotoModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onDelete={deletePhoto}
            onUpdate={updatePhoto}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App