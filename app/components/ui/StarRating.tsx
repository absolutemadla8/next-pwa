import { Star } from 'lucide-react'
import React from 'react'

interface StarRatingProps {
  rating: number
  size?: number
}

const StarRating = ({ rating, size = 5 }: StarRatingProps) => {
  // Calculate the number of full and partial stars
  const fullStars = Math.floor(rating)
  const hasPartialStar = rating % 1 !== 0
  const totalStars = 5

  return (
    <div className='flex flex-row items-center justify-start w-fit'>
      {[...Array(totalStars)].map((_, index) => (
        <Star
          key={index}
          className={`size-${size} ${index < fullStars ? 'fill-gray-800' : 'fill-gray-300'}`}
        />
      ))}
    </div>
  )
}

export default StarRating