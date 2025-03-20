'use client'
import React from 'react'
import AnimatedButton from '../ui/AnimatedButton'
import { Frame, User } from 'lucide-react'
import { useChat } from 'ai/react';
import useItineraryStore from '@/app/store/itineraryStore';

interface RoomRateCardProps {
  room: any;
  chatId: string;
  onSelect: (rate: any) => void;
}

const SimpleRoomRateCard: React.FC<RoomRateCardProps> = ({ chatId, room, onSelect }) => {
  const { itinerary, setRoomDetails } = useItineraryStore();
  
  const { append, error, reload, isLoading } = useChat({
    id: chatId,
    body: { 
      id: chatId,
      payload: {
        roomsAndRateAllocations: itinerary.rooms.map(room => ({
          rateId: String(room.rateId),
          roomId: String(room.roomId),
          occupancy: {
            adults: room.adults,
            childAges: room.children.map(child => child.age)
          }
        })),
        recommendationId: String(itinerary.recommendationId),
      }
    },
    maxSteps: 10,
  });

  // Get first image URL
  const imageUrl = room.images?.[0]?.links?.find((l: any) => 
    ['Xxl', 'Standard'].includes(l.size)
  )?.url || 'https://often-public-assets.blr1.cdn.digitaloceanspaces.com/altimagehotels.png';

  const handleBookNow = (recommendationId: string, rateId: string, roomId: string, boardType:string, roomType:string) => {
    
    // Call the onSelect callback
    onSelect({ recommendationId, rateId, roomId});
    
    // Append message to chat
    append({
      role: "user",
      content: `I want to book ${room.rates.find((r: any) => r.rateId === rateId)?.boardBasis?.description || 'selected'} option in ${room.type}.`,
    });
  };

  // Skeleton loader for when data is loading (room exists but no rates yet and no error)
  if (isLoading && !error) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-40 bg-slate-200 animate-pulse"></div>
        <div className="p-4 space-y-4">
          <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
          <div className="h-10 bg-slate-200 rounded animate-pulse w-full mt-4"></div>
        </div>
      </div>
    );
  }

  if (!room?.rates?.length) return null;

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Room Header */}
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={room.type} 
          className="w-full h-40 object-cover"
        />
        <div className="flex flex-col items-start justify-end absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 h-40 p-4">
          <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-white text-lg lowercase">{room.type}</h2>
          <div className="flex gap-4 mt-1">
            <div className="flex items-center gap-1 text-slate-200">
              <Frame size={14} />
              <span className="text-xs">
                {room.area?.squareFeet || '--'} sq.ft
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-200">
              <User size={14} />
              <span className="text-xs">
                Max {room.maxAdultAllowed || 2} Adults
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rates List */}
      <div className="space-y-4 max-h-56 overflow-auto">
        {error && (
          <div className="p-4">
            <div className="text-red-500">An error occurred.</div>
            <button 
              type="button" 
              onClick={() => reload()}
              className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}
        
        {room.rates.map((rate: any) => (
          <div key={rate.rateId} className="p-4 border-b border-slate-300">
            {/* Rate Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-blue-900 lowercase">
                  {rate.boardBasis.description}
                </h3>
                <p className="text-sm text-slate-600 mt-1 tracking-tight">
                  {rate.refundable ? 'Flexible' : 'Non-refundable'} rate
                </p>
              </div>
              <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-lg text-blue-900">
                Rs.{rate.finalRate.toLocaleString()}
              </span>
            </div>

            {/* Cancellation Policy */}
            {rate.cancellationPolicies && (
              <div style={{ fontFamily: 'var(--font-nohemi)' }} className="mt-3 text-xs text-green-700 bg-green-50 p-2 rounded">
                Free cancellation until {formatCancellationDate(rate)}
              </div>
            )}

            {/* Inclusions */}
            {rate.includes?.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-slate-700 mb-1">Includes:</h4>
                <div className="flex flex-wrap gap-2">
                  {rate.includes.map((inc: string, i: number) => (
                    <span 
                      key={i}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {inc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Select Button */}
            <AnimatedButton
              variant="secondary"
              className="w-full mt-4"
              onClick={() => handleBookNow(rate.recommendationId, rate.rateId, room.id, rate.boardBasis.type, room.type )}
            >
              Select Rate
            </AnimatedButton>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to format cancellation date
const formatCancellationDate = (rate: any) => {
  const policy = rate.cancellationPolicies?.[0]?.rules?.[0];
  return policy?.end ? new Date(policy.end).toLocaleDateString() : 'check-in';
};

export default SimpleRoomRateCard;