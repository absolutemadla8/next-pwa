"use client";

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Building2, MessageCircle } from 'lucide-react';
import BottomSheet from '../components/ui/BottomSheet';
import HorizontalScroll from '../components/ui/HorizontalScroll';
import DateRangeEvent from '../components/ui/DateRangeEvent';
import CalendarList from '../components/ui/CalendarList';
import SearchComponent from '../components/ui/Search';
import useBottomSheetStore from '../store/bottomSheetStore';
import RoomConfiguration from '../components/ui/RoomConfiguration';
import ErrorSheet from '../components/ui/ErrorSheet';
import PassportExpiryPicker from '../components/ui/PassportExpiryPicker';
import AmenitiesBottomSheet from '../components/stays/AmenitiesBottomSheet';
import PoliciesBottomSheet from '../components/stays/PoliciesBottomSheet';
import HotelFilterBottomSheet from '../components/stays/HotelFilterBottomSheet';
import useItineraryStore from '../store/itineraryStore';
import BottomNavigation from '../components/trippy/BottomNavigation';
import { IconApps, IconBubbleText, IconBuildings, IconDiscount, IconHome, IconNavigationDiscount, IconSparkles, IconUserCircle } from '@tabler/icons-react';
import BottomOrderInfo from '../components/trippy/BottomOrderInfo';

