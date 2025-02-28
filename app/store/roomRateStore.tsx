import {create} from 'zustand';
import { RoomData } from '../types/itinerary';

// Define the Zustand store
export const useRoomStore = create<{
    rooms: RoomData[]; // Array of RoomData
    itineraryId: string; // Assuming itineraryId is a string
    traceId: string; // Assuming traceId is a string
    type:{
        type:string;
        code:string;
    };
    setRooms: (rooms: RoomData[]) => void; // Function to set rooms
    setTraceId: (traceId: string) => void; // Function to set traceId
    setItineraryId: (itineraryId: string) => void; // Function to set itineraryId
    setType: (type: {type:string;code:string}) => void; // Function to set itineraryId
    clearRooms: () => void; // Function to clear rooms
}>((set) => ({
    rooms: [], // Initial state: empty array of rooms
    itineraryId: '', // Initial empty string for itineraryId
    traceId: '', // Initial empty string for traceId
    type: { // Initial type object
        type: '',
        code: ''
    },

    // Function to set rooms
    setRooms: (rooms: RoomData[]) => {
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
    setType: (type: {type:string;code:string}) => {
        set({ type });
    },

    // Function to clear rooms
    clearRooms: () => {
        set({ rooms: [] });
    },
}));