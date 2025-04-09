'use client'
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import CollapsibleMessage from './collapsible-message';
import StepLoader from './StepLoader';
import AnimatedButton from '../ui/AnimatedButton';
import { ToolArgsSection, Section } from './section';
import { ToolProps } from '@/app/types/chat/tools';
import HorizontalScroll from '../ui/HorizontalScroll';

interface ActivityImage {
  url: string;
}

interface Activity {
  id: string;
  title: string;
  type: string;
  duration: string;
  images: ActivityImage[];
  description?: string;
}

interface Destination {
  id: string;
  name: string;
  nights: number;
  order: number;
  activities: Activity[];
}

interface ActivitiesData {
  destinations: Destination[];
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

export function SelectedActivities({ 
  toolName, 
  state,
  results,
  args,
  chatId,
  isOpen, 
  onOpenChange 
}: ToolProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, boolean>>({});
  const [showOptionText, setShowOptionText] = useState<boolean>(false);
  const [animatingActivities, setAnimatingActivities] = useState<Record<string, boolean>>({});
  
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
  const activitiesData = state === 'result' ? results : undefined;
  const query = args?.query;

  // Effect to auto-select primary activities after 1 second
  useEffect(() => {
    if (!isLoading && activitiesData?.destinations) {
      const newSelectedActivities: Record<string, boolean> = {};
      const animatingIds: Record<string, boolean> = {};
      
      const timer = setTimeout(() => {
        //@ts-ignore mlmr
        activitiesData.destinations.forEach(dest => {
          //@ts-ignore mlmr
          dest.activities?.forEach(activity => {
            if (activity.type === 'PRIMARY') {
              animatingIds[activity.id] = true;
              
              // Set selected state after animation starts with staggered delay
              const staggerDelay = 800 + (Math.random() * 300);
              setTimeout(() => {
                setSelectedActivities(prev => ({
                  ...prev,
                  [activity.id]: true
                }));
              }, staggerDelay);
            }
          });
        });
        
        setAnimatingActivities(animatingIds);
        
        // Show "Marked as option" text after primary activities are selected
        setTimeout(() => {
          setShowOptionText(true);
        }, 3000);
        
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, activitiesData]);

  const activitySteps: Step[] = [
    {
      title: 'Analyzing destination highlights',
      description: 'Finding the top attractions and experiences in each location',
      percentage: 20
    },
    {
      title: 'Curating local experiences',
      description: 'Selecting authentic cultural and adventure activities',
      percentage: 20
    },
    {
      title: 'Checking availability',
      description: 'Confirming activity schedules during your trip dates',
      percentage: 20
    },
    {
      title: 'Optimizing itinerary flow',
      description: 'Arranging activities for the best experience each day',
      percentage: 20
    },
    {
      title: 'Finalizing activity selections',
      description: 'Creating your perfect Thailand adventure experiences',
      percentage: 20
    }
  ];

  useEffect(() => {
    if (!isToolLoading && activitiesData) {
      // Use a timeout to ensure the loader completes its animation
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isToolLoading, activitiesData]);

  const header = (
    <ToolArgsSection
      tool={toolName}
      number={
        //@ts-ignore mlmr
        activitiesData?.destinations?.reduce((total, destination) => {
          return total + (destination.activities?.length || 0);
        }, 0) || 0
      }
    >
      {"@eva Add activities for " + (query || "Thailand adventure")}
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
      <Section title="@eva" tool={toolName}>
        {(chatIsLoading && isToolLoading) || isLoading ? (
          <StepLoader
            steps={activitySteps}
            totalTimeMs={8000}
            onComplete={() => setIsLoading(false)}
          />
        ) : (
          <div className="mb-4">
            <div className="">
              <p style={{ fontFamily: 'var(--font-domine)'}} 
                className="text-lg text-primary font-medium mb-4">
                Here are the recommended activities for your Thailand adventure:
              </p>
              <div className='flex flex-col gap-y-6 w-full'>
                {
                //@ts-ignore mlmr
                activitiesData?.destinations?.map((dest, index) => (
                  <div key={index} className='flex flex-col gap-y-3 w-full'>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold mr-3">
                        {index + 1}
                      </div>
                      <h1 style={{ fontFamily: 'var(--font-nohemi)'}}
                        className="text-lg text-primary font-medium">
                        {dest.name} - {dest.nights} {dest.nights === 1 ? 'night' : 'nights'}
                      </h1>
                    </div>
                    <div className="ml-11">
                      <HorizontalScroll>
                        {
                        //@ts-ignore mlmr
                        dest?.activities?.map((activity, activityIndex) => (
                          <motion.div
                            key={activityIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: activityIndex * 0.15,
                              ease: "easeOut" 
                            }}
                            className='flex flex-col items-start justify-start w-64 bg-white rounded-lg overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md'
                          >
                            <div className="relative w-full h-36 overflow-hidden rounded-t-lg">
                              <img 
                                src={activity?.images[0].url || "https://often-public-assets.blr1.cdn.digitaloceanspaces.com/altimagehotels.png"} 
                                alt={activity.title} 
                                className='w-full h-36 object-cover' 
                              />
                              {activity.type !== 'PRIMARY' && showOptionText && (
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-start justify-start p-3">
                                  <div className="px-2 py-1 rounded text-primary bg-white font-medium">
                                    <TypingText text="Marked as option" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className='flex flex-col items-start justify-start w-full p-3'>
                              <div className='flex flex-row items-center justify-between w-full'>
                                <h1 
                                  style={{ fontFamily: 'var(--font-nohemi)' }} 
                                  className='text-md text-primary w-[90%] truncate font-medium'
                                >
                                  {activity.title}
                                </h1>
                              </div>
                              <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-xs text-slate-600 font-normal tracking-tight truncate w-full'>
                                {activity?.duration} Minutes
                              </span>
                            </div>
                            <div className="mt-auto p-2 w-full border-t border-gray-100">
                              <AnimatePresence mode="wait">
                                {selectedActivities[activity.id] ? (
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
                                    onClick={() => setSelectedActivities(prev => ({ ...prev, [activity.id]: false }))}
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
                                    <AnimatedButton 
                                      variant='primary'
                                      onClick={() => setSelectedActivities(prev => ({ ...prev, [activity.id]: true }))}
                                    >
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
                  </div>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100"
              >
                <p className="text-sm text-green-800 font-medium">
                  ✓ Activities curated! These experiences will enhance your Thailand adventure with local culture and exciting excursions.
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </Section>
    </CollapsibleMessage>
  );
}