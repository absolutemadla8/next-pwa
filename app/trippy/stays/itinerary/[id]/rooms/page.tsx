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
  
  // Combined function that handles both room selection and booking
  const handleRoomSelectAndBook = async (
    roomId: string, 
    rateId: string, 
    recommendationId: string, 
    price: number,
    bookNow = false // Optional parameter to indicate if we should proceed to booking
  ) => {
    console.log("Room selected:", roomId, rateId, recommendationId, price);
    
    // Update room details in store
    itinerary.rooms.forEach(room => {
      setRoomDetails(room.id, { rateId, roomId, price });
      setRecommendationId(recommendationId);
    });
    
    // Update total price
    const totalPrice = getTotalPrice();
    setSelectedPrice(totalPrice);
    
    // If bookNow is true, proceed with booking process
    if (bookNow) {
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
          recommendationId: String(recommendationId),
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
      } catch (error) {
        console.error('Error selecting room rates:', error);
        // You might want to show an error toast or message to the user
      } finally {
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    // Set up bottom order bar with the combined function
    setButtonText('Book now');
    setHandleCreateItinerary(() => handleRoomSelectAndBook(
      itinerary.rooms[0]?.roomId || '',
      itinerary.rooms[0]?.rateId || '',
      itinerary.recommendationId || '',
      getTotalPrice(),
      true // Pass true to initiate booking
    ));
    setInfoTitle('inclusive of all taxes');
    setInfoSubtitle(`Rs.${getTotalPrice()}` || 'Guests not Selected');
  }, [setButtonText, setHandleCreateItinerary, setInfoSubtitle, setInfoTitle, itinerary, getTotalPrice])
  
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
              onBookNow={(roomId, rateId, recommendationId, price) => 
                handleRoomSelectAndBook(roomId, rateId, recommendationId, price)
              }
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