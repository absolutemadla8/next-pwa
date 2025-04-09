"use client";

import { useEffect, useState } from "react";
import { useItineraryStore } from "@/app/store/itineraryStore";
import axios from "@/app/lib/axios";
import {AdvancedMarker, APIProvider, Map, InfoWindow, useAdvancedMarkerRef, Pin} from '@vis.gl/react-google-maps';
import { useRouter } from "next/navigation";
import HotelOptionCardDark from "@/app/components/stays/HotelOptionCardDark";
import { useHotelSearchStore } from "@/app/store/hotelsSearchStore";
import { IconList } from "@tabler/icons-react";
import AnimatedButton from "@/app/components/ui/AnimatedButton";

// Define the container style for the map
const containerStyle = {
  width: "100%",
  height: "calc(100vh - 64px)" // Adjust based on your header/footer height
};

const customMapStyles = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }]
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }, { lightness: 18 }]
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }]
  }
];

// Define the HotelData type based on your API response
interface HotelData {
  id: string;
  name: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    cityName: string;
    countryName: string;
  };
  media?: {
    url: string;
  }[];
  rates: {
    final_rate: number;
    currency: string;
  };
  rating?: number;
}

// Create a marker with ref component similar to the reference code
const AdvancedMarkerWithRef = (props: {
  position: google.maps.LatLngLiteral;
  onClick: (marker: google.maps.marker.AdvancedMarkerElement) => void;
  isSelected?: boolean;
  children?: React.ReactNode;
}) => {
  const { position, onClick, isSelected, children } = props;
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      position={position}
      ref={markerRef}
      onClick={() => {
        if (marker) {
          onClick(marker);
        }
      }}
    >
     {children}
    </AdvancedMarker>
  );
};

export default function MapSearchPage() {
  const router = useRouter();
  const { itinerary } = useItineraryStore();
  const { hotels } = useHotelSearchStore();
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState<boolean>(false);

  useEffect(() => {
    if (hotels.length > 0) {
      const firstHotel = hotels[0];
      setCenter({
        lat: +firstHotel.geoCode.latitude,
        lng: +firstHotel.geoCode.longitude
      });
    }
  }, [hotels]);

  // Get the selected hotel data based on ID
  const selectedHotel = hotels.find((hotel:any) => hotel.id === selectedHotelId) || null;

  const handleMarkerClick = (hotel: HotelData, marker: google.maps.marker.AdvancedMarkerElement) => {
    // If clicking the same marker that's already selected, toggle the InfoWindow
    if (selectedHotelId === hotel.id) {
      setInfoWindowOpen(!infoWindowOpen);
      return;
    }
    
    // Close any existing InfoWindow first
    setInfoWindowOpen(false);
    
    // Set a small timeout to prevent stack overflow
    setTimeout(() => {
      // Then open the new one
      setSelectedHotelId(hotel.id);
      setSelectedMarker(marker);
      setInfoWindowOpen(true);
    }, 10);
  };

  const handleInfoWindowClose = () => {
    setInfoWindowOpen(false);
    // Optional: keep the marker still highlighted or clear selection completely
    // setSelectedHotelId(null);
    // setSelectedMarker(null);
  };

  const handleHotelSelect = (hotelId: string) => {
    router.push(`/trippy/stays/${hotelId}`);
  };

  const handleMapClick = () => {
    setInfoWindowOpen(false);
    setSelectedHotelId(null);
    setSelectedMarker(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1">
        <APIProvider 
        //@ts-ignore mlmr
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
          <Map 
            mapId={'DEMO_MAP_ID'} 
            defaultCenter={center} 
            defaultZoom={10}
            onClick={handleMapClick}
          >
            {hotels.map((hotel: HotelData) => (
              <AdvancedMarkerWithRef
                key={hotel.id}
                position={{
                  lat: +hotel.geoCode.latitude,
                  lng: +hotel.geoCode.longitude
                }}
                isSelected={selectedHotelId === hotel.id}
                onClick={(marker) => handleMarkerClick(hotel, marker)}
              >
                <div className=" px-3 py-2 flex flex-row items-center justify-start gap-x-1 bg-blue-600 rounded-full border border-white">
                <span className="text-white text-xs" style={{ fontFamily: 'var(--font-nohemi)' }}>
                  Rs. {hotel.rates.final_rate}
                </span>
                </div>
              </AdvancedMarkerWithRef>
            ))}
            
            {selectedHotel && selectedMarker && infoWindowOpen && (
              <InfoWindow
                anchor={selectedMarker}
                pixelOffset={[0, -2]}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="p-2 max-w-xs">
                  {selectedHotel.media && selectedHotel.media.length > 0 && (
                    <div className="w-full h-32 overflow-hidden rounded-md mb-2">
                      <img 
                        src={selectedHotel.media[0].url} 
                        alt={selectedHotel.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-medium text-lg mb-1 text-primary">{selectedHotel.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedHotel.address.cityName}, {selectedHotel.address.countryName}
                  </p>
                  {selectedHotel.rates && (
                    <p className="text-sm font-medium">
                      {selectedHotel.rates.currency} {selectedHotel.price.final_rate} / night
                    </p>
                  )}
                  <AnimatedButton
                  variant="primary" 
                    className="mt-2 w-full text-white py-1 px-2 rounded text-sm"
                    onClick={() => handleHotelSelect(selectedHotel.id)}
                  >
                    View Details
                  </AnimatedButton>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
      <div className='absolute w-full bottom-20 flex flex-col items-center justify-center pb-2'>
        <button 
          className='px-4 py-2 bg-gray-800 text-white rounded-full flex items-center'
          onClick={() => router.push('/trippy/stays/search')}
        >
          <IconList className='mr-2' />
          <span className='text-sm tracking-tight'>
            List View
          </span>
        </button>
      </div>
    </div>
  );
}