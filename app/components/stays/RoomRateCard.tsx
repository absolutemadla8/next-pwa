'use client'
import { Switch } from '@headlessui/react'
import { Frame, User } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import AnimatedButton from '../ui/AnimatedButton'
import useItineraryStore from '@/app/store/itineraryStore'
import { formatDate } from '@/app/lib/utils'

interface RoomRateCardProps {
  room: any;
  onBookNow: (
    roomId: string, 
    rateId: string, 
    recommendationId: string, 
    price: number
  ) => void;
  selectedRateId?: string; // Add optional prop to track which rate is selected
  roomIndex?: number; // Add optional prop to track which room index we're selecting
  isMultiRoom?: boolean; // Flag to indicate if we're in multi-room selection mode
}

const RoomRateCard: React.FC<RoomRateCardProps> = ({
  room,
  onBookNow,
  selectedRateId,
  roomIndex = 0, // Default to first room if not specified
  isMultiRoom = false // Default to single room mode
}) => {
  const {itinerary} = useItineraryStore()
  const [boardTypeRates, setBoardTypeRates] = useState<Record<string, any[]>>({});
  const [selectedRateIds, setSelectedRateIds] = useState<Record<string, string>>({});
  const [onlyRefundableRates, setOnlyRefundableRates] = useState<any[]>([]);

  // Process room rates on component mount or when room changes
  useEffect(() => {
    if (room && room.rates && room.rates.length > 0) {
      // Group rates by board type
      const grouped: Record<string, any[]> = {};
      const initialSelectedRateIds: Record<string, string> = {};
      const refundableOnlyRates: any[] = [];
      
      room.rates.forEach((rate: any) => {
        const boardType = rate.boardBasis.type;
        if (!grouped[boardType]) {
          grouped[boardType] = [];
        }
        grouped[boardType].push(rate);
      });
      
      // For each board type, determine if it has both refundable and non-refundable options
      Object.entries(grouped).forEach(([boardType, rates]) => {
        const hasRefundable = rates.some(rate => rate.refundable);
        const hasNonRefundable = rates.some(rate => !rate.refundable);
        
        // If only refundable rates exist for this board type, add to separate list
        if (hasRefundable && !hasNonRefundable) {
          // Find the best refundable rate (could be lowest price or best terms)
          const bestRefundableRate = rates.find(rate => rate.refundable);
          if (bestRefundableRate) {
            refundableOnlyRates.push(bestRefundableRate);
          }
          // Remove this board type from the main grouped rates
          delete grouped[boardType];
        } else {
          // For board types with both options, set initial selection 
          // (prefer refundable if available)
          const refundableRate = rates.find(rate => rate.refundable);
          const initialRate = refundableRate || rates[0];
          initialSelectedRateIds[boardType] = initialRate.rateId;
        }
      });
      
      setBoardTypeRates(grouped);
      setSelectedRateIds(initialSelectedRateIds);
      setOnlyRefundableRates(refundableOnlyRates);
    }
  }, [room]);

  // Toggle between refundable and non-refundable rates for a board type
  const toggleRefundable = (boardType: string) => {
    const rates = boardTypeRates[boardType] || [];
    const currentRateId = selectedRateIds[boardType];
    const currentRate = rates.find(rate => rate.rateId === currentRateId);
    
    if (!currentRate) return;
    
    // Find a rate with the opposite refundable status
    const targetRefundable = !currentRate.refundable;
    const alternateRate = rates.find(rate => rate.refundable === targetRefundable);
    
    if (alternateRate) {
      // Update the selected rate ID
      setSelectedRateIds({
        ...selectedRateIds,
        [boardType]: alternateRate.rateId
      });
      
      // Only call onBookNow if this is the rate that's currently selected in the itinerary
      // or if we don't have a selected rate yet
      if (itinerary.rooms[roomIndex]?.rateId === currentRate.rateId || !itinerary.rooms[roomIndex]?.rateId) {
        onBookNow(
          room.id,
          alternateRate.rateId,
          alternateRate.recommendationId,
          alternateRate.finalRate
        );
      }
    }
  };

  // Function to get cancellation date from policies
  const getCancellationDate = (rate: any) => {
    if (!rate || !rate.cancellationPolicies || 
        !rate.cancellationPolicies[0] || 
        !rate.cancellationPolicies[0].rules || 
        !rate.cancellationPolicies[0].rules[0]) {
      return 'Check-in date';
    }
    
    // For refundable rates, find the first rule that has a 0 value (free cancellation)
    if (rate.refundable) {
      const freeRule = rate.cancellationPolicies[0].rules.find((rule: any) => 
        rule.value === 0 || rule.estimatedValue === 0
      );
      
      if (freeRule && freeRule.end) {
        return formatDate(new Date(freeRule.end));
      }
    }
    
    return 'Check-in date';
  };

  // Get image URL from room
  const getImageUrl = () => {
    if (room.images && room.images.length > 0 && 
        room.images[0].links && room.images[0].links.length > 0) {
      // Find the largest image (prefer XXL, fallback to standard)
      const xxlImage = room.images[0].links.find((link: any) => link.size === 'Xxl');
      const standardImage = room.images[0].links.find((link: any) => link.size === 'Standard');
      
      return xxlImage ? xxlImage.url : (standardImage ? standardImage.url : '/placeholder-room.jpg');
    }
    return "https://often-public-assets.blr1.cdn.digitaloceanspaces.com/altimagehotels.png";
  };

  // Check if both refundable and non-refundable options exist for a specific board type
  const hasBothRefundableOptions = (boardType: string) => {
    const rates = boardTypeRates[boardType] || [];
    const hasRefundable = rates.some(rate => rate.refundable);
    const hasNonRefundable = rates.some(rate => !rate.refundable);
    return hasRefundable && hasNonRefundable;
  };

  // Get the currently selected rate for a board type
  const getSelectedRate = (boardType: string) => {
    const rates = boardTypeRates[boardType] || [];
    const rateId = selectedRateIds[boardType];
    return rates.find(rate => rate.rateId === rateId) || null;
  };

  // If no room or no rates, return empty
  if (!room || !room.rates || room.rates.length === 0 || 
      (Object.keys(boardTypeRates).length === 0 && onlyRefundableRates.length === 0)) {
    return null;
  }

  return (
    <div className='flex flex-col items-start justify-start w-full bg-white rounded-xl overflow-hidden gap-y-1'>
      {/* Room Information Section - Common for all rates */}
      <div className='flex flex-col items-start justify-start w-full bg-white rounded-xl overflow-hidden border-2 border-white'>
        <img src={getImageUrl()} alt={room.type} className='w-full h-32 object-cover' />
        <div className='flex flex-col items-start justify-start p-4 gap-y-2'>
          <div className='flex flex-row items-start justify-start gap-x-4'>
            <div className='flex flex-row items-center justify-start gap-x-1'>
              <Frame size={14} className='text-slate-600' />
              <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-xs text-slate-600 font-normal tracking-tight truncate'>
                {room.area && room.area.squareFeet > 0 ? `${room.area.squareFeet} sq.ft` : '---'}
              </span>
            </div>
            <div className='flex flex-row items-center justify-start gap-x-1'>
              <User size={14} className='text-slate-600' />
              <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-xs text-slate-600 font-normal tracking-tight truncate'>
                Max {room.maxAdultAllowed || 2} Adults
              </span>
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg text-blue-950 w-full lowercase'>
            {room.type || room.roomType}
          </h1>
          <span className='text-xs text-slate-600 font-normal tracking-tight line-clamp-6'>
            {room.description && room.description.startsWith('<p>') 
              ? <div dangerouslySetInnerHTML={{ __html: room.description }} className="text-xs" />
              : room.description}
          </span>
        </div>
      </div>
      
      {/* Rate Cards - One for each board type with both refundable options */}
      {Object.keys(boardTypeRates).map((boardType) => {
        const selectedRate = getSelectedRate(boardType);
        
        if (!selectedRate) return null;
        
        return (
          <div key={boardType} className='flex flex-col items-start justify-start w-full bg-white overflow-hidden p-4 border-t border-slate-300'>
            {/* Board Type Header */}
            <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg text-blue-950 w-full lowercase'>
              {selectedRate.boardBasis.description}
            </h1>
            
            {/* Refundable Toggle - only show if both options exist for this board type */}
            {hasBothRefundableOptions(boardType) && (
              <div className='flex flex-row items-center justify-start gap-x-2 bg-gradient-to-r from-[#D6EFDD] to-white w-full rounded-lg p-4'>
                <Switch
                  checked={selectedRate.refundable}
                  onChange={() => toggleRefundable(boardType)}
                  className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-800 transition data-[checked]:bg-green-600"
                >
                  <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
                </Switch>
                <div className='flex flex-row items-center justify-start gap-x-1'>
                  <span className='text-xs text-slate-700 font-normal tracking-tight truncate'>
                  Free cancellation
                  </span>
                  {selectedRate.refundable && (
                    <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-xs text-green-600 font-normal tracking-tight truncate mt-[1px]'>
                      till {getCancellationDate(selectedRate)}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Inclusions - show if available */}
            {selectedRate.includes && selectedRate.includes.length > 0 && (
              <div className='flex flex-col w-full mt-3'>
                <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-sm text-blue-950 mb-1'>
                  Includes:
                </h2>
                <div className='flex flex-row flex-wrap gap-x-2 gap-y-1'>
                  {selectedRate.includes.map((inclusion: string, index: number) => (
                    <span key={index} className='text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded'>
                      {inclusion}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Price Information */}
            <div className='flex flex-col items-start justify-start pt-3'>
              <div className='flex flex-row items-center justify-start gap-x-2'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg text-blue-950'>
                  Rs.{selectedRate.finalRate.toLocaleString()}
                </h1>
                <span className='text-xs text-slate-600 font-normal tracking-tight truncate'>
                  total per room
                </span>
              </div>
              <span className='text-xs text-teal-600 font-normal tracking-tight truncate'>
                Inclusive of taxes and fee
              </span>
            </div>
            
            {/* Book Now Button */}
            <div className='w-full pt-3'>
              <AnimatedButton 
                variant={selectedRateId && selectedRateId === selectedRate.rateId ? 'success' : 'primary'}
                className='w-full' 
                onClick={() => onBookNow(
                  room.roomId || room.id, 
                  selectedRate.rateId, 
                  selectedRate.recommendationId || room.bestRate?.recommendationId, 
                  selectedRate.finalRate
                )}
              >
                {isMultiRoom 
                  ? (selectedRateId && selectedRateId === selectedRate.rateId ? 'Selected' : 'Book Now')
                  : (itinerary.rooms.some(room => room.rateId === selectedRate.rateId) ? 'Selected' : 'Book Now')
                }
              </AnimatedButton>
            </div>
          </div>
        );
      })}
      
      {/* Separate cards for refundable-only rates */}
      {onlyRefundableRates.map((rate) => (
        <div key={rate.rateId} className='flex flex-col items-start justify-start w-full bg-white rounded-xl overflow-hidden p-4 border border-blue-600'>
          {/* Board Type Header with Refundable Indicator */}
          <div className='flex flex-row items-center justify-between w-full'>
            <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg text-blue-950'>
              {rate.boardBasis.description}
            </h1>
            <span className='text-xs text-green-600 font-medium px-2 py-1 rounded-full bg-green-50 border border-green-200'>
              Refundable
            </span>
          </div>
          
          {/* Cancellation Info */}
          <div className='flex flex-row items-center justify-start gap-x-1 mt-1'>
            <span className='text-xs text-slate-700 font-normal tracking-tight truncate'>
              Free cancellation till
            </span>
            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-xs text-green-600 font-normal tracking-tight truncate mt-[1px]'>
              {getCancellationDate(rate)}
            </span>
          </div>
          
          {/* Inclusions - show if available */}
          {rate.includes && rate.includes.length > 0 && (
            <div className='flex flex-col w-full mt-3'>
              <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-sm text-blue-950 mb-1'>
                Includes:
              </h2>
              <div className='flex flex-row flex-wrap gap-x-2 gap-y-1'>
                {rate.includes.map((inclusion: string, index: number) => (
                  <span key={index} className='text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded'>
                    {inclusion}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Price Information */}
          <div className='flex flex-col items-start justify-start pt-3'>
            <div className='flex flex-row items-center justify-start gap-x-2'>
              <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg text-blue-950'>
                Rs.{rate.finalRate.toLocaleString()}
              </h1>
              <span className='text-xs text-slate-600 font-normal tracking-tight truncate'>
                room per night
              </span>
            </div>
            <span className='text-xs text-teal-600 font-normal tracking-tight truncate'>
              Inclusive of taxes and fee
            </span>
          </div>
          
          {/* Book Now Button */}
          <div className='w-full pt-3'>
            <AnimatedButton 
              variant={selectedRateId === rate.rateId || itinerary.rooms[roomIndex]?.rateId === rate.rateId ? 'success' : 'secondary'}
              className='w-full' 
              onClick={() => onBookNow(
                room.roomId || room.id, 
                rate.rateId, 
                rate.recommendationId || room.bestRate?.recommendationId, 
                rate.finalRate
              )}
            >
              {selectedRateId === rate.rateId || itinerary.rooms[roomIndex]?.rateId === rate.rateId ? 'Selected' : 'Book Now'}
            </AnimatedButton>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomRateCard;