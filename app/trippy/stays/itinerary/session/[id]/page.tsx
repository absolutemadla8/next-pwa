'use client'

import { ChevronDown, ChevronUp, ListCheck, Star, Users } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import StarRating from '@/app/components/ui/StarRating'
import { useParams } from 'next/navigation'
import { api } from '@/app/lib/axios'
import { useHotelStore } from '@/app/store/hotelsSearchStore'
import { useGuestStore } from '@/app/store/guestStore'
import GuestForm from '@/app/components/stays/GuestForm'
import AnimatedButton from '@/app/components/ui/AnimatedButton'
import { RoomAllocationPayload } from '@/app/types/roomAllocation'
import Script from 'next/script'
import { formatDate } from '@/app/lib/utils'
import useItineraryStore from '@/app/store/itineraryStore'
import useBottomOrderStore from '@/app/store/bottomOrderStore'

const Page = () => {
  const params = useParams();
  const {hotel} = useHotelStore();
  const { setGuests, guests, updateGuest, hasChanged, setInitialGuests, resetChanges } = useGuestStore();
  const {itinerary, setRecommendationId, setRoomDetails, getTotalPrice} = useItineraryStore();
  const {setButtonText, setHandleCreateItinerary, setInfoSubtitle, setInfoTitle} = useBottomOrderStore();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState<boolean[]>([]);

  // Added Razorpay script loader function
  const loadRazorpayScript = () => {
    if (window.Razorpay) {
      setIsRazorpayLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsRazorpayLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load payment gateway. Please try again later.');
    };
    document.body.appendChild(script);
  };
  
  // Load Razorpay script on component mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // State to track if each guest form is valid
  const [formValidity, setFormValidity] = useState<boolean[]>([]);
  
  // Memoized validation callback
  const handleValidationChange = React.useCallback((idx: number, isValid: boolean) => {
    setFormValidity(prev => {
      // Skip update if value hasn't changed to prevent infinite loops
      if (prev[idx] === isValid) return prev;
      
      const newState = [...prev];
      newState[idx] = isValid;
      return newState;
    });
  }, []);

  useEffect(() => {
    if (session && session.rooms) {
      // Initialize guests based on room count
      const totalRooms = session.rooms.length;
      const initialGuests = Array.from({ length: totalRooms }).map(() => ({
        title: 'Mr',
        firstName: '',
        lastName: '',
        email: '',
        isdCode: '91',
        type: 'adult',
        contactNumber: '',
        panCardNumber: null,
        passportNumber: null,
        passportExpiry: null
      }));
      
      setInitialGuests(initialGuests);
      
      // Initialize form validity tracking
      setFormValidity(Array(totalRooms).fill(false));
      
      // Initialize all rooms as expanded if single room, or only first room expanded if multiple
      if (totalRooms === 1) {
        setExpandedRooms([true]);
      } else {
        setExpandedRooms(Array(totalRooms).fill(false));
      }
    }
  }, [session, setInitialGuests]);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await api.get(`/hotels/itinerary/${params.id}`);
        console.log("API Response:", response.data);
//@ts-ignore mlmr
        if (response.data.status === 'success') {
            //@ts-ignore mlmr
          setSession(response.data.data);
          //@ts-ignore mlmr
          console.log("Session data set:", response.data.data);
        } else {
          setError('Failed to fetch session details');
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
        setError('An error occurred while fetching session details');
      } finally {
        setLoading(false);
      }
    };
  
    if (params.id) {
      fetchSessionData();
    }
  }, [params.id]);

  const totalRooms = session?.rooms ? session.rooms.length : 0;
  //@ts-ignore mlmr
  const totalAdults = session?.rooms ? session.rooms.reduce((sum, room) => sum + room.adults, 0) : 0;

  const toggleRoomExpand = (index: number) => {
    setExpandedRooms(prev => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const handleRazorpayPayment = React.useCallback((orderId: string, amount: number, currency: string) => {
    if (!window.Razorpay) {
      setError('Payment gateway not loaded. Please refresh the page and try again.');
      return;
    }
    
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: amount * 100,
      currency: currency || "INR",
      name: "Often Travel",
      description: `Hotel Booking - ${orderId}`,
      order_id: orderId,
      prefill: {
        email: guests[0]?.email || "",
        contact: guests[0]?.contactNumber
          ? `${guests[0]?.isdCode}${guests[0]?.contactNumber}`
          : "",
        name: `${guests[0]?.firstName} ${guests[0]?.lastName}`.trim() || "",
      },
      theme: { color: "#0C66E4" },
      handler: async function (response: any) {
        console.log("Payment successful:", response);
        alert("Payment successful!");
  
        // Redirect to confirmation page
        window.location.href = `/bookings/${orderId}`;
      },
      modal: {
        ondismiss: function () {
          alert("Payment cancelled");
        },
      },
    };
  
    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Razorpay initialization error:", err);
      setError('Failed to initialize payment gateway. Please try again.');
    }
  }, [guests, setError]);

  // Fix for the submitBooking function in the session page
const submitBooking = React.useCallback(async () => {
  if (!session || !params.id) {
    setError('Missing session data or booking reference');
    return;
  }
  
  if (!isRazorpayLoaded) {
    setError('Payment gateway is still loading. Please wait a moment and try again.');
    return;
  }

  // Check if all forms are valid according to our form validation state
  const areAllFormsValid = formValidity.every(isValid => isValid);
  
  if (!areAllFormsValid) {
    setError('Please complete all required guest information correctly');
    return;
  }
  
  // Additional validation on the raw data as a secondary check
  const isDataValid = guests.every(
    (guest) => guest.firstName && guest.lastName && guest.email && guest.contactNumber
  );

  if (!isDataValid) {
    setError('Please fill in all required guest information');
    return;
  }

  try {
    setLoading(true);
    
    // Step 1: Allocate Rooms
    // Check if roomAllocations exists in session, otherwise look for rooms
    const roomAllocationData = session.roomAllocations || session.rooms;
    
    if (!roomAllocationData || roomAllocationData.length === 0) {
      throw new Error('No room allocation data found in session');
    }
    
    const roomAllocationPayload = {
      guests: roomAllocationData.map((roomData:any, index:number) => {
        return {
          title: guests[index].title,
          firstName: guests[index].firstName.trim(),
          lastName: guests[index].lastName.trim(),
          isLeadGuest: true,  // First guest is lead guest
          type: 'adult',
          email: guests[index].email.trim(),
          isdCode: guests[index].isdCode,
          contactNumber: guests[index].contactNumber.trim(),
          panCardNumber: guests[index].panCardNumber || null,
          passportNumber: guests[index].passportNumber || null,
          passportExpiry: guests[index].passportExpiry || null,
          roomIndex: index
        };
      }),
      specialRequests: ""
    };

    console.log('Room allocation payload:', roomAllocationPayload);

    const roomAllocationResponse = await api.post(
      `/hotels/booking/${params.id}/guests`,
      roomAllocationPayload
    );
    
    //@ts-ignore can't be fixed will do later
    if (roomAllocationResponse.data.status !== 'success') {
      //@ts-ignore can't be fixed will do later
      throw new Error(roomAllocationResponse.data.message || 'Failed to allocate rooms');
    }

    // Step 2: Generate Order
    const orderResponse = await api.post(`/hotels/booking/${params.id}/order`);
    
    //@ts-ignore can't be fixed will do later
    if (orderResponse.data.status !== 'success') {
      //@ts-ignore can't be fixed will do later
      throw new Error(orderResponse.data.message || 'Failed to create order');
    }
    
    //@ts-ignore can't be fixed will do later
    const orderData = orderResponse.data.data;
    const razorpayOrderId = orderData.id; // Extract Razorpay Order ID

    if (!razorpayOrderId) {
      throw new Error('Razorpay order ID missing in response');
    }

    // Step 3: Proceed with Razorpay Payment
    handleRazorpayPayment(razorpayOrderId, orderData.amount, orderData.currency);

  } catch (err: any) {
    console.error('Error during booking:', err);
    const errorMessage =
      err.response?.data?.message || err.message || 'An unexpected error occurred';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
}, [session, params.id, isRazorpayLoaded, formValidity, guests, handleRazorpayPayment]);

  React.useEffect(() => {
    // Set up bottom order bar with the combined function
    setButtonText('Book now');
    setHandleCreateItinerary(submitBooking);
    setInfoTitle('inclusive of all taxes');
    setInfoSubtitle(`₹${session?.finalRate ? session.finalRate : 0} total` || 'Guests not Selected');
  }, [setButtonText, setHandleCreateItinerary, setInfoSubtitle, setInfoTitle, session, submitBooking])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-[#F1F2F4]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F1F2F4]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F1F2F4]">
        <div className="text-gray-600">No session data found</div>
      </div>
    );
  }
  return (
    <div className='flex flex-col w-full h-full items-center justify-center bg-[#F1F2F4]'>
        {/* Add Razorpay script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
          onLoad={() => setIsRazorpayLoaded(true)}
          onError={() => setError('Failed to load payment gateway. Please try again later.')}
        />
        
        <div className="flex flex-col items-center justify-start h-full w-full">
            <div className='relative flex flex-col items-start justify-start w-full h-64'>
            <img src={session.hotelDetails.images[0].url} className='h-64 w-full transition-all delay-150 duration-300 ease-in-out' />
            <div className='absolute -bottom-1 h-48 w-full bg-gradient-to-t from-[#F1F2F4] to-[#F1F2F400]' />
            </div>
            <div className='flex flex-col items-center justify-center w-full gap-y-3 px-6 -mt-10 z-10'>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                    <div className='flex flex-row items-center justify-between w-full'>
                    <div className='flex flex-col gap-y-1 w-[60%]'>
                        <div className='flex flex-row items-center justify-start gap-x-4 w-full'>
                           <img src='https://aktt5yjwyc.ufs.sh/f/VfNn67L471Nr09H0PGyN69PzLBI5kGd34SqJQVxpOwXWubog' className='w-14 h-6 object-contain' /> 
                       <StarRating rating={4.5} />
                        </div>
                        <div className='flex flex-col w-full'>
                        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg truncate'>
                            {session.hotelDetails.name ? session.hotelDetails.name : ""}
                        </h1>
                        <span className='text-slate-600 text-sm font-normal tracking-tight'>
                        {session.location ? session.location : ""}
                        </span>
                        </div>
                        </div>
                        {hotel && 
                        <div className='flex flex-col w-20 h-fit rounded-lg overflow-hidden'>
                            <div className='flex flex-row items-center justify-center gap-x-1 bg-teal-600 p-1'>
                            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-white text-sm font-normal'>
                            {+hotel.reviews[0].rating ? +hotel.reviews[0].rating : 0}
                        </span>
                        <Star className='size-3 fill-white' />
                            </div>
                            <div className='flex flex-col items-center justify-center bg-slate-100 p-1'>
                            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-sm font-normal'>
                            {+hotel.reviews[0].count ? +hotel.reviews[0].count : 0}
                        </span>
                        <span className='text-primary text-xs font-normal tracking-tighter'>
                            reviews
                        </span>
                            </div>
                        </div>
                        }
                    </div>
                    <hr className='w-full' />
                    <div className='flex flex-row items-start justify-between w-full'>
                        <div className='flex flex-col items-start justify-start'>
                        <span className='text-gray-800 text-sm font-normal'>
                            Check-in
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg' >
                        {session.checkin ? new Date(session.checkin).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
}).replace(/ /g, ' ') : ""}
                        </h2>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-gray-800 text-sm font-normal'>
                            From 2:00 PM
                        </span>
                        </div>
                        <div className='flex flex-col items-end justify-start'>
                        <span className='text-gray-800 text-sm font-normal'>
                            Check out
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg' >
                        {session.checkout ? new Date(session.checkout).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
}).replace(/ /g, ' ') : ""}
                        </h2>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-gray-800 text-sm font-normal'>
                            Until 11:00 AM
                        </span>
                        </div>
                    </div>
                    <hr className='w-full' />
                    <div className='flex flex-row items-start justify-between w-full'>
                        <div className='flex flex-col items-start justify-start'>
                        <span className='text-gray-800 text-sm font-normal'>
                            Guests & Room
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg' >
                        {totalAdults} Adults, {totalRooms} Room{totalRooms > 1 ? 's' : ''}
                        </h2>
                        </div>
                    </div>
                </div>
                
                {/* Improved Room details section */}
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl shadow-sm gap-y-4'>
  <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-lg'>
    {totalRooms > 1 ? 'Your Rooms' : 'Your Room'}
  </h1>
  
  {session.rooms && session.rooms.map((roomData:any, index:number) => (
    <div key={index} className='w-full'>
      <div 
        className={`flex flex-row items-center justify-between w-full ${index > 0 ? 'pt-2 border-t border-gray-100' : ''}`}
        onClick={() => totalRooms > 1 && toggleRoomExpand(index)}
      >
        <div className='flex flex-row items-center gap-x-2'>
          <div className='flex items-center justify-center bg-gradient-to-r from-[#E9F2FF] to-[#CCE0FF] rounded-full w-6 h-6'>
            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-[#1D4F7B] text-xs font-normal mt-0.5'>
              {index + 1}
            </span>
          </div>
          <div className='flex flex-col'>
            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-md font-normal'>
              {roomData.room_name}
            </span>
            <div className='flex flex-row items-center gap-x-2'>
              <span className='text-[#0C66E4] text-xs font-medium'>
                {roomData.board_basis.description}
              </span>
              <div className='flex flex-row items-center gap-x-1'>
                <Users className='text-[#44546F] size-3' />
                <span className='text-[#44546F] text-xs'>
                  {roomData.adults} Adult{roomData.adults > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {totalRooms > 1 && (
          <button className='text-[#0C66E4] p-1 rounded hover:bg-[#E9F2FF] transition-colors duration-200'>
            {expandedRooms[index] ? 
              <ChevronUp className='size-4' /> : 
              <ChevronDown className='size-4' />
            }
          </button>
        )}
      </div>
      
      {/* Expanded room details - always visible for single room or when expanded */}
      {(totalRooms === 1 || expandedRooms[index]) && (
        <div className='mt-2 pl-8'>
          {!roomData.cancellation.has_free_cancellation ?
            <div className='flex items-center py-1 px-2 bg-red-50 text-red-600 text-xs rounded-full w-fit'>
              Non Refundable
            </div> :
            <div className='flex items-center py-1 px-2 bg-[#E6FFFA] text-[#2C7A7B] text-xs rounded-full w-fit'>
              Free Cancellation till {roomData.cancellation.free_cancellation_until ? 
                new Date(roomData.cancellation.free_cancellation_until).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short'
                }).replace(/ /g, ' ') : ""}
            </div>
          }
          
          <div className='mt-2 text-[#44546F] text-sm'>
            {/* Room amenities could go here */}
            {roomData.cancellation.has_free_cancellation && (
              <div className='mt-1 text-xs text-[#718096]'>
                <span className='font-medium'>Full Details:</span> 100% refund till {roomData.cancellation.free_cancellation_until ? 
                  new Date(roomData.cancellation.free_cancellation_until).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }).replace(/ /g, ' ') + ', ' + new Date(roomData.cancellation.free_cancellation_until).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }).toUpperCase() : ""}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  ))}
</div>
                
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg'>
                           Guest Information
                        </h1>
                        {Array.from({ length: totalRooms }).map((_, index) => (
           <GuestForm
           key={index}
           guest={guests[index]}
           index={index}
           updateGuest={updateGuest}
           isPanCardRequired={session?.is_pan_card_required || false}
           isPassportRequired={session?.is_passport_required || false}
           onValidationChange={handleValidationChange}
         />
          ))}
                </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                    <div className='flex flex-row items-start justify-start gap-x-2'>
                        <div className='flex items-center justify-center p-2 rounded-md bg-teal-600'>
                            <ListCheck className='text-white size-4' />
                        </div>
                        <div className='flex flex-col mb-2'>
                        <span className='flex flex-row items-center justify-start gap-x-1 text-primary text-sm font-normal tracking-tight'>
                            To Pay
                            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-sm'>
                            Rs. {session?.finalRate? (+session.finalRate).toFixed() : 0}
                        </span>
                        </span>
                        <span className='flex flex-row items-center justify-start gap-x-1 text-teal-600 text-xs font-semibold tracking-tight'>
                            We&apos;re happy to help you find the best deals
                        </span>
                        </div>
                    </div>
                        <div className='flex flex-row items-center justify-between w-full'>
                        <span className='text-slate-600 text-sm font-normal tracking-tight'>
                            Sub Total
                        </span>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-slate-600 text-sm'>
                        ₹{session?.baseRate? session.baseRate : 0}
                        </span>
                    </div>
                    <hr className='w-full' />
                    <div className='flex flex-row items-center justify-between w-full'>
                        <span className='text-slate-600 text-sm font-normal'>
                            Taxes & fee
                        </span>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-slate-600 text-sm'>
                        ₹{session?.tax? session.tax : 0}
                        </span>
                    </div>
                    <hr className='w-full' />
                    <div className='flex flex-row items-center justify-between w-full'>
                        <span className='text-primary text-md font-normal'>
                            Total
                        </span>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg'>
                        ₹{session?.finalRate? session.finalRate : 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
   </div>
  )
}

// Type declaration for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default Page