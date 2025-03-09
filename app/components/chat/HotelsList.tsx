'use client'
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useChat } from 'ai/react';
import CollapsibleMessage from './collapsible-message';
import StepLoader from './StepLoader';
import AnimatedButton from '../ui/AnimatedButton';
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

interface LocationSearchResults {
  clusters: Cluster[];
  countries: Country[];
  destinations: Destination[];
}

// Step interface for our loader
interface Step {
  title: string;
  description: string;
  percentage: number;
}

export function HotelsList({ 
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
    body: { id: chatId },
    maxSteps: 5,
  });

  const isToolLoading = state === 'call';
  const searchResults = state === 'result' ? results : undefined;
  const query = args?.query;

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
      number={searchResults?.clusters?.length + searchResults?.countries?.length + searchResults?.destinations?.length || 0}
    >
      {"@stan I need hotels in " + query || "Search for locations"}
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
            steps={searchSteps}
            totalTimeMs={2000}
            onComplete={() => setIsLoading(false)}
          />
        ) : (
            <div className="mb-4">
            <div className="">
            <p style={{ fontFamily: 'var(--font-domine)'}} 
                className="text-lg text-blue-950 font-medium mb-2">
                Yo, dude! Just blazed through some searches and found these totally chill hotels for your trip!
              </p>
            <HorizontalScroll>
            {results.map((result:any, index:number) => (
                <div
                    key={index}
                    onClick={() => {
                        append({
                            role: "user",
                            content: `Give me the room rates for ${result.name}!`,
                        });
                    }}
                    className='flex flex-col items-start justify-start w-64 bg-white rounded-lg overflow-hidden'>
                    <img src={result?.hero_image?.url || "https://often-public-assets.blr1.cdn.digitaloceanspaces.com/altimagehotels.png"} alt={result.name} className='w-full h-36 object-cover' />
                    <div className='flex flex-col items-start justify-start w-full p-2'>
                        <div className='flex flex-row items-center justify-between w-full'>
                            <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg text-blue-950 w-[68%] truncate'>
                                {result.name}
                            </h1>
                            {result.star_rating && 
                                <StarRating rating={+result.star_rating} size={3} />
                            }
                        </div>
                        <span className='text-xs text-slate-600 font-normal tracking-tight truncate w-full '>
                            {result.location}
                        </span>
                    </div>
                </div>
            ))}
        </HorizontalScroll>
        </div>
        </div>
        )}
      </Section>
    </CollapsibleMessage>
  );
}