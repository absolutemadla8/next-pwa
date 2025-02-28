import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';

// Define the type for a single room in the itinerary
interface Room {
  id: string; // Unique ID for the room
  adults: number; // Number of adults in the room (max 3)
  children: { age: number }[]; // Array of child ages (max 2 children)
  rateId: string | null; // Rate ID for this specific room
  roomId: string | null; // Room ID for this specific room
  price: number; // Price for this room
}

// Define the type for the itinerary
interface Itinerary {
  id: string; // Unique ID for the itinerary
  locationId: string | number | null; // Location ID
  locationName: string | null; // Location name
  type: 'Hotel' | 'City' | string; // Type of location
  city?: string; // City name
  state?: string; // State name
  country?: string; // Country name
  travclanScore?: number; // Travclan score
  hotelId: string | number | null; // Hotel ID
  recommendationId: string | null; // Recommendation ID is global to the itinerary
  rooms: Room[]; // List of rooms in the itinerary
  checkIn: Date | null;
  checkOut: Date | null;
}

// Define the type for the store state and actions
interface ItineraryStore {
  itinerary: Itinerary; // The current itinerary
  setLocationDetails: (locationDetails: Pick<Itinerary, 'locationId' | 'locationName' | 'type' | 'city' | 'state' | 'country' | 'travclanScore' | 'hotelId'>) => void; // Set location details
  setRecommendationId: (recommendationId: string | null) => void; // Set recommendation ID for the itinerary
  setRoomDetails: (roomId: string, details: Pick<Room, 'rateId' | 'roomId' | 'price'>) => void; // Set room details for a specific room
  addRoomToItinerary: () => void; // Add a room to the itinerary
  removeRoomFromItinerary: (roomId: string) => void; // Remove a room from the itinerary
  increaseAdultsInRoom: (roomId: string) => void; // Increase adults in a specific room
  decreaseAdultsInRoom: (roomId: string) => void; // Decrease adults in a specific room
  addChildToRoom: (roomId: string, age: number) => void; // Add a child to a specific room
  removeChildFromRoom: (roomId: string, index: number) => void; // Remove a child from a specific room
  setDates: (checkIn: Date | null, checkOut: Date | null) => void;
  getTotalAdults: () => number; // Get total number of adults across all rooms
  getTotalChildren: () => number; // Get total number of children across all rooms
  getTotalRooms: () => number; // Get total number of rooms
  getOccupancies: () => { numOfAdults: number; childAges: number[]; rateId: string | null; roomId: string | null; }[]; // Get occupancy data for all rooms
  getNumberOfNights: () => number; // Get number of nights between check-in and check-out dates
  getTotalPrice: () => number; // Get total price across all rooms
}

// Custom storage handler to properly parse dates from JSON
const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const str = localStorage.getItem(name);
    return str;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    localStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    localStorage.removeItem(name);
  },
};

// Create the Zustand store with persistence
export const useItineraryStore = create<ItineraryStore>()(
  persist(
    (set, get) => ({
      // Initialize with a default itinerary
      itinerary: {
        id: `itinerary-${Date.now()}`,
        locationId: null,
        locationName: null,
        type: 'Hotel',
        city: undefined,
        state: undefined,
        country: undefined,
        travclanScore: undefined,
        hotelId: null,
        recommendationId: null,
        rooms: [],
        checkIn: null,
        checkOut: null,
      },

      setLocationDetails: (locationDetails) => set((state) => ({
        itinerary: {
          ...state.itinerary,
          ...locationDetails
        }
      })),

      setRecommendationId: (recommendationId) => set((state) => ({
        itinerary: {
          ...state.itinerary,
          recommendationId
        }
      })),

      setDates: (checkIn, checkOut) => set((state) => ({
        itinerary: {
          ...state.itinerary,
          checkIn,
          checkOut
        }
      })),

      // Set details for a specific room
      setRoomDetails: (roomId: string, details) => set((state) => ({
        itinerary: {
         ...state.itinerary,
         rooms: state.itinerary.rooms.map((room) =>
            room.id === roomId ? { ...room, ...details } : room
         )
        }
      })),

      // Add a room to the itinerary
      addRoomToItinerary: () =>
        set((state) => ({
          itinerary: {
            ...state.itinerary,
            rooms: [
              ...state.itinerary.rooms,
              {
                id: `room-${Date.now()}`,
                adults: 1,
                children: [],
                rateId: null,
                roomId: null,
                price: 0,
              },
            ],
          },
        })),

      // Remove a room from the itinerary
      removeRoomFromItinerary: (roomId: string) =>
        set((state) => ({
          itinerary: {
            ...state.itinerary,
            rooms: state.itinerary.rooms.filter((room) => room.id !== roomId),
          },
        })),

      // Increase the number of adults in a specific room
      increaseAdultsInRoom: (roomId: string) =>
        set((state) => ({
          itinerary: {
            ...state.itinerary,
            rooms: state.itinerary.rooms.map((room) =>
              room.id === roomId && room.adults < 3
                ? { ...room, adults: room.adults + 1 }
                : room
            ),
          },
        })),

      // Decrease the number of adults in a specific room
      decreaseAdultsInRoom: (roomId: string) =>
        set((state) => ({
          itinerary: {
            ...state.itinerary,
            rooms: state.itinerary.rooms.map((room) =>
              room.id === roomId && room.adults > 0
                ? { ...room, adults: room.adults - 1 }
                : room
            ),
          },
        })),

      // Add a child to a specific room
      addChildToRoom: (roomId: string, age: number) =>
        set((state) => ({
          itinerary: {
            ...state.itinerary,
            rooms: state.itinerary.rooms.map((room) =>
              room.id === roomId && room.children.length < 2
                ? { ...room, children: [...room.children, { age }] }
                : room
            ),
          },
        })),

      // Remove a child from a specific room
      removeChildFromRoom: (roomId: string, index: number) =>
        set((state) => ({
          itinerary: {
            ...state.itinerary,
            rooms: state.itinerary.rooms.map((room) =>
              room.id === roomId
                ? {
                    ...room,
                    children: room.children.filter((_, i) => i !== index),
                  }
                : room
            ),
          },
        })),

      // Get total number of adults across all rooms
      getTotalAdults: () => {
        const state = get();
        return state.itinerary.rooms.reduce((total, room) => total + room.adults, 0);
      },

      // Get total number of children across all rooms
      getTotalChildren: () => {
        const state = get();
        return state.itinerary.rooms.reduce((total, room) => total + room.children.length, 0);
      },

      // Get total number of rooms
      getTotalRooms: () => {
        const state = get();
        return state.itinerary.rooms.length;
      },

      // Get occupancies data for all rooms
      getOccupancies: () => {
        const state = get();
        return state.itinerary.rooms.map(room => ({
          numOfAdults: room.adults,
          childAges: room.children.map(child => child.age),
          rateId: room.rateId,
          roomId: room.roomId,
        }));
      },

      // Get number of nights between check-in and check-out dates
      getNumberOfNights: () => {
        const state = get();
        const { checkIn, checkOut } = state.itinerary;
        
        if (!checkIn || !checkOut) return 0;
        
        const diffTime = checkOut.getTime() - checkIn.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
      },

      // Get total price across all rooms
      getTotalPrice: () => {
        const state = get();
        return state.itinerary.rooms.reduce((total, room) => total + room.price, 0);
      },
    }),
    {
      name: 'itinerary-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => {
        // Exclude rooms and recommendationId from persistence
        const { itinerary } = state;
        const { rooms, recommendationId, ...persistedItineraryData } = itinerary;
        
        return {
          itinerary: {
            ...persistedItineraryData,
            // Keep empty arrays for rooms and null for recommendationId
            rooms: [],
            recommendationId: null,
          }
        };
      },
      // Custom hydration function to handle Date objects
      onRehydrateStorage: () => (state) => {
        // Convert string dates back to Date objects if they exist
        if (state && state.itinerary) {
          if (state.itinerary.checkIn && typeof state.itinerary.checkIn === 'string') {
            state.itinerary.checkIn = new Date(state.itinerary.checkIn);
          }
          if (state.itinerary.checkOut && typeof state.itinerary.checkOut === 'string') {
            state.itinerary.checkOut = new Date(state.itinerary.checkOut);
          }
        }
      }
    }
  )
);

export default useItineraryStore;