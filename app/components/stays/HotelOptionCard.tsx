'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

interface Hotel {
  name?: string;
  location?: string;
}

interface RoomImage {
  url: string;
}

interface Room {
  name?: string;
  images?: RoomImage[];
}

interface HotelOptionCardProps {
  hotel?: Hotel;
  room?: Room;
  boardType?: string;
  className?: string;
}

const boardTypeLabels: Record<string, string> = {
  BB: 'Free Breakfast',
  HB: 'Half Board',
  FB: 'Full Board',
  AI: 'All Inclusive',
  RO: 'Room Only',
};

const HotelOptionCard: React.FC<HotelOptionCardProps> = ({ 
  hotel, 
  room, 
  boardType = 'RO',
  className = ''
}) => {
  // Get all the image URLs from the room. Fallback if no images available.
  const images = room?.images?.map((img) => img.url) ?? ['https://via.placeholder.com/400x240'];

  // Limit to one image for display
  const displayImage = images[0];

  return (
    <div className={`flex flex-col items-start justify-start overflow-hidden rounded-lg w-full ${className}`}>
      {/* Image Gallery */}
      <div className="flex flex-col w-full h-48">
        <img 
          src={displayImage} 
          alt={room?.name || 'Hotel room'} 
          className="object-cover rounded-t-xl"
        />
      </div>

      <div className="p-4 bg-white space-y-3 w-full">
        {/* Hotel Info */}
        <div className="space-y-1">
          <h3 
            style={{ fontFamily: 'var(--font-nohemi)' }}
            className="text-primary font-medium text-base truncate"
          >
            {hotel?.name ?? 'Hotel Name'}
          </h3>
          <p className="text-slate-600 text-xs truncate tracking-tight">
            {hotel?.location ?? 'Location'}
          </p>
        </div>

        <div className="h-px bg-gray-200"></div>

        {/* Room Details */}
        <div className="space-y-2">
          <p className="text-rose-600 text-xs font-medium">Room Type</p>
          <p 
            style={{ fontFamily: 'var(--font-nohemi)' }}
            className="text-primary text-sm line-clamp-2"
          >
            {room?.name ?? 'Standard Room'}
          </p>

          <div className="flex items-center gap-1.5">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-green-600 text-xs font-medium">
              {boardTypeLabels[boardType]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelOptionCard;