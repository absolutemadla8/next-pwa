export interface RoomRateAllocation {
    rateId: string;
    roomId: string;
    occupancy: {
      adults: number;
      children?: number;
    };
  }
  
  export interface Item {
    code: string;
    type: 'HOTEL';
  }
  
  export interface SelectRoomRatesPayload {
    roomsAndRateAllocations: RoomRateAllocation[];
    journeyId: string;
    recommendationId: string;
  }