export default function TrippyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { activeSheet, openSheet, closeSheet, sheetConfig } = useBottomSheetStore();
  const {itinerary, increaseAdultsInRoom, decreaseAdultsInRoom, addChildToRoom, addRoomToItinerary, removeChildFromRoom, removeRoomFromItinerary, setDates} = useItineraryStore();
  
  // State for passport expiry date picker
  const [currentGuestIndex, setCurrentGuestIndex] = React.useState<number>(0);
  const [onPassportExpirySelect, setOnPassportExpirySelect] = React.useState<(date: string) => void>(() => () => {});
  
  // Function to set up passport expiry date selection
  React.useEffect(() => {
    // Expose a function for components to set up passport expiry date selection
    (window as any).setupPassportExpirySelection = (index: number, callback: (date: string) => void) => {
      setCurrentGuestIndex(index);
      setOnPassportExpirySelect(() => callback);
    };
    
    return () => {
      delete (window as any).setupPassportExpirySelection;
    };
  }, []);
  
  // Popular dates configuration
  const popularDates = useMemo(() => [
    {
      id: 1,
      name: "Upcoming Weekend",
      description: "Weekend Getaway",
      startDate: new Date(new Date().setDate(new Date().getDate() + (5 - new Date().getDay()) % 7 + 1)), // Next Friday
      endDate: new Date(new Date().setDate(new Date().getDate() + (7 - new Date().getDay()) % 7 + 1))    // Next Sunday
    },
    {
      id: 2,
      name: "Week-long Stay",
      description: "Perfect for 7 nights",
      startDate: new Date(new Date().setDate(new Date().getDate() + 14)), // 2 weeks from now
      endDate: new Date(new Date().setDate(new Date().getDate() + 21))    // 3 weeks from now
    },
    {
      id: 3,
      name: "Summer Vacation",
      description: "Beat the heat",
      startDate: new Date(new Date().getFullYear(), 5, 15), // June 15
      endDate: new Date(new Date().getFullYear(), 5, 25)    // June 25
    }
  ], []);
  
  // Handle popular date selection
  const handlePopularDateSelect = (startDate: Date, endDate: Date) => {
    setDates(startDate, endDate);
    // Close the bottom sheet after selection for better UX
    closeSheet();
  };
  
  // Navigation items
  const navigationItems: any[] = [
    {
      name: 'Deals',
      path: '/trippy/deals',
      icon: IconNavigationDiscount
    },
    {
      name: 'Chat',
      path: '/trippy/chat',
      icon: IconSparkles
    },
    {
      name: 'Home',
      path: '/trippy', 
      icon: IconApps
    },
    {
      name: 'Stays',
      path: '/trippy/stays',
      icon: IconBuildings
    },
    {
      name: 'Profile',
      path: '/trippy/profile',
      icon: IconUserCircle
    },
  ];

  // Close bottom sheet when route changes
  useEffect(() => {
    closeSheet();
  }, [pathname, closeSheet]);

  return (
    <div className="flex flex-col min-h-screen max-h-screen overflow-hidden bg-gray-800">
      {/* Main content */}
      <main className="flex min-h-[91vh] max-h-[91vh] rounded-b-2xl w-full md:max-w-md bg-gradient-to-b bg-[#F1F2F4] overflow-y-auto">
        <div className="w-full overflow-auto">{children}</div>
      </main>

      {/* Bottom Navigation */}
      {(pathname === '/trippy' || pathname === '/trippy/stays' || pathname === '/trippy/chat' || pathname === '/trippy/profile' || pathname === '/trippy/stays/search' || pathname === '/trippy/deals' || pathname === '/trippy/stays/search/map') ?
      <div className='flex items-center w-full h-[9vh]'>
        <BottomNavigation navItems={navigationItems} />
      </div>
      :
      pathname.startsWith('/trippy/chat/') && pathname.length > '/trippy/chat/'.length ?
      <div className='flex items-center w-full h-[9vh]'>
        <BottomNavigation navItems={navigationItems} />
      </div>
      :
      <div className='flex items-center w-full h-[9vh]'>
        <BottomOrderInfo  />
      </div>
      }   
      
      {/* Date Range Bottom Sheet */}
      <BottomSheet 
        isOpen={activeSheet === 'dateRange'}
        onClose={closeSheet}
        title={sheetConfig.title}
        minHeight={sheetConfig.minHeight}
        maxHeight={sheetConfig.maxHeight}
        showPin={sheetConfig.showPin}
      >
        <div className='flex flex-col w-full'>
          <div className='flex flex-col items-start justify-start bg-blue-600 mb-4'>
            <h2 className='text-white font-normal text-md pt-3 px-6 tracking-tight'>Popular Dates</h2>
            <HorizontalScroll className='pt-2 pb-4'>
              {popularDates.map(date => {
                // Format the dates for display
                const startStr = date.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const endStr = date.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (
                  <DateRangeEvent
                    key={date.id}
                    dateRange={`${startStr} - ${endStr}`}
                    eventDescription={date.description}
                    startDate={date.startDate}
                    endDate={date.endDate}
                    onClick={handlePopularDateSelect}
                  />
                );
              })}
            </HorizontalScroll>
          </div>
          <CalendarList
            mode="range"
            minDate={new Date()} // Set min date to today
            maxDate={new Date(new Date().getFullYear() + 1, 11, 31)} // Set max date to end of next year
            initialSelectedDates={itinerary.checkIn && itinerary.checkOut ? 
              [itinerary.checkIn, itinerary.checkOut] : 
              []}
            onChange={(dates) => {
                try {
                if (dates.length === 2) {
                    setDates(dates[0], dates[1]);
                } else if (dates.length === 1) {
                    setDates(dates[0], null);
                } else {
                    setDates(null, null);
                }
                } catch (error) {
                console.error("Error in onChange handler:", error);
                }
            }}
            primaryColor="indigo-600"
            secondaryColor="indigo-200"
            hoverColor="indigo-50"
            monthsToShow={6}
            />
        </div>
      </BottomSheet>
      
      {/* Search Bottom Sheet */}
      <BottomSheet 
        isOpen={activeSheet === 'search'}
        onClose={closeSheet}
        title={sheetConfig.title}
        minHeight={sheetConfig.minHeight}
        maxHeight={sheetConfig.maxHeight}
        showPin={sheetConfig.showPin}
      >
        <div className='flex flex-col w-full'>
          <SearchComponent />
        </div>
      </BottomSheet>
      <BottomSheet
       isOpen={activeSheet === 'roomConfig'}
       onClose={closeSheet}
       title={sheetConfig.title}
       minHeight={sheetConfig.minHeight}
       maxHeight={sheetConfig.maxHeight}
       showPin={sheetConfig.showPin}
      >
      <div className='flex flex-col w-full'>
         <RoomConfiguration
         increaseAdultsInRoom={increaseAdultsInRoom}
         decreaseAdultsInRoom={decreaseAdultsInRoom}
         addChildToRoom={addChildToRoom}
         addRoomToItinerary={addRoomToItinerary}
         removeChildFromRoom={removeChildFromRoom}
         removeRoomFromItinerary={removeRoomFromItinerary}
         itinerary={itinerary}
         />
        </div>
      </BottomSheet>
      
      {/* Error Bottom Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'error'}
        onClose={closeSheet}
        title={sheetConfig.title}
        minHeight={sheetConfig.minHeight}
        maxHeight={sheetConfig.maxHeight}
        showPin={sheetConfig.showPin}
      >
        <ErrorSheet />
      </BottomSheet>
      
      {/* Passport Expiry Date Bottom Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'passportExpiry'}
        onClose={closeSheet}
        title={sheetConfig.title}
        minHeight={sheetConfig.minHeight}
        maxHeight={sheetConfig.maxHeight}
        showPin={sheetConfig.showPin}
      >
        <PassportExpiryPicker
          guestIndex={currentGuestIndex}
          onDateSelect={onPassportExpirySelect}
        />
      </BottomSheet>
      
      {/* Amenities Bottom Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'amenities'}
        onClose={closeSheet}
        title={sheetConfig.title}
        minHeight={sheetConfig.minHeight}
        maxHeight={sheetConfig.maxHeight}
        showPin={sheetConfig.showPin}
      >
        <AmenitiesBottomSheet />
      </BottomSheet>
      
      {/* Policies Bottom Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'policies'}
        onClose={closeSheet}
        title={sheetConfig.title}
        minHeight={sheetConfig.minHeight}
        maxHeight={sheetConfig.maxHeight}
        showPin={sheetConfig.showPin}
      >
        <PoliciesBottomSheet />
      </BottomSheet>
      
      {/* Hotel Filter Bottom Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'filter'}
        onClose={closeSheet}
        title={sheetConfig.title}
        minHeight={sheetConfig.minHeight}
        maxHeight={sheetConfig.maxHeight}
        showPin={sheetConfig.showPin}
      >
        <HotelFilterBottomSheet />
      </BottomSheet>
    </div>
  );
}