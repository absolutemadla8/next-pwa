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
        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 font-normal text-md'>
          {itinerary.locationName}
        </h2>
        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-slate-600 font-normal text-sm'>
          {itinerary.checkIn ? formatDate(itinerary.checkIn) : 'No date selected'} - {itinerary.checkOut ? formatDate(itinerary.checkOut) : 'No date selected'}
        </h2>
        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 font-normal text-sm'>
          {getTotalAdults() + getTotalChildren()} Guests, {getTotalRooms()} Room
        </h2>
      </motion.div>
      <div className='flex w-full pt-2'>
        <HorizontalScroll>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            className="flex gap-x-2 px-1"
          >
            <motion.div 
              variants={filterVariants} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenFilter}
              className='flex flex-row items-center justify-center gap-x-1 w-32 truncate bg-white rounded-full p-2 shadow-sm cursor-pointer'
            >
              <IconAdjustmentsHorizontal className='text-blue-950' size={16} />
              <span className='text-blue-950 text-sm tracking-tight' style={{ fontFamily: 'var(--font-nohemi)' }}>
                Filters
              </span>
            </motion.div>
            <motion.div 
              variants={filterVariants} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenFilter}
              className='flex flex-row items-center justify-center gap-x-1 w-32 truncate bg-white rounded-full p-2 shadow-sm cursor-pointer'
            >
              <IconStar className='text-blue-950' size={16} />
              <span className='text-blue-950 text-sm tracking-tight' style={{ fontFamily: 'var(--font-nohemi)' }}>
                Star Rating
              </span>
            </motion.div>
            <motion.div 
              variants={filterVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenFilter}
              className='flex flex-row items-center justify-center w-32 gap-x-1 truncate bg-white rounded-full p-2 shadow-sm cursor-pointer'
            >
              <IconToolsKitchen3 className='text-blue-950' size={16} />
              <span className='text-blue-950 text-sm tracking-tight' style={{ fontFamily: 'var(--font-nohemi)' }}>
                Inclusions
              </span>
            </motion.div>
            <motion.div 
              variants={filterVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenFilter}
              className='flex flex-row items-center justify-center w-32 gap-x-1 truncate bg-white rounded-full p-2 shadow-sm cursor-pointer'
            >
              <IconAdjustmentsHorizontal className='text-blue-950' size={16} />
              <span className='text-blue-950 text-sm tracking-tight' style={{ fontFamily: 'var(--font-nohemi)' }}>
                Price Range
              </span>
            </motion.div>
          </motion.div>
        </HorizontalScroll>
      </div>
    </div>
  );
};

export default StayInformationHeader;