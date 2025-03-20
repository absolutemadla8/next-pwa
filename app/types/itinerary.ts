export interface CreateItineraryPayload {
    hotelId: string;
    traceId: string;
  }

// Type for Room Area
interface RoomArea {
    squareMeters: number;
    squareFeet: number;
}

// Type for Room Facility
interface RoomFacility {
    name: string;
}

// Type for Room Rate Info
export interface RoomRateInfo {
    rateId: string;
    recommendationId: string;
    roomId: string;
    refundable: boolean;
    payAtHotel: boolean;
    baseRate: number;
    taxAmount: number;
    finalRate: number;
    currency: string;
    boardBasis: {
        description: string;
        type: string;
    };
    policies: string[];
    cancellationPolicies: any[]; // Replace 'any' with a more specific type if possible
    includes: string[];
    onlineCancellable: boolean;
    specialRequestSupported: boolean;
    bestValue: boolean;
    bestValueExplanation: string;
}

interface Links {
    url: string;
    size: string;
}

interface Images {
    links: Links[];
    caption: string;
}

// Type for Room Data
export interface RoomData {
    id: string;
    type: string;
    description: string;
    area: RoomArea;
    maxGuestAllowed: number;
    maxAdultAllowed: number;
    maxChildrenAllowed: number;
    facilities: RoomFacility[];
    views: string[];
    images: Images[]; // Assuming images are URLs as strings
    rates: RoomRateInfo[];
    minPrice: number;
}

// Type for the API Response
export interface CreateItineraryResponse {
    status: string;
    data: {
        itineraryCode: string;
        traceId: string;
        item:{
            type: string;
            code: string;
        }
        rooms: RoomData[];
    }
    message: string;
}