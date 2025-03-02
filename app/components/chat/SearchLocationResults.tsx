import React, { useState, useEffect } from 'react';
import { Building, Navigation, MapPin, Globe, Check } from 'lucide-react';
import AnimatedButton from '../ui/AnimatedButton';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import StepLoader from './StepLoader';

interface SearchResult {
  id: number;
  name: string;
  type: string;
  fullName: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

interface SearchLocationResultsProps {
  results?: SearchResult[];
  chatId: string;
}

// Step interface for our loader
interface Step {
  title: string;
  description: string;
  percentage: number;
}

export function SearchLocationResults({ results, chatId }: SearchLocationResultsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });

  const searchSteps: Step[] = [
    {
      title: 'Getting list of hotels from the repository',
      description: 'Fetching list of hotels for the location from more than 275 hotel chains',
      percentage: 25
    },
    {
      title: 'Checking availability',
      description: 'Fetching list of hotels for the location from more than 275 hotel chains',
      percentage: 25
    },
    {
      title: 'Fetching room rates',
      description: 'Fetching list of hotels for the location from more than 275 hotel chains',
      percentage: 25
    },
    {
      title: 'Sorting the best options',
      description: 'Fetching list of hotels for the location from more than 275 hotel chains',
      percentage: 25
    }
  ];

  return (
    <div className="mb-4">
      <div className="">
        <p 
          style={{ fontFamily: 'var(--font-domine)'}} 
          className="text-xl text-blue-950 font-medium mb-2"
        >
          {isLoading 
            ? "Searching for hotels..." 
            : "Select the exact location you're looking for"
          }
        </p>
        
        {isLoading ? (
          <StepLoader
            steps={searchSteps}
            totalTimeMs={4000}
            onComplete={() => setIsLoading(false)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-2 bg-white rounded-lg py-2 border border-slate-300">
            {results?.slice(0, 4).map((location, index) => (
              <React.Fragment key={location.id}>
                <AnimatedButton
                  variant='bland'
                  className="flex items-center justify-between w-full p-3 h-16 text-left bg-white"
                  onClick={() => {
                    append({
                      role: "user",
                      content: `I would like to search hotels in ${location.fullName}!`,
                    });
                  }}
                >
                  <div className="flex gap-3">
                    <div>
                      <div 
                        style={{ fontFamily: 'var(--font-nohemi)' }} 
                        className="font-normal text-lg text-blue-950 tracking-normal"
                      >
                        {location.name}
                      </div>
                      <div className="text-xs text-slate-500 tracking-tight text-muted-foreground">
                        {[
                          location.city,
                          location.state,
                          location.country
                        ].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                </AnimatedButton>
                {index < (results?.slice(0, 4).length - 1) && (
                  <hr className="border-gray-200 mx-4" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}