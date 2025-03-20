'use client'
import AdvisorSection from '@/app/components/deals/AdvisorSection';
import ImageGallery from '@/app/components/deals/ImageGallery';
import DaySection from '@/app/components/itinerary/DaySection';
import HotelOptionCard from '@/app/components/stays/HotelOptionCard';
import HorizontalScroll from '@/app/components/ui/HorizontalScroll';
import SeeMoreText from '@/app/components/ui/SeeMoreText';
import StarRating from '@/app/components/ui/StarRating';
import { api } from '@/app/lib/axios';
import useBottomOrderStore from '@/app/store/bottomOrderStore';
import { useDealStore } from '@/app/store/dealStore';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import React from 'react';

const Page = () => {
    const params = useParams();
    const {setButtonText, setHandleCreateItinerary, setInfoSubtitle, setInfoTitle} = useBottomOrderStore();
    const {deal, setDeal} = useDealStore();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedDay, setSelectedDay] = React.useState(1);

    React.useEffect(() => {
        const fetchDealData = async () => {
          try {
            const response = await api.get(`/trips/${params.id}/`);
            //@ts-ignore mlmr
            if (response.data) {
                //@ts-ignore mlmr
              setDeal(response.data);
            } else {
              setError('Failed to fetch hotel details');
            }
          } catch (error) {
            console.error('Error fetching hotel details:', error);
            setError('An error occurred while fetching hotel details');
          } finally {
            setLoading(false);
          }
        };
    
        if (params.id) {
            fetchDealData();
        }
      }, [params.id]);

      React.useEffect(() => {
        setButtonText('Select Dates');
        setHandleCreateItinerary(()=>{});
        setInfoTitle(`inclusive of all taxes`);
        setInfoSubtitle(`Rs.${deal?.deposit_amount} deposit`);
      }, [setButtonText, setHandleCreateItinerary, setInfoSubtitle, setInfoTitle, deal])
    
      if (loading) {
      return (
          <div className="flex items-center justify-center h-screen bg-[#F1F2F4] w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        );
      }

      // Function to render itineraries with the DaySection component
      const renderItineraries = () => {
        if (!deal?.itineraries || deal.itineraries.length === 0) {
          return <div className="text-gray-500 p-4">No itinerary available for this trip</div>;
        }
            //@ts-ignore mlmr
        return deal.itineraries.map((itinerary) => {
          
          // Get total number of days and all items
          let totalDays = 0;
          const allItems = [...itinerary.items];
          
          // Sort destinations by order
          const sortedDestinations = [...itinerary.destinations].sort(
            (a, b) => a.order - b.order
          );
          
          // Map destinations to their days
          const destinationByDay = new Map();
          let currentDay = 1;
          
          sortedDestinations.forEach((destination) => {
            const daysInThisDestination = destination.duration || 2;
            
            for (let i = 0; i < daysInThisDestination; i++) {
              destinationByDay.set(currentDay + i, destination);
            }
            
            currentDay += daysInThisDestination;
          });
          
          totalDays = currentDay - 1;
          
          // Generate array of all day numbers
          const allDays = Array.from({ length: totalDays }, (_, i) => i + 1);
          
          // Filter items for current selected day
          const selectedDayItems = allItems.filter(item => item.dayNumber === selectedDay);
          
          // Get current destination for selected day
          const currentDestination = destinationByDay.get(selectedDay);
          
          return (
            <div key={itinerary.id} className="flex flex-col w-full bg-white rounded-lg mb-6">
              <div className="p-4 w-full border-b border-gray-100">
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-blue-950 text-lg">
                  Itinerary
                </h1>
              </div>
              
              {/* Day Tabs - All days in one horizontal scroll */}
              <div className="flex items-start justify-start w-full bg-blue-600 py-3">
                <HorizontalScroll>
                  {allDays.map((dayNumber) => {
                    const dayDestination = destinationByDay.get(dayNumber);
                    return (
                      <div 
                        key={dayNumber}
                        className={`flex flex-col items-center justify-center min-w-[5rem] rounded-lg py-2 px-2 h-fit cursor-pointer mx-1 ${
                          selectedDay === dayNumber ? 'bg-blue-950' : 'bg-white'
                        }`}
                        onClick={() => setSelectedDay(dayNumber)}
                      >
                        <h2 
                          style={{ fontFamily: 'var(--font-nohemi)' }} 
                          className={`${selectedDay === dayNumber ? 'text-white' : 'text-blue-950'} text-md`}
                        >
                          Day {dayNumber}
                        </h2>
                        {dayDestination && (
                          <span 
                            className={`${selectedDay === dayNumber ? 'text-white/70' : 'text-blue-950/70'} text-xs mt-1`}
                          >
                            {dayDestination.name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </HorizontalScroll>
              </div>
              
              {/* Display destination name for current day */}
              {currentDestination && (
                <div className="px-4 py-2 mt-2">
                  <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-blue-950 text-md font-medium">
                    {currentDestination.name}
                  </h2>
                </div>
              )}
              
              {/* Display items for selected day */}
              <div className="w-full px-4">
                {selectedDayItems.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">
                    No activities planned for Day {selectedDay}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDayItems.map((item) => (
                      <div key={item.id} className="w-full">
                        {/* Reuse the rendering logic from DaySection */}
                        {renderItemContent(item)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        });
      };
      
      // Copied from DaySection component to maintain consistent rendering
      const renderItemContent = (item: any) => {
        switch (item.itemType) {
          case 'HOTEL':
            return (
              item.hotel && (
                <HotelOptionCard hotel={item.hotel} room={item.room} boardType={item.boardType}/>
              )
            );

          case 'FLIGHT':
            return (
              item.flight && (
                <div className="bg-blue-900/10 p-4 rounded-lg">
                  {item.flight.logo && (
                    <img
                      src={item.flight.logo}
                      alt={item.flight.carrier}
                      className="h-8 mb-2 object-contain"
                    />
                  )}
                  <div className="font-semibold text-blue-950">{item.flight.carrier}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-950">{item.flight.depCode}</span>
                    <span className="text-blue-950">→</span>
                    <span className="text-blue-950">{item.flight.arrivalCode}</span>
                  </div>
                </div>
              )
            );

          case 'ACTIVITY':
            return (
              item.activity && (
                <div className="rounded-lg overflow-hidden bg-white">
                  {item.activity.images?.length > 0 && (
                    <img 
                      src={item.activity.images[0].url} 
                      alt={item.activity.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-blue-950 text-lg mb-1">{item.activity.name}</h3>
                    <div className="bg-blue-950/10 p-2 rounded-md inline-block mb-2">
                      <div className="text-blue-950/60 text-xs">Duration</div>
                      <div className="text-blue-950 text-sm font-medium">
                        {Math.floor(item.activity.duration / 60)} hours
                      </div>
                    </div>
                    {item.activity.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{item.activity.description}</p>
                    )}
                  </div>
                </div>
              )
            );

          case 'GENERIC':
            return (
              item.generic && (
                <div className="rounded-lg overflow-hidden bg-white">
                  {item.generic.images?.length > 0 && (
                    <img 
                      src={item.generic.images[0].url} 
                      alt={item.generic.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-blue-950 text-lg font-semibold mb-1">{item.generic.name}</h3>
                    {item.generic.subtitle && (
                      <p className="text-gray-500 text-sm mb-1">{item.generic.subtitle}</p>
                    )}
                    {item.generic.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{item.generic.description}</p>
                    )}
                  </div>
                </div>
              )
            );

          default:
            return (
              <div className="bg-blue-900/10 p-4 rounded-lg">
                <div className="text-blue-950 font-semibold">Item Type: {item.itemType}</div>
                <div className="text-gray-600 text-sm">Day: {item.dayNumber}</div>
              </div>
            );
        }
      };

  return (
    <div className='relative flex flex-col w-full h-fit items-start justify-start bg-[#F1F2F4]'>
        <div className='flex flex-col w-full h-full gap-y-4 p-4'>
        <div className='flex flex-col w-full'>
         <ImageGallery images={deal?.images || []} />
         </div>
         <div className='flex flex-col items-start justify-start w-full p-4 bg-white rounded-lg'>
         <div className='flex flex-row items-center justify-start gap-x-4 w-full mb-1'>
                           <img src='https://aktt5yjwyc.ufs.sh/f/VfNn67L471Nr09H0PGyN69PzLBI5kGd34SqJQVxpOwXWubog' className='w-14 h-6 object-contain' /> 
                       <StarRating size={4} rating={4.5} />
                        </div>
            <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg font-normal text-blue-950'>
                {deal.name}
            </h1>
            <SeeMoreText text={deal.description} maxLength={180} />
         </div>
         <div className='flex flex-col items-start justify-start w-full p-4 bg-white rounded-lg'>
            <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-md mb-2'>
              Inclusions
            </h2>
            <div className="flex flex-row flex-wrap items-start justify-start gap-x-2 gap-y-2">
              {(deal.inclusions || '')
                .split(',')
                //@ts-ignore mlmr
                .map((inclusion, index) => (
                  <div key={index} className="flex flex-row items-start justify-start gap-x-2">
                    <IconCircleCheckFilled className="h-5 w-5 text-teal-600 flex-shrink-0" />
                    <span className="text-blue-950 text-sm font-medium tracking-tight">
                      {inclusion.trim()}
                    </span>
                  </div>
                ))}
            </div>
            </div>
            <div className='flex flex-col w-full'>
            <AdvisorSection 
            advisor={deal.advisor}/>
            </div>
            
            {/* DaySection integration */}
            <div className='flex flex-col w-full'>
              {renderItineraries()}
            </div>
        </div>
    </div>
  )
}

export default Page