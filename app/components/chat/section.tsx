'use client'
import React from 'react';
import { Search, Building, MapPin, Globe, Calendar, CreditCard, UserSearch, Map } from 'lucide-react';
import { Badge } from './badge';

// ToolArgsSection Component
interface ToolArgsSectionProps {
  tool: string;
  number?: number;
  children: React.ReactNode;
}

export function ToolArgsSection({ tool, number, children }: ToolArgsSectionProps) {
  // Select icon based on tool name
  const getToolIcon = () => {
    switch (tool) {
      case 'searchLocation':
        return <Search className="h-4 w-4 text-slate-600" />;
      case 'searchHotels':
        return <Building className="h-4 w-4 text-slate-600" />;
      case 'searchFlights':
        return <Map className="h-4 w-4 text-slate-600" />;
      case 'checkAvailability':
        return <Calendar className="h-4 w-4 text-slate-600" />;
      case 'searchPricing':
        return <CreditCard className="h-4 w-4 text-slate-600" />;
      case 'searchCustomers':
        return <UserSearch className="h-4 w-4 text-slate-600" />;
      default:
        return <Search className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {getToolIcon()}
        <div style={{ fontFamily: 'var(--font-nohemi)' }}  className="text-sm text-slate-700 truncate w-44">
          {children}
        </div>
      </div>
      {number !== undefined && number > 0 && (
        <Badge className="ml-2">
          {number}
        </Badge>
      )}
    </div>
  );
}

// Section Component
interface SectionProps {
  title: string;
  tool: string;
  children: React.ReactNode;
}

export function Section({ title, tool, children }: SectionProps) {
  // Customize section based on tool
  const getSectionClasses = () => {
    switch (tool) {
      case 'searchLocation':
        return "text-blue-600";
      case 'searchHotels':
        return "text-rose-600";
      case 'searchFlights':
        return "text-emerald-950";
      case 'checkAvailability':
        return "text-amber-950";
      case 'searchPricing':
        return "text-rose-950";
      default:
        return "text-blue-950";
    }
  };

  return (
    <div className="space-y-2">
      <h3 
        style={{ fontFamily: 'var(--font-nohemi)' }} 
        className={`${getSectionClasses()} text-blue-600 text-md flex items-center gap-2`}
      >
        {title}
      </h3>
      <div className="content">
        {children}
      </div>
    </div>
  );
}

// A helper component for different result item types
interface ResultItemProps {
  type: 'cluster' | 'country' | 'destination' | 'hotel';
  name: string;
  subtext?: string;
  onClick: () => void;
}

export function ResultItem({ type, name, subtext, onClick }: ResultItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'cluster':
        return <Building className="h-5 w-5 text-slate-400" />;
      case 'country':
        return <Globe className="h-5 w-5 text-slate-400" />;
      case 'destination':
      case 'hotel':
        return <MapPin className="h-5 w-5 text-slate-400" />;
      default:
        return <MapPin className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div
      className="flex items-center justify-between w-full p-3 h-16 text-left bg-white cursor-pointer hover:bg-slate-50"
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* {getIcon()} */}
        <div>
          <div 
            style={{ fontFamily: 'var(--font-nohemi)' }}
            className="font-normal text-lg text-blue-950"
          >
            {name}
          </div>
          {subtext && (
            <div className="text-xs text-slate-500">
              {subtext}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}