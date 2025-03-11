'use client';

import { create } from 'zustand';

// Define the types for our filter state
interface PriceRange {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
}

interface Inclusion {
  id: string;
  name: string;
  selected: boolean;
}

interface HotelFilterState {
  // Price range filter
  priceRange: PriceRange;
  
  // Star rating filter (1-5 stars)
  starRatings: number[];
  
  // Inclusions/amenities filter
  inclusions: Inclusion[];
  
  // Filter visibility state
  isFilterVisible: boolean;
  
  // Actions
  setPriceRange: (min: number, max: number) => void;
  updateCurrentPriceRange: (min: number, max: number) => void;
  toggleStarRating: (rating: number) => void;
  toggleInclusion: (id: string) => void;
  setInclusions: (inclusions: Omit<Inclusion, 'selected'>[]) => void;
  resetFilters: () => void;
  setFilterVisibility: (visible: boolean) => void;
}

// Create the store with initial values
const useHotelFilterStore = create<HotelFilterState>((set) => ({
  // Default price range
  priceRange: {
    min: 0,
    max: 50000,
    currentMin: 0,
    currentMax: 50000,
  },
  
  // No star ratings selected by default
  starRatings: [],
  
  // Default inclusions (will be populated from API data)
  inclusions: [
    { id: 'breakfast', name: 'Breakfast', selected: false },
    { id: 'wifi', name: 'Free WiFi', selected: false },
    { id: 'parking', name: 'Parking', selected: false },
    { id: 'pool', name: 'Swimming Pool', selected: false },
    { id: 'gym', name: 'Fitness Center', selected: false },
    { id: 'spa', name: 'Spa', selected: false },
  ],
  
  // Filter visibility
  isFilterVisible: false,
  
  // Set the min and max price range
  setPriceRange: (min, max) => set((state) => ({
    priceRange: {
      ...state.priceRange,
      min,
      max,
      currentMin: min,
      currentMax: max,
    },
  })),
  
  // Update the current price range (when slider moves)
  updateCurrentPriceRange: (currentMin, currentMax) => set((state) => ({
    priceRange: {
      ...state.priceRange,
      currentMin,
      currentMax,
    },
  })),
  
  // Toggle a star rating selection
  toggleStarRating: (rating) => set((state) => {
    const isSelected = state.starRatings.includes(rating);
    return {
      starRatings: isSelected
        ? state.starRatings.filter((r) => r !== rating)
        : [...state.starRatings, rating].sort(),
    };
  }),
  
  // Toggle an inclusion selection
  toggleInclusion: (id) => set((state) => ({
    inclusions: state.inclusions.map((inclusion) =>
      inclusion.id === id
        ? { ...inclusion, selected: !inclusion.selected }
        : inclusion
    ),
  })),
  
  // Set available inclusions from API data
  setInclusions: (newInclusions) => set((state) => ({
    inclusions: newInclusions.map((inclusion) => ({
      ...inclusion,
      selected: false,
    })),
  })),
  
  // Reset all filters to default values
  resetFilters: () => set((state) => ({
    priceRange: {
      ...state.priceRange,
      currentMin: state.priceRange.min,
      currentMax: state.priceRange.max,
    },
    starRatings: [],
    inclusions: state.inclusions.map((inclusion) => ({
      ...inclusion,
      selected: false,
    })),
  })),
  
  // Set filter visibility
  setFilterVisibility: (visible) => set({
    isFilterVisible: visible,
  }),
}));

export default useHotelFilterStore;