"use client";

import React, { useEffect } from 'react';
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
import useItineraryStore from '../store/itineraryStore';
import BottomNavigation from '../components/trippy/BottomNavigation';
import { IconBubbleText, IconBuildings, IconSparkles, IconUserCircle } from '@tabler/icons-react';

export default function TrippyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { activeSheet, openSheet, closeSheet, sheetConfig } = useBottomSheetStore();
  const {itinerary, increaseAdultsInRoom, decreaseAdultsInRoom, addChildToRoom, addRoomToItinerary, removeChildFromRoom, removeRoomFromItinerary, setDates} = useItineraryStore();
  
  // Navigation items
  const navigationItems: any[] = [
    {
      name: 'Chat',
      path: '/trippy/chat',
      icon: IconBubbleText
    },
    {
      name: 'Trippy',
      path: '/trippy', 
      icon: IconSparkles
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
      <main className="flex h-[92vh] rounded-b-2xl w-full md:max-w-md bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className='flex items-center w-full h-[8vh]'>
      <BottomNavigation navItems={navigationItems} />
      </div>
      
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
            <HorizontalScroll className='pt-2'>
              <DateRangeEvent
                dateRange="March 22 - March 28"
                eventDescription="Long Weekend"
              />
            </HorizontalScroll>
          </div>
          <CalendarList
            mode="range"
            minDate={new Date(2025, 1, 1)}
            maxDate={new Date(2025, 11, 31)}
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
    </div>
  );
}