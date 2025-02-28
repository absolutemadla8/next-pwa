// store/useBottomSheetStore.ts
'use client';

import { create } from 'zustand';

// Define all possible bottom sheet IDs
type BottomSheetId = 'dateRange' | 'search' | 'roomConfig' | null;

// Define configuration options for bottom sheets
interface SheetConfig {
  title: string;
  minHeight: string;
  maxHeight: string;
  showPin: boolean;
}

// Define the state and actions for the bottom sheet store
interface BottomSheetState {
  // Currently active sheet (null if none are open)
  activeSheet: BottomSheetId;
  
  // Sheet configuration options
  sheetConfig: SheetConfig;
  
  // Sheet methods
  openSheet: (id: BottomSheetId, config?: Partial<SheetConfig>) => void;
  closeSheet: () => void;
  toggleSheet: (id: BottomSheetId, config?: Partial<SheetConfig>) => void;
}

const useBottomSheetStore = create<BottomSheetState>((set) => ({
  // Initial state
  activeSheet: null,
  
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
}));

export default useBottomSheetStore;