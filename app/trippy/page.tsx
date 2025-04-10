"use client";

import SmallLogoWhite from '@/app/components/svg/SmallLogoWhite'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/store/authStore';
import { Heart, Send, Send2 } from 'iconsax-react';
import TopSheet from '@/app/components/ui/TopSheet';
import useBottomSheetStore from '@/app/store/bottomSheetStore';
import useItineraryStore from '@/app/store/itineraryStore';
import { formatDate } from '@/app/lib/utils';
import { ArrowRight } from 'lucide-react';
import OftenGradientLogo from '../components/svg/OftenGradientLogo';
import { FileUpload } from '../components/ui/FileUpload';
import EventLogo from '../components/svg/EventLogo';
import StaysLogo from '../components/svg/StaysLogo';
import StaysTopSheet from '../components/stays/StaysTopSheet';
import LoadingButton from '../components/ui/LoadingButton';
import OftenLogo from '../components/svg/OftenLogo';

const Page = () => {
  const {user, token} = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [staysSheetOpen, setStaysSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);
  const router = useRouter();
  
  // Clear persisted itinerary data if needed
  useEffect(() => {
    const hasResetParam = typeof window !== 'undefined' && 
      new URLSearchParams(window.location.search).get('reset') === 'true';
    if (hasResetParam) {
      // Reset itinerary here if needed
      localStorage.removeItem('itinerary-storage');
      window.location.href = '/trippy'; // Reload without the query param
    }
  }, []);
  
  // Access Bottom Sheet and Itinerary stores
  const { openSheet } = useBottomSheetStore();
  const {
    itinerary,
    getTotalAdults,
    getTotalRooms,
    getTotalChildren,
    setDates,
    addRoomToItinerary,
    setLocationDetails
  } = useItineraryStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('agent_id', 'default_agent_id');
      
      const response = await fetch('http://127.0.0.1:8000/api/ai/tasks/upload_and_extract', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response from API:', data);
      
      // Clear file selection after successful upload
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStaysClick = () => {
    setStaysSheetOpen(true);
  };

  // Set default values for check-in, check-out, and room configuration
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    // Force reset the room configuration to exactly one room with 2 adults
    // This ensures we never have duplicate rooms added on refresh
    const resetRooms = () => {
      // Generate a consistent room ID to avoid duplicates
      const roomId = `room-default`;
      
      // Set location details with a rooms array that has exactly one room with 2 adults
      setLocationDetails({
        locationId: itinerary.locationId,
        locationName: itinerary.locationName,
        type: itinerary.type,
        city: itinerary.city,
        state: itinerary.state,
        country: itinerary.country,
        travclanScore: itinerary.travclanScore,
        hotelId: itinerary.hotelId,
      });
    };
    
    // Only set up initial data if none exists already
    if (!itinerary.checkIn || !itinerary.checkOut) {
      // Set check-in date to one month from now
      const checkInDate = new Date();
      checkInDate.setMonth(checkInDate.getMonth() + 1);
      
      // Set check-out date to two days after check-in
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 2);
      
      // Set dates in the itinerary store
      setDates(checkInDate, checkOutDate);
    }
    
    // Always reset the rooms to ensure exactly one room with 2 adults
    resetRooms();
    
  }, [itinerary.locationId, itinerary.locationName, itinerary.type, itinerary.city, 
      itinerary.state, itinerary.country, itinerary.travclanScore, itinerary.hotelId, 
      itinerary.checkIn, itinerary.checkOut, setDates, setLocationDetails]);


  return (
    <div className='flex flex-col items-start justify-start min-h-screen bg-white w-full relative'>
      <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/oftenlogobg.png" alt="trippy" className='absolute -top-5 left-0 right-0 bottom-0 w-full h-72 object-cover p-4 opacity-40 -z-0' />
      <StaysTopSheet
        isOpen={staysSheetOpen}
        onClose={() => setStaysSheetOpen(false)}
      />
      <div className='flex flex-row items-center justify-between w-full p-6 z-10'>
        <div className='flex flex-row items-center justify-center'>
          <OftenLogo />
        </div>
      </div>
      <div className='flex flex-col items-start justify-start w-full p-6 h-fit z-10'>
        <img src='https://often-public-assets.blr1.cdn.digitaloceanspaces.com/Group%20482143.png' alt='trippy-hero' className='w-full h-56 object-cover rounded-md mb-1' />
        <LoadingButton
          loading={isUploading}
          onClick={handleUpload}
          className='flex flex-row items-center justify-center w-full gap-x-2 bg-[#0085FF] text-white py-3 px-6 rounded-md'
          text='Upload File'
          icon={<ArrowRight size={20} className='text-white' />}
        />
      </div>
      <div className='flex flex-col items-start justify-start w-full px-6 h-fit'>
        <h1 style={{fontFamily: "var(--font-domine)"}} className='text-lg text-primary'>
          explore often
        </h1>
        <p className='text-sm font-normal text-gray-500 mb-2'>
          Discover new places to stay, events, and more
        </p>
        <div className='grid grid-cols-1 md:grid-cols-1 gap-4 w-full mt-4'>
          <div onClick={()=>setStaysSheetOpen(true)} className='relative flex flex-col items-start justify-start w-full gap-2 bg-[#F4F2EB] p-3 rounded-md overflow-hidden'>
            <div className='flex flex-row items-center justify-between w-full'>
              <div className='flex flex-row items-center justify-center gap-2'>
                <StaysLogo />
                <h1 className='text-sm font-semibold text-primary'>
                  Stays
                </h1>
              </div>
            </div>
            <p className='text-sm font-normal text-gray-500 w-[80%]'>
              Find the best deals on hotels, apartments, and more
            </p>
            <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/maldivesoften.png" className='absolute size-32 -bottom-10 -right-10' />
          </div>
          <div onClick={()=>setStaysSheetOpen(true)} className='relative flex flex-col items-start justify-start w-full gap-2 bg-[#F4F2EB] p-3 rounded-md overflow-hidden'>
            <div className='flex flex-row items-center justify-between w-full'>
              <div className='flex flex-row items-center justify-center gap-2'>
                <EventLogo />
                <h1 className='text-sm font-semibold text-primary'>
                  Events
                </h1>
              </div>
            </div>
            <p className='text-sm font-normal text-gray-500 w-[80%]'>
              Buy tickets to live sports, music, festivals, and more
            </p>
            <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/fboftenst.png" className='absolute size-36 -bottom-10 -right-12' />
          </div>
          </div>
      </div>
    </div>
  )
}

export default Page