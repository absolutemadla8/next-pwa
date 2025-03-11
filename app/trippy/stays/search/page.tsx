'use client'
import HotelCard from '@/app/components/stays/HotelCard'
import HotelFilterBottomSheet from '@/app/components/stays/HotelFilterBottomSheet'
import StayInformationHeader from '@/app/components/stays/StayInformationHeader'
import { api } from '@/app/lib/axios'
import { formatDate } from '@/app/lib/utils'
import { useHotelSearchStore } from '@/app/store/hotelsSearchStore'
import useItineraryStore from '@/app/store/itineraryStore'
import { IconMap } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const Page = () => {
  const router = useRouter();
  const {
    itinerary,
    getTotalRooms, 
    getOccupancies, 
    getNumberOfNights,
    addRoomToItinerary,
    increaseAdultsInRoom
  } = useItineraryStore();
  const {hotels, setHotels} = useHotelSearchStore();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const searchHotels = async () => {
      if (!itinerary.locationId || !itinerary.checkIn || !itinerary.checkOut) {
        setError('Please select location and dates');
        setLoading(false);
        return;
      }

      // Default occupancy if no rooms are configured
      let occupancies = getOccupancies();
      
      // If no rooms are configured, create a default occupancy with 2 adults
      if (occupancies.length === 0) {
        occupancies = [{ numOfAdults: 2, childAges: [] }];
        
        // Add a default room to the itinerary (not required for the API call)
        // This will ensure the UI is consistent when the user returns
        if (itinerary.rooms.length === 0) {
          addRoomToItinerary();
          // By default the room is created with 1 adult, so we need to increase it to 2
          if (itinerary.rooms.length > 0) {
            increaseAdultsInRoom(itinerary.rooms[0].id);
          }
        }
      }

      const searchParams = {
        checkIn: itinerary.checkIn.toISOString().split('T')[0],
        checkOut: itinerary.checkOut.toISOString().split('T')[0],
        nationality: 'IN',
        locationId: itinerary.locationId,
        occupancies: occupancies,
        page: 1
      };

      try {
        const response = await api.post('/hotels/search-hotels', searchParams);
        //@ts-ignore mlmr
        if (response.data.status === 'success') {
           //@ts-ignore mlmr
          setHotels(response.data.data.results || []);
        } else {
          setError('Failed to fetch hotels');
        }
      } catch (error) {
        console.error('Error searching hotels:', error);
        setError('An error occurred while searching hotels');
      } finally {
        setLoading(false);
      }
    };

    searchHotels();
  }, [itinerary.locationId, itinerary.checkIn, itinerary.checkOut]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F1F2F4] w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      );
    }

  return (
    <div className='flex flex-col items-start justify-start w-full h-full'>
        <div className='flex w-full sticky top-0 z-10'>
          <StayInformationHeader />
        </div>
        <div className='flex flex-col items-start justify-start w-full p-6 gap-y-4'>
          {hotels.map((hotel: any) => (
            <HotelCard 
                key={hotel.id}
                name={hotel.name}
                location={hotel.address.line1}
                images={[hotel.hero_image]}
                rating={hotel.star_rating}
                amenities={hotel.facilities}
                price={+((hotel.rates.final_rate/getNumberOfNights())/getTotalRooms()).toFixed()}
                distance={hotel.distance === "0" ? 'Very close to the center' : `${hotel.distance} km from the center`}
                onClickHotel={()=>router.push(`/trippy/stays/${hotel.id}`)}
            />
          ))}
        </div>
        <div className='absolute w-full bottom-20 flex flex-col items-center justify-center pb-2'>
        <button 
            className='px-4 py-2 bg-gray-800 text-white rounded-full flex items-center'
            onClick={() => router.push('/trippy/stays/search/map')}
          >
           <IconMap className='mr-2'/>
            <span className='text-sm tracking-tight'>
            Map View
            </span>
          </button>
          </div>
    </div>
  )
}

export default Page