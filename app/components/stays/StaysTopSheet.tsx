'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import TopSheet from '@/app/components/ui/TopSheet';
import useBottomSheetStore from '@/app/store/bottomSheetStore';
import useItineraryStore from '@/app/store/itineraryStore';
import { formatDate } from '@/app/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface StaysTopSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const StaysTopSheet: React.FC<StaysTopSheetProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  
  // Access Bottom Sheet and Itinerary stores
  const { openSheet } = useBottomSheetStore();
  const {
    itinerary,
    getTotalAdults,
    getTotalRooms,
    getTotalChildren,
    setLocationDetails
  } = useItineraryStore();

  const handleSearch = () => {
    // Validate required fields
    if (!itinerary.locationName) {
      toast.error('Please select a location');
      return;
    }

    if (!itinerary.checkIn || !itinerary.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    
    // Reset rateId and roomId for all rooms before search
    const updatedRooms = itinerary.rooms.map(room => ({
      ...room,
      rateId: null,
      roomId: null,
      price: 0
    }));
    
    // Update itinerary with the same location but reset rooms
    setLocationDetails({
      locationId: itinerary.locationId,
      locationName: itinerary.locationName,
      type: itinerary.type,
      city: itinerary.city,
      state: itinerary.state,
      country: itinerary.country,
      travclanScore: itinerary.travclanScore,
      hotelId: itinerary.hotelId
    });
    
    if (itinerary.hotelId) {
      router.push(`/trippy/stays/${itinerary.hotelId}`);
    } else {
      router.push('/trippy/stays/search');
    }
    onClose();
  };

  return (
    <TopSheet 
      isOpen={isOpen}
      onClose={onClose}
      title="Book your stay"
      minHeight="30vh"
      maxHeight="50vh"
    >
      <div className='flex flex-col items-center justify-center w-full px-6'>
        <div className='flex flex-col items-center justify-start gap-y-2 w-full'>
          <div onClick={() => openSheet('search', { 
            title: 'Search Locations',
            minHeight: '55%',
            maxHeight: '55%',
          })} className='flex flex-col items-start justify-center bg-white rounded-lg px-4 w-full h-14'>
            <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-md truncate w-[90%]'>
              {itinerary.locationName || "Select a location"}
            </h2>
          </div>
          <div onClick={() => openSheet('dateRange', { 
            title: 'Check in & Check out',
            minHeight: '55%',
            maxHeight: '55%',
          })} className='flex flex-col items-start justify-center bg-white rounded-lg px-4 w-full h-14'>
            <span className='text-slate-600 font-normal text-xs tracking-tighter'>Checkin & Checkout</span>
            <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-md'>
              {itinerary.checkIn ? formatDate(itinerary.checkIn) : 'No date selected'} - {itinerary.checkOut ? formatDate(itinerary.checkOut) : 'No date selected'}
            </h2>
          </div>
          <div onClick={() => openSheet('roomConfig', { 
            title: 'Rooms & Guests',
            minHeight: '55%',
            maxHeight: '55%',
          })} className='flex flex-col items-start justify-center bg-white rounded-lg px-4 w-full h-14'>
            <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-md'>
              {getTotalAdults() + getTotalChildren()} Guests, {getTotalRooms()} Room
            </h2>
          </div>
          <button 
            onClick={handleSearch} 
            className='flex flex-row items-center justify-between bg-primary rounded-lg px-4 w-full h-14'
          >
            <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-white font-normal text-md'>Search</h2>
            <ArrowRight size={20} className='text-white' />
          </button>
        </div>
      </div>
    </TopSheet>
  );
};

export default StaysTopSheet;