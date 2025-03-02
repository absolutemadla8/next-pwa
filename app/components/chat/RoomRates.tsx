import { useChat } from 'ai/react';
import React from 'react'
import HorizontalScroll from '../ui/HorizontalScroll';
import RoomRateCard from '../stays/RoomRateCard';

export function RoomRates({ results, chatId }: { results?: any, chatId: string }) {
    const { append } = useChat({
      id: chatId,
      body: { id: chatId },
      maxSteps: 5,
    });
  
    const handleBookNow = (
      roomId: string, 
      rateId: string, 
      recommendationId: string, 
      price: number,
      boardType?: string,
      roomType?: string
    ) => {
      append({
        role: "user",
        content: `I want to book ${boardType} option in ${roomType}.`,
      });
    };
  
    return (
      <HorizontalScroll>
        {results && results.length > 0 ? (
          results.map((room: any, index: number) => (
            <div key={index} className="w-72 flex-shrink-0 p-2">
              <RoomRateCard 
                room={room} 
                onBookNow={handleBookNow} 
              />
            </div>
          ))
        ) : (
          <div className="p-4 text-center w-full">
            No rooms available for the selected criteria
          </div>
        )}
      </HorizontalScroll>
    );
  }