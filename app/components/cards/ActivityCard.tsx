import React from 'react';
import SeeMoreText from '../ui/SeeMoreText';
import { ActivityCardProps } from './types';

const ActivityCard: React.FC<ActivityCardProps> = ({
  imageUrl,
  title,
  duration,
  description,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-start justify-start gap-y-2 w-64 ${className}`}>
      <img src={imageUrl} className='w-full h-40 rounded-lg object-cover' />
      <div className='flex flex-row items-center justify-between w-full'>
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-md font-medium text-gray-800'>
          {title}
        </h1>
      </div>
      <div className='flex flex-row items-center justify-start gap-x-1'>
        <h1 className='text-sm font-semibold text-gray-800 tracking-tight'>
          Duration
        </h1>
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-sm text-blue-600 ml-1'>
          {duration}
        </h1>
      </div>
      <SeeMoreText
        maxLength={100}
        text={description}
      />
    </div>
  );
};

export default ActivityCard;
