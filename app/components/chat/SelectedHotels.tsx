'use client'
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import CollapsibleMessage from './collapsible-message';
import StepLoader from './StepLoader';
import { ToolArgsSection, Section } from './section';
import { ToolProps } from '@/app/types/chat/tools';
import HorizontalScroll from '../ui/HorizontalScroll';

interface HotelImage {
  url: string;
}

interface Hotel {
  id: string;
  name: string;
  images: HotelImage[];
  location: string;
  type: string;
  day_number: number;
}

interface Destination {
  id: string;
  name: string;
  nights: number;
  order: number;
  hotels: Hotel[];
}

interface HotelsData {
  itinerary_id: string;
  destinations: Destination[];
}

export function SelectedHotels({ 
  toolName, 
  state,
  results,
  args,
  chatId,
  isOpen, 
  onOpenChange 
}: ToolProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedHotels, setSelectedHotels] = useState<Record<string, boolean>>({});
  const [showOptionText, setShowOptionText] = useState<boolean>(false);
  const [animatingHotels, setAnimatingHotels] = useState<Record<string, boolean>>({});
  
  const { append, isLoading: chatIsLoading } = useChat({
    id: chatId,
    body: { 
      id: chatId,
      appendOnly: true // Specify that messages should be appended to existing chat
    },
    maxSteps: 10,
    onFinish: () => {
      // Prevent URL change to maintain the same chat session
      window.history.replaceState({}, "", `/trippy/chat/${chatId}`);
    }
  });

  const isToolLoading = state === 'call';
  const hotelsData = state === 'result' ? results : undefined;
  const query = args?.query;

  // Effect to auto-select primary hotels after loading
  useEffect(() => {
    if (!isLoading && hotelsData?.destinations) {
      const newSelectedHotels: Record<string, boolean> = {};
      const animatingIds: Record<string, boolean> = {};
      
      const timer = setTimeout(() => {
        //@ts-ignore mlmr
        hotelsData.destinations.forEach(dest => {
            //@ts-ignore mlmr
          dest.hotels.forEach(hotel => {
            if (hotel.type === 'PRIMARY') {
              animatingIds[hotel.id] = true;
              
              // Set selected state after animation starts with staggered delay
              const staggerDelay = 800 + (hotel.day_number * 600) + (Math.random() * 300);
              setTimeout(() => {
                setSelectedHotels(prev => ({
                  ...prev,
                  [hotel.id]: true
                }));
              }, staggerDelay);
            }
          });
        });
        
        setAnimatingHotels(animatingIds);
        
        // Show "Marked as option" text after primary hotels are selected
        setTimeout(() => {
          setShowOptionText(true);
        }, 3000);
        
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, hotelsData]);

  // Enhanced typing effect component with Framer Motion
  const TypingText = ({ text }: { text: string }) => {
    const characters = Array.from(text);
    
    return (
      <motion.span className='text-sm font-normal'>
        {characters.map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.1,
              delay: index * 0.05, // Stagger the animation of each character
              ease: "easeInOut"
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    );
  };

  // Step loader steps for hotel selection
  const hotelSteps = [
    {
      title: 'Finding the best hotels',
      description: 'Searching for premium accommodations in each destination',
      percentage: 25
    },
    {
      title: 'Comparing amenities and locations',
      description: 'Analyzing hotel features and proximity to attractions',
      percentage: 25
    },
    {
      title: 'Checking availability',
      description: 'Confirming room availability for your travel dates',
      percentage: 25
    },
    {
      title: 'Finalizing selections',
      description: 'Choosing the best options for your Thailand adventure',
      percentage: 25
    }
  ];

  useEffect(() => {
    if (!isToolLoading && hotelsData) {
      // Use a timeout to ensure the loader completes its animation
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isToolLoading, hotelsData]);

  const header = (
    <ToolArgsSection
      tool={toolName}
      number={
        //@ts-ignore mlmr
        hotelsData?.destinations?.reduce((total, destination) => {
          return total + (destination.hotels?.length || 0);
        }, 0) || 0
      }
    >
      {"@stan Select hotels for " + (query || "Thailand trip")}
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
      <Section title="@stan" tool={toolName}>
        {(chatIsLoading && isToolLoading) || isLoading ? (
          <StepLoader
            steps={hotelSteps}
            totalTimeMs={8000}
            onComplete={() => setIsLoading(false)}
          />
        ) : (
          <div className="mb-4">
            <div className="">
              <p style={{ fontFamily: 'var(--font-domine)'}} 
                className="text-lg text-blue-950 font-medium mb-2">
                Here are your recommended hotels:
              </p>
              <div className='flex flex-col gap-y-4 w-full'>
                {
                //@ts-ignore mlmr
                hotelsData?.destinations?.map((dest, index) => (
                  <div key={index} className='flex flex-col gap-y-2 w-full'>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <h1 style={{ fontFamily: 'var(--font-nohemi)'}}
                          className="text-lg text-blue-950 font-medium">
                          {dest.name}
                        </h1>
                        <p className="text-sm text-slate-600">
                          {dest.nights} {dest.nights === 1 ? 'night' : 'nights'}
                        </p>
                      </div>
                    </div>
                    <HorizontalScroll>
                      {
                      //@ts-ignore mlmr
                      dest?.hotels?.map((hotel, hotelIndex) => (
                        <motion.div
                          key={hotelIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: hotelIndex * 0.15,
                            ease: "easeOut" 
                          }}
                          className='flex flex-col items-start justify-start w-64 bg-white rounded-lg overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md'
                        >
                          <div className="relative w-full h-36 overflow-hidden rounded-t-lg">
                            <img 
                              src={hotel?.images[0].url || "https://often-public-assets.blr1.cdn.digitaloceanspaces.com/altimagehotels.png"} 
                              alt={hotel.name} 
                              className='w-full h-36 object-cover' 
                            />
                            {hotel.type !== 'PRIMARY' && showOptionText && (
                              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-start justify-start p-3">
                                <div className="px-2 py-1 rounded text-blue-950 bg-white font-medium">
                                  <TypingText text="Marked as option" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className='flex flex-col items-start justify-start w-full p-3'>
                            <div className='flex flex-row items-center justify-between w-full'>
                              <h1 
                                style={{ fontFamily: 'var(--font-nohemi)' }} 
                                className='text-md text-blue-950 w-[90%] truncate font-medium'
                              >
                                {hotel.name}
                              </h1>
                            </div>
                            <span className='text-xs text-slate-600 font-normal tracking-tight truncate w-full'>
                              {hotel?.location || `Day ${hotel.day_number}`}
                            </span>
                          </div>
                          <div className="mt-auto p-2 w-full border-t border-gray-100">
                            <AnimatePresence mode="wait">
                              {selectedHotels[hotel.id] ? (
                                <motion.button 
                                  className="w-full py-2 px-4 bg-green-500 text-white rounded-lg flex items-center justify-center"
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ 
                                    scale: [0.9, 1.1, 0.95, 1.05, 1],
                                    opacity: [0, 1, 1, 1, 1],
                                    backgroundColor: ["#3b82f6", "#3b82f6", "#10b981", "#10b981", "#10b981"]
                                  }}
                                  transition={{ 
                                    duration: 0.8,
                                    times: [0, 0.2, 0.5, 0.8, 1],
                                    ease: "easeInOut" 
                                  }}
                                  exit={{ scale: 0.8, opacity: 0 }}
                                  key="selected-button"
                                  onClick={() => setSelectedHotels(prev => ({ ...prev, [hotel.id]: false }))}
                                >
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <Check className="mr-1 h-4 w-4 inline" /> Selected
                                  </motion.div>
                                </motion.button>
                              ) : (
                                <motion.button
                                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg"
                                  initial={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  key="select-button"
                                  onClick={() => setSelectedHotels(prev => ({ ...prev, [hotel.id]: true }))}
                                >
                                  Select
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ))}
                    </HorizontalScroll>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>
    </CollapsibleMessage>
  );
}