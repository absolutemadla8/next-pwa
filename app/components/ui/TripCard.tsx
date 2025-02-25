import React from 'react';
import { ArrowUpCircle, CheckCircle2 } from 'lucide-react';

interface TripCardProps {
  trip: {
    id: string;
    name: string;
    country: string;
    images: Array<{ url: string }>;
    inclusions: string;
    pricing: number;
    discountedPrice: number;
    nights: number;
    currency: string;
  };
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  return (
    <div 
      key={trip.id}
      className="flex-shrink-0 w-80 h-fit rounded-2xl flex flex-col items-center justify-center overflow-hidden bg-white shadow-sm"
    >
      <img 
        src={trip.images?.[0]?.url || "/api/placeholder/400/320"} 
        alt={trip.name}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="flex flex-col items-start justify-start gap-y-2 p-4 w-full">
        <div className='flex flex-row items-center justify-between w-full'>
          <span className="text-gray-600 text-sm font-notmal">
            {trip.country}
          </span>
          <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-gray-600 text-sm">
            {trip.nights} {trip.nights === 1 ? 'night' : 'nights'}
          </span>
        </div>
        <h1 
          style={{ fontFamily: 'var(--font-nohemi)' }} 
          className="text-blue-950 text-lg line-clamp-2"
        >
          {trip.name}
        </h1>
        <div className='flex flex-row flex-wrap items-center justify-start gap-x-3 gap-y-2'>
          {trip.inclusions?.split(',').map((inclusion, index) => (
            <div key={index} className='flex flex-row items-center justify-start gap-x-1'>
              <CheckCircle2 className='text-teal-500 text-xs size-4' />
              <p className='text-sm font-medium text-blue-950'>
                {inclusion.trim()}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-x-2">
          <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-[#0159FB] font-medium text-lg">
            {trip.currency === "INR" ? "₹" : "$"}{trip.discountedPrice.toLocaleString()}
          </span>
          {trip.pricing !== trip.discountedPrice && (
            <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-gray-400 line-through text-sm">
              {trip.currency === "INR" ? "₹" : "$"}{trip.pricing.toLocaleString()}
            </span>
          )}
        </div>
        <button className='flex flex-row items-center justify-center gap-x-2 rounded-full p-3 bg-[#0159FB] text-sm font-semibold text-white'>
          <ArrowUpCircle className='size-4' />
          Send on Whatsapp
        </button>
      </div>
    </div>
  );
};

export default TripCard;