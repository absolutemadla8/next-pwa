import React from 'react'
import StarRating from '../ui/StarRating'
import { MapPin } from 'lucide-react'
import TagList from '../ui/TagList'
import ImageCarousel from '../ui/ImageCarousel'

interface HotelCardProps {
  name: string
  location: string
  rating: number
  distance: string
  amenities: string[]
  price: number
  images: string[],
  onClickHotel: () => void
}

const HotelCard: React.FC<HotelCardProps> = ({
  name,
  location,
  rating,
  distance,
  amenities,
  price,
  images,
  onClickHotel
}) => {
  return (
    <div onClick={onClickHotel} className='flex flex-col items-start justify-start w-full h-fit bg-white overflow-hidden'>
        <ImageCarousel images={images} alt={name} />
        <div className='flex flex-col items-start justify-start w-full p-4'>
            <div className='flex flex-row items-start justify-between w-full'>
            <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg text-primary w-[68%] truncate'>
                {name}
            </h1>
            <StarRating rating={rating} size={5} />
            </div>
            <span className='text-xs text-slate-600 font-normal tracking-tight truncate'>
                {location}
            </span>
            <div className='flex flex-row items-start justify-start pt-2'>
                <MapPin size={16} className='fill-primary' />
                <span className='text-xs text-primary font-normal tracking-tight truncate'>
                   {distance}
                </span>
            </div>
            <TagList tags={amenities} />
            <div className='flex flex-row items-start justify-between w-full'>
            <div className='flex flex-col items-start justify-start pt-2'>
            <span className='text-xs text-slate-600 font-normal tracking-tight truncate'>
                   Starting from
                </span>
                <div className='flex flex-row items-center justify-start gap-x-2'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg text-primary'>
                Rs.{price.toLocaleString()}
            </h1>
            <span className='text-xs text-slate-600 font-normal tracking-tight truncate'>
                   room per night
                </span>
            </div>
            <span className='text-xs text-teal-600 font-normal tracking-tight truncate'>
                   Inclusive of taxes and fee
                </span>
            </div>
            </div>
        </div>
    </div>
  )
}

export default HotelCard