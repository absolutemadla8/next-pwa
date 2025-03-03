'use client'

import React, { useState, useEffect, MouseEvent, TouchEvent } from 'react'
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react'

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
      <div className="grid grid-cols-3 gap-2 w-full max-h-screen overflow-scroll py-14 px-4">
        {/* Main large image */}
        <div 
          className="col-span-3 h-64 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => openModal(0)}
        >
          <img 
            src={getImageUrl(images[0])} 
            alt="Hotel main view" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Smaller thumbnails */}
        {images.slice(1, 8).map((image, index) => (
          <div 
            key={index}
            className="aspect-square rounded-lg overflow-hidden cursor-pointer"
            onClick={() => openModal(index + 1)}
          >
            <img 
              src={getImageUrl(image)} 
              alt={`Hotel view ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
        {/* "View more" button if there are more than 5 images */}
        {images.length > 5 && (
          <div 
            className="aspect-square relative rounded-lg overflow-hidden cursor-pointer bg-slate-800"
            onClick={() => openModal(5)}
          >
            <img 
              src={getImageUrl(images[5])} 
              alt="More hotel images" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <ImageIcon className="mb-1" />
              <span className="text-sm font-semibold">+{images.length - 5}</span>
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col"
          onClick={closeModal}
        >
          {/* Modal Header */}
          <div 
            className="flex justify-between items-center p-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-lg">
              {currentIndex + 1} / {images.length}
            </span>
            <button 
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                closeModal()
              }}
              className="p-2 rounded-full bg-black bg-opacity-50"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Image Container */}
          <div 
            className="flex-1 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img 
              src={getImageUrl(images[currentIndex])} 
              alt={`Hotel view ${currentIndex + 1}`}
              className="max-h-full max-w-full"
            />
          </div>
          
          {/* Navigation Controls */}
          <div 
            className="absolute inset-y-0 left-0 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={prevImage}
              className="bg-black bg-opacity-30 p-2 rounded-r-lg"
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
              className="bg-black bg-opacity-30 p-2 rounded-l-lg"
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