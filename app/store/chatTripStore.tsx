import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ChatTripState {
  tripId: string | null;
  setTripId: (id: string) => void;
  clearTripId: () => void;
}

const useChatTripStore = create<ChatTripState>()(
  persist(
    (set) => ({
      tripId: null,
      setTripId: (id) => set({ tripId: id }),
      clearTripId: () => set({ tripId: null }),
    }),
    {
      name: 'chat-trip-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useChatTripStore;
