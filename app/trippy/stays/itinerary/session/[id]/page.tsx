'use client'

import { ListCheck, Star } from 'lucide-react'
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

const Page = () => {
  const params = useParams();
  const {hotel} = useHotelStore();
  const { setGuests, guests, updateGuest, hasChanged, setInitialGuests, resetChanges } = useGuestStore();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

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
    }
  }, [session, setInitialGuests]);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await api.get(`/hotels/itineraries/${params.id}`);
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

  const roomData = session?.rooms && session.rooms.length > 0 ? session.rooms[0] : null;
  const totalRooms = session?.rooms ? session.rooms.length : 0;
  const totalAdults = roomData ? roomData.adults * totalRooms : 0;

  const handleRazorpayPayment = (orderId: string, amount: number, currency: string) => {
    if (!window.Razorpay) {
      setError('Payment gateway not loaded. Please refresh the page and try again.');
      return;
    }
    
    const options = {
      key: process.env.RAZORPAY_KEY,
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
  };

  const submitBooking = async () => {
    if (!session || !params.id) {
      setError('Missing session data or booking reference');
      return;
    }
    
    if (!isRazorpayLoaded) {
      setError('Payment gateway is still loading. Please wait a moment and try again.');
      return;
    }
  
    // Validate guest information
    const isValid = guests.every(
      (guest) => guest.firstName && guest.lastName && guest.email && guest.contactNumber
    );
  
    if (!isValid) {
      setError('Please fill in all required guest information');
      return;
    }
  
    try {
      setLoading(true);
      
      // Step 1: Allocate Rooms
      const roomAllocationPayload: RoomAllocationPayload = {
        traceId: session.traceId,
        //@ts-ignore can't be fixed will do later
        roomsAllocations: Array.from({ length: session.roomAllocations.length}).map((_, index) => ({
            rateId: String(session.roomAllocations[index].rate_id),
            roomId: String(session.roomAllocations[index].room_id),
            guests: [guests[index]]
          }))
      };
  
      const roomAllocationResponse = await api.post(
        `/hotels/itineraries/${session.itineraryCode}/rooms-allocations`,
        roomAllocationPayload
      );
      //@ts-ignore can't be fixed will do later
      if (roomAllocationResponse.data.status !== 'success') {
        //@ts-ignore can't be fixed will do later
        throw new Error(roomAllocationResponse.data.message || 'Failed to allocate rooms');
      }
  
      // Step 2: Generate Order
      const orderResponse = await api.post(`/hotels/itineraries/${params.id}/order`);
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
      const errorMessage =
        err.response?.data?.message || err.message || 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F1F2F4]">
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
    <div className='flex flex-col w-full min-h-screen items-center justify-center'>
        {/* Add Razorpay script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
          onLoad={() => setIsRazorpayLoaded(true)}
          onError={() => setError('Failed to load payment gateway. Please try again later.')}
        />
        
        <div className="flex flex-col items-center justify-start h-full w-full bg-[#F1F2F4]">
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
                        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg truncate'>
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
                            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-sm font-normal'>
                            {+hotel.reviews[0].count ? +hotel.reviews[0].count : 0}
                        </span>
                        <span className='text-blue-950 text-xs font-normal tracking-tighter'>
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
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg' >
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
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg' >
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
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg' >
                        {totalAdults} Adults, {totalRooms} Room{totalRooms > 1 ? 's' : ''}
                        </h2>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                <div className='flex flex-col w-full'>
                <span className='text-blue-500 text-sm font-normal tracking-tight'>
                {roomData?.board_basis.description}
                        </span>
                        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg'>
                        {roomData?.room_name}
                        </h1>
                        {!roomData.cancellation.has_free_cancellation ?
                         <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-slate-600 text-sm'>
                            Non Refundable
                         </span>:
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-teal-600 text-sm'>
                           Get 100% refund till {roomData.cancellation.free_cancellation_until ? new Date(roomData.cancellation.free_cancellation_until).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        }).replace(/ /g, ' ') + ', ' + new Date(roomData.cancellation.free_cancellation_until).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        }).toUpperCase() : ""}
                        </span>
}
                        </div>
                </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg'>
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
         />
          ))}
                </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                    <div className='flex flex-row items-start justify-start gap-x-2'>
                        <div className='flex items-center justify-center p-2 rounded-md bg-teal-600'>
                            <ListCheck className='text-white size-4' />
                        </div>
                        <div className='flex flex-col mb-2'>
                        <span className='flex flex-row items-center justify-start gap-x-1 text-blue-950 text-sm font-normal tracking-tight'>
                            To Pay
                            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-sm'>
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
                        <span className='text-blue-950 text-md font-normal'>
                            Total
                        </span>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg'>
                        ₹{session?.finalRate? session.finalRate : 0}
                        </span>
                    </div>
                </div>
            </div>
            <div className='py-6' />
        </div>
        <div className='fixed bottom-0 left-0 right-0 flex flex-col items-center justify-start w-full bg-gradient-to-t from-white via-white to-transparent p-4 z-20'>
            <div className='flex flex-col items-center justify-center rounded-lg overflow-hidden bg-blue-600 w-full max-w-screen-xl mx-auto'>
                <div className='flex flex-row items-center justify-between w-full px-3 py-2 bg-blue-700'>
                </div>
                <div className='flex flex-row items-center justify-between w-full px-3 py-2'>
                <div className='flex flex-col items-start justify-start'>
                <div className='flex flex-row items-center justify-start gap-x-1'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-md text-white'>
                ₹{session?.finalRate? session.finalRate : 0}
            </h1>
            <span className='text-xs text-slate-50 font-normal tracking-tight truncate'>
                   total
                </span>
            </div>
            <span className='text-xs text-slate-50 font-normal tracking-tight truncate'>
                   Inclusive of taxes and fee
                </span>
            </div>
            <AnimatedButton 
              disabled={loading || !isRazorpayLoaded} 
              loading={loading} 
              onClick={submitBooking} 
              size='md' 
              variant="bland"
            >
              {loading ? 'Initiating...' : !isRazorpayLoaded ? 'Loading payment...' : 'Pay now'}
            </AnimatedButton>
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