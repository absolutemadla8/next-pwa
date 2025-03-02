'use client'
import RoomRateCard from '@/app/components/stays/RoomRateCard'
import StayInformationHeader from '@/app/components/stays/StayInformationHeader'
import { useRoomStore } from '@/app/store/roomRateStore'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AnimatedButton from '@/app/components/ui/AnimatedButton'
import useItineraryStore from '@/app/store/itineraryStore'
import { SelectRoomRatesPayload } from '@/app/types/roomRate'
import { api } from '@/app/lib/axios'
import { formatDate } from '@/app/lib/utils'
import useBottomOrderStore from '@/app/store/bottomOrderStore'

const Page = () => {
  const params = useParams();
  const [selectedPrice, setSelectedPrice] = React.useState(0);
  const { rooms, itineraryId, traceId, type } = useRoomStore()
  const [loading, setLoading] = useState(false);
  const {setButtonText, setHandleCreateItinerary, setInfoSubtitle, setInfoTitle} = useBottomOrderStore();
  const {itinerary, setRecommendationId, setRoomDetails, getTotalPrice} = useItineraryStore()
  const router = useRouter()
  
  // Add state to track the recommendation ID locally
  const [currentRecommendationId, setCurrentRecommendationId] = useState<string | null>(null);
  
  // In the parent component (Page)
  const handleRoomSelect = async (
    roomId: string, 
    rateId: string, 
    recommendationId: string, 
    price: number
  ) => {
    console.log("Room selected:", roomId, rateId, recommendationId, price);
    
    // Store recommendation ID locally
    setCurrentRecommendationId(recommendationId);
    
    // Update the itinerary store with the recommendation ID
    setRecommendationId(recommendationId);
    
    // Set room details for all rooms in the itinerary
    itinerary.rooms.forEach(room => {
      setRoomDetails(room.id, { rateId, roomId, price });
    });
    
    // Update the selected price immediately after state changes
    const totalPrice = getTotalPrice();
    setSelectedPrice(totalPrice);
    
    // Update the bottom order info with the new price
    setInfoSubtitle(`Rs.${totalPrice}`);
    
    console.log("After selection - RecommendationID:", recommendationId);
  };

  const handleBookNow = async () => {
    try {
      if (!itineraryId) {
        console.error('No itinerary ID found');
        return;
      }
      
      // Log state before submission
      console.log("Booking with recommendationId:", currentRecommendationId || itinerary.recommendationId);
      console.log("Itinerary state:", itinerary);
      
      setLoading(true);

      // Use the locally stored recommendationId as a fallback
      const recommendationId = itinerary.recommendationId || currentRecommendationId;
      
      if (!recommendationId) {
        console.error('No recommendation ID found');
        setLoading(false);
        return;
      }

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
        recommendationId: String(recommendationId),
        items: [{
          code: type.code,
          type: 'HOTEL'
        }]
      };

      console.log("Sending payload:", payload);

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

  // Monitor changes to the itinerary and update the price
  useEffect(() => {
    const totalPrice = getTotalPrice();
    setSelectedPrice(totalPrice);
    setInfoSubtitle(`Rs.${totalPrice}` || 'Guests not Selected');
  }, [itinerary, getTotalPrice, setInfoSubtitle]);
  
  // Set up initial values and ensure handleBookNow has the latest state
  useEffect(() => {
    const bookNowHandler = () => handleBookNow();
    setButtonText('Book now');
    setHandleCreateItinerary(bookNowHandler);
    setInfoTitle('inclusive of all taxes');
  }, [setButtonText, setInfoTitle]);
  
  return (
    <div className='flex flex-col items-start justify-start w-full bg-[#F1F2F4] min-h-screen max-h-screen overflow-scroll'>
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
    </div>
  )
}

export default Page