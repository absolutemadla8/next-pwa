'use client'
import RoomRateCard from '@/app/components/stays/RoomRateCard'
import StayInformationHeader from '@/app/components/stays/StayInformationHeader'
import { useRoomStore } from '@/app/store/roomRateStore'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AnimatedButton from '@/app/components/ui/AnimatedButton'
import useItineraryStore from '@/app/store/itineraryStore'
import { SelectRoomRatesPayload } from '@/app/types/roomRate'
import { api } from '@/app/lib/axios'

const Page = () => {
  const params = useParams();
   const [selectedPrice, setSelectedPrice] = React.useState(0);
  const { rooms, itineraryId, traceId, type } = useRoomStore()
  const [loading, setLoading] = useState(false);
  const {itinerary, setRecommendationId, setRoomDetails, getTotalPrice} = useItineraryStore()
  const router = useRouter()
  
 // In the parent component (Page)
const handleRoomSelect = async (
  roomId: string, 
  rateId: string, 
  recommendationId: string, 
  price: number
) => {
  console.log("Room selected:", roomId, rateId, recommendationId, price);
  itinerary.rooms.forEach(room => {
    setRoomDetails(room.id, { rateId, roomId, price });
    setRecommendationId(recommendationId);
  });
  const totalPrice = getTotalPrice();
  setSelectedPrice(totalPrice);
};

const handleBookNow = async () => {
  try {
    if (!itineraryId) {
      console.error('No itinerary ID found');
      return;
    }
    setLoading(true);

    const payload: SelectRoomRatesPayload = {
      roomsAndRateAllocations: itinerary.rooms.map(room => ({
        rateId: String(room.rateId),
          roomId: String(room.roomId),
          occupancy: {
            adults: room.adults,
            childAges: room.children.map(child => child.age)
        }
      })),
      traceId,
      recommendationId: String(itinerary.recommendationId),
      items: [{
        code: type.code,
        type: 'HOTEL'
      }]
    };

    const response = await api.post(`/hotels/itineraries/${itineraryId}/select-roomrates`, payload);

    //@ts-ignore mlmr
    if (response?.data.status === 'success') {
      router.push(`/trippy/stays/itinerary/session/${params.id}`)
    }
    console.log('Room selection response:', response);
    // Navigate to the next step after successful room selection
  } catch (error) {
    console.error('Error selecting room rates:', error);
    // You might want to show an error toast or message to the user
  }
  finally {
    setLoading(false);
  }
};
  
  return (
    <div className='flex flex-col items-start justify-start w-full bg-[#F1F2F4] min-h-screen'>
      <div className='flex w-full sticky top-0'>
        <StayInformationHeader />
      </div>
      <div className='flex flex-col w-full items-start justify-start p-6 gap-6'>
        {rooms && rooms.length > 0 ? (
          rooms.map(room => (
            <RoomRateCard 
              key={room.id} 
              room={room} 
              onBookNow={handleRoomSelect}
            />
          ))
        ) : (
          <div className="w-full text-center py-8 text-gray-500">
            No rooms available for the selected criteria
          </div>
        )}
      </div>
      <div className='fixed bottom-0 left-0 right-0 flex flex-col items-center justify-start w-full bg-gradient-to-t from-white via-white to-transparent p-4 z-20'>
            <div className='flex flex-col items-center justify-center rounded-lg overflow-hidden bg-blue-600 w-full max-w-screen-xl mx-auto'>
                <div className='flex flex-row items-center justify-between w-full px-3 py-2 bg-blue-700'>
                <span className='text-white text-xs font-normal tracking-tight'>
                            Mar 19, 2025 - Mar 21, 2025, 2 Guests
                        </span>
                </div>
                <div className='flex flex-row items-center justify-between w-full px-3 py-2'>
                <div className='flex flex-col items-start justify-start'>
                <div className='flex flex-row items-center justify-start gap-x-1'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-md text-white'>
                Rs.123456
            </h1>
            <span className='text-xs text-slate-50 font-normal tracking-tight truncate'>
                   total
                </span>
            </div>
            <span className='text-xs text-slate-50 font-normal tracking-tight truncate'>
                   Inclusive of taxes and fee
                </span>
            </div>
            <AnimatedButton disabled={loading} loading={loading} onClick={handleBookNow} size='sm' variant="bland">
            {loading ? 'Selecting' : 'Select Rooms'}
            </AnimatedButton>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Page