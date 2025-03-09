import {create} from 'zustand';
import { RoomData } from '../types/itinerary';
import { api } from '../lib/axios';

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
    setRooms: (rooms: any[]) => void; // Function to set rooms
    setTraceId: (traceId: string) => void; // Function to set traceId
    setItineraryId: (itineraryId: string) => void; // Function to set itineraryId
    setSessionId: (sessionId: string) => void; // Function to set sessionId
    setType: (type: {type:string;code:string}) => void; // Function to set item type
    clearRooms: () => void; // Function to clear rooms
    addSelectedRateId: (rateId: string) => void; // Add a rate ID to the selection
    clearSelectedRateIds: () => void; // Clear selected rate IDs
    getSelectedRateIds: () => string[]; // Get all selected rate IDs
    fetchCompatibleRates: (rateId: string, previousRateIds?: string[]) => Promise<any[]>; // Get compatible rates
    validateRateSelection: (rateIds: string[]) => Promise<boolean>; // Validate final selection
    setCompatibleRates: (rates: any[]) => void; // Set compatible rates
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
    
    // Function to fetch compatible rates
    fetchCompatibleRates: async (rateId: string, previousRateIds = []) => {
        try {
            console.log(`Fetching compatible rates for rate: ${rateId}, previous rates: ${previousRateIds.join(',')}`);
            
            // Construct the API request
            const payload = {
                rateId: rateId,
                previousRateIds: previousRateIds
            };
            
            const sessionId = get().sessionId;
            const response = await api.post(`/hotels/session/${sessionId}/compatible-rates`, payload);
            
            if (response?.data) {
                //@ts-ignore mlmr
                if (response.data.compatibleRecommendations && 
                     //@ts-ignore mlmr
                    response.data.compatibleRecommendations.length > 0 && 
                     //@ts-ignore mlmr
                    response.data.compatibleRecommendations[0].rooms) {
                     //@ts-ignore mlmr
                    const compatibleRooms = response.data.compatibleRecommendations[0].rooms;
                    console.log("Compatible rates received from recommendations:", compatibleRooms);
                    get().setCompatibleRates(compatibleRooms);
                    return compatibleRooms;
                } 
                // Fallback to direct rooms array if present
                 //@ts-ignore mlmr
                else if (response.data.rooms) {
                     //@ts-ignore mlmr
                    console.log("Compatible rates received directly:", response.data.rooms);
                     //@ts-ignore mlmr
                    get().setCompatibleRates(response.data.rooms);
                     //@ts-ignore mlmr
                    return response.data.rooms;
                }
            }
            
            console.error("Invalid response format for compatible rates");
            return [];
        } catch (error) {
            console.error("Error fetching compatible rates:", error);
            return [];
        }
    },
    
    // Function to validate rate selection
    validateRateSelection: async (rateIds: string[]) => {
        try {
            console.log(`Validating rate selection: ${rateIds.join(',')}`);
            
            // Construct the API request
            const payload = {
                selectedRateIds: rateIds
            };
            
            const sessionId = get().sessionId;
            const response = await api.post(`/hotels/session/${sessionId}/validate-selection`, payload);
            
            if (response?.data) {
                console.log("Rate validation result:", response.data);
                //@ts-expect-error mlmr
                return response.data.valid === true;
            }
            
            return false;
        } catch (error) {
            console.error("Error validating rate selection:", error);
            return false;
        }
    }
}));