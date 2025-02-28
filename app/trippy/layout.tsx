"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, TagIcon, HomeIcon, Calendar, Search, Home, Building2 } from 'lucide-react';
import BottomSheet from '../components/ui/BottomSheet';
import HorizontalScroll from '../components/ui/HorizontalScroll';
import DateRangeEvent from '../components/ui/DateRangeEvent';
import CalendarList from '../components/ui/CalendarList';
import SearchComponent from '../components/ui/Search';
import useBottomSheetStore from '../store/bottomSheetStore';
import RoomConfiguration from '../components/ui/RoomConfiguration';
import useItineraryStore from '../store/itineraryStore';
import BottomNavigation from '../components/trippy/BottomNavigation';

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
      name: 'Home',
      path: '/home',
      icon: Home
    },
    {
      name: 'Trippy',
      path: '/trippy', 
      icon: Sparkles
    },
    {
      name: 'Stays',
      path: '/trippy/stays',
      icon: Building2
    },
  ];

  // Close bottom sheet when route changes
  useEffect(() => {
    closeSheet();
  }, [pathname, closeSheet]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Main content */}
      <main className="flex-grow pb-24 items-center justify-center">
        {children}
        
        {/* Floating action buttons */}
        {/* <div className="fixed bottom-20 right-4 flex flex-col gap-2">
          <button 
            onClick={() => openSheet('dateRange', { 
              title: 'Check in & Check out',
              minHeight: '60vh'
            })}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
            aria-label="Select dates"
          >
            <Calendar size={20} />
          </button>
          <button 
            onClick={() => openSheet('search', { 
              title: 'Search Locations',
              minHeight: '90vh',
              maxHeight: '90vh'
            })}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div> */}
         <div className='items-center justify-center w-full'>
      <BottomNavigation navItems={navigationItems} />
      </div>
      </main>

      {/* Bottom Navigation */}
      {/* <div className='items-center justify-center w-full'>
      <BottomNavigation navItems={navigationItems} />
      </div> */}
      
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