import React, { useEffect, useState } from 'react';
import HorizontalScroll from './ui/HorizontalScroll';
import useVoiceChatStore from '@/app/store/voiceChatStore';
import { api } from '@/app/lib/axios';
import TripCard from './ui/TripCard';
import RoomCard, { Room } from './ui/RoomCard';

interface Trip {
  id: string;
  name: string;
  country: string;
  images: Array<{ url: string }>;
  inclusions: string;
  pricing: number;
  discountedPrice: number;
  nights: number;
  currency: string;
}

interface Hotel {
  name?: string;
  location?: string;
}

interface ApiResponse {
  data: {
    meta_data: {
      type: string;
      destination?: string;
      checkIn?: string;
      checkOut?: string;
      occupancies?: Array<{
        numOfAdults: number;
        childAges: number[];
      }>;
    };
    hotelDetails: {
      name?: string;
      rooms: any[];
      currency?: string;
      hotel?: Hotel;
    };
    suggestions: Array<{
      country: string;
      trips: Trip[];
    }>;
  };
}

interface DealsScrollProps {
  onPopulate?: () => void;
}

const DealsScroll: React.FC<DealsScrollProps> = ({ onPopulate }) => {
  const { sessionPin } = useVoiceChatStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [type, setType] = useState('hotel');
  const [hasPopulated, setHasPopulated] = useState(false);
  const [currency, setCurrency] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await api.post<ApiResponse>('/trippy/sessions/get', {
          pin: sessionPin || 485039
        });
        
        // Set the content type
        if (response.data.data.meta_data) {
          setType(response.data.data.meta_data.type);
        }
        
        // Set currency
        if (response.data.data.hotelDetails?.currency) {
          setCurrency(response.data.data.hotelDetails.currency);
        }

        // Set hotel info if available
        const hotelInfo = response.data.data.hotelDetails?.hotel || {
          name: response.data.data.hotelDetails.name || 'Hotel',
          location: response.data.data.meta_data.destination || 'Location'
        };
        
        setHotel(hotelInfo);
        
        // Handle hotel data
        if (response.data.data.hotelDetails?.rooms && response.data.data.hotelDetails.rooms.length > 0) {
          // Map API response to our Room interface
          const mappedRooms = response.data.data.hotelDetails.rooms.map(room => ({
            id: room.id,
            name: room.type, // Use type as name
            boardType: 'RO', // Default, will be overridden if rates exist with mapping
            description: room.description,
            // Map rates to get boardType
            //@ts-ignore mlmr
            boardType: room.rates && room.rates.length > 0 && room.rates[0].boardBasis 
              ? (room.rates[0].boardBasis.type === "AllInclusive" ? 'AI' : 'BB') 
              : 'RO',
            // Include original API data for reference
            type: room.type,
            rates: room.rates,
            minPrice: room.minPrice,
            area: room.area,
            // Add recommendationId for easy access
            recommendationId: room.rates && room.rates.length > 0 ? room.rates[0].recommendationId : null
          }));
          //@ts-ignore mlmr
          setRooms(mappedRooms);
          
          // Call onPopulate only once when data is first populated
          if (!hasPopulated && onPopulate) {
            onPopulate();
            setHasPopulated(true);
          }
        }
        
        // Handle trip data
        if (response.data.data.suggestions && response.data.data.suggestions.length > 0) {
          const firstSuggestion = response.data.data.suggestions[0];
          if (firstSuggestion?.trips) {
            setTrips(firstSuggestion.trips);
            
            // Call onPopulate only once when suggestions are first populated
            if (!hasPopulated && onPopulate) {
              onPopulate();
              setHasPopulated(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      }
    };

    fetchDeals();
    const intervalId = setInterval(fetchDeals, 2000);

    return () => clearInterval(intervalId);
  }, [sessionPin, onPopulate, hasPopulated]);

  // Function to format price
  const formatPrice = (price: number, currencyCode: string = currency) => {
    if (!price) return '0';
    
    // Format the price with currency symbol
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Function to handle room selection
  const handleRoomSelect = async (room: Room) => {
    // if (!sessionPin) {
    //   console.error('Session PIN is required');
    //   return;
    // }

    // Find the rate for this room
    const rate = room.rates && room.rates.length > 0 ? room.rates[0] : null;
    
    if (!rate) {
      console.error('No rate available for this room');
      return;
    }

    setLoading(room.id);

    try {
      // Send request to select the room
      const response = await api.post('/trippy/itinerary/rooms', {
        pin: sessionPin || 485039,
        roomsAndRateAllocations: [
          {
            roomId: room.id,
            rateId: rate.rateId
          }
        ],
        recommendationId: room.recommendationId || rate.recommendationId
      });

      console.log('Room selection response:', response.data);
      
      // Handle successful selection
      //@ts-ignore mlmr
      if (response?.data?.status === 'success') {
        // Show success message or navigate to next step
        alert('Room selected successfully!');
      } else {
        //@ts-ignore mlmr
        alert(response?.data?.message || 'Failed to select room');
      }
    } catch (error) {
      console.error('Error selecting room:', error);
      alert('An error occurred while selecting the room');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <HorizontalScroll>
        {type === 'hotel' ? 
          rooms.map((room) => (
            <RoomCard 
              key={room.id} 
              room={room} 
              showPrice={true} 
              price={room.minPrice || 0}
              hotelName={hotel?.name}
              hotelLocation={hotel?.location}
              onSelect={() => handleRoomSelect(room)}
              isLoading={loading === room.id}
            />
          )) : 
          trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))
        }
        <div className='px-2' />
      </HorizontalScroll>
    </div>
  );
};

export default DealsScroll;