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

interface HotelSearchStoreState {
  hotels: any;
  isLoading: boolean;
  error: string | null;
  setHotels: (hotels: any) => void;
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

export const useHotelSearchStore = create<HotelSearchStoreState>((set) => ({
  hotels: [],
  isLoading: false,
  error: null,
  setHotels: (hotels) => set({ hotels }),
  setLoading: (status) => set({ isLoading: status }),
  setError: (error) => set({ error }),
  resetStore: () =>
    set({
      hotels: [],
      isLoading: false,
      error: null,
    }),
}));