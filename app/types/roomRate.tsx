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
    traceId?: string;
    recommendationId: string;
    items?: Item[];
  }