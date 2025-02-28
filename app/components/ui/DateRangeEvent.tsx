'use client'

import React from 'react';

interface DateRangeEventProps {
  dateRange: string;
  eventDescription: string;
}

const DateRangeEvent: React.FC<DateRangeEventProps> = ({ dateRange, eventDescription }) => {
  return (
    <div className='flex flex-col items-start justify-start p-4 bg-slate-100 rounded-md'>
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