'use client'
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Plane, Car, Ship, Train } from 'lucide-react';
import { useChat } from 'ai/react';
import CollapsibleMessage from './collapsible-message';
import StepLoader from './StepLoader';
import { ToolArgsSection, Section } from './section';
import { ToolProps } from '@/app/types/chat/tools';
import HorizontalScroll from '../ui/HorizontalScroll';
import SeeMoreText from '../ui/SeeMoreText';

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

export function HumanRefer({ 
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
  const searchResults: any = state === 'result' ? results : undefined;
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


  const header = (
    <ToolArgsSection
      tool={toolName}
      number={searchResults?.data?.length || 0}
    >
      {"@trippy Tag a human advisor to review the itinerary " + query}
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
          <div className="mb-4 space-y-4">
            {/* <div style={{ fontFamily: 'var(--font-domine)'}} 
              className="text-lg text-primary font-medium mb-2">
              {searchResults?.message
                ? `Found ${searchResults.data.length} label${searchResults.data.length > 1 ? 's' : ''} matching your preferences:`
                : "No labels found for the user's preferences. Please try another destination."}
            </div> */}
            <div className='flex flex-row items-center justify-start w-full flex-wrap gap-x-2'>
                  <div className='flex flex-col items-start justify-start gap-y-2 p-2'>
                    <div className='flex flex-row w-full items-start justify-start gap-x-2'>
                        <img src={searchResults?.advisor?.pictureUrl} className='size-12 rounded-full' />
                        <div className='flex flex-col gap-y-1'>
                        <p style={{fontFamily: 'var(--font-nohemi)'}} className='text-md text-primary'>{searchResults?.advisor?.name}</p>
                            <SeeMoreText text={searchResults?.advisor?.description} />
                        </div>
                    </div>
                    <div className='flex flex-col p-2 rounded-b-lg rounded-tr-lg bg-slate-100 border border-slate-300 overflow-hidden'>
                    <p className='text-sm text-primary tracking-tight'>{searchResults.message}</p>
                    </div>
                  </div>
            </div>
          </div>
        )}
      </Section>
    </CollapsibleMessage>
  );
}