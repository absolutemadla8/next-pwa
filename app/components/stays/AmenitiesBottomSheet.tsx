'use client';

import React from 'react';
import FacilityGroups from '../ui/FacilityGroups';
import { useHotelStore } from '@/app/store/hotelsSearchStore';

const AmenitiesBottomSheet = () => {
  const { hotel } = useHotelStore();
  
  if (!hotel || !hotel.facilities || !hotel.facilityGroups) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">No amenities information available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <FacilityGroups 
        facilities={hotel.facilities} 
        facilityGroups={hotel.facilityGroups} 
      />
    </div>
  );
};

export default AmenitiesBottomSheet;