'use client'

import React, { useState, useEffect, MouseEvent, TouchEvent } from 'react'
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react'
import AnimatedButton from '../ui/AnimatedButton';

// Define image type that can handle both string URLs and object with url property
type ImageType = string | { url: string; [key: string]: any }

interface HotelGalleryProps {
  images: ImageType[]
}

const HotelGallery: React.FC<HotelGalleryProps> = ({ images }) => {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // The minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50

  const openModal = (index: number): void => {
    setCurrentIndex(index)
    setShowModal(true)
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden'
  }

  const closeModal = (e?: MouseEvent): void => {
    // Check if the click was directly on the backdrop
    if (e && e.target !== e.currentTarget) return
    
    setShowModal(false)
    // Re-enable scrolling
    document.body.style.overflow = 'auto'
  }

  const nextImage = (e: MouseEvent | KeyboardEvent): void => {
    if ('stopPropagation' in e) {
      e.stopPropagation() // Stop event from reaching backdrop
    }
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = (e: MouseEvent | KeyboardEvent): void => {
    if ('stopPropagation' in e) {
      e.stopPropagation() // Stop event from reaching backdrop
    }
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  // Helper function to get image URL
  const getImageUrl = (image: ImageType): string => {
    return typeof image === 'string' ? image : image.url
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!showModal) return
      
      if (e.key === 'ArrowRight') nextImage(e)
      if (e.key === 'ArrowLeft') prevImage(e)
      if (e.key === 'Escape') closeModal()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showModal])

  // Handle touch events for swiping
  const onTouchStart = (e: TouchEvent<HTMLDivElement>): void => {
    e.stopPropagation() // Prevent event from reaching backdrop
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: TouchEvent<HTMLDivElement>): void => {
    e.stopPropagation() // Prevent event from reaching backdrop
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>): void => {
    e.stopPropagation() // Prevent event from reaching backdrop
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) {
      const syntheticEvent = { stopPropagation: () => {} } as MouseEvent
      nextImage(syntheticEvent)
    }
    if (isRightSwipe) {
      const syntheticEvent = { stopPropagation: () => {} } as MouseEvent
      prevImage(syntheticEvent)
    }
  }

  return (
    <>
      {/* Thumbnail Gallery Grid */}
      <div className="grid grid-cols-2 gap-1.5 w-full pt-4 px-3">
        {/* Main large image */}
        <div 
          className="col-span-2 h-72 rounded-xl overflow-hidden cursor-pointer shadow-md transition-transform hover:scale-[1.01]"
          onClick={() => openModal(0)}
        >
          <img 
            src={getImageUrl(images[0])} 
            alt="Hotel main view" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* First row of thumbnails - larger and prominent */}
        <div className="col-span-2 grid grid-cols-2 gap-1.5 mt-1.5">
          {images.slice(1, 3).map((image, index) => (
            <div 
              key={index}
              className="h-40 rounded-xl overflow-hidden cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
              onClick={() => openModal(index + 1)}
            >
              <img 
                src={getImageUrl(image)} 
                alt={`Hotel view ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* Remaining thumbnails */}
        <div className="col-span-2 grid grid-cols-3 gap-1.5 mt-1.5">
          {images.slice(3, 9).map((image, index) => (
            <div 
              key={index}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
              onClick={() => openModal(index + 3)}
            >
              <img 
                src={getImageUrl(image)} 
                alt={`Hotel view ${index + 3}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* "View more" button if there are more than 9 images */}
        <div className='flex flex-col w-full py-2'>
        {images.length > 9 && (
         <AnimatedButton variant='primary' onClick={() => openModal(9)}>
            View all Images
         </AnimatedButton>
        )}
        </div>
      </div>

      {/* Full Screen Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black z-50 flex flex-col"
          onClick={closeModal}
        >
          {/* Modal Header */}
          <div 
            className="flex justify-between items-center p-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center">
              <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-lg font-medium">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
            <button 
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                closeModal()
              }}
              className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors z-10"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Image Container */}
          <div 
            className="flex-1 flex items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img 
              src={getImageUrl(images[currentIndex])} 
              alt={`Hotel view ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>
          
          {/* Thumbnail Strip */}
          <div 
            className="px-4 py-3 overflow-x-auto flex space-x-2 bg-black bg-opacity-50" 
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((image, index) => (
              <div 
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-16 w-24 flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-all ${
                  index === currentIndex ? 'border-2 border-white scale-105' : 'opacity-70'
                }`}
              >
                <img 
                  src={getImageUrl(image)} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          {/* Navigation Controls */}
          <div 
            className="absolute inset-y-0 left-0 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={prevImage}
              className="bg-black bg-opacity-30 hover:bg-opacity-50 p-3 rounded-r-xl transition-colors ml-2"
            >
              <ChevronLeft color="white" size={32} />
            </button>
          </div>
          
          <div 
            className="absolute inset-y-0 right-0 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={nextImage}
              className="bg-black bg-opacity-30 hover:bg-opacity-50 p-3 rounded-l-xl transition-colors mr-2"
            >
              <ChevronRight color="white" size={32} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default HotelGallery