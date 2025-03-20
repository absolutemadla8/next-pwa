import { useChat } from 'ai/react';
import React from 'react'
import HorizontalScroll from '../ui/HorizontalScroll';
import RoomRateCard from '../stays/RoomRateCard';
import SimpleRoomRateCard from './SimpleRoomRateCard';
import AnimatedButton from '../ui/AnimatedButton';

export function RoomRates({ results, chatId }: { results?: any, chatId: string }) {
  const { append, error, reload } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 10,
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
  
    return (
      <HorizontalScroll>
        {results && results.length > 0 ? (
          results.map((room: any, index: number) => (
            <div key={index} className="w-72 flex-shrink-0 p-2">
              <SimpleRoomRateCard 
                chatId={chatId}
                room={room} 
                onSelect={()=>handleBookNow} 
              />
            </div>
          ))
        ) : (
        <AnimatedButton type="button" onClick={() => reload()}>
          Retry
        </AnimatedButton>
        )}
      </HorizontalScroll>
    );
  }