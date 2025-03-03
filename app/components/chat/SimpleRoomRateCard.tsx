'use client'
import React from 'react'
import AnimatedButton from '../ui/AnimatedButton'
import { Frame, User } from 'lucide-react'
import { useChat } from 'ai/react';

interface RoomRateCardProps {
  room: any;
  chatId: string;
  onSelect: (rate: any) => void;
}

const SimpleRoomRateCard: React.FC<RoomRateCardProps> = ({ chatId, room, onSelect }) => {
    const { append, error, reload } = useChat({
        id: chatId,
        body: { id: chatId },
        maxSteps: 5,
      });
      {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => reload()}>
            Retry
          </button>
        </>
      )}
      
        const handleBookNow = (
          boardType?: string,
          roomType?: string
        ) => {
          append({
            role: "user",
            content: `I want to book ${boardType} option in ${roomType}.`,
          });
        };
  // Get first image URL
  const imageUrl = room.images?.[0]?.links?.find((l: any) => 
    ['Xxl', 'Standard'].includes(l.size)
  )?.url || 'https://often-public-assets.blr1.cdn.digitaloceanspaces.com/altimagehotels.png'

  if (!room?.rates?.length) return null

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Room Header */}
      <div className="relative">
        <img 
          src={imageUrl ?? "https://often-public-assets.blr1.cdn.digitaloceanspaces.com/altimagehotels.png"} 
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
      <div className="space-y-4 max-h-56 overflow-scroll">
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
              onClick={() => handleBookNow(rate.boardBasis.type, room.type)}
            >
              Select Rate
            </AnimatedButton>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper function to format cancellation date
const formatCancellationDate = (rate: any) => {
  const policy = rate.cancellationPolicies?.[0]?.rules?.[0]
  return policy?.end ? new Date(policy.end).toLocaleDateString() : 'check-in'
}

export default SimpleRoomRateCard