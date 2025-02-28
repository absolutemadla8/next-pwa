"use client"
import SmallLogoWhite from '@/app/components/svg/SmallLogoWhite'
import React from 'react'
import useBottomSheetStore from '@/app/store/bottomSheetStore'
import useItineraryStore from '@/app/store/itineraryStore'
import { formatDate } from '@/app/lib/utils'
import { ArrowRight } from 'lucide-react'
import { api } from '@/app/lib/axios'
import { useRouter } from 'next/navigation';
import { useHotelStore } from '@/app/store/hotelsSearchStore'

const Page = () => {
  const router = useRouter();
  const { activeSheet, openSheet, closeSheet, sheetConfig } = useBottomSheetStore();
  const {itinerary, getTotalAdults, getTotalRooms, getTotalChildren, getOccupancies} = useItineraryStore();

  const handleSearch = () => {
    if (!itinerary.locationId || !itinerary.checkIn || !itinerary.checkOut) {
      return;
    }
    router.push('/trippy/stays/search');
  };

  return (
    <div className='flex flex-col items-start justify-start w-full'>
        <div className='flex flex-col items-center justify-center w-full bg-gradient-to-t from-blue-600 to-blue-800 p-6'>
          <SmallLogoWhite size={50} />
          <div className='flex flex-col items-center justify-start gap-y-2 w-full pt-4'>
            <div onClick={() => openSheet('search', { 
              title: 'Search Locations',
            })} className='flex flex-col items-start justify-center bg-white rounded-lg px-4 w-full h-14'>
              <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 font-normal text-md'>{itinerary.locationName || "Select a location"}</h2>
            </div>
            <div onClick={() => openSheet('dateRange', { 
              title: 'Check in & Check out',
            })} className='flex flex-col items-start justify-center bg-white rounded-lg px-4 w-full h-14'>
              <span className='text-slate-600 font-normal text-xs tracking-tighter'>Checkin & Checkout</span>
              <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 font-normal text-md'>{itinerary.checkIn ? formatDate(itinerary.checkIn) : 'No date selected'} - {itinerary.checkOut ? formatDate(itinerary.checkOut) : 'No date selected'}</h2>
            </div>
            <div onClick={() => openSheet('roomConfig', { 
              title: 'Rooms & Guests',
            })} className='flex flex-col items-start justify-center bg-white rounded-lg px-4 w-full h-14'>
              <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 font-normal text-md'>{getTotalAdults() + getTotalChildren()} Guests, {getTotalRooms()} Room</h2>
            </div>
            <div onClick={()=>handleSearch()} className='flex flex-row items-center justify-between bg-blue-950 rounded-lg px-4 w-full h-14'>
              <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-white font-normal text-md'>Search</h2>
              <ArrowRight size={20} className='text-white' />
            </div>
          </div>
        </div>
        <div className='flex flex-col items-start justify-start w-full p-6'>
          <div className='flex flex-row items-start justify-between w-full'>
          <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 font-normal text-lg w-1/2 pr-4'>Explore top stay packages</h2>
          <hr className='w-1/2 border-[0.5px] border-slate-500 mt-3' />
          </div>
        </div>
    </div>
  )
}

export default Page