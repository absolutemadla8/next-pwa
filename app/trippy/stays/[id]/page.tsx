'use client'

import SeeMoreText from '@/app/components/ui/SeeMoreText'
import StarRating from '@/app/components/ui/StarRating'
import { Check, Star } from 'lucide-react'
import React from 'react'
import { api } from '@/app/lib/axios'
import { useParams, useRouter } from 'next/navigation'
import AnimatedButton from '@/app/components/ui/AnimatedButton'
import HotelRating from '@/app/components/stays/HotelRating'
import useItineraryStore from '@/app/store/itineraryStore'
import { CreateItineraryPayload } from '@/app/types/itinerary'
import { useRoomStore } from '@/app/store/roomRateStore'
import { useHotelStore } from '@/app/store/hotelsSearchStore'
import { formatDate } from '@/app/lib/utils'
import useBottomOrderStore from '@/app/store/bottomOrderStore'
import useBottomSheetStore from '@/app/store/bottomSheetStore'

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const {setButtonText, setHandleCreateItinerary, setInfoSubtitle, setInfoTitle} = useBottomOrderStore();
  const { itinerary, getOccupancies, getTotalAdults, getTotalChildren, getTotalRooms } = useItineraryStore();
  const {setRooms, setItineraryId, setType, setTraceId,setSessionId} = useRoomStore();
  const {hotel, setHotel} = useHotelStore();
  const { openSheet } = useBottomSheetStore();
  const [isCreating, setIsCreating] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Moved handleCreateItinerary function higher in the component
  const handleCreateItinerary = async () => {
    setLoading(true);
    if (!itinerary.checkIn || !itinerary.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    setIsCreating(true);

    try {
      const payload: CreateItineraryPayload = {
        checkIn: itinerary.checkIn.toISOString().split('T')[0],
        checkOut: itinerary.checkOut.toISOString().split('T')[0],
        nationality: 'IN',
        hotelId: params.id as string,
        occupancies: getOccupancies(),
      };

      const response = await api.post('/hotels/itineraries/create', payload);
      //@ts-ignore mlmr
      if (response.data.status === 'success') {
        //@ts-ignore mlmr
        const sessionId = response.data.data.sessionId;
        //@ts-ignore mlmr
        setSessionId(response.data.data.sessionId);
        //@ts-ignore mlmr
        setRooms(response.data.data.rooms);
        //@ts-ignore mlmr
        setItineraryId(response.data.data.itineraryCode);
        //@ts-ignore mlmr
        setType(response.data.data.item)
        //@ts-ignore mlmr
        setTraceId(response.data.data.traceId)
        router.push(`/trippy/stays/itinerary/${sessionId}/rooms`);
      } else {
        throw new Error('Failed to create itinerary');
      }
    } catch (error) {
      console.error('Error creating itinerary:', error);
      alert('Failed to create itinerary. Please try again.');
    } finally {
      setIsCreating(false);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setButtonText('Select Rooms');
    setHandleCreateItinerary(handleCreateItinerary);
    setInfoTitle(`${itinerary.checkIn ? formatDate(itinerary.checkIn) : 'No date selected'} - ${itinerary.checkOut ? formatDate(itinerary.checkOut) : 'No date selected'}`);
    setInfoSubtitle(`${getTotalRooms()} Rooms, ${getTotalAdults()+getTotalChildren()} Guests` || 'Guests not Selected');
  }, [setButtonText, setHandleCreateItinerary, setInfoSubtitle, setInfoTitle])

  React.useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const response = await api.get(`/hotels/${params.id}/static-content`);
        //@ts-ignore mlmr
        if (response.data.status === 'success') {
            //@ts-ignore mlmr
          setHotel(response.data.data.results[0].data[0]);
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
      fetchHotelData();
    }
  }, [params.id]);

  if (loading) {
  return (
      <div className="flex items-center justify-center h-screen bg-[#F1F2F4] w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className='relative flex flex-col w-full h-full items-center justify-center bg-[#F1F2F4]'>
        <div className="flex flex-col items-center justify-start h-full w-full">
            <div className='sticky top-0 flex flex-col items-start justify-start w-full h-64'>
            <img src={hotel.heroImage} className='h-64 w-full transition-all delay-150 duration-300 ease-in-out object-cover' />
            <div className='absolute -bottom-1 h-36 w-full bg-gradient-to-t from-[#F1F2F4] to-[#F1F2F400]' />
            </div>
            <div className='flex flex-col items-center justify-center w-full gap-y-3 px-4 -mt-16 z-10'>
              <div className='flex flex-col items-end justify-end w-full'>
                <div onClick={()=>router.push(`/trippy/stays/${params.id}/gallery`)} className='flex flex-col relative items-center justify-center size-12 rounded-lg bg-cover bg-center overflow-hidden border border-white' style={{ backgroundImage: `url(${hotel.heroImage})` }}>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-white text-sm z-10'>
                           +{hotel.images.length - 1}
                </h1>
                <div className='absolute h-full w-full bg-black/30 backdrop-blur-sm rounded-lg overflow-hidden' />
                </div>
              </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                    <div className='flex flex-row items-center justify-between w-full'>
                        <div className='flex flex-col gap-y-1 w-[60%]'>
                        <div className='flex flex-row items-center justify-start gap-x-4 w-full'>
                           <img src='https://aktt5yjwyc.ufs.sh/f/VfNn67L471Nr09H0PGyN69PzLBI5kGd34SqJQVxpOwXWubog' className='w-14 h-6 object-contain' /> 
                       <StarRating rating={4.5} />
                        </div>
                        <div className='flex flex-col w-full'>
                        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg'>
                            {hotel.name}
                        </h1>
                        <span className='text-slate-600 text-sm font-normal tracking-tight'>
                            {hotel.contact.address.line1}
                        </span>
                        </div>
                        </div>
                        <div className='flex flex-col w-20 h-fit rounded-lg overflow-hidden'>
                            <div className='flex flex-row items-center justify-center gap-x-1 bg-teal-600 p-1'>
                            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-white text-sm font-normal'>
                            {+hotel.reviews[0].rating}
                        </span>
                        <Star className='size-3 fill-white' />
                            </div>
                            <div className='flex flex-col items-center justify-center bg-slate-100 p-1'>
                            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-sm font-normal'>
                            {+hotel.reviews[0].count}
                        </span>
                        <span className='text-blue-950 text-xs font-normal tracking-tighter'>
                            reviews
                        </span>
                            </div>
                        </div>
                    </div>
                    <hr className='w-full' />
                    <div className='flex flex-col items-start justify-start'>
                    <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-md'>
                           About this property
                        </h2>
                        <SeeMoreText
                        text={hotel.descriptions[0].text}
                        maxLength={120}
                        />

                    </div>
                </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-md'>
                           Location Info
                        </h1>
                    <div className='flex flex-row items-start justify-start w-full gap-x-2'>
                    <img src="https://aktt5yjwyc.ufs.sh/f/VfNn67L471NrgCbs7rKWSpe0yJ4MKVqkD12ZwUYB37j85oFi" className='size-14 rounded-lg bg-blue-600' />
                    <div className='flex flex-col w-full'>
                        <span className='text-blue-950 text-sm font-normal tracking-tight'>
                            This property is{' '}
                            <span className='font-semibold'>
                                {hotel?.nearByAttractions[0].distance}
                            </span>{' '}
                            away from{' '}
                            <span className='font-semibold'>
                                {hotel?.nearByAttractions[0].name}
                            </span>{' '}
                            and{' '}
                            <span className='font-semibold'>
                                {hotel?.nearByAttractions[1].distance}
                            </span>{' '}
                            away from{' '}
                            <span className='font-semibold'>
                                {hotel?.nearByAttractions[1].name}
                            </span>
                        </span>
                    </div>
                        </div>
                </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-md'>
                           Amenities
                        </h1>
                        <div className='flex flex-row flex-wrap items-start justify-start gap-x-2 gap-y-2'>
                            {hotel.facilities.slice(0, 6).map((facility: any, index:number) => (
                            <div key={index} className='flex flex-row items-center justify-center gap-x-2'>
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className='text-slate-600 text-sm font-normal tracking-tight'>
                                {facility.name}
                            </span>
                            </div>
                            ))}
                        </div>
                        <div className='flex flex-col items-center justify-center w-full'>
<AnimatedButton 
  size='sm' 
  variant="bland"
  onClick={() => openSheet('amenities', { 
    title: 'All Amenities', 
    minHeight: '70vh', 
    maxHeight: '90vh',
    showPin: false
  })}
>
  View All Amenities
</AnimatedButton>
          </div>
                </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-md'>
                           Reviews
                        </h1>
                        <div>
                            <HotelRating reviews={hotel.reviews} />
                        </div>
                </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-md'>
                           Rules & Policies
                        </h1>
<div className='flex flex-row items-center justify-start gap-x-4 w-full'>
    <div className='flex flex-col items-start justify-start gap-y-1'>
        <span className='text-slate-600 text-sm font-normal tracking-tight'>
            Check-in
        </span>
        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-slate-950 text-sm font-medium'>
            From {hotel?.checkinInfo.beginTime}
        </span>
    </div>
    <div className='flex flex-col items-start justify-start gap-y-1'>
    <span className='text-slate-600 text-sm font-normal tracking-tight'>
            Check out
        </span>
        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-slate-950 text-sm font-medium'>
            Until {hotel?.checkoutInfo.time}
        </span>
    </div>
</div>
<div className='flex w-full h-24'>
    <p className='text-slate-600 text-xs font-normal tracking-tight overflow-hidden text-ellipsis'>
    {hotel?.policies[0]?.text?.trimStart()}
    </p>
</div>
<div className='flex flex-col items-center justify-center w-full'>
    <AnimatedButton 
        size='sm' 
        variant="bland"
        onClick={() => openSheet('policies', { 
            title: 'Hotel Policies', 
            minHeight: '70vh', 
            maxHeight: '90vh',
            showPin: false
        })}
    >
        View All Policies
    </AnimatedButton>
</div>
          </div>
                </div>
            </div>
        </div>
  )
}

export default Page