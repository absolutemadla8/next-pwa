import { create } from 'zustand';

interface DealStoreState {
  deal: any;
  isLoading: boolean;
  error: string | null;
  setDeal: (deal: any) => void;
  setLoading: (status: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;
}

export const useDealStore = create<DealStoreState>((set) => ({
  deal: null,
  isLoading: false,
  error: null,

  setDeal: (deal) => set({ deal }),
  setLoading: (status) => set({ isLoading: status }),
  setError: (error) => set({ error }),
  resetStore: () =>
    set({
      deal: null,
      isLoading: false,
      error: null,
    }),
}));