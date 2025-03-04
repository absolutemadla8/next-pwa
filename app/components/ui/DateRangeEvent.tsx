'use client'

import React from 'react';

interface DateRangeEventProps {
  dateRange: string;
  eventDescription: string;
  startDate?: Date;
  endDate?: Date;
  onClick?: (startDate: Date, endDate: Date) => void;
}

const DateRangeEvent: React.FC<DateRangeEventProps> = ({ 
  dateRange, 
  eventDescription, 
  startDate, 
  endDate,
  onClick 
}) => {
  const handleClick = () => {
    if (onClick && startDate && endDate) {
      onClick(startDate, endDate);
    }
  };

  return (
    <div 
      className='flex flex-col items-start justify-start p-4 bg-slate-100 rounded-lg mx-2 
                min-w-[180px] hover:bg-blue-50 hover:border-blue-200 transition-colors 
                cursor-pointer border border-transparent active:bg-blue-100'
      onClick={handleClick}
    >
      <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 font-normal text-sm'>
        {dateRange}
      </h2>
      <h2 className='text-slate-600 font-normal text-xs tracking-tight'>
        {eventDescription}
      </h2>
    </div>
  );
};

export default DateRangeEvent;