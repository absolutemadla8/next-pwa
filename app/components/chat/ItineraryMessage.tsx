'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import CollapsibleMessage from './collapsible-message';
import { Section, ToolArgsSection } from './section';
import { ToolProps } from '@/app/types/chat/tools';
import HorizontalScroll from '../ui/HorizontalScroll';
import StepLoader from './StepLoader';
import { useChat } from 'ai/react';
import ImageGallery from '../deals/ImageGallery';
import AnimatedButton from '../ui/AnimatedButton';

// Enhanced typing effect with Framer Motion
const TypingText = ({ text }: { text: string }) => {
  const characters = Array.from(text);
  
  return (
    <motion.span className='text-sm font-light tracking-wide'>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.08,
            delay: index * 0.03,
            ease: "easeInOut"
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Step interface for loader
interface Step {
  title: string;
  description: string;
  percentage: number;
}

// Interface for the component props
interface ItineraryData {
  id: string;
  name: string;
  deal_type: string | null;
  highlight: string | null;
  description: string | null;
  labels: string[];
  inclusions: any[] | null;
  country: string;
  startDate: string;
  endDate: string;
  nights: number;
  slots: any[];
  bookingValidity: string | null;
  travelValidity: string | null;
  travelStart: string | null;
  pricing: number;
  discountedPrice: number | null;
  deposit_amount: number | null;
  unit: string;
  currency: string;
  isTaxIncluded: boolean;
  images: { url: string }[];
  onTrip: any | null;
  advisorId: string | null;
  createdAt: string;
  updatedAt: string;
  advisor: any | null;
  itinerary: {
    id: string;
    tripId: string;
    name: string;
    inclusions: any[];
    is_group_trip: boolean;
    property_rating: number | null;
    starting_price: number | null;
    destinations: {
      id: string;
      name: string;
      order: number;
      description: string | null;
      country: string;
      images: any | null;
      nights: number;
    }[];
    createdAt: string;
    updatedAt: string;
    items: {
      id: string;
      itineraryId: string;
      dayNumber: number;
      itemType: string;
      hotelId: string | null;
      roomId: string | null;
      boardType: string | null;
      flightId: string | null;
      activityId: string | null;
      genericId: string | null;
      order: number;
      createdAt: string;
      updatedAt: string;
      hotel?: {
        id: string;
        name: string;
        checkin: string | null;
        checkout: string | null;
        location: string;
        description: string | null;
        images: { url: string }[];
      };
      activity?: any;
      flight?: any;
    }[];
  };
}

export function ItineraryMessage({ 
  toolName, 
  state,
  results,
  args,
  chatId,
  isOpen,
  onOpenChange 
}: ToolProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  
  const { append, isLoading: chatIsLoading } = useChat({
    id: chatId,
    body: { 
      id: chatId,
      appendOnly: true
    },
    maxSteps: 5,
    onFinish: () => {
      window.history.replaceState({}, "", `/trippy/chat/${chatId}`);
    }
  });

  const isToolLoading = state === 'call';
  const itineraryData: ItineraryData = state === 'result' ? results : undefined;
  const query = args?.query;

  useEffect(() => {
    if (!isToolLoading && itineraryData) {
      setIsLoading(false);
    }
  }, [isToolLoading, itineraryData]);

  const searchSteps: Step[] = [
    {
      title: 'Getting your itinerary',
      description: 'Fetching your personalized travel plan',
      percentage: 50
    },
    {
      title: 'Organizing destinations',
      description: 'Arranging your destinations and activities',
      percentage: 50
    },
  ];

  // Group items by day
  const itemsByDay = itineraryData?.itinerary?.items?.reduce(
    (acc, item) => {
      if (!acc[item.dayNumber]) {
        acc[item.dayNumber] = [];
      }
      acc[item.dayNumber].push(item);
      return acc;
    },
    {} as Record<number, any[]>
  ) || {};

  // Sort items within each day by order
  Object.keys(itemsByDay).forEach((dayNumber) => {
    itemsByDay[Number(dayNumber)].sort((a, b) => a.order - b.order);
  });

  // Get sorted day numbers
  const sortedDayNumbers = Object.keys(itemsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  // Get destination for current day
  const getCurrentDestination = (dayNumber: number) => {
    let currentNights = 0;
    
    for (const destination of itineraryData?.itinerary?.destinations || []) {
      currentNights += destination.nights;
      if (dayNumber <= currentNights) {
        return destination;
      }
    }
    
    return itineraryData?.itinerary?.destinations?.[0] || null;
  };

  const currentDestination = getCurrentDestination(selectedDay);

  // Format dates
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return 'Date TBD';
    }
  };

  const header = (
    <ToolArgsSection
      tool={toolName}
      number={itineraryData?.itinerary?.destinations?.length || 0}
    >
      {"@trippy Create itinerary" + (query || "")}
    </ToolArgsSection>
  );

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Section title="@trippy" tool={toolName}>
        {(chatIsLoading && isToolLoading) || isLoading ? (
          <StepLoader
            steps={searchSteps}
            totalTimeMs={2000}
            onComplete={() => setIsLoading(false)}
          />
        ) : (
          <div className="mb-6">
            <div className="flex flex-col gap-6">
              {/* Header with trip details */}
              <div className="flex flex-col gap-4">
                {/* Hero image with gradient overlay */}
                {itineraryData?.images && itineraryData.images.length > 0 && (
                  <div className="relative w-full h-64 overflow-hidden rounded-xl">
                    <div className="absolute inset-0">
                      <img
                        src={itineraryData.images[0].url}
                        alt={itineraryData.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
                    </div>
                    
                    {/* Trip title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h2 style={{ fontFamily: 'var(--font-domine)' }} className="text-xl font-medium tracking-tight">
                        {itineraryData?.name || 'Your Trip Itinerary'}
                      </h2>
                      <div className="flex items-center gap-3 mt-2 text-sm opacity-90">
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className="inline-flex items-center">
                          {formatDate(itineraryData?.startDate || '')} - {formatDate(itineraryData?.endDate || '')}
                        </span>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className="inline-flex items-center">
                          {itineraryData?.nights} nights
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Destinations List */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-sm uppercase text-neutral-500 tracking-widest font-medium mb-3">
                  Your Destinations
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {itineraryData?.itinerary?.destinations.map((destination, index) => (
                    <motion.div 
                      key={destination.id} 
                      className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg hover:shadow-sm transition-shadow duration-200"
                      whileHover={{ y: -1 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p style={{ fontFamily: 'var(--font-nohemi)' }} className="text-neutral-800 font-medium">{destination.name}</p>
                        <p style={{ fontFamily: 'var(--font-nohemi)' }} className="text-xs text-neutral-500">{destination.nights} {destination.nights === 1 ? 'night' : 'nights'}</p>
                      </div>
                      <div className="text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Day Selection */}
              {sortedDayNumbers.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-sm uppercase text-neutral-500 tracking-widest font-medium mb-3">
                    Daily Itinerary
                  </h3>
                  <HorizontalScroll>
                    {sortedDayNumbers.map((dayNumber) => (
                      <motion.button
                        key={dayNumber}
                        style={{ fontFamily: 'var(--font-nohemi)' }}
                        className={`px-4 py-2 rounded-full mr-2 text-sm ${
                          selectedDay === dayNumber
                            ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-sm'
                            : 'bg-neutral-50 text-neutral-700'
                        }`}
                        onClick={() => setSelectedDay(dayNumber)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Day {dayNumber}
                      </motion.button>
                    ))}
                  </HorizontalScroll>
                </div>
              )}

              {/* Day Items */}
              {selectedDay && itemsByDay[selectedDay] && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-neutral-800 font-medium">
                      {currentDestination ? `${currentDestination.name}` : `Day ${selectedDay}`}
                    </h4>
                    <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-xs text-slate-600 px-2 py-1 bg-neutral-100 rounded-full">
                      {itemsByDay[selectedDay].length} activities
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {itemsByDay[selectedDay].map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-xl overflow-hidden border border-neutral-100"
                      >
                        {item.itemType === 'HOTEL' && item.hotel && (
                          <div className="flex flex-col">
                            {item.hotel.images && item.hotel.images.length > 0 && (
                              <div className="relative w-full h-36">
                                <img 
                                  src={item.hotel.images[0].url} 
                                  alt={item.hotel.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-blue-800">
                                  Hotel
                                </div>
                              </div>
                            )}
                            <div className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 style={{ fontFamily: 'var(--font-nohemi)' }} className=" text-neutral-800">
                                    {item.hotel.name}
                                  </h5>
                                  {item.hotel.location && (
                                    <div style={{ fontFamily: 'var(--font-nohemi)' }} className="flex items-center text-xs text-slate-600 mt-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      </svg>
                                      {item.hotel.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {item.itemType === 'ACTIVITY' && item.activity && (
                          <div className="flex flex-col">
                            {item.activity.images && item.activity.images.length > 0 && (
                              <div className="relative w-full h-36">
                                <img 
                                  src={item.activity.images[0].url} 
                                  alt={item.activity.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-green-800">
                                  Activity
                                </div>
                              </div>
                            )}
                            <div className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 style={{ fontFamily: 'var(--font-nohemi)' }} className=" text-slate-800">
                                    {item.activity.name}
                                  </h5>
                                  {item.activity.duration && (
                                    <div style={{ fontFamily: 'var(--font-nohemi)' }} className="flex items-center text-xs text-slate-600 mt-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {item.activity.duration} Minutes
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {item.itemType === 'FLIGHT' && item.flight && (
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium text-neutral-800">{item.flight.carrier}</div>
                              <div className="px-2 py-1 bg-amber-50 rounded-full text-xs font-medium text-amber-800">
                                Flight
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2 bg-neutral-50 p-2 rounded-lg">
                              <div className="text-center">
                                <div className="text-sm font-semibold text-neutral-800">{item.flight.depCode}</div>
                                <div className="text-xs text-neutral-500">Departure</div>
                              </div>
                              <div className="flex-1 flex items-center justify-center">
                                <div className="w-1/3 h-px bg-neutral-300"></div>
                                <div className="mx-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 00-.725-.962l-5-1.857a1 1 0 01.894-1.789l7 3.5a1 1 0 01.725.962v4.714a1 1 0 001.725.962l5-2.857a1 1 0 000-1.789l-7-3.5z" />
                                  </svg>
                                </div>
                                <div className="w-1/3 h-px bg-neutral-300"></div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-neutral-800">{item.flight.arrivalCode}</div>
                                <div className="text-xs text-neutral-500">Arrival</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* View Full Itinerary Button */}
              <div className="mt-2 flex justify-center">
                <AnimatedButton 
                  variant="primary"
                  className="px-6 py-2.5 rounded-full text-white font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  View Full Itinerary
                </AnimatedButton>
              </div>
            </div>
          </div>
        )}
      </Section>
    </CollapsibleMessage>
  );
}