import { create } from 'zustand';

interface HotelStoreState {
  hotel: any;
  isLoading: boolean;
  error: string | null;
  setHotel: (hotel: any) => void;
  setLoading: (status: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;
}

export const useHotelStore = create<HotelStoreState>((set) => ({
  hotel: null,
  isLoading: false,
  error: null,

  setHotel: (hotel) => set({ hotel }),
  setLoading: (status) => set({ isLoading: status }),
  setError: (error) => set({ error }),
  resetStore: () =>
    set({
      hotel: null,
      isLoading: false,
      error: null,
    }),
}));