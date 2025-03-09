'use client'
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import CollapsibleMessage from './collapsible-message';
import StepLoader from './StepLoader';
import AnimatedButton from '../ui/AnimatedButton';
import CountdownButton from '../ui/CountdownButton';
import { ToolInvocation } from 'ai';
import { ToolArgsSection, Section, ResultItem } from './section';
import { ToolProps } from '@/app/types/chat/tools';
import HorizontalScroll from '../ui/HorizontalScroll';
import StarRating from '../ui/StarRating';

interface SearchResult {
  id: number;
  name: string;
  type: string;
  fullName: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

interface ClusterDestination {
  id: number;
  name: string;
}

interface Cluster {
  id: number;
  name: string;
  destinations: ClusterDestination[];
}

interface Country {
  id: number;
  name: string;
  code: string;
}

interface Destination {
  id: number;
  name: string;
  country?: {
    name: string;
  } | null;
}

interface Hotel {
  id: string;
  name: string;
  type: string;
  day_number: number;
  priority?: number;
  hero_image?: {
    url: string;
  };
  location?: string;
}

interface DestinationWithHotels {
  id: string;
  name: string;
  nights: number;
  order: number;
  hotels: Hotel[];
}

interface Itinerary {
  id: string;
  name: string;
  is_group_trip: boolean;
  destinations: DestinationWithHotels[];
}

interface TripResult {
  trip: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    nights: number;
    country_id: string;
    // other trip properties...
  };
  itinerary: Itinerary;
}

interface LocationSearchResults {
  clusters: Cluster[];
  countries: Country[];
  destinations: Destination[];
  itinerary?: Itinerary;
}

// Step interface for our loader
interface Step {
  title: string;
  description: string;
  percentage: number;
}

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

// Animated typing effect using Framer Motion
const TypingEffect = ({ text }: { text: string }) => {
  return (
    <motion.span
      initial={{ opacity: 1 }}
      className="inline-block"
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.1,
            delay: index * 0.05,
            ease: "easeInOut"
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

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
    maxSteps: 5,
    onFinish: () => {
      // Prevent URL change to maintain the same chat session
      window.history.replaceState({}, "", `/trippy/chat/${chatId}`);
    }
  });

  const isToolLoading = state === 'call';
  const searchResults = state === 'result' ? results : undefined;
  const query = args?.query;

  // Effect to auto-select primary hotels after 1 second
  useEffect(() => {
    if (!isLoading && searchResults?.itinerary?.destinations) {
      const newSelectedHotels: Record<string, boolean> = {};
      const animatingIds: Record<string, boolean> = {};
      
      const timer = setTimeout(() => {
        //@ts-ignore mlmr
        searchResults.itinerary.destinations.forEach(dest => {
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
        // Use a longer delay to ensure all selections have completed
        setTimeout(() => {
          setShowOptionText(true);
        }, 3000);
        
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, searchResults]);

  const searchSteps: Step[] = [
    {
      title: 'Getting list of locations',
      description: 'Fetching list of hotels for the location from more than 275 hotel chains',
      percentage: 25
    },
    {
      title: 'Dividing locations into clusters',
      description: 'Organizing locations into geographical clusters',
      percentage: 25
    },
  ];

  useEffect(() => {
    if (!isToolLoading && searchResults) {
      setIsLoading(false);
    }
  }, [isToolLoading, searchResults]);

  const header = (
    <ToolArgsSection
      tool={toolName}
      number={
         //@ts-ignore mlmr
        searchResults?.itinerary?.destinations?.reduce((total, destination) => {
          return total + (destination.hotels?.length || 0);
        }, 0) || 0
      }
    >
      {"@me (Trippy) Create a base itinerary for the user" + query || "Search for locations"}
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
      <Section title="@me" tool={toolName}>
        {(chatIsLoading && isToolLoading) || isLoading ? (
          <StepLoader
            steps={searchSteps}
            totalTimeMs={2000}
            onComplete={() => setIsLoading(false)}
          />
        ) : (
          <div className="mb-4">
            <div className="">
              <p style={{ fontFamily: 'var(--font-domine)'}} 
                className="text-lg text-blue-950 font-medium mb-2">
                Here&apos;s your itinerary with hotel options:
              </p>
              <div className='flex flex-col gap-y-4 w-full'>
                
                { //@ts-ignore mlmr
                searchResults?.itinerary?.destinations?.map((dest, index) => (
                  <div key={index} className='flex flex-col gap-y-2 w-full'>
                    <h1 style={{ fontFamily: 'var(--font-nohemi)'}}
                      className="text-md text-blue-950 font-medium mb-2">
                      {dest.name} - {dest.nights} {dest.nights === 1 ? 'night' : 'nights'}
                    </h1>
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
                          className='flex flex-col items-start justify-start w-64 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'>
                          <div className="relative w-full h-36">
                            <img 
                              src={hotel?.hero_image?.url || "https://often-public-assets.blr1.cdn.digitaloceanspaces.com/altimagehotels.png"} 
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
                          <div className='flex flex-col items-start justify-start w-full p-2'>
                            <div className='flex flex-row items-center justify-between w-full'>
                              <h1 
                                style={{ fontFamily: 'var(--font-nohemi)' }} 
                                className='text-lg text-blue-950 w-[68%] truncate'
                              >
                                 {hotel.name}
                              </h1>
                            </div>
                            <span className='text-xs text-slate-600 font-normal tracking-tight truncate w-full'>
                              { hotel?.location || `Day ${hotel.day_number}`}
                            </span>
                          </div>
                          <div className="mt-auto p-2 w-full">
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
                                <motion.div
                                  initial={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  key="select-button"
                                  className="w-full"
                                >
                                  <AnimatedButton variant='primary'>
                                    Select
                                  </AnimatedButton>
                                </motion.div>
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