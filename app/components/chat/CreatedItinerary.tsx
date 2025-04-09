'use client'
import React, { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import CollapsibleMessage from './collapsible-message';
import StepLoader from './StepLoader';
import { ToolArgsSection, Section } from './section';
import { ToolProps } from '@/app/types/chat/tools';
import HorizontalScroll from '../ui/HorizontalScroll';

interface TripData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  nights: number;
  country_id: string;
  for_listing: boolean;
  price: number;
  dynamic_pricing: boolean;
  margin: number;
  margin_type: string;
  unit: string;
  currency: string;
  images: string[];
  advisor_id: string;
  id: string;
  updated_at: string;
  created_at: string;
}

interface Destination {
  id: string;
  name: string;
  nights: number;
  order: number;
}

interface Itinerary {
  id: string;
  name: string;
  is_group_trip: boolean;
  destinations: Destination[];
}

interface TripResult {
  trip: TripData;
  itinerary: Itinerary;
}

// Step interface for our loader
interface Step {
  title: string;
  description: string;
  percentage: number;
}

export function CreatedItinerary({ 
  toolName, 
  state,
  results,
  args,
  chatId,
  isOpen, 
  onOpenChange 
}: ToolProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
  const searchResults = state === 'result' ? results : undefined;
  const tripResult = searchResults as TripResult;
  const query = args?.query;

  // Enhanced step loader for itinerary creation
  const itinerarySteps: Step[] = [
    {
      title: 'Analyzing preferences',
      description: 'Understanding your travel style and preferences',
      percentage: 20
    },
    {
      title: 'Researching destinations',
      description: 'Finding the perfect destinations in Thailand',
      percentage: 25
    },
    {
      title: 'Optimizing travel route',
      description: 'Creating the most efficient journey between destinations',
      percentage: 25
    },
    {
      title: 'Calculating trip durations',
      description: 'Determining ideal length of stay at each location',
      percentage: 15
    },
    {
      title: 'Finalizing itinerary',
      description: 'Putting together your complete Thailand adventure',
      percentage: 15
    }
  ];

  useEffect(() => {
    if (!isToolLoading && searchResults) {
      // Use a timeout to ensure the loader completes its animation
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isToolLoading, searchResults]);

  // Format dates for display
  const formatTripDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const header = (
    <ToolArgsSection
      tool={toolName}
      number={tripResult?.itinerary?.destinations?.length || 0}
    >
      {"@stan Create itinerary for " + (tripResult?.trip?.name || "Thailand")}
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
            steps={itinerarySteps}
            totalTimeMs={8000}
            onComplete={() => setIsLoading(false)}
          />
        ) : (
          <div className="mb-4">
            <div className="">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p style={{ fontFamily: 'var(--font-domine)'}} 
                  className="text-xl text-primary font-medium mb-2">
                  {tripResult.trip.name}
                </p>
                <div className="mb-4 text-sm text-slate-600">
                  {formatTripDate(tripResult.trip.start_date)} - {formatTripDate(tripResult.trip.end_date)} • {tripResult.trip.nights} nights
                </div>
              </motion.div>
              
              <div className='flex flex-col gap-y-6 w-full'>
                {tripResult?.itinerary?.destinations?.map((dest, index) => (
                  <motion.div 
                    key={dest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.2,
                      ease: "easeOut" 
                    }}
                    className='flex flex-col gap-y-2 w-full'
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <h1 style={{ fontFamily: 'var(--font-nohemi)'}}
                          className="text-lg text-primary font-medium">
                          {dest.name}
                        </h1>
                        <p className="text-sm text-slate-600">
                          {dest.nights} {dest.nights === 1 ? 'night' : 'nights'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pl-11">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <p className="text-sm text-blue-800">
                          Your {index === 0 ? 'first' : 'next'} destination in Thailand awaits! Accommodation options will be presented soon.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100"
              >
                <p className="text-sm text-green-800 font-medium">
                  ✓ Itinerary created successfully! Your {tripResult.trip.nights}-night adventure through Thailand has been planned.
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </Section>
    </CollapsibleMessage>
  );
}