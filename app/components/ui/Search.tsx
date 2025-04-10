import { useState, useEffect } from 'react';
import { useItineraryStore } from '@/app/store/itineraryStore';
import { Bed, MapPin, Plane, Train, Building } from 'lucide-react';
import { api } from '@/app/lib/axios';
import useBottomSheetStore from '@/app/store/bottomSheetStore';

interface SearchResult {
  id: number;
  name: string;
  type: string;
  fullName: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  coordinates?: {
    lat: number;
    long: number;
  };
  source?: string;
}

export default function LocationSearch() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const { setLocationDetails } = useItineraryStore();
  const { closeSheet } = useBottomSheetStore();

  useEffect(() => {
    const fetchResults = async () => {
      if (keyword.length < 3) return;
      
      setIsLoading(true);
      try {
        const response = await api.post(`/hotels/search/locations`, {
          search_keyword: keyword,
        });
        
        //@ts-ignore mlmr
        if (response?.data?.status === 'success') {
          //@ts-ignore mlmr
          setResults(response.data.data);
          setIsError(false);
        } else {
          setIsError(true);
        }
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [keyword]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Hotel': return <Bed className="w-5 h-5" />;
      case 'Airport': return <Plane className="w-5 h-5" />;
      case 'TrainStation': return <Train className="w-5 h-5" />;
      case 'City': return <Building className="w-5 h-5" />;
      case 'State': return <Building className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const handleItemClick = (item: SearchResult) => {
    setLocationDetails({
      locationId: item.id || null,
      locationName: item.name,
      type: item.type,
      city: item.city || undefined,
      state: item.state || undefined,
      country: item.country || undefined,
      // Set hotelId to the item's id if the type is Hotel, otherwise null
      hotelId: item.type === 'Hotel' ? item.id : null
    });
    setKeyword('');
    
    // Close the bottom sheet after selection
    closeSheet();
  };

  return (
    <div className="relative w-full mx-auto">
      <div className='flex px-4'>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search locations, hotels, or airports..."
          className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-primary tracking-tight"
        />
      </div>
      {(isLoading || results.length > 0 || isError) && (
        <div className="absolute z-10 w-full mt-1 bg-white h-screen overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-gray-500">Searching...</div>
          ) : isError ? (
            <div className="p-4 text-red-500">Error loading results</div>
          ) : (
            results.map((item) => (
              <div
                key={`${item.id}-${item.name}`}
                onClick={() => handleItemClick(item)}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <div className="flex-shrink-0 mr-3 text-primary">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0 py-2">
                  <h3 className="font-normal text-primary truncate tracking-tight">{item.name}</h3>
                  <p className="text-xs text-slate-600 tracking-tight truncate">
                    {item.fullName}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}