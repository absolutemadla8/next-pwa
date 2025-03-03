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
      title: 'Getting list of locations',
      description: 'Fetching list of hotels for the location from more than 275 hotel chains',
      percentage: 25
    },
    {
      title: 'Divind locations into clusters',
      description: 'Fetching list of hotels for the location from more than 275 hotel chains',
      percentage: 25
    },
  ];

  return (
    <div className="mb-4">
      <div className="">
        <p style={{ fontFamily: 'var(--font-domine)'}} 
           className="text-xl text-blue-950 font-medium mb-2">
          {isLoading ? "Searching for hotels..." 
                     : "Select the exact location you're looking for"}
        </p>
        
        {isLoading ? (
          <StepLoader
            steps={searchSteps}
            totalTimeMs={2000}
            onComplete={() => setIsLoading(false)}
          />
        ) : 
        //@ts-ignore mlmr
        results?.clusters.length === 0 && results?.countries.length === 0 && results?.destinations.length === 0 ? (
          <div className="flex items-center gap-2 bg-white rounded-lg py-2 border border-slate-300">
            <Check className="h-4 w-4 text-slate-400" />
            <span style={{ fontFamily: 'var(--font-nohemi)' }}
                  className="text-slate-500 text-sm">
              No results found
            </span>
          </div>
        ) :
        (
          <div className="grid grid-cols-1 gap-2 bg-white rounded-lg py-2 border border-slate-300">
            {/* Clusters Section */}
            {
            //@ts-ignore mlmr
            results?.clusters.map((cluster) => (
              <div key={cluster.id} className="group">
                <div className="p-3 flex items-center gap-2 text-blue-950 bg-slate-50">
                  <Building className="h-4 w-4 text-slate-500" />
                  <span style={{ fontFamily: 'var(--font-nohemi)' }}
                        className="font-medium">
                    {cluster.name}
                  </span>
                </div>
                
                {
                 //@ts-ignore mlmr
                cluster.destinations.map((destination, idx) => (
                  <React.Fragment key={destination.id}>
                    <AnimatedButton
                      variant='bland'
                      className="flex items-center justify-between w-full p-3 h-16 text-left bg-white pl-8"
                      onClick={() => append({
                        role: "user",
                        content: `Give me hotels in ${destination.name}, ${cluster.name}!`,
                      })}
                    >
                      <div className="flex gap-3">
                        <MapPin className="h-5 w-5 text-slate-400" />
                        <div>
                          <div style={{ fontFamily: 'var(--font-nohemi)' }}
                               className="font-normal text-lg text-blue-950">
                            {destination.name}
                          </div>
                        </div>
                      </div>
                    </AnimatedButton>
                    {idx < cluster.destinations.length - 1 && 
                     <hr className="border-gray-200 mx-4" />}
                  </React.Fragment>
                ))}
              </div>
            ))}

            {/* Countries Section */}
            {
             //@ts-ignore mlmr
            results?.countries.map((country, index) => (
              <React.Fragment key={country.id}>
                <AnimatedButton
                  variant='bland'
                  className="flex items-center justify-between w-full p-3 h-16 text-left bg-white"
                  onClick={() => append({
                    role: "user",
                    content: `Give me hotels in ${country.name}!`,
                  })}
                >
                  <div className="flex gap-3">
                    <Globe className="h-5 w-5 text-slate-400" />
                    <div>
                      <div style={{ fontFamily: 'var(--font-nohemi)' }}
                           className="font-normal text-lg text-blue-950">
                        {country.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {country.code}
                      </div>
                    </div>
                  </div>
                </AnimatedButton>
                {
                 //@ts-ignore mlmr
                index < (results.countries.length - 1) && 
                 <hr className="border-gray-200 mx-4" />}
              </React.Fragment>
            ))}

            {/* Destinations Section */}
            {
             //@ts-ignore mlmr
            results?.destinations.map((destination, index) => (
              <React.Fragment key={destination.id}>
                <AnimatedButton
                  variant='bland'
                  className="flex items-center justify-between w-full p-3 h-16 text-left bg-white"
                  onClick={() => append({
                    role: "user",
                    content: `Give me hotels in ${destination.name}, ${destination.country?.name}!`,
                  })}
                >
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <div>
                      <div style={{ fontFamily: 'var(--font-nohemi)' }}
                           className="font-normal text-lg text-blue-950">
                        {destination.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {destination.country?.name}
                      </div>
                    </div>
                  </div>
                </AnimatedButton>
                {
                 //@ts-ignore mlmr
                index < (results.destinations.length - 1) && 
                 <hr className="border-gray-200 mx-4" />}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}