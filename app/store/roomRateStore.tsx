import {create} from 'zustand';

// Define the Zustand store
export const useRoomStore = create<{
    rooms: any[]; // Array of RoomData
    itineraryId: string; // Assuming itineraryId is a string
    traceId: string; // Assuming traceId is a string
    sessionId: string; // Session ID for multi-room selection
    selectedRateIds: string[]; // Array of selected rate IDs
    type:{
        type:string;
        code:string;
    };
    compatibleRates: any[]; // Compatible rooms for next selection
    recommendations: any[]; // Recommendations for rooms
    setRooms: (rooms: any[]) => void; // Function to set rooms
    setTraceId: (traceId: string) => void; // Function to set traceId
    setItineraryId: (itineraryId: string) => void; // Function to set itineraryId
    setSessionId: (sessionId: string) => void; // Function to set sessionId
    setType: (type: {type:string;code:string}) => void; // Function to set item type
    clearRooms: () => void; // Function to clear rooms
    addSelectedRateId: (rateId: string) => void; // Add a rate ID to the selection
    clearSelectedRateIds: () => void; // Clear selected rate IDs
    getSelectedRateIds: () => string[]; // Get all selected rate IDs
    setCompatibleRates: (rates: any[]) => void; // Set compatible rates
    setRecommendations: (recommendations: any[]) => void; // Set recommendations
}>((set, get) => ({
    rooms: [], // Initial state: empty array of rooms
    itineraryId: '', // Initial empty string for itineraryId
    traceId: '', // Initial empty string for traceId
    sessionId: '', // Initial empty string for sessionId
    selectedRateIds: [], // Initial empty array for selected rate IDs
    type: { // Initial type object
        type: '',
        code: ''
    },
    compatibleRates: [], // Initial empty array for compatible rates
    recommendations: [], // Initial empty array for recommendations

    // Function to set rooms
    setRooms: (rooms: any[]) => {
        set({ rooms });
    },
    
    // Function to set traceId
    setTraceId: (traceId: string) => {
        set({ traceId });
    },
    
    // Function to set itineraryId
    setItineraryId: (itineraryId: string) => {
        set({ itineraryId });
    },
    
    // Function to set sessionId
    setSessionId: (sessionId: string) => {
        set({ sessionId });
    },
    
    // Function to set type
    setType: (type: {type:string;code:string}) => {
        set({ type });
    },

    // Function to clear rooms
    clearRooms: () => {
        set({ rooms: [] });
    },
    
    // Function to add a selected rate ID
    addSelectedRateId: (rateId: string) => {
        set((state) => ({
            selectedRateIds: [...state.selectedRateIds, rateId]
        }));
    },
    
    // Function to clear selected rate IDs
    clearSelectedRateIds: () => {
        set({ selectedRateIds: [] });
    },
    
    // Function to get selected rate IDs
    getSelectedRateIds: () => {
        return get().selectedRateIds;
    },
    
    // Function to set compatible rates
    setCompatibleRates: (rates: any[]) => {
        set({ compatibleRates: rates });
    },
    
    // Function to set recommendations
    setRecommendations: (recommendations: any[]) => {
        set({ recommendations });
    }
}));