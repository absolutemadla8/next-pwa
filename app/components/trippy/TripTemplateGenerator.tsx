'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import HorizontalScroll from '@/app/components/ui/HorizontalScroll';

interface TripTemplate {
  duration: string;
  destination: string;
  months: string[];
  luxe: string[];
  vibes: string[];
}

const TripTemplateGenerator = ({ onSelectTemplate }: { onSelectTemplate: (template: string) => void }) => {
  // State for builder filters
  const [duration, setDuration] = useState("");
  const [destination, setDestination] = useState("");
  const [months, setMonths] = useState<string[]>([]);
  const [luxeOptions, setLuxeOptions] = useState<string[]>([]);
  const [vibeOptions, setVibeOptions] = useState<string[]>([]);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showLuxeDropdown, setShowLuxeDropdown] = useState(false);
  const [showVibeDropdown, setShowVibeDropdown] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  // Available options for filters
  const durations = Array.from({ length: 30 }, (_, i) => (i + 1).toString());
  const destinations = ["Maldives", "Mauritius", "Thailand", "Bali", "Dubai", "Singapore", "Vietnam", "India"];
  const monthOptions = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const luxeLevels = ["basic", "luxe", "luxe+", "ultra lux"];
  const vibes = [
    "romantic", "chill", "adventure", "party", "relaxing", 
    "all-out luxe", "instagram essentials", "culinary immersion", 
    "local experiences", "safari", "cultural immersion"
  ];

  // Popular template options
  const popularTemplates: TripTemplate[] = [
    {
      duration: "7",
      destination: "Maldives",
      months: ["May", "June"],
      luxe: ["luxe+"],
      vibes: ["romantic", "relaxing"]
    },
    {
      duration: "5",
      destination: "Thailand",
      months: ["Dec", "Jan"],
      luxe: ["luxe"],
      vibes: ["adventure", "instagram essentials"]
    },
    {
      duration: "10",
      destination: "Bali",
      months: ["Sep", "Oct"],
      luxe: ["basic", "luxe"],
      vibes: ["chill", "local experiences"]
    },
    {
      duration: "4",
      destination: "Dubai",
      months: ["Nov", "Dec"],
      luxe: ["ultra lux"],
      vibes: ["all-out luxe", "party"]
    },
    {
      duration: "8",
      destination: "Mauritius",
      months: ["Feb", "March"],
      luxe: ["luxe"],
      vibes: ["romantic", "adventure"]
    },
    {
      duration: "6",
      destination: "Vietnam",
      months: ["Jan", "Feb"],
      luxe: ["basic"],
      vibes: ["cultural immersion", "culinary immersion"]
    }
  ];

  // Format months with "or"
  const formatMonthsString = (monthsArray: string[]) => {
    if (monthsArray.length === 0) return "";
    if (monthsArray.length === 1) return monthsArray[0];
    
    return monthsArray.join(" or ");
  };
  
  // Format luxe options with "or"
  const formatLuxeString = (luxeArray: string[]) => {
    if (luxeArray.length === 0) return "";
    if (luxeArray.length === 1) return luxeArray[0];
    
    return luxeArray.join(" or ");
  };

  // Generate template string
  const getTemplateString = (template: TripTemplate) => {
    return `${template.duration}N trip to ${template.destination} in ${formatMonthsString(template.months)}. I prefer ${formatLuxeString(template.luxe)} options with a ${template.vibes[0]}${template.vibes[1] && template.vibes[0] !== template.vibes[1] ? ` plus ${template.vibes[1]}` : ""} vibe.`;
  };

  // Get random items from an array
  const getRandomItems = (array: string[], count: number) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Generate templates based on selected filters
  const generateCustomTemplates = () => {
    const templates: TripTemplate[] = [];
    
    // Get current month for defaults
    const currentMonthIndex = new Date().getMonth();
    const defaultMonth = monthOptions[currentMonthIndex % 12];
    
    // Populate with selected values or simplified defaults
    const selectedMonths = months.length > 0 ? months : [defaultMonth];
    const selectedLuxe = luxeOptions.length > 0 ? luxeOptions : getRandomItems(luxeLevels, Math.floor(Math.random() * 2) + 1);
    
    // Always select exactly 2 vibes for defaults
    const selectedVibes = vibeOptions.length > 0 ? vibeOptions : getRandomItems(vibes, 2);
    
    // Generate 3 templates with different default destinations if none selected
    const selectedDestinations = destination ? 
      [destination, destination, destination] : 
      getRandomItems(destinations, 3);
      
    // Default durations if none selected
    const selectedDurations = duration ? 
      [duration, duration, duration] : 
      ["7", "10", "14"];
    
    // Generate 3 templates with variations
    for (let i = 0; i < 3; i++) {
      const template = {
        duration: selectedDurations[i],
        destination: selectedDestinations[i],
        months: selectedMonths,
        luxe: selectedLuxe,
        vibes: [
          selectedVibes[0],
          selectedVibes.length > 1 ? selectedVibes[1] : selectedVibes[0]
        ]
      };
      templates.push(template);
    }
    
    return templates;
  };

  // Handle multi-select change
  const handleMultiSelectChange = (value: string, currentValues: string[], setterFunction: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (currentValues.includes(value)) {
      setterFunction(currentValues.filter(item => item !== value));
    } else {
      setterFunction([...currentValues, value]);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowMonthDropdown(false);
        setShowLuxeDropdown(false);
        setShowVibeDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectTemplate = (template: TripTemplate) => {
    onSelectTemplate(getTemplateString(template));
  };

  // Generate custom templates
  const customTemplates = generateCustomTemplates();

  return (
    <div className="w-full space-y-2 mb-4">
      <div className="px-4 flex justify-between items-center">
        <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-blue-950 text-sm font-medium pb-1">
          Trip templates
        </h3>
        <button 
          onClick={() => setShowBuilder(!showBuilder)}
          className="text-xs text-blue-600 underline"
        >
          {showBuilder ? 'Hide builder' : 'Show builder'}
        </button>
      </div>
      
      {showBuilder && (
        <div className="px-4 py-2 rounded-lg mb-2">
          <div className="flex flex-row flex-wrap justify-between items-center gap-2 mb-2">
            {/* Duration Filter */}
            <div className="w-[30%]">
              <label className="block text-xs font-medium mb-1 text-blue-950">Duration</label>
              <Listbox value={duration} onChange={setDuration}>
                <div className="relative mt-1">
                  <ListboxButton
                    style={{ fontFamily: 'var(--font-nohemi)' }}
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-gray-800 text-sm text-left flex justify-between items-center"
                  >
                    <span className="truncate">{duration || "Nights"}</span>
                    <span className="pointer-events-none inset-y-0 right-0 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </ListboxButton>
                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <ListboxOption 
                      key="empty" 
                      value="" 
                      className="cursor-default select-none relative py-2 pl-10 pr-4 text-gray-900 hover:bg-blue-100"
                    >
                      {({ selected, active }) => (
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          Nights
                        </span>
                      )}
                    </ListboxOption>
                    {durations.map(d => (
                      <ListboxOption 
                        key={d} 
                        value={d} 
                        className="cursor-default select-none relative py-2 pl-10 pr-4 text-gray-900 hover:bg-blue-100"
                      >
                        {({ selected, active }) => (
                          <span style={{ fontFamily: 'var(--font-nohemi)' }} className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {d}
                          </span>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>
            
            {/* Destination Filter */}
            <div className="w-[30%]">
              <label className="block text-xs font-medium mb-1 text-blue-950 ">Destination</label>
              <Listbox value={destination} onChange={setDestination}>
                <div className="relative mt-1">
                  <ListboxButton
                    style={{ fontFamily: 'var(--font-nohemi)' }}
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-gray-800 text-sm text-left flex justify-between items-center"
                  >
                    <span className="truncate">{destination || "Select"}</span>
                    <span className="pointer-events-none inset-y-0 right-0 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </ListboxButton>
                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <ListboxOption 
                      key="empty" 
                      value="" 
                      className="cursor-default select-none relative py-2 px-4 text-gray-900 hover:bg-blue-100"
                    >
                      {({ selected, active }) => (
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          Select
                        </span>
                      )}
                    </ListboxOption>
                    {destinations.map(dest => (
                      <ListboxOption 
                        key={dest} 
                        value={dest} 
                        className="cursor-default select-none relative py-2 px-4 text-gray-900 hover:bg-blue-100"
                      >
                        {({ selected, active }) => (
                          <span style={{ fontFamily: 'var(--font-nohemi)' }} className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {dest}
                          </span>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>
            
            {/* Month Filter (multi-select dropdown) */}
            <div className="w-[30%] relative dropdown-container">
              <label className="block text-xs font-medium mb-1 text-blue-950">Month(s)</label>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowMonthDropdown(!showMonthDropdown);
                    setShowLuxeDropdown(false);
                    setShowVibeDropdown(false);
                  }}
                  style={{ fontFamily: 'var(--font-nohemi)' }}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-gray-800 text-sm text-left flex justify-between items-center"
                >
                  <span className="truncate">{months.length > 0 ? `${months.length} selected` : "Select"}</span>
                  <span className="pointer-events-none inset-y-0 right-0 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                {showMonthDropdown && (
                  <div className="absolute z-10 mt-1 w-full left-0 bg-white border border-gray-100 rounded-md shadow-lg p-2 ring-1 ring-black ring-opacity-5 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2">
                      {monthOptions.map(month => (
                        <button
                          key={month}
                          onClick={() => handleMultiSelectChange(month, months, setMonths)}
                          className={`px-3 py-2 rounded-md text-sm flex items-center justify-center ${
                            months.includes(month) 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row flex-wrap justify-between items-center gap-2">
            {/* Luxe Filter (multi-select dropdown) */}
            <div className="w-[48%] relative dropdown-container">
              <label className="block text-xs font-medium mb-1 text-blue-950">Luxe Level(s)</label>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowLuxeDropdown(!showLuxeDropdown);
                    setShowMonthDropdown(false);
                    setShowVibeDropdown(false);
                  }}
                  style={{ fontFamily: 'var(--font-nohemi)' }}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-gray-800 text-sm text-left flex justify-between items-center"
                >
                  <span className="truncate">{luxeOptions.length > 0 ? `${luxeOptions.length} selected` : "Select"}</span>
                  <span className="pointer-events-none inset-y-0 right-0 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                {showLuxeDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg p-2 ring-1 ring-black ring-opacity-5">
                    <div className="grid grid-cols-2 gap-2">
                      {luxeLevels.map(level => (
                        <button
                          key={level}
                          onClick={() => handleMultiSelectChange(level, luxeOptions, setLuxeOptions)}
                          className={`px-3 py-2 rounded-md text-sm flex items-center justify-center ${
                            luxeOptions.includes(level) 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Vibe Filter (multi-select dropdown) */}
            <div className="w-[48%] relative dropdown-container">
              <label className="block text-xs font-medium mb-1 text-blue-950">Vibe(s)</label>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowVibeDropdown(!showVibeDropdown);
                    setShowMonthDropdown(false);
                    setShowLuxeDropdown(false);
                  }}
                  style={{ fontFamily: 'var(--font-nohemi)' }}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-gray-800 text-sm text-left flex justify-between items-center"
                >
                  <span className="truncate">{vibeOptions.length > 0 ? `${vibeOptions.length} selected` : "Select"}</span>
                  <span className="pointer-events-none inset-y-0 right-0 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                {showVibeDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg p-2 ring-1 ring-black ring-opacity-5 max-h-60 overflow-y-auto">
                    <div className="flex flex-col space-y-2">
                      {vibes.map(vibe => (
                        <button
                          key={vibe}
                          onClick={() => handleMultiSelectChange(vibe, vibeOptions, setVibeOptions)}
                          className={`px-3 py-2 rounded-md text-sm text-left ${
                            vibeOptions.includes(vibe) 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {vibe}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Custom Templates */}
      {showBuilder && (
        <div className="py-2">
          <HorizontalScroll>
            {customTemplates.map((template, index) => (
              <motion.button
                key={`custom-${index}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectTemplate(template)}
                className="flex-shrink-0 w-72 sm:w-64 h-36 p-4 bg-white border border-blue-500 rounded-lg shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span style={{ fontFamily: 'var(--font-nohemi)' }} className="text-md text-blue-950 mr-1">
                      {template.duration}N {template.destination}
                    </span>
                  </div>
                  {index === 0 && (
                    <span className="bg-gradient-to-tr from-blue-600 to-blue-800 text-white px-2 py-0.5 text-xs font-semibold rounded">
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <p className="text-sm text-blue-800 mt-1 line-clamp-3 text-left tracking-tight">
                  {template.duration}N trip to {template.destination} in {formatMonthsString(template.months)}. I prefer {formatLuxeString(template.luxe)} options with a {template.vibes[0]}{template.vibes[1] && template.vibes[0] !== template.vibes[1] ? ` plus ${template.vibes[1]}` : ""} vibe.
                </p>
              </motion.button>
            ))}
          </HorizontalScroll>
        </div>
      )}
    </div>
  );
};

export default TripTemplateGenerator;