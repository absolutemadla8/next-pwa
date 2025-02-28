interface Guest {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    isdCode: number;
    contactNumber: number | null;
    panCardNumber: string | null;
    passportNumber: string | null;
    passportExpiry: Date | null;
}

interface RoomAllocation {
    rateId: string;
    roomId: string;
    guests: Guest[];
}

export interface RoomAllocationPayload {
    traceId: string;
    roomsAllocations: RoomAllocation[];
}