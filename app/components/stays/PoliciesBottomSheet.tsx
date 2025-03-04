'use client';

import React from 'react';
import PolicyList from './PolicyList';
import { useHotelStore } from '@/app/store/hotelsSearchStore';

const PoliciesBottomSheet = () => {
  const { hotel } = useHotelStore();
  
  if (!hotel || !hotel.policies || hotel.policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">No policy information available</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-2 bg-white">
      <PolicyList 
        policies={hotel.policies} 
        collapsible={false} // No need for collapsible in bottom sheet as we have all the space
        initialExpandedState={true} // Show all policies
      />
    </div>
  );
};

export default PoliciesBottomSheet;