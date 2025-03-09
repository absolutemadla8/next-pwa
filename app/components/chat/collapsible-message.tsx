'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleMessageProps {
  role: 'assistant' | 'user' | 'system';
  header: React.ReactNode;
  children: React.ReactNode;
  isCollapsible?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CollapsibleMessage({
  role,
  header,
  children,
  isCollapsible = true,
  isOpen = true,
  onOpenChange = () => {}
}: CollapsibleMessageProps) {
  const [isLocalOpen, setIsLocalOpen] = useState(isOpen);
  
  const open = isOpen !== undefined ? isOpen : isLocalOpen;
  
  const handleToggle = () => {
    const newOpenState = !open;
    setIsLocalOpen(newOpenState);
    onOpenChange(newOpenState);
  };

  const messageClasses = {
    assistant: 'bg-blue-50 border-blue-100',
    user: 'bg-gray-50 border-gray-100',
    system: 'bg-yellow-50 border-yellow-100'
  };

  return (
    <div className={`rounded-lg border ${messageClasses[role]} mb-4 overflow-hidden`}>
      <div 
        className={`p-3 flex justify-between items-center ${isCollapsible ? 'cursor-pointer hover:bg-gray-100/50' : ''}`}
        onClick={isCollapsible ? handleToggle : undefined}
      >
        <div className="flex-1">{header}</div>
        
        {isCollapsible && (
          <button 
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
      </div>
      
      {open && (
        <div className="p-4 border-t border-gray-100 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}