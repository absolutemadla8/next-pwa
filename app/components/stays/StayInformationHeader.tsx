'use client'

import { formatDate } from '@/app/lib/utils';
import useItineraryStore from '@/app/store/itineraryStore';
import React, { useEffect, useState } from 'react';
import HorizontalScroll from '../ui/HorizontalScroll';
import { IconAdjustmentsHorizontal, IconGrillFork, IconStar, IconToolsKitchen3 } from '@tabler/icons-react';
import { motion, stagger } from 'framer-motion';
import useBottomSheetStore from '@/app/store/bottomSheetStore';

const StayInformationHeader = () => {
  const { itinerary, getTotalAdults, getTotalChildren, getTotalRooms } = useItineraryStore();
  const [isVisible, setIsVisible] = useState(false);
  const { openSheet } = useBottomSheetStore();

  useEffect(() => {
    // Small delay before triggering animation for better visual effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to open the filter bottom sheet
  const handleOpenFilter = () => {
    openSheet('filter', {
      title: 'Filter Hotels',
      minHeight: '60vh',
      maxHeight: '90vh'
    });
  };

  // Enhanced animation variants with spring physics
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    },
  };

  const filterVariants = {
    hidden: {
      x: 20,
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 160,
        damping: 15,
        mass: 1,
        velocity: 2
      },
    },
  };

  // Info card animation
  const infoCardVariants = {
    hidden: { 
      x: -20, 
      opacity: 0 
    },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.5
      }
    }
  };

  return (
    <div className='flex flex-col items-start justify-start w-full bg-gradient-to-r from-blue-600 to-blue-800 pb-2 rounded-b-lg overflow-hidden z-10'>
      <motion.div 
        variants={infoCardVariants}
        initial="hidden"
        animate="visible"
        className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-b-lg overflow-hidden'
      >
        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-md'>
          {itinerary.locationName}
        </h2>
        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-slate-600 font-normal text-sm'>
          {itinerary.checkIn ? formatDate(itinerary.checkIn) : 'No date selected'} - {itinerary.checkOut ? formatDate(itinerary.checkOut) : 'No date selected'}
        </h2>
        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-sm'>
          {getTotalAdults() + getTotalChildren()} Guests, {getTotalRooms()} Room
        </h2>
      </motion.div>
    </div>
  );
};

export default StayInformationHeader;