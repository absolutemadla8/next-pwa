'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownButtonProps {
  options: {
    id: string | number;
    name: string;
    value: any;
  }[];
  defaultOptionIndex?: number;
  countdownDuration?: number; // in milliseconds
  onSelect: (value: any) => void;
  className?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  // Unique identifier for this set of options to save selection state
  stateKey?: string;
  // Flag to disable autoselection (e.g. if we're viewing a completed conversation)
  disableAutoSelect?: boolean;
}

const CountdownButton: React.FC<CountdownButtonProps> = ({
  options,
  defaultOptionIndex = 0,
  countdownDuration = 3000, // 3 seconds default
  onSelect,
  className = '',
  buttonClassName = '',
  activeButtonClassName = '',
  stateKey = 'default',
  disableAutoSelect = false
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [autoSelectComplete, setAutoSelectComplete] = useState(false);

  // Check if a selection was previously made for this stateKey
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Try to retrieve previously made selection from localStorage
    const savedSelections = JSON.parse(localStorage.getItem('countdownSelections') || '{}');
    const previousSelection = savedSelections[stateKey];
    
    if (previousSelection) {
      // If we already made a selection, set it as complete
      setSelectedIndex(previousSelection.index);
      setAutoSelectComplete(true);
      return;
    }
    
    // Otherwise, set the default selection
    if (options.length > 0 && defaultOptionIndex >= 0 && defaultOptionIndex < options.length) {
      setSelectedIndex(defaultOptionIndex);
    }
  }, [options, defaultOptionIndex, stateKey]);

  // Progress bar animation - only runs if no previous selection was made
  useEffect(() => {
    if (autoSelectComplete || selectedIndex === null || disableAutoSelect) return;

    const startTime = Date.now();
    const endTime = startTime + countdownDuration;
    
    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min(100, (elapsed / countdownDuration) * 100);
      
      setProgress(newProgress);
      
      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        // Auto-select the default option when time runs out
        setAutoSelectComplete(true);
        
        // Save the selection to localStorage
        if (typeof window !== 'undefined') {
          const savedSelections = JSON.parse(localStorage.getItem('countdownSelections') || '{}');
          savedSelections[stateKey] = {
            index: selectedIndex,
            value: options[selectedIndex].value,
            timestamp: new Date().getTime()
          };
          localStorage.setItem('countdownSelections', JSON.stringify(savedSelections));
        }
        
        onSelect(options[selectedIndex].value);
      }
    };
    
    const animationId = requestAnimationFrame(updateProgress);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [countdownDuration, options, selectedIndex, onSelect, autoSelectComplete, disableAutoSelect, stateKey]);

  // Handle manual selection
  const handleSelect = (index: number) => {
    if (autoSelectComplete) return;
    
    setSelectedIndex(index);
    setAutoSelectComplete(true);
    
    // Save the selection to localStorage
    if (typeof window !== 'undefined') {
      const savedSelections = JSON.parse(localStorage.getItem('countdownSelections') || '{}');
      savedSelections[stateKey] = {
        index: index,
        value: options[index].value,
        timestamp: new Date().getTime()
      };
      localStorage.setItem('countdownSelections', JSON.stringify(savedSelections));
    }
    
    onSelect(options[index].value);
  };

  if (options.length === 0) return null;

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleSelect(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 
              ${buttonClassName} 
              ${selectedIndex === index ? `relative ${activeButtonClassName || 'bg-blue-600 text-white'}` : 'bg-white text-primary border border-slate-200'}`}
            disabled={autoSelectComplete}
          >
            {option.name}
            {selectedIndex === index && !autoSelectComplete && (
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-white/70"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CountdownButton;