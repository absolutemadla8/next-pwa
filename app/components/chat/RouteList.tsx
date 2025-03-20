'use client'
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Plane, Car, Ship, Train } from 'lucide-react';
import { useChat } from 'ai/react';
import CollapsibleMessage from './collapsible-message';
import StepLoader from './StepLoader';
import { ToolArgsSection, Section } from './section';
import { ToolProps } from '@/app/types/chat/tools';
import HorizontalScroll from '../ui/HorizontalScroll';

// Define the response data structure based on your API response
interface Destination {
  id: number;
  order: number;
  nights: number;
  transfer_type: 'land' | 'air' | 'sea' | 'rail';
  destination: {
    id: string;
    name: string;
  };
}

interface Country {
  id: string;
  name: string;
  code: string;
}

interface Route {
  id: number;
  name: string;
  nights: number;
  country: Country;
  destinations: Destination[];
  created_at: string;
  updated_at: string;
}

interface RouteResponse {
  success: boolean;
  data: Route[];
  message: string;
}

// Step interface for our loader
interface Step {
  title: string;
  description: string;
  percentage: number;
}

export function RouteList({ 
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
      appendOnly: true
    },
    maxSteps: 10,
    onFinish: () => {
      window.history.replaceState({}, "", `/trippy/chat/${chatId}`);
    }
  });

  const isToolLoading = state === 'call';
  const searchResults: RouteResponse = state === 'result' ? results : undefined;
  const query = args?.countryCode || '';

  const searchSteps: Step[] = [
    {
      title: 'Finding available routes',
      description: 'Searching for routes in your desired location',
      percentage: 40
    },
    {
      title: 'Fetching route details',
      description: 'Getting information about destinations and stays',
      percentage: 60
    },
  ];

  useEffect(() => {
    if (!isToolLoading && searchResults) {
      setIsLoading(false);
    }
  }, [isToolLoading, searchResults]);

  // Function to get the appropriate icon for transfer type
  const getTransferIcon = (type: string) => {
    switch (type) {
      case 'air':
        return <Plane className="h-4 w-4 text-blue-500" />;
      case 'land':
        return <Car className="h-4 w-4 text-green-500" />;
      case 'sea':
        return <Ship className="h-4 w-4 text-blue-700" />;
      case 'rail':
        return <Train className="h-4 w-4 text-orange-500" />;
      default:
        return <Car className="h-4 w-4 text-green-500" />;
    }
  };

  const header = (
    <ToolArgsSection
      tool={toolName}
      number={searchResults?.data?.length || 0}
    >
      {"@trisha Get routes for " + query}
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
      <Section title="@trisha" tool={toolName}>
        {(chatIsLoading && isToolLoading) || isLoading ? (
          <StepLoader
            steps={searchSteps}
            totalTimeMs={2000}
            onComplete={() => setIsLoading(false)}
          />
        ) : (
          <div className="mb-4 space-y-4">
            <div style={{ fontFamily: 'var(--font-domine)'}} 
              className="text-lg text-blue-950 font-medium mb-2">
              {searchResults?.data?.length > 0 
                ? `Found ${searchResults.data.length} route${searchResults.data.length > 1 ? 's' : ''} for you:`
                : "No routes found for this location. Please try another destination."}
            </div>
            
            <HorizontalScroll>
              <div className="flex gap-4 pb-2">
                {searchResults?.data?.map((route: Route) => (
                  <div onClick={() => append({
                    role: "user",
                    content: `${route.name} works for me!`
                  })} key={route.id} className="flex-shrink-0 w-64 bg-white rounded-lg overflow-hidden border border-gray-100">
                    <div className="bg-blue-600 p-3 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-lg text-white">{route.name}</h3>
                        <div className="flex items-center text-blue-800 bg-blue-100 px-2 py-1 rounded-full">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span className="text-xs font-normal truncate">{route.nights} Night{route.nights > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-slate-200">
                        <span>{route.country.name}</span>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <div className="space-y-3">
                        {route.destinations.map((dest, index) => (
                          <div key={dest.id} className="flex items-start">
                            <div className="flex flex-col items-center mr-2">
                              <div style={{ fontFamily: 'var(--font-nohemi)' }} className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-bold">
                                <p className='mt-0.5'>{index + 1}</p>
                              </div>
                              {index < route.destinations.length - 1 && (
                                <div className="h-6 w-0.5 bg-gray-200 my-1"></div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <h4 style={{ fontFamily: 'var(--font-nohemi)' }} className=" text-gray-800">{dest.destination.name}</h4>
                                <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                  <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-xs text-gray-700">{dest.nights}N</span>
                                </div>
                              </div>
                              
                              {index < route.destinations.length - 1 && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <span className="mr-1">Next transfer:</span>
                                  {getTransferIcon(route.destinations[index + 1].transfer_type)}
                                  <span className="ml-1 capitalize">{route.destinations[index + 1].transfer_type}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </HorizontalScroll>
          </div>
        )}
      </Section>
    </CollapsibleMessage>
  );
}