import { useState, useEffect } from 'react';
import { useItineraryStore } from '@/app/store/itineraryStore';
import { Bed, MapPin, Plane, Train, Building } from 'lucide-react';
import axios from 'axios';
import { api } from '@/app/lib/axios';

interface SearchResult {
  id: number;
  name: string;
  type: string;
  fullName: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  travclanScore: number;
  referenceId?: string;
}

export default function LocationSearch() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const { setLocationDetails } = useItineraryStore();

  useEffect(() => {
    const fetchResults = async () => {
      if (keyword.length < 3) return;
      
      setIsLoading(true);
      try {
        const response = await api.get(`/hotels/search-locations`, {
            params: { search_keyword: keyword },
          });
        //@ts-ignore mlmr
        if (response?.data?.status === 'success') {
          //@ts-ignore mlmr
          setResults(response?.data.data);
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
      travclanScore: item.travclanScore,
      hotelId: item.referenceId ? Number(item.referenceId) : null,
    });
    setKeyword('');
  };

  return (
    <div className="relative w-full mx-auto">
      <div className='flex px-4'>
      <input
        type="text"
        value={keyword}
        style={{ fontFamily: 'var(--font-nohemi)' }}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search locations, hotels, or airports..."
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-blue-950"
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
                <div className="flex-shrink-0 mr-3 text-blue-950">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="font-medium text-blue-950 truncate">{item.name}</h3>
                  <p className="text-sm text-slate-600 tracking-tight truncate">
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