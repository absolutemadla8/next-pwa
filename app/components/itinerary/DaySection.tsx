'use client'
import React, { useState } from 'react';
import HorizontalScroll from '@/app/components/ui/HorizontalScroll';

// Types for our component props - adjust according to your actual data structure
interface DaySectionProps {
  destination: string;
  items: any[]; // Using any[] to match your existing code style
}

const CARD_WIDTH = 280;

const DaySection: React.FC<DaySectionProps> = ({ destination, items }) => {
  // Group items by day
  const itemsByDay = items.reduce(
    (acc, item) => {
      if (!acc[item.dayNumber]) {
        acc[item.dayNumber] = [];
      }
      acc[item.dayNumber].push(item);
      return acc;
    },
    {} as Record<number, any[]>
  );

  // Sort items within each day by order
  Object.keys(itemsByDay).forEach((dayNumber) => {
    //@ts-ignore mlmr
    itemsByDay[Number(dayNumber)].sort((a, b) => a.order - b.order);
  });

  // Get sorted day numbers
  const sortedDayNumbers = Object.keys(itemsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  // State to track the currently selected day
  const [selectedDay, setSelectedDay] = useState(sortedDayNumbers[0] || 1);

  // Handle empty items case
  if (sortedDayNumbers.length === 0) {
    return (
      <div className="flex flex-col items-start justify-start w-full bg-white rounded-lg p-4">
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-primary text-lg font-bold mb-2">
          {destination}
        </h1>
        <p className="text-gray-500">No itinerary items available for this destination</p>
      </div>
    );
  }

  const renderItemContent = (item: any) => {
    switch (item.itemType) {
      case 'HOTEL':
        return (
          item.hotel && (
            <div className="bg-blue-900/10 p-4 rounded-lg h-full">
              <div className="text-primary font-semibold mb-2">{item.hotel.name}</div>
              {item.room && (
                <div className="text-gray-600 text-sm mb-1">{item.room.name}</div>
              )}
              {item.boardType && (
                <div className="text-gray-500 text-xs">{item.boardType}</div>
              )}
            </div>
          )
        );

      case 'FLIGHT':
        return (
          item.flight && (
            <div className="bg-blue-900/10 p-4 rounded-lg h-full">
              {item.flight.logo && (
                <img
                  src={item.flight.logo}
                  alt={item.flight.carrier}
                  className="h-8 mb-2 object-contain"
                />
              )}
              <div className="font-semibold text-primary">{item.flight.carrier}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-primary">{item.flight.depCode}</span>
                <span className="text-primary">→</span>
                <span className="text-primary">{item.flight.arrivalCode}</span>
              </div>
            </div>
          )
        );

      case 'ACTIVITY':
        return (
          item.activity && (
            <div className="rounded-lg overflow-hidden h-full bg-white">
              {item.activity.images?.length > 0 && (
                <img 
                  src={item.activity.images[0].url} 
                  alt={item.activity.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-3">
                <h3 className="text-primary text-lg font-semibold mb-1">{item.activity.name}</h3>
                <div className="bg-primary/10 p-2 rounded-md inline-block mb-2">
                  <div className="text-primary/60 text-xs">Duration</div>
                  <div className="text-primary text-sm font-medium">
                    {Math.floor(item.activity.duration / 60)} hours
                  </div>
                </div>
                {item.activity.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">{item.activity.description}</p>
                )}
              </div>
            </div>
          )
        );

      case 'GENERIC':
        return (
          item.generic && (
            <div className="rounded-lg overflow-hidden h-full bg-white">
              {item.generic.images?.length > 0 && (
                <img 
                  src={item.generic.images[0].url} 
                  alt={item.generic.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-3">
                <h3 className="text-primary text-lg font-semibold mb-1">{item.generic.name}</h3>
                {item.generic.subtitle && (
                  <p className="text-gray-500 text-sm mb-1">{item.generic.subtitle}</p>
                )}
                {item.generic.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">{item.generic.description}</p>
                )}
              </div>
            </div>
          )
        );

      default:
        return (
          <div className="bg-blue-900/10 p-4 rounded-lg h-full">
            <div className="text-primary font-semibold">Item Type: {item.itemType}</div>
            <div className="text-gray-600 text-sm">Day: {item.dayNumber}</div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-start justify-start w-full rounded-lg mb-4">
      {/* Destination Header */}
      <div className="p-4 w-full">
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-primary text-lg font-bold">
          {destination}
        </h1>
      </div>
      
      {/* Day Tabs */}
      <div className="flex items-start justify-start w-full py-2">
        <HorizontalScroll>
          {sortedDayNumbers.map((dayNumber) => (
            <div 
              key={dayNumber}
              className={`flex flex-col items-center justify-center w-20 rounded-lg py-2 h-fit cursor-pointer mx-1 ${
                selectedDay === dayNumber ? 'bg-primary' : 'bg-slate-100'
              }`}
              onClick={() => setSelectedDay(dayNumber)}
            >
              <h2 
                style={{ fontFamily: 'var(--font-nohemi)' }} 
                className={`${selectedDay === dayNumber ? 'text-white' : 'text-primary'} text-md`}
              >
                Day {dayNumber}
              </h2>
            </div>
          ))}
        </HorizontalScroll>
      </div>
      
      {/* Items for selected day */}
      <div className="w-full pb-6 pt-2">
        <HorizontalScroll>
            
          {
            //@ts-ignore mlmr
          itemsByDay[selectedDay]?.map((item) => (
            <div key={item.id} style={{ width: CARD_WIDTH }} className="flex-shrink-0 mr-3">
              {renderItemContent(item)}
            </div>
          ))}
        </HorizontalScroll>
      </div>
    </div>
  );
};

export default DaySection;