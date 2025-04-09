import React from 'react';
import { CircleDashed } from 'lucide-react';
import SeeMoreText from '../ui/SeeMoreText';
import { PlaceCardProps } from './types';
import { LogoGoogle } from '../chat/icons';

const PlaceCard: React.FC<PlaceCardProps> = ({
  imageUrl,
  name,
  rating,
  description,
  isSelfTransfer = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-start justify-start gap-y-2 w-64 ${className}`}>
      <img src={imageUrl} className='w-full h-40 rounded-lg object-cover' />
      <div className='flex flex-row items-center justify-between w-full'>
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-md font-medium text-gray-800 w-[60%]'>
          {name}
        </h1>
        <div className='flex flex-row items-center justify-start gap-x-1'>
          <LogoGoogle size={16} />
          <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-sm text-gray-800 ml-1'>
            {rating}
          </h1>
        </div>
      </div>
      <SeeMoreText
        maxLength={100}
        text={description}
      />
      {isSelfTransfer && (
        <div className='flex flex-row items-center justify-start w-full'>
          <CircleDashed size={12} className='text-yellow-600' />
          <h1 className='text-sm font-normal text-gray-800 ml-1'>
            Self-Transfer
          </h1>
        </div>
      )}
    </div>
  );
};

export default PlaceCard;
