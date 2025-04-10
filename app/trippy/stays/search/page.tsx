'use client'
import HotelCard from '@/app/components/stays/HotelCard'
import HotelFilterBottomSheet from '@/app/components/stays/HotelFilterBottomSheet'
import StayInformationHeader from '@/app/components/stays/StayInformationHeader'
import { api } from '@/app/lib/axios'
import { formatDate } from '@/app/lib/utils'
import { useHotelSearchStore } from '@/app/store/hotelsSearchStore'
import useItineraryStore from '@/app/store/itineraryStore'
import { bottomSheetStore } from '@/app/store/bottomSheetStore'
import { FilterData } from '@/app/store/bottomSheetStore'
import { IconFilter, IconMap } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useRoomStore } from '@/app/store/roomRateStore'
import { Filter, Map } from 'iconsax-react'

// Helper function to count active filters
const countActiveFilters = (filters: FilterData): number => {
  let count = 0;
  
  // Count price range filter if it's not at default values
  if (filters.priceRange && 
      (filters.priceRange.min > 0 || filters.priceRange.max < 50000)) {
    count++;
  }
  
  // Count star ratings
  if (filters.starRatings && filters.starRatings.length > 0) {
    count++;
  }
  
  // Count facilities
  if (filters.facilities && filters.facilities.length > 0) {
    count++;
  }
  
  // Count rate options
  if (filters.rateOptions) {
    if (filters.rateOptions.freeBreakfast) count++;
    if (filters.rateOptions.freeCancellation) count++;
  }
  
  return count;
}

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
  const {setTraceId} = useRoomStore();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeFilters, setActiveFilters] = React.useState<FilterData | null>(null);

  // Function to search hotels with filters
  const searchHotels = React.useCallback(async (filters?: FilterData) => {
    setLoading(true);
    
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

    const searchParams: any = {
      checkIn: itinerary.checkIn.toISOString().split('T')[0],
      checkOut: itinerary.checkOut.toISOString().split('T')[0],
      nationality: 'IN',
      locationId: itinerary.locationId,
      occupancies: occupancies,
      page: 1
    };
    
    // Add filters if they exist
    if (filters) {
      searchParams.filterBy = filters;
      searchParams.onlyFilter = true; // Only filter from cache, don't make new API call
      setActiveFilters(filters);
    }

    try {
      const response = await api.post('/hotels/search', searchParams);
      //@ts-ignore mlmr
      if (response.data.status === 'success') {
         //@ts-ignore mlmr
        setHotels(response.data.data.results || []);
        //@ts-ignore mlmr
        setTraceId(response.data.data.journey_id);
      } else {
        setError('Failed to fetch hotels');
      }
    } catch (error) {
      console.error('Error searching hotels:', error);
      setError('An error occurred while searching hotels');
    } finally {
      setLoading(false);
    }
  }, [itinerary.locationId, itinerary.checkIn, itinerary.checkOut, getOccupancies, addRoomToItinerary, increaseAdultsInRoom]);

  // Handle filter application
  const handleApplyFilters = React.useCallback((filters: FilterData) => {
    searchHotels(filters);
  }, [searchHotels]);

  // Open filter bottom sheet
  const openFilterSheet = () => {
    bottomSheetStore.openSheet('filter', {
      title: 'Filter Hotels',
      minHeight: '60vh',
      maxHeight: '90vh',
      showPin: false,
      onApplyFilters: handleApplyFilters
    });
  };

  React.useEffect(() => {
    // Initial search without filters
    searchHotels();
  }, [itinerary.locationId, itinerary.checkIn, itinerary.checkOut, searchHotels]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      );
    }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white w-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-start justify-start w-full h-full'>
        <div className='flex w-full sticky top-0 z-10'>
          <StayInformationHeader />
        </div>
        <div className='flex flex-col items-start justify-start w-full py-6 gap-y-4 bg-white'>
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
        <div className='absolute w-full bottom-14 flex flex-row items-center justify-center gap-4 pb-2'>
          <button 
            className='px-4 py-2 bg-primary text-white rounded-full flex flex-row gap-x-1 items-center relative'
            onClick={openFilterSheet}
          >
            <Filter size={18} variant='Bulk'/>
            <span className='text-sm tracking-tight'>
              Filter
            </span>
            {activeFilters && countActiveFilters(activeFilters) > 0 && (
              <div className='absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {countActiveFilters(activeFilters)}
              </div>
            )}
          </button>
          <button 
            className='px-4 py-2 bg-primary text-white rounded-full flex flex-row gap-x-1 items-center'
            onClick={() => router.push('/trippy/stays/search/map')}
          >
            <Map size={18} variant='Bulk'/>
            <span className='text-sm tracking-tight'>
              Map View
            </span>
          </button>
        </div>
        
        {/* Render the filter bottom sheet */}
        <HotelFilterBottomSheet />
    </div>
  )
}

export default Page