'use client'
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useChat } from 'ai/react';
import CollapsibleMessage from './collapsible-message';
import StepLoader from './StepLoader';
import AnimatedButton from '../ui/AnimatedButton';
import CountdownButton from '../ui/CountdownButton';
import { ToolInvocation } from 'ai';
import { ToolArgsSection, Section, ResultItem } from './section';
import { ToolProps } from '@/app/types/chat/tools';

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

export function SearchLocationResults({ 
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
      {"@trisha can you search for " + query || "Search for locations"}
    </ToolArgsSection>
  );

  const renderResults = () => {
    if (!searchResults) return null;
    
    const hasNoResults = 
      searchResults.clusters?.length === 0 && 
      searchResults.countries?.length === 0 && 
      searchResults.destinations?.length === 0;

    if (hasNoResults) {
      return (
        <div className="flex items-center gap-2 bg-white rounded-lg py-2 border border-slate-300">
          <Check className="h-4 w-4 text-slate-400" />
          <span style={{ fontFamily: 'var(--font-nohemi)' }}
                className="text-slate-500 text-sm">
            No results found
          </span>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-2 bg-white rounded-lg py-2 border border-slate-200">
        {/* Clusters Section */}
        {searchResults.clusters?.map((cluster:any) => (
          <div key={cluster.id} className="group">
            <div className="p-3 flex items-center gap-2 text-primary bg-slate-50">
              <span style={{ fontFamily: 'var(--font-nohemi)' }}
                    className="font-medium">
                {cluster.name}
              </span>
            </div>
            
            {cluster.destinations.map((destination:any, idx:any) => (
              <React.Fragment key={destination.id}>
                <AnimatedButton
                  variant='bland'
                  className="flex items-center justify-between w-full p-3 h-16 text-left bg-white pl-8"
                  onClick={() => append({
                    role: "user",
                    content: `Create an itinerary for ${destination.name}, ${cluster.name}!`,
                  })}
                >
                  <ResultItem 
                    type="destination"
                    name={destination.name}
                    onClick={() => {}}
                  />
                </AnimatedButton>
                {idx < cluster.destinations.length - 1 && 
                  <hr className="border-gray-200 mx-4" />}
              </React.Fragment>
            ))}
          </div>
        ))}

        {/* Countries Section */}
        {searchResults.countries?.map((country:any, index:number) => (
          <React.Fragment key={country.id}>
            <AnimatedButton
              variant='bland'
              className="flex items-center justify-between w-full p-3 h-16 text-left bg-white"
              onClick={() => append({
                role: "user",
                content: `Create an itinerary for ${country.name}!`,
              })}
            >
              <ResultItem 
                type="country"
                name={country.name}
                subtext={country.code}
                onClick={() => {}}
              />
            </AnimatedButton>
            {index < (searchResults.countries.length - 1) && 
              <hr className="border-gray-200 mx-4" />}
          </React.Fragment>
        ))}

        {/* Destinations Section */}
        {searchResults.destinations?.map((destination:any, index:number) => (
          <React.Fragment key={destination.id}>
            <AnimatedButton
              variant='bland'
              className="flex items-center justify-between w-full p-3 h-16 text-left bg-white"
              onClick={() => append({
                role: "user",
                content: `Create an itinerary for ${destination.name}${destination.country ? `, ${destination.country.name}` : ''}!`,
              })}
            >
              <ResultItem 
                type="destination"
                name={destination.name}
                subtext={destination.country?.name}
                onClick={() => {}}
              />
            </AnimatedButton>
            {index < (searchResults.destinations.length - 1) && 
              <hr className="border-gray-200 mx-4" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

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
          <div className="mb-4">
            <div className="">
              <p style={{ fontFamily: 'var(--font-domine)'}} 
                className="text-lg text-primary font-medium mb-2">
                Hey, I would need to know the exact location you&apos;re looking for.
              </p>
              {renderResults()}
            </div>
          </div>
        )}
      </Section>
    </CollapsibleMessage>
  );
}