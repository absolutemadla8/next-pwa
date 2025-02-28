'use client'
import HotelCard from '@/app/components/stays/HotelCard'
import StayInformationHeader from '@/app/components/stays/StayInformationHeader'
import { api } from '@/app/lib/axios'
import { formatDate } from '@/app/lib/utils'
import useItineraryStore from '@/app/store/itineraryStore'
import { useRouter } from 'next/navigation'
import React from 'react'

const Page = () => {
  const router = useRouter();
  const {itinerary, getTotalAdults, getTotalChildren, getTotalRooms, getOccupancies, getNumberOfNights} = useItineraryStore();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hotels, setHotels] = React.useState([]);

  React.useEffect(() => {
    const searchHotels = async () => {
      if (!itinerary.locationId || !itinerary.checkIn || !itinerary.checkOut) {
        setError('Please select location and dates');
        setLoading(false);
        return;
      }

      const searchParams = {
        checkIn: itinerary.checkIn.toISOString().split('T')[0],
        checkOut: itinerary.checkOut.toISOString().split('T')[0],
        nationality: 'IN',
        locationId: itinerary.locationId,
        occupancies: getOccupancies(),
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

  return (
    <div className='flex flex-col items-start justify-start w-full'>
        <div className='flex w-full sticky top-0 z-10'>
          <StayInformationHeader />
        </div>
        <div className='flex flex-col items-start justify-start w-full p-6 gap-y-4'>
          {hotels.map((hotel: any) => (
            <HotelCard 
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
    </div>
  )
}

export default Page