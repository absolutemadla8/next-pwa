import React, { useEffect, useState } from 'react';
import HorizontalScroll from './ui/HorizontalScroll';
import useVoiceChatStore from '@/app/store/voiceChatStore';
import { api } from '@/app/lib/axios';

interface Trip {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  pricing: number;
  discountedPrice: number;
  nights: number;
  currency: string;
}

interface ApiResponse {
  data: {
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
  const [hasPopulated, setHasPopulated] = useState(false);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await api.post<ApiResponse>('/trippy/sessions/get', {
          pin: sessionPin
        });
        
        // Check if suggestions exist and aren't empty
        if (response.data.data.suggestions && response.data.data.suggestions.length > 0) {
          const firstSuggestion = response.data.data.suggestions[0];
          if (firstSuggestion?.trips) {
            setTrips(firstSuggestion.trips);
          }
          
          // Call onPopulate only once when suggestions are first populated
          if (!hasPopulated && onPopulate) {
            onPopulate();
            setHasPopulated(true);
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

  return (
    <div className="space-y-6">
      <HorizontalScroll>
        {trips.map((trip) => (
          <div 
            key={trip.id}
            className="flex-shrink-0 w-72 h-fit rounded-2xl flex flex-col items-center justify-center overflow-hidden bg-white shadow-sm"
          >
            <img 
              src={trip.images?.[0]?.url || "/api/placeholder/400/320"} 
              alt={trip.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="flex flex-col items-start justify-start gap-y-2 p-4 w-full">
              <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-gray-600 text-sm">
                {trip.nights} {trip.nights === 1 ? 'night' : 'nights'}
              </span>
              <h1 
                style={{ fontFamily: 'var(--font-nohemi)' }} 
                className="text-blue-950 text-lg line-clamp-2"
              >
                {trip.name}
              </h1>
              <div className="flex items-center gap-x-2">
                <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-green-600 font-medium">
                  {trip.currency} {trip.discountedPrice.toLocaleString()}
                </span>
                {trip.pricing !== trip.discountedPrice && (
                  <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-gray-400 line-through text-sm">
                    {trip.currency} {trip.pricing.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </HorizontalScroll>
    </div>
  );
};

export default DealsScroll;