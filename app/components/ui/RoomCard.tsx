import React from 'react';
import { Check, ArrowUpCircle } from 'lucide-react';
import SeeMoreText from './SeeMoreText';
import LoadingButton from './LoadingButton';

interface Image {
    url: string;
    caption?: string | null;
    alt?: string | null;
}

export interface Room {
    id: string;
    name: string;
    boardType: 'AI' | 'BB' | 'RO'; // All Inclusive, Bed & Breakfast, Room Only
    description?: string;
    minPrice?: number;
    type?: string;
    rates?: any[];
    area?: any;
    recommendationId?: string | null;
  }

interface RoomCardProps {
    room: Room;
    showPrice?: boolean;
    price?: number;
    hotelName?: string;
    hotelLocation?: string;
    onSelect?: () => void;
    isLoading?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ 
    room, 
    showPrice = false, 
    price = 0,
    hotelName = 'Hotel Name',
    hotelLocation = 'Location',
    onSelect,
    isLoading = false
}) => {
    const boardTypeLabels: Record<string, string> = {
        'BB': 'Free Breakfast',
        'HB': 'Half Board',
        'FB': 'Full Board',
        'AI': 'All Inclusive',
        'RO': 'Room Only'
    };

    // Determine room type from either name or type property
    const roomName = room?.name || room?.type || "Room";

    // Get board type from API response or use default
    let boardType = room?.boardType || 'RO';
    
    // Map All Inclusive from API to our internal type
    if (room?.rates && room.rates.length > 0 && 
        room.rates[0].boardBasis && 
        room.rates[0].boardBasis.type === "AllInclusive") {
        boardType = 'AI';
    }

    // Get price from the API response if available
    const roomPrice = price || 
        (room?.minPrice || 
        (room?.rates && room.rates.length > 0 ? room.rates[0].finalRate : 0));

    // Format price with comma separators
    const formattedPrice = typeof roomPrice === 'number' 
        ? roomPrice.toLocaleString() 
        : roomPrice;

    // Function to strip HTML tags from description
    const stripHtml = (html: string) => {
        return html.replace(/<[^>]*>?/gm, '');
    };

    // Process description if necessary
    const processedDescription = room?.description 
        ? stripHtml(room.description)
        : '';

    return (
        <div className='flex flex-col bg-white rounded-xl overflow-hidden w-80 shadow-sm border border-gray-100'>
            {/* <img 
                src={roomImage} 
                alt={roomName} 
                className="w-full h-[180px] object-cover"
            /> */}
            <div className='flex flex-col p-4 gap-y-3 w-full'>
                <div className='flex flex-col'>
                    <h1 className='text-sm font-semibold text-primary lowercase truncate'>
                        {hotelName}
                    </h1>
                    <p className='text-xs font-medium text-gray-500 truncate'>
                        {hotelLocation}
                    </p>
                </div>
                
                <hr className='border-t border-gray-200' />
                
                <div className='flex flex-col space-y-1'>
                    <p className='text-xs font-medium text-blue-600'>Room Type</p>
                    <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-md text-primary truncate w-[95%]'>
                        {roomName}
                    </h1>
                    
                    <div className='flex items-center gap-x-1 max-w-full'>
                        <Check className='text-green-600' />
                        <p className='text-xs font-medium text-green-600 truncate'>
                            {boardTypeLabels[boardType]}
                        </p>
                    </div>
                    
                    {processedDescription && (
                        <div className='flex flex-wrap w-full'>
                            <SeeMoreText maxLength={80} text={processedDescription} />
                        </div>
                    )}
                    <div className='flex flex-row gap-x-2 w-full items-center justify-between'>
                        {showPrice && roomPrice > 0 && (
                            <div className='flex flex-col pt-2'>
                                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-md text-primary'>
                                ₹{formattedPrice}
                                </h1>
                                <p className='text-xs font-medium text-gray-500'>
                                    total inclusive of tax
                                </p>
                            </div>
                        )}
                        <LoadingButton
                            text='Select'
                            type='button'
                            loading={isLoading}
                            onClick={onSelect}
                            className="flex items-center gap-x-2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-700 transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomCard;