import React from 'react';
import { Shuffle } from 'lucide-react';
import StarRating from '../ui/StarRating';
import SeeMoreText from '../ui/SeeMoreText';
import { HotelCardProps } from './types';

const HotelCard: React.FC<HotelCardProps> = ({
  imageUrl,
  name,
  rating,
  description,
  hideOptions = true,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-start justify-start gap-y-2 w-64 ${className}`}>
      <img src={imageUrl} className='w-full h-40 rounded-lg object-cover' />
      <div className='flex flex-row items-center justify-between w-full'>
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-md font-medium text-gray-800 w-[60%]'>
          {name}
        </h1>
        <StarRating size={4} rating={rating} />
      </div>
      <SeeMoreText maxLength={100} text={description} />
      {hideOptions && (
        <div className='flex flex-row items-center justify-start gap-x-2 py-1 px-3 rounded-full bg-indigo-50 border border-indigo-400'>
          <Shuffle size={14} className='text-indigo-800' />
          <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-sm font-medium text-indigo-800'>
            Hide Options
          </h1>
        </div>
      )}
    </div>
  );
};

export default HotelCard;
