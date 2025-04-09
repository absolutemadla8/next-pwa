'use client';

import React, { useEffect, useState } from 'react';
import BottomSheet from '../ui/BottomSheet';
import useBottomSheetStore from '@/app/store/bottomSheetStore';
import useHotelFilterStore from '@/app/store/hotelFilterStore';
import { motion } from 'framer-motion';
import { IconStar } from '@tabler/icons-react';
import AnimatedButton from '../ui/AnimatedButton';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

const HotelFilterBottomSheet = () => {
  const { activeSheet, closeSheet, sheetConfig } = useBottomSheetStore();
  const {
    priceRange,
    starRatings,
    inclusions,
    updateCurrentPriceRange,
    toggleStarRating,
    toggleInclusion,
    resetFilters,
  } = useHotelFilterStore();
  
  // Custom style for the range slider
  useEffect(() => {
    // Add custom styling for the range slider
    const style = document.createElement('style');
    style.textContent = `
      .price-range-slider .range-slider__thumb {
        background-color: #2563eb; /* blue-600 */
        width: 20px;
        height: 20px;
      }
      .price-range-slider .range-slider__range {
        background-color: #2563eb; /* blue-600 */
        height: 6px;
      }
      .price-range-slider .range-slider__track {
        background-color: #e5e7eb; /* gray-200 */
        height: 6px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Local state for the slider values
  const [sliderValues, setSliderValues] = useState({
    min: priceRange.currentMin,
    max: priceRange.currentMax,
  });

  // Update local state when store values change
  useEffect(() => {
    setSliderValues({
      min: priceRange.currentMin,
      max: priceRange.currentMax,
    });
  }, [priceRange.currentMin, priceRange.currentMax]);

  // Handle range slider change
  const handleRangeSliderChange = (values: number[]) => {
    // Update local state immediately for smooth UI
    setSliderValues({
      min: Math.round(values[0]),
      max: Math.round(values[1])
    });
    
    // Debounce the actual store update to reduce performance impact
    const timeoutId = setTimeout(() => {
      updateCurrentPriceRange(
        Math.round(values[0]),
        Math.round(values[1])
      );
    }, 100);
    
    return () => clearTimeout(timeoutId);
  };

  // Handle applying filters
  const handleApplyFilters = () => {
    // Close the bottom sheet
    closeSheet();
    
    // Get the active inclusions (facilities)
    const selectedFacilities = inclusions
      .filter(inclusion => inclusion.selected)
      .map(inclusion => inclusion.name);
    
    // Prepare the filter object to send to the backend
    const filters = {
      priceRange: {
        min: priceRange.currentMin,
        max: priceRange.currentMax
      },
      starRatings: starRatings.length > 0 ? starRatings : undefined,
      facilities: selectedFacilities.length > 0 ? selectedFacilities : undefined,
      rateOptions: {
        // Check if specific inclusions are selected
        freeBreakfast: inclusions.find(inc => inc.id === 'breakfast')?.selected || false,
        freeCancellation: false // Default, can be added as an inclusion option later
      }
    };
    
    // Trigger hotel search with the new filters
    if (typeof sheetConfig?.onApplyFilters === 'function') {
      sheetConfig.onApplyFilters(filters);
    }
  };

  // Animation variants for filter items
  const filterItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 160, damping: 15 } },
  };

  return (
    <BottomSheet
      isOpen={activeSheet === 'filter'}
      onClose={closeSheet}
      title="Filter Hotels"
      minHeight="60vh"
      maxHeight="90vh"
    >
      <div className="flex flex-col space-y-6 overflow-y-auto bg-white p-4">
        {/* Price Range Section */}
        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={filterItemVariants}
        >
          <h3 className="text-primary font-semibold text-lg">Price Range</h3>
          <div className="px-2">
            <div className="flex justify-between mb-2">
              <span className="text-primary" style={{ fontFamily: 'var(--font-nohemi)' }}>₹{sliderValues.min}</span>
              <span className="text-primary" style={{ fontFamily: 'var(--font-nohemi)' }}>₹{sliderValues.max}</span>
            </div>
            <div className="relative mb-6 pt-2">
              <RangeSlider
                id="price-range-slider"
                min={priceRange.min}
                max={priceRange.max}
                step={100}
                value={[sliderValues.min, sliderValues.max]}
                onInput={handleRangeSliderChange}
                className="price-range-slider"
              />
            </div>
          </div>
        </motion.div>

        {/* Star Rating Section */}
        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={filterItemVariants}
          custom={1}
        >
          <h3 className="text-primary font-semibold text-lg">Star Rating</h3>
          <div className="flex flex-wrap gap-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <motion.div
                key={rating}
                onClick={() => toggleStarRating(rating)}
                className={`flex items-center justify-center px-4 py-2 rounded-full cursor-pointer transition-all ${starRatings.includes(rating) ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-primary'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconStar size={14} className={starRatings.includes(rating) ? 'text-white' : 'text-primary'} />
                <span className="ml-1 mt-0.5 text-sm" style={{ fontFamily: 'var(--font-nohemi)' }}>{rating}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Inclusions Section */}
        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={filterItemVariants}
          custom={2}
        >
          <h3 className="text-primary font-semibold text-lg">Inclusions</h3>
          <div className="flex flex-wrap gap-2">
            {inclusions.map((inclusion) => (
              <motion.div
                key={inclusion.id}
                onClick={() => toggleInclusion(inclusion.id)}
                className={`px-4 py-2 text-sm rounded-full cursor-pointer transition-all ${inclusion.selected ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-primary'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {inclusion.name}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 sticky bottom-0 bg-white pb-4">
        <AnimatedButton
            onClick={resetFilters}
            variant='bland'
            className='text-primary'
          >
           Reset Selections
          </AnimatedButton>
          <AnimatedButton
            onClick={handleApplyFilters}
            variant='primary'
          >
            Apply Filters
          </AnimatedButton>
        </div>
      </div>
    </BottomSheet>
  );
};

export default HotelFilterBottomSheet;