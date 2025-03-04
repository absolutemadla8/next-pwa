// store/useBottomSheetStore.ts
'use client';

import { create } from 'zustand';

// Define all possible bottom sheet IDs
type BottomSheetId = 'dateRange' | 'search' | 'roomConfig' | 'error' | 'passportExpiry' | 'amenities' | 'policies' | null;

// Define configuration options for bottom sheets
interface SheetConfig {
  title: string;
  minHeight: string;
  maxHeight: string;
  showPin: boolean;
}

// Interface for error data
interface ErrorData {
  message: string;
  details?: string;
  code?: string | number;
}

// Define the state and actions for the bottom sheet store
interface BottomSheetState {
  // Currently active sheet (null if none are open)
  activeSheet: BottomSheetId;
  
  // Sheet configuration options
  sheetConfig: SheetConfig;
  
  // Error data for error sheet
  errorData: ErrorData | null;
  
  // Sheet methods
  openSheet: (id: BottomSheetId, config?: Partial<SheetConfig>) => void;
  closeSheet: () => void;
  toggleSheet: (id: BottomSheetId, config?: Partial<SheetConfig>) => void;
  showError: (error: ErrorData) => void;
}

const useBottomSheetStore = create<BottomSheetState>((set) => ({
  // Initial state
  activeSheet: null,
  errorData: null,
  
  // Default sheet configuration
  sheetConfig: {
    minHeight: '50vh',
    maxHeight: '90vh',
    showPin: false,
    title: 'Trippy ActionSheet'
  },
  
  // Open a sheet with optional configuration
  openSheet: (id, config) => set((state) => ({ 
    activeSheet: id,
    sheetConfig: {
      ...state.sheetConfig,
      ...config
    }
  })),
  
  // Close the currently active sheet
  closeSheet: () => set({ activeSheet: null }),
  
  // Toggle a sheet (open if closed, close if open)
  toggleSheet: (id, config) => set((state) => ({
    activeSheet: state.activeSheet === id ? null : id,
    sheetConfig: {
      ...state.sheetConfig,
      ...config
    }
  })),
  
  // Show error sheet with error data
  showError: (error) => set({
    activeSheet: 'error',
    errorData: error,
    sheetConfig: {
      title: 'Error',
      minHeight: '30vh',
      maxHeight: '50vh',
      showPin: false
    }
  }),
}));

export default useBottomSheetStore;