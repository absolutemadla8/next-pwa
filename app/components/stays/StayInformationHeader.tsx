'use client'

import { formatDate } from '@/app/lib/utils';
import useItineraryStore from '@/app/store/itineraryStore';
import React from 'react';

const StayInformationHeader = () => {
  const { itinerary, getTotalAdults, getTotalChildren, getTotalRooms } = useItineraryStore();

  return (
    <div className='flex flex-col items-start justify-start w-full bg-gradient-to-r from-blue-600 to-blue-800 pb-2 rounded-b-lg overflow-hidden z-10'>
      <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-b-lg overflow-hidden'>
        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 font-normal text-md'>
          {itinerary.locationName}
        </h2>
        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-slate-600 font-normal text-sm'>
          {itinerary.checkIn ? formatDate(itinerary.checkIn) : 'No date selected'} - {itinerary.checkOut ? formatDate(itinerary.checkOut) : 'No date selected'}
        </h2>
        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 font-normal text-sm'>
          {getTotalAdults() + getTotalChildren()} Guests, {getTotalRooms()} Room
        </h2>
      </div>
    </div>
  );
};

export default StayInformationHeader